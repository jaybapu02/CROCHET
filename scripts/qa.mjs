/**
 * Dev QA script: boots the production server, crawls every route at desktop /
 * tablet / mobile widths, records console errors, broken responses, horizontal
 * overflow, internal link status, and captures screenshots.
 *
 * `/this-page-does-not-exist` is an intentionally invalid route: it MUST
 * return HTTP 404 and render the custom not-found page. That response is an
 * expected result, not a problem — any other status is reported as a failure.
 *
 * Run: node scripts/qa.mjs
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { chromium } from "playwright";

/** Ask the OS for a free port so a stale server can never shadow this run. */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.unref();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

const PORT = await getFreePort();
const BASE = `http://localhost:${PORT}`;
const SHOTS = path.join(process.cwd(), ".cache", "qa");

const ROUTES = [
  { name: "home", route: "/" },
  { name: "products", route: "/products" },
  { name: "product", route: "/products/crochet-daisy-bouquet" },
  { name: "order", route: "/order" },
  {
    name: "order-prefill",
    route: "/order?product=crochet-rose-bouquet&qty=2&note=pink%20please",
  },
  { name: "about", route: "/about" },
  { name: "reviews", route: "/reviews" },
  { name: "contact", route: "/contact" },
  // Intentionally invalid: must 404 and show the custom not-found page.
  { name: "notfound", route: "/this-page-does-not-exist", expectStatus: 404 },
];

/** Routes that are supposed to 404 — their expected failure is not a problem. */
const EXPECTED_404_PATHS = new Set(
  ROUTES.filter((r) => r.expectStatus === 404).map((r) => new URL(r.route, BASE).pathname),
);

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 360, height: 740 },
];

const pathnameOf = (url) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

async function waitForServer(url, child, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (child.exitCode !== null) return false;
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

/**
 * Stop the server and its whole tree. Spawning taskkill with an args array
 * (no shell) avoids the DEP0190 "shell option true" deprecation warning and
 * still makes sure `next start` never outlives the script as an orphan.
 */
function stopServer(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    killer.on("error", () => child.kill("SIGTERM"));
  } else {
    child.kill("SIGTERM");
  }
}

// Run the local Next CLI directly through the current Node binary — no shell,
// so no DEP0190 "shell option true" deprecation warning (and no shell quoting
// issues on Windows).
const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
  stdio: "ignore",
  env: { ...process.env },
  windowsHide: true,
});

const ready = await waitForServer(`${BASE}/`, server);
if (!ready) {
  stopServer(server);
  console.error(`server did not start on ${BASE}`);
  process.exit(1);
}

// Safety net: never leave a `next start` process behind.
process.on("exit", () => stopServer(server));

await fs.mkdir(SHOTS, { recursive: true });

const problems = [];
const consoleErrors = [];
const hrefs = new Set();

const browser = await chromium.launch();

