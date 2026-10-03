import { spawn } from "node:child_process";
import net from "node:net";
import { chromium } from "playwright";

const freePort = () =>
  new Promise((res, rej) => {
    const s = net.createServer();
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => res(port));
    });
  });

const PORT = await freePort();
const BASE = `http://127.0.0.1:${PORT}`;

const FLOWERS = [
  { n: 1, slug: "crochet-sunflower-bouquet", price: "₹180 per piece", name: "Crochet Sunflower Stem" },
  { n: 2, slug: "crochet-rose-bouquet", price: "₹699 (Large Size)", name: "Crochet Rose Bouquet" },
  { n: 3, slug: "crochet-tulip-bouquet", price: "₹160 per piece", name: "Crochet Tulip Stem" },
  { n: 4, slug: "crochet-mixed-bouquet", price: "₹580", name: "Crochet Mixed Bouquet" },
  { n: 5, slug: "crochet-wrapped-bouquet", price: "₹1,399", name: "Crochet Wrapped Flower Bouquet" },
  { n: 6, slug: "crochet-flower-vase", price: "₹1,999", name: "Crochet Flower Vase Arrangement" },
  { n: 7, slug: "crochet-tulip-gift-wrap", price: "₹250", name: "Crochet Tulip Gift Wrap" },
  { n: 8, slug: "crochet-daisy-bouquet", price: "₹449", name: "Crochet Daisy Mini Bouquet" },
  { n: 9, slug: "crochet-rose-bunch", price: "₹499", name: "Crochet Rose Bunch" },
];

let fails = 0;
const check = (label, ok, extra = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
};
const srcPath = (raw) =>
  raw && raw.includes("_next/image") ? new URL(raw).searchParams.get("url") || "" : raw || "";
const imgPaths = (page) => page.$$eval("main img", (els) => els.map((e) => e.getAttribute("src") || ""));

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
server.stdout.on("data", (d) => (log += d));
server.stderr.on("data", (d) => (log += d));

