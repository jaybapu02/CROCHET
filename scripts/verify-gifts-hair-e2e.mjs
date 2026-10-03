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

const HAIR = [
  { n: 1, slug: "crochet-rose-claw-clip", price: "₹259", name: "Crochet Rose Claw Clip" },
  { n: 2, slug: "crochet-daisy-claw-clip", price: "₹459", name: "Crochet Daisy Claw Clip" },
  { n: 3, slug: "crochet-tulip-hair-clips", price: "₹99 per pair", name: "Crochet Tulip Hair Clips" },
  { n: 4, slug: "crochet-pink-tulip-clips", price: "₹99", name: "Pink Tulip Hair Clips" },
  { n: 5, slug: "crochet-bow-hair-clip", price: "₹99", name: "Crochet Bow Hair Clips" },
  { n: 6, slug: "crochet-scrunchie", price: "₹359 — Medium Size", name: "Crochet Ruffle Scrunchie" },
  { n: 7, slug: "crochet-daisy-hair-clip", price: "₹199 — Small Size", name: "Crochet Daisy Hair Clip" },
  { n: 8, slug: "crochet-flower-hair-strands", price: "₹459", name: "Crochet Flower Hair Strands" },
  { n: 9, slug: "crochet-daisy-hair-vine", price: "₹399", name: "Crochet Daisy Hair Vine" },
  { n: 10, slug: "crochet-puff-flower-clip", price: "₹99", name: "Crochet Puff Flower Clip" },
];
const GIFTS = [
  { n: 1, slug: "rose-daisy-gift-hamper", price: "₹599", name: "Rose & Daisy Gift Hamper" },
  { n: 2, slug: "cherry-granny-gift-hamper", price: "₹799", name: "Cherry & Granny Gift Hamper" },
  { n: 3, slug: "sunflower-gift-hamper", price: "₹499", name: "Sunflower Gift Hamper" },
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

  // --- Category pill + counts on the products page ---
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  let body = await page.textContent("body");
  check('category pill "Gift Hamper" visible', body.includes("Gift Hamper"));
  check('category pill "Hair" visible', body.includes("Hair"));
  const allSrcs = (await imgPaths(page)).map(srcPath);
  const byCat = {};
  for (const s of allSrcs) {
    const m = s.match(/\/images\/products\/([a-z-]+)\//);
    if (m) byCat[m[1]] = (byCat[m[1]] || 0) + 1;
  }
  console.log("products page images by category:", JSON.stringify(byCat));
  for (const [cat, n] of [
    ["flowers", 9],
    ["clothes", 8],
    ["decor", 7],
    ["hair-accessories", 10],
    ["gifts", 3],
    ["bags", 11],
    ["keychains", 7],
    ["toys", 4],
    ["shoes", 3],
  ]) {
    check(`${cat} = ${n} images`, byCat[cat] === n, String(byCat[cat]));
  }

  // --- Filtered views ---
  await page.goto(`${BASE}/products?category=gifts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  body = await page.textContent("body");
  check("gifts filter shows 3 products", body.includes("3 products"), body.match(/\d+ products/)?.[0] ?? "");
  let imgs = [...new Set((await imgPaths(page)).map(srcPath).filter((s) => s.includes("/images/products/gifts/")))];
  check("all 3 gift hamper images displayed", imgs.length === 3, imgs.join(" "));
  for (const g of GIFTS) {
    check(`gift ${g.n}.jpeg displayed`, imgs.includes(`/images/products/gifts/${g.n}.jpeg`));
    check(`gift price ${g.price} on list page`, body.includes(g.price));
    check(`gift name "${g.name}" on list page`, body.includes(g.name));
  }

  await page.goto(`${BASE}/products?category=hair-accessories`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  body = await page.textContent("body");
  check("hair filter shows 10 products", body.includes("10 products"), body.match(/\d+ products/)?.[0] ?? "");
  imgs = [...new Set((await imgPaths(page)).map(srcPath).filter((s) => s.includes("/images/products/hair-accessories/")))];
  check("all 10 hair images displayed", imgs.length === 10, imgs.join(" "));
  for (const h of HAIR) {
    check(`hair ${h.n}.jpeg displayed`, imgs.includes(`/images/products/hair-accessories/${h.n}.jpeg`));
    check(`hair price "${h.price}" on list page`, body.includes(h.price));
    check(`hair name "${h.name}" on list page`, body.includes(h.name));
  }

  // --- Detail pages ---
  for (const p of [...GIFTS, ...HAIR]) {
    const dir = GIFTS.includes(p) ? "gifts" : "hair-accessories";
    await page.goto(`${BASE}/products/${p.slug}`, { waitUntil: "networkidle" });
    const txt = await page.textContent("body");
    check(`detail ${p.slug}: shows "${p.price}"`, txt.includes(p.price));
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

  // --- Order page: unit/size info and totals ---
  const orderChecks = [
    { slug: "crochet-tulip-hair-clips", qty: 2, unit: "₹99 per pair × 2", total: "₹198" },
    { slug: "crochet-scrunchie", qty: 1, unit: "₹359 — Medium Size × 1", total: "₹359" },
    { slug: "crochet-daisy-hair-clip", qty: 3, unit: "₹199 — Small Size × 3", total: "₹597" },
    { slug: "rose-daisy-gift-hamper", qty: 2, unit: "₹599 × 2", total: "₹1,198" },
    { slug: "cherry-granny-gift-hamper", qty: 1, unit: "₹799 × 1", total: "₹799" },
    { slug: "crochet-rose-claw-clip", qty: 4, unit: "₹259 × 4", total: "₹1,036" },
  ];
  for (const o of orderChecks) {
    await page.goto(`${BASE}/order?product=${o.slug}&qty=${o.qty}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const t = await page.textContent("body");
    check(`order ${o.slug}: "${o.unit}"`, t.includes(o.unit));
    check(`order ${o.slug}: total ${o.total}`, t.includes(o.total));
  }

  // --- WhatsApp order form flow ---
  const waForm = async (slug, qty, name) => {
    await page.goto(`${BASE}/order?product=${slug}&qty=${qty}`, { waitUntil: "networkidle" });
    await page.fill("#order-name", "Test User");
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

  let m = await waForm("crochet-tulip-hair-clips", 2);
  check("WA: tulip clips name", m.includes("Product: Crochet Tulip Hair Clips"));
  check("WA: per pair price + total", m.includes("Price: ₹99 per pair — ₹198 total"), (m.match(/Price: [^\n]*/) || [""])[0]);
  check("WA: quantity 2", m.includes("Quantity: 2"));
  check('WA: no stray "each" on per-pair note', !m.includes("each"));

  m = await waForm("crochet-scrunchie", 1);
  check("WA: scrunchie name", m.includes("Product: Crochet Ruffle Scrunchie"));
  check("WA: medium size price + total", m.includes("Price: ₹359 — Medium Size — ₹359 total"), (m.match(/Price: [^\n]*/) || [""])[0]);

  m = await waForm("crochet-daisy-hair-clip", 3);
  check("WA: small size price + total", m.includes("Price: ₹199 — Small Size — ₹597 total"), (m.match(/Price: [^\n]*/) || [""])[0]);

  m = await waForm("rose-daisy-gift-hamper", 1);
  check("WA: hamper name", m.includes("Product: Rose & Daisy Gift Hamper"));
  check("WA: hamper price", m.includes("Price: ₹599 each — ₹599 total"), (m.match(/Price: [^\n]*/) || [""])[0]);

  // --- Regression: untouched categories still render their prices ---
  for (const [slug, price] of [
    ["crochet-granny-cardigan", "₹2,399"],
    ["crochet-chick-hat", "₹1,899"],
    ["crochet-chick-cushion", "₹859"],
    ["crochet-sunflower-pot", "₹499 (Big Size)"],
    ["crochet-tulips-in-vase", "₹299"],
    ["handmade-crochet-tote-bag", "₹800"],
    ["crochet-flower-keychain", "₹150"],
    ["crochet-bunny", "₹1,399"],
    ["crochet-daisy-bouquet", "₹449"],
    ["crochet-rose-bouquet", "₹699 (Large Size)"],
    ["crochet-sunflower-bouquet", "₹180 per piece"],
  ]) {
    await page.goto(`${BASE}/products/${slug}`, { waitUntil: "networkidle" });
    check(`untouched ${slug} still ${price}`, (await page.textContent("body")).includes(price));
  }

  // --- Home page still renders with the new featured products ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const home = await page.innerText("body");
  check("home page mentions Gift Hamper", home.includes("Gift Hamper"));
  check("home page has no [object Object] / undefined price", !/undefined|NaN|\[object/.test(home));

  await browser.close();
} finally {
  server.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 400));
  try { server.kill("SIGKILL"); } catch {}
}

console.log(fails === 0 ? "\nALL E2E CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