async function run() {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });

    for (const { name, route, expectStatus } of ROUTES) {
      const page = await context.newPage();
      const routePath = pathnameOf(route);
      const documentUrl = `${BASE}${route}`;
      let documentStatus = null;

      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        const location = msg.location()?.url ?? "";
        // The intentional 404 route logs a resource error for its own document.
        // That status is expected — everything else is still reported.
        if (
          expectStatus === 404 &&
          /Failed to load resource/i.test(text) &&
          (location === "" || location === documentUrl || pathnameOf(location) === routePath)
        ) {
          return;
        }
        consoleErrors.push(`[${viewport.name}] ${route}: ${text}`);
      });
      page.on("pageerror", (err) => consoleErrors.push(`[${viewport.name}] ${route}: ${err.message}`));
      page.on("response", (res) => {
        const url = res.url();
        if (!url.startsWith(BASE)) return;
        const status = res.status();
        const isDocument =
          res.request().isNavigationRequest() && res.frame() === page.mainFrame();

        if (isDocument && pathnameOf(url) === routePath) {
          documentStatus = status;
          if (expectStatus) {
            if (status !== expectStatus) {
              problems.push(
                `expected HTTP ${expectStatus} for ${route} but got ${status} (${viewport.name})`,
              );
            }
            return;
          }
        }
        if (status >= 400) problems.push(`HTTP ${status} ${url} (${viewport.name})`);
      });

      await page.goto(documentUrl, { waitUntil: "load" });
      await page.waitForTimeout(600);

      // intentional-404 route: status + custom not-found page rendering
      if (expectStatus === 404) {
        if (documentStatus !== expectStatus) {
          problems.push(
            `404 route ${route} returned ${documentStatus ?? "no document response"} (${viewport.name})`,
          );
        }
        const hasHeading = await page
          .locator("h1", { hasText: "This page seems to have unravelled" })
          .first()
          .isVisible()
          .catch(() => false);
        if (!hasHeading) {
          problems.push(`custom 404 heading missing on ${route} (${viewport.name})`);
        }
        const hasFooter = await page
          .locator("footer")
          .first()
          .isVisible()
          .catch(() => false);
        if (!hasFooter) {
          problems.push(`custom 404 page is missing the footer (${viewport.name})`);
        }
        const hasNav = await page
          .locator('header a[href="/"]')
          .first()
          .isVisible()
          .catch(() => false);
        if (!hasNav) {
          problems.push(`custom 404 page is missing the navbar (${viewport.name})`);
        }
      }

      // reveal-on-scroll: walk the page so lazy sections appear.
      // The site uses `scroll-behavior: smooth`, which makes each scripted
      // scrollTo animate — the walk would lag behind and never reach the
      // bottom sections, so force instant scrolling while walking.
      await page.evaluate(async () => {
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
        }
        window.scrollTo(0, 0);
        root.style.scrollBehavior = prev;
      });
      // wait for lazy images to finish loading, then for reveal animations
      // (stagger delay + transition) to settle before measuring/screenshotting
      await page
        .waitForFunction(() => Array.from(document.images).every((img) => img.complete), null, {
          timeout: 5000,
        })
        .catch(() => {});
      await page.waitForTimeout(1500);

      const hiddenReveals = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll("[data-reveal]")).filter(
            (el) => el.offsetParent !== null && getComputedStyle(el).opacity !== "1",
          ).length,
      );
      if (hiddenReveals > 0) {
        problems.push(
          `${hiddenReveals} reveal element(s) still hidden on ${route} (${viewport.name})`,
        );
      }

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 2) problems.push(`overflow ${overflow}px on ${route} @${viewport.name}`);

      if (viewport.name !== "tablet") {
        await page.screenshot({
          path: path.join(SHOTS, `${name}-${viewport.name}.png`),
          fullPage: true,
        });
      }
      await page.close();
    }

    await context.close();
  }

  // ---- internal link check ----
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  for (const { route } of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href")),
    );
    found.forEach((href) => {
      if (href && href.startsWith("/") && !href.startsWith("/#")) hrefs.add(href.split("#")[0]);
    });
  }
  for (const href of hrefs) {
    // The intentional 404 probe is not linked from the site; skip it if it ever is.
    if (EXPECTED_404_PATHS.has(pathnameOf(href))) continue;
    const res = await fetch(`${BASE}${href}`).catch(() => null);
    if (!res || res.status >= 400) {
      problems.push(`broken link ${href} -> ${res ? res.status : "no response"}`);
    }
  }

  // ---- mobile menu interaction ----
  const mobile = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const mp = await mobile.newPage();
  await mp.goto(`${BASE}/`, { waitUntil: "load" });
  await mp.waitForTimeout(600); // let React hydrate before interacting
  await mp.click('button[aria-controls="mobile-menu"]');
  await mp.waitForTimeout(500);
  const menuVisible = await mp.isVisible('#mobile-menu [role="dialog"]');
  if (!menuVisible) problems.push("mobile menu did not open");
  await mp.screenshot({ path: path.join(SHOTS, "menu-open-mobile.png") });
  await mp.keyboard.press("Escape");
  await mp.waitForTimeout(300);

  // ---- products filtering ----
  await mp.goto(`${BASE}/products`, { waitUntil: "load" });
  await mp.waitForTimeout(600); // let React hydrate before interacting
  await mp.fill("#product-search", "bouquet");
  await mp.waitForTimeout(400);
  const searchCount = await mp.locator("article").count();
  if (searchCount === 0) problems.push("search for 'bouquet' returned 0 products");
  await mp.screenshot({ path: path.join(SHOTS, "products-search-mobile.png"), fullPage: false });

  await mp.fill("#product-search", "zzzzz-not-a-product");
  await mp.waitForTimeout(400);
  const emptyState = await mp.getByText("No matches just yet").isVisible();
  if (!emptyState) problems.push("empty search state missing");

  // ---- order form validation ----
  await mp.goto(`${BASE}/order`, { waitUntil: "load" });
  await mp.waitForTimeout(600); // let React hydrate before interacting
  await mp.click('button[type="submit"]');
  await mp.waitForTimeout(400);
  const errorShown = await mp.locator(".field-error").first().isVisible();
  if (!errorShown) problems.push("order form did not show validation errors");
  await mp.screenshot({ path: path.join(SHOTS, "order-errors-mobile.png") });

  // pre-filled order form
  await mp.goto(`${BASE}/order?product=crochet-rose-bouquet&qty=3`, { waitUntil: "load" });
  await mp.waitForTimeout(600); // let React hydrate before reading form state
  const selectedValue = await mp.locator("#order-productSlug").inputValue();
  const qtyValue = await mp.locator("#order-quantity").inputValue();
  if (selectedValue !== "crochet-rose-bouquet") problems.push(`prefill product = ${selectedValue}`);
  if (qtyValue !== "3") problems.push(`prefill qty = ${qtyValue}`);

  // product gallery lightbox
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desktop.newPage();
  await dp.goto(`${BASE}/products/crochet-rose-bouquet`, { waitUntil: "load" });
  await dp.waitForTimeout(600); // let React hydrate before interacting
  await dp.click('button[aria-label="Open image gallery"]');
  await dp.waitForTimeout(500);
  const lightbox = await dp.isVisible('[role="dialog"][aria-label$="images"]');
  if (!lightbox) problems.push("lightbox did not open");
  await dp.screenshot({ path: path.join(SHOTS, "lightbox-desktop.png") });
  await dp.keyboard.press("Escape");

  await browser.close();
}

try {
  await run();
} finally {
  stopServer(server);
}

const uniqueConsoleErrors = [...new Set(consoleErrors)];

console.log("\n=== LINKS CHECKED:", hrefs.size);
console.log("=== PROBLEMS ===");
console.log(problems.length ? problems.join("\n") : "none");
console.log("=== CONSOLE ERRORS ===");
console.log(uniqueConsoleErrors.length ? uniqueConsoleErrors.join("\n") : "none");

if (problems.length || uniqueConsoleErrors.length) {
  process.exitCode = 1;
}