try {
  let up = false;
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) { up = true; break; }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!up) throw new Error("server did not start:\n" + log);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // --- Products page: Flowers filter ---
  await page.goto(`${BASE}/products?category=flowers`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const body = await page.textContent("body");
  check("Flowers filter shows 9 products", body.includes("9 products"), body.match(/\d+ products/)?.[0] ?? "");
  const imgs = [...new Set((await imgPaths(page)).map(srcPath).filter((s) => s.includes("/images/products/flowers/")))];
  check("all 9 flower images displayed", imgs.length === 9, imgs.join(" "));
  for (const f of FLOWERS) {
    check(`image ${f.n}.jpeg displayed`, imgs.includes(`/images/products/flowers/${f.n}.jpeg`));
    check(`price "${f.price}" on products page`, body.includes(f.price));
    check(`product "${f.name}" on products page`, body.includes(f.name));
  }

  // --- Detail pages ---
  for (const f of FLOWERS) {
    await page.goto(`${BASE}/products/${f.slug}`, { waitUntil: "networkidle" });
    const txt = await page.textContent("body");
    check(`detail ${f.slug}: shows "${f.price}"`, txt.includes(f.price));
    const srcs = (await imgPaths(page)).map(srcPath);
    check(`detail ${f.slug}: image ${f.n}.jpeg`, srcs.some((s) => s.includes(`/images/products/flowers/${f.n}.jpeg`)));
    const wa = decodeURIComponent((await page.getAttribute('a[href*="wa.me"]', "href")) || "");
    check(
      `detail ${f.slug}: WhatsApp name + price`,
      wa.includes(`Product: ${f.name}`) && wa.includes(f.price),
      wa.split("\n").filter((l) => l.startsWith("Product") || l.startsWith("Price")).join(" | ")
    );
    const orderLink = await page.getAttribute('a[href^="/order?product="]', "href");
    check(`detail ${f.slug}: Order Now link`, !!orderLink && orderLink.startsWith(`/order?product=${f.slug}`));
  }

  // --- Order page: unit + size info and totals ---
  await page.goto(`${BASE}/order?product=crochet-sunflower-bouquet&qty=5`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  let t = await page.textContent("body");
  check("order: ₹180 per piece × 5", t.includes("₹180 per piece × 5"));
  check("order: total ₹900", t.includes("₹900"));

  await page.goto(`${BASE}/order?product=crochet-rose-bouquet&qty=2`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  t = await page.textContent("body");
  check("order: ₹699 (Large Size) × 2", t.includes("₹699 (Large Size) × 2"));
  check("order: total ₹1,398", t.includes("₹1,398"));

  await page.goto(`${BASE}/order?product=crochet-tulip-bouquet&qty=3`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  t = await page.textContent("body");
  check("order: ₹160 per piece × 3", t.includes("₹160 per piece × 3"));
  check("order: total ₹480", t.includes("₹480"));

  // --- WhatsApp message from the order form (per-piece product) ---
  await page.goto(`${BASE}/order?product=crochet-tulip-bouquet&qty=3`, { waitUntil: "networkidle" });
  await page.fill("#order-name", "Test User");
  await page.fill("#order-phone", "9876543210");
  await page.fill("#order-address", "12 Test Street, Jaipur");
  const pop1 = page.context().waitForEvent("page", { timeout: 15000 });
  await page.click('button[type="submit"]');
  const p1 = await pop1;
  await p1.waitForLoadState("domcontentloaded").catch(() => {});
  await p1.waitForTimeout(1200);
  const m1 = decodeURIComponent(p1.url().replace(/\+/g, " "));
  check("WA form: product name", m1.includes("Product: Crochet Tulip Stem"));
  check("WA form: unit price + total", m1.includes("Price: ₹160 per piece — ₹480 total"), (m1.match(/Price: [^\n]*/) || [""])[0]);
  check("WA form: quantity", m1.includes("Quantity: 3"));
  await p1.close();

  // --- WhatsApp message for the Large Size product ---
  await page.goto(`${BASE}/order?product=crochet-rose-bouquet&qty=2`, { waitUntil: "networkidle" });
  await page.fill("#order-name", "Test User");
  await page.fill("#order-phone", "9876543210");
  await page.fill("#order-address", "12 Test Street, Jaipur");
  const pop2 = page.context().waitForEvent("page", { timeout: 15000 });
  await page.click('button[type="submit"]');
  const p2 = await pop2;
  await p2.waitForLoadState("domcontentloaded").catch(() => {});
  await p2.waitForTimeout(1200);
  const m2 = decodeURIComponent(p2.url().replace(/\+/g, " "));
  check("WA form: Large Size product name", m2.includes("Product: Crochet Rose Bouquet"));
  check("WA form: price with size + total", m2.includes("Price: ₹699 (Large Size) each — ₹1,398 total"), (m2.match(/Price: [^\n]*/) || [""])[0]);
  await p2.close();

  // --- Regression: other categories ---
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const allSrcs = (await imgPaths(page)).map(srcPath);
  const byCat = {};
  for (const s of allSrcs) {
    const m = s.match(/\/images\/products\/([a-z-]+)\//);
    if (m) byCat[m[1]] = (byCat[m[1]] || 0) + 1;
  }
  console.log("products page images by category:", JSON.stringify(byCat));
  check("all 9 categories rendered", Object.keys(byCat).length === 9, Object.keys(byCat).join(","));
  for (const [cat, n] of [
    ["flowers", 9],
    ["clothes", 8],
    ["decor", 7],
    ["hair-accessories", 10],
    ["bags", 11],
    ["keychains", 7],
    ["toys", 4],
    ["gifts", 3],
    ["shoes", 3],
  ]) {
    check(`${cat} = ${n}`, byCat[cat] === n, String(byCat[cat]));
  }

  for (const [slug, price] of [
    ["crochet-granny-cardigan", "₹2,399"],
    ["crochet-chick-hat", "₹1,899"],
    ["crochet-chick-cushion", "₹859"],
    ["crochet-sunflower-pot", "₹499 (Big Size)"],
    ["crochet-tulips-in-vase", "₹299"],
    ["handmade-crochet-tote-bag", "₹800"],
    ["crochet-flower-keychain", "₹150"],
    ["crochet-bunny", "₹1,399"],
  ]) {
    await page.goto(`${BASE}/products/${slug}`, { waitUntil: "networkidle" });
    check(`untouched ${slug} still ${price}`, (await page.textContent("body")).includes(price));
  }

  await browser.close();
} finally {
  server.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  try { server.kill("SIGKILL"); } catch {}
}

console.log(fails === 0 ? "\nALL E2E CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
