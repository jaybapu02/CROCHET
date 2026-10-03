import { spawn } from "node:child_process";
import net from "node:net";
import { chromium } from "playwright";

/**
 * End-to-end checks for the Keychain / Baby Shoes / Baby Toys update.
 * Run: node scripts/verify-keychain-shoes-toys-e2e.mjs   (needs `npm run build` first)
 */
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

const KEYCHAINS = [
  { n: 1, slug: "evil-eye-keychain", price: "₹120", name: "Crochet Evil Eye Keychain" },
  { n: 2, slug: "crochet-moon-star-keychain", price: "₹160 — Single", pair: "₹299 — Pair", name: "Crochet Moon & Star Keychain" },
  { n: 3, slug: "crochet-octopus-keychain", price: "₹160 — Single", pair: "₹299 — Pair", name: "Crochet Octopus Keychain" },
  { n: 4, slug: "crochet-flower-keychain", price: "₹150", name: "Crochet Flower Keychain" },
  { n: 5, slug: "crochet-bow-keychain", price: "₹150", name: "Crochet Bow Keychain" },
  { n: 6, slug: "crochet-red-octopus-keychain", price: "₹180", name: "Crochet Red Octopus Keychain" },
  { n: 7, slug: "crochet-blue-octopus-keychain", price: "₹180", name: "Crochet Blue Octopus Keychain" },
];
const SHOES = [
  { n: 1, slug: "crochet-bear-baby-sandals", price: "₹649", name: "Crochet Bear Baby Sandals" },
  { n: 2, slug: "crochet-daisy-baby-sandals", price: "₹549", name: "Crochet Daisy Baby Sandals" },
  { n: 3, slug: "crochet-kitty-baby-shoes", price: "₹549", name: "Crochet Kitty Baby Shoes" },
];
const TOYS = [
  { n: 1, slug: "crochet-bunny", price: "₹1,399", name: "Crochet Sunflower Bunny" },
  { n: 2, slug: "crochet-turtle", price: "₹1,999", name: "Crochet Plush Turtle" },
  { n: 3, slug: "crochet-bunny-doll", price: "₹999 — Small Size", name: "Crochet Bunny Doll" },
  { n: 4, slug: "crochet-fox", price: "₹2,599", name: "Crochet Fox" },
];

let fails = 0;
const check = (label, ok, extra = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
};
const srcPath = (raw) =>
  raw && raw.includes("_next/image") ? new URL(raw).searchParams.get("url") || "" : raw || "";
const imgPaths = (page) => page.$$eval("main img", (els) => els.map((e) => e.getAttribute("src") || ""));

