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

const BAGS = [
  { n: 1, slug: "crochet-daisy-backpack", price: "₹3,299", name: "Crochet Daisy Backpack" },
  { n: 2, slug: "crochet-maroon-mini-handbag", price: "₹549", name: "Crochet Maroon Mini Handbag" },
  { n: 3, slug: "crochet-lilac-daisy-backpack", price: "₹2,849", name: "Crochet Lilac Daisy Backpack" },
  { n: 4, slug: "crochet-pastel-zip-pouch-set", price: "₹799", name: "Crochet Pastel Zip Pouch Set" },
  { n: 5, slug: "crochet-blue-granny-shoulder-bag", price: "₹849", name: "Crochet Blue Granny Square Shoulder Bag" },
  { n: 6, slug: "crochet-green-daisy-tote-bag", price: "₹2,799", name: "Crochet Green Daisy Tote Bag" },
  { n: 7, slug: "crochet-sunburst-granny-square-bag", price: "₹2,899", name: "Crochet Sunburst Granny Square Bag" },
  { n: 8, slug: "handmade-crochet-tote-bag", price: "₹800", name: "Handmade Crochet Tote Bag" },
  { n: 9, slug: "crochet-granny-sling-bag", price: "₹199", name: "Crochet Granny Square Sling Bag" },
  { n: 10, slug: "crochet-mini-handbag", price: "₹249", name: "Crochet Mini Handbag" },
  { n: 11, slug: "crochet-red-granny-square-bag", price: "₹249", name: "Crochet Red Granny Square Bag" },
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

  // --- Home page: featured + best seller flags still wired up ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const home = await page.textContent("body");
  check("home shows featured Crochet Daisy Backpack", home.includes("Crochet Daisy Backpack"));

  // --- Products page: Bags filter ---
  await page.goto(`${BASE}/products?category=bags`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const body = await page.textContent("body");
  check("Bags filter shows 11 products", body.includes("11 products"), body.match(/\d+ products/)?.[0] ?? "");
  const imgs = [...new Set((await imgPaths(page)).map(srcPath).filter((s) => s.includes("/images/products/bags/")))];
  check("all 11 bag images displayed", imgs.length === 11, imgs.join(" "));
  for (const b of BAGS) {
    check(`image ${b.n}.jpeg displayed`, imgs.includes(`/images/products/bags/${b.n}.jpeg`));
    check(`price "${b.price}" on products page`, body.includes(b.price));
    check(`product "${b.name}" on products page`, body.includes(b.name));
  }

  // --- Detail pages ---
  for (const b of BAGS) {
    await page.goto(`${BASE}/products/${b.slug}`, { waitUntil: "networkidle" });
    const txt = await page.textContent("body");
    check(`detail ${b.slug}: shows "${b.price}"`, txt.includes(b.price));
    const srcs = (await imgPaths(page)).map(srcPath);
    check(`detail ${b.slug}: image ${b.n}.jpeg`, srcs.some((s) => s.includes(`/images/products/bags/${b.n}.jpeg`)));
    const wa = decodeURIComponent((await page.getAttribute('a[href*="wa.me"]', "href")) || "");
    check(
      `detail ${b.slug}: WhatsApp name + price`,
      wa.includes(`Product: ${b.name}`) && wa.includes(b.price),
      wa.split("\n").filter((l) => l.startsWith("Product") || l.startsWith("Price")).join(" | ")
    );
    const orderLink = await page.getAttribute('a[href^="/order?product="]', "href");
    check(`detail ${b.slug}: Order Now link`, !!orderLink && orderLink.startsWith(`/order?product=${b.slug}`));
  }

  // --- Order page: line total + grand total ---
  await page.goto(`${BASE}/order?product=crochet-daisy-backpack&qty=2`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  let t = await page.textContent("body");
  check("order: ₹3,299 × 2", t.includes("₹3,299 × 2"));
  check("order: total ₹6,598", t.includes("₹6,598"));

  await page.goto(`${BASE}/order?product=crochet-granny-sling-bag&qty=3`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  t = await page.textContent("body");
  check("order: ₹199 × 3", t.includes("₹199 × 3"));
  check("order: total ₹597", t.includes("₹597"));

  // --- WhatsApp message from the order form ---
  await page.goto(`${BASE}/order?product=crochet-granny-sling-bag&qty=3`, { waitUntil: "networkidle" });
  await page.fill("#order-name", "Test User");
  await page.fill("#order-phone", "9876543210");
  await page.fill("#order-address", "12 Test Street, Jaipur");
  const pop = page.context().waitForEvent("page", { timeout: 15000 });
  await page.click('button[type="submit"]');
  const popup = await pop;
  await popup.waitForLoadState("domcontentloaded").catch(() => {});
  await popup.waitForTimeout(1200);
  const msg = decodeURIComponent(popup.url().replace(/\+/g, " "));
  check("WA form: product name", msg.includes("Product: Crochet Granny Square Sling Bag"));
  check("WA form: unit price + total", msg.includes("Price: ₹199 each — ₹597 total"), (msg.match(/Price: [^\n]*/) || [""])[0]);
  check("WA form: quantity", msg.includes("Quantity: 3"));
  await popup.close();

  // --- Regression: other categories unchanged ---
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
    ["crochet-sunflower-bouquet", "₹180 per piece"],
    ["crochet-rose-bunch", "₹499"],
    ["crochet-granny-cardigan", "₹2,399"],
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

console.log(fails === 0 ? "\nALL BAGS E2E CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