const waHref = async (page) => {
  const href = await page.getAttribute('a[href*="wa.me"]', "href");
  return decodeURIComponent((href || "").replace(/\+/g, " "));
};

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

  // --- Products page: every image of the three categories is visible ---
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  let body = await page.textContent("body");
  const allSrcs = (await imgPaths(page)).map(srcPath);
  const byCat = {};
  for (const s of allSrcs) {
    const m = s.match(/\/images\/products\/([a-z-]+)\//);
    if (m) byCat[m[1]] = (byCat[m[1]] || 0) + 1;
  }
  console.log("products page images by category:", JSON.stringify(byCat));
  check("all 9 categories rendered", Object.keys(byCat).length === 9, Object.keys(byCat).join(","));
  for (const [cat, n] of [
    ["keychains", 7],
    ["shoes", 3],
    ["toys", 4],
    ["flowers", 9],
    ["clothes", 8],
    ["decor", 7],
    ["hair-accessories", 10],
    ["gifts", 3],
    ["bags", 11],
  ]) {
    check(`${cat} = ${n} images`, byCat[cat] === n, String(byCat[cat]));
  }

  // --- Filtered category views ---
  const filters = [
    { cat: "keychains", list: KEYCHAINS, count: "7 products" },
    { cat: "shoes", list: SHOES, count: "3 products" },
    { cat: "toys", list: TOYS, count: "4 products" },
  ];
  for (const f of filters) {
    await page.goto(`${BASE}/products?category=${f.cat}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    body = await page.textContent("body");
    check(`${f.cat} filter shows ${f.count}`, body.includes(f.count), body.match(/\d+ products/)?.[0] ?? "");
    const imgs = [...new Set((await imgPaths(page)).map(srcPath).filter((s) => s.includes(`/images/products/${f.cat}/`)))];
    check(`all ${f.list.length} ${f.cat} images displayed`, imgs.length === f.list.length, imgs.join(" "));
    for (const p of f.list) {
      check(`${f.cat} ${p.n}.jpeg displayed`, imgs.includes(`/images/products/${f.cat}/${p.n}.jpeg`));
      check(`${f.cat} price "${p.price}" on list page`, body.includes(p.price));
      if (p.pair) check(`${f.cat} price "${p.pair}" on list page`, body.includes(p.pair));
      check(`${f.cat} name "${p.name}" on list page`, body.includes(p.name));
    }
  }

  // --- Detail pages ---
  for (const p of [...KEYCHAINS, ...SHOES, ...TOYS]) {
    const dir = KEYCHAINS.includes(p) ? "keychains" : SHOES.includes(p) ? "shoes" : "toys";
    await page.goto(`${BASE}/products/${p.slug}`, { waitUntil: "networkidle" });
    const txt = await page.textContent("body");
    check(`detail ${p.slug}: shows "${p.price}"`, txt.includes(p.price));
    if (p.pair) check(`detail ${p.slug}: shows "${p.pair}"`, txt.includes(p.pair));
    const srcs = (await imgPaths(page)).map(srcPath);
    check(
      `detail ${p.slug}: image ${p.n}.jpeg`,
      srcs.some((s) => s.includes(`/images/products/${dir}/${p.n}.jpeg`))
    );
    const wa = await waHref(page);
    check(
      `detail ${p.slug}: WhatsApp name + price`,
      wa.includes(`Product: ${p.name}`) && wa.includes(p.price),
      wa.split("\n").filter((l) => l.startsWith("Product") || l.startsWith("Price")).join(" | ")
    );
    const orderLink = await page.getAttribute('a[href^="/order?product="]', "href");
    check(`detail ${p.slug}: Order Now link`, !!orderLink && orderLink.startsWith(`/order?product=${p.slug}`));
  }

  // --- Single / Pair on the product page ---
  await page.goto(`${BASE}/products/crochet-octopus-keychain`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  check("detail: default total is the Single price", (await page.textContent("body")).includes("₹160"));
  await page.getByRole("radio", { name: "₹299 — Pair" }).click();
  await page.waitForTimeout(300);
  let detail = await page.textContent("body");
  check("detail: Pair selected -> total ₹299", detail.includes("₹299"));
  check("detail: Pair unit line", detail.includes("₹299 — Pair × 1"), (detail.match(/₹299[^\n]*/) || [""])[0]);
  const waPair = await waHref(page);
  check(
    "detail: WhatsApp switches to the Pair price",
    waPair.includes("Price: ₹299 — Pair — ₹299 total"),
    (waPair.match(/Price: [^\n]*/) || [""])[0]
  );
  const pairLink = await page.getAttribute('a[href^="/order?product="]', "href");
  check("detail: Order Now carries the Pair option", !!pairLink && pairLink.includes("variant=Pair"), pairLink ?? "");

  // --- Order page: Single / Pair selection ---
  await page.goto(`${BASE}/order?product=crochet-moon-star-keychain&qty=2`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  let order = await page.textContent("body");
  check("order: defaults to Single", order.includes("₹160 — Single × 2"), (order.match(/₹160[^\n]*/) || [""])[0]);
  check("order: Single total ₹320", order.includes("₹320"));
  await page.getByRole("radio", { name: "₹299 — Pair" }).click();
  await page.waitForTimeout(300);
  order = await page.textContent("body");
  check("order: Pair selected", order.includes("₹299 — Pair × 2"), (order.match(/₹299[^\n]*/) || [""])[0]);
  check("order: Pair total ₹598", order.includes("₹598"));
  const checked = await page.getByRole("radio", { name: "₹299 — Pair" }).getAttribute("aria-checked");
  check("order: Pair radio is checked", checked === "true", String(checked));

  // --- Order page: ?variant= prefill ---
  await page.goto(`${BASE}/order?product=crochet-octopus-keychain&qty=3&variant=Pair`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(400);
  order = await page.textContent("body");
  check("order: variant=Pair prefilled", order.includes("₹299 — Pair × 3"), (order.match(/₹299[^\n]*/) || [""])[0]);
  check("order: Pair total ₹897", order.includes("₹897"));

  // --- Order page: fixed prices still work ---
  const orderChecks = [
    { slug: "evil-eye-keychain", qty: 2, unit: "₹120 × 2", total: "₹240" },
    { slug: "crochet-kitty-baby-shoes", qty: 1, unit: "₹549 × 1", total: "₹549" },
    { slug: "crochet-bear-baby-sandals", qty: 2, unit: "₹649 × 2", total: "₹1,298" },
    { slug: "crochet-bunny-doll", qty: 2, unit: "₹999 — Small Size × 2", total: "₹1,998" },
    { slug: "crochet-fox", qty: 1, unit: "₹2,599 × 1", total: "₹2,599" },
  ];
  for (const o of orderChecks) {
    await page.goto(`${BASE}/order?product=${o.slug}&qty=${o.qty}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const t = await page.textContent("body");
    check(`order ${o.slug}: "${o.unit}"`, t.includes(o.unit));
    check(`order ${o.slug}: total ${o.total}`, t.includes(o.total));
  }

  // --- WhatsApp order form flow ---
  const waForm = async (url, name) => {
    await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
    await page.fill("#order-name", name ?? "Test User");
    await page.fill("#order-phone", "9876543210");
    await page.fill("#order-address", "12 Test Street, Jaipur");
    const pop = page.context().waitForEvent("page", { timeout: 15000 });
    await page.click('button[type="submit"]');
    const p = await pop;
    await p.waitForLoadState("domcontentloaded").catch(() => {});
    await p.waitForTimeout(1200);
    const m = decodeURIComponent(p.url().replace(/\+/g, " "));
    await p.close();
    return m;
  };

  let m = await waForm("/order?product=crochet-octopus-keychain&qty=2");
  check("WA: keychain name", m.includes("Product: Crochet Octopus Keychain"));
  check(
    "WA: Single price + total",
    m.includes("Price: ₹160 — Single — ₹320 total"),
    (m.match(/Price: [^\n]*/) || [""])[0]
  );
  check("WA: quantity 2", m.includes("Quantity: 2"));

  m = await waForm("/order?product=crochet-moon-star-keychain&qty=1&variant=Pair");
  check("WA: pair option in message", m.includes("Price: ₹299 — Pair — ₹299 total"), (m.match(/Price: [^\n]*/) || [""])[0]);

  m = await waForm("/order?product=crochet-bunny-doll&qty=1");
  check("WA: toy name", m.includes("Product: Crochet Bunny Doll"));
  check(
    "WA: small size price + total",
    m.includes("Price: ₹999 — Small Size — ₹999 total"),
    (m.match(/Price: [^\n]*/) || [""])[0]
  );

  m = await waForm("/order?product=crochet-bear-baby-sandals&qty=1");
  check("WA: shoes name", m.includes("Product: Crochet Bear Baby Sandals"));
  check("WA: shoes price", m.includes("Price: ₹649 each — ₹649 total"), (m.match(/Price: [^\n]*/) || [""])[0]);

  // --- Regression: other categories untouched ---
  for (const [slug, price] of [
    ["crochet-granny-cardigan", "₹2,399"],
    ["crochet-chick-hat", "₹1,899"],
    ["crochet-chick-cushion", "₹859"],
    ["crochet-sunflower-pot", "₹499 (Big Size)"],
    ["crochet-tulips-in-vase", "₹299"],
    ["handmade-crochet-tote-bag", "₹800"],
    ["rose-daisy-gift-hamper", "₹599"],
    ["crochet-rose-claw-clip", "₹259"],
    ["crochet-daisy-bouquet", "₹449"],
    ["crochet-rose-bouquet", "₹699 (Large Size)"],
    ["crochet-sunflower-bouquet", "₹180 per piece"],
  ]) {
    await page.goto(`${BASE}/products/${slug}`, { waitUntil: "networkidle" });
    check(`untouched ${slug} still ${price}`, (await page.textContent("body")).includes(price));
  }

  // --- Home page still renders ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const home = await page.innerText("body");
  check("home page has no [object Object] / undefined price", !/undefined|NaN|\[object/.test(home));

  await browser.close();
} finally {
  server.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  try { server.kill("SIGKILL"); } catch {}
}

console.log(fails === 0 ? "\nALL E2E CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
