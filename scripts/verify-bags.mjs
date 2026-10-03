import fs from "node:fs";

const src = fs.readFileSync("data/products.ts", "utf8");
const blocks = src.split(/\n  \{\n/).slice(1);

// Serial number -> exact price the user specified for each bags image.
const expected = {
  1: { price: 3299, slug: "crochet-daisy-backpack" },
  2: { price: 549, slug: "crochet-maroon-mini-handbag" },
  3: { price: 2849, slug: "crochet-lilac-daisy-backpack" },
  4: { price: 799, slug: "crochet-pastel-zip-pouch-set" },
  5: { price: 849, slug: "crochet-blue-granny-shoulder-bag" },
  6: { price: 2799, slug: "crochet-green-daisy-tote-bag" },
  7: { price: 2899, slug: "crochet-sunburst-granny-square-bag" },
  8: { price: 800, slug: "handmade-crochet-tote-bag" },
  9: { price: 199, slug: "crochet-granny-sling-bag" },
  10: { price: 249, slug: "crochet-mini-handbag" },
  11: { price: 249, slug: "crochet-red-granny-square-bag" },
};

const expectedCategoryCounts = {
  flowers: 9,
  bags: 11,
  "hair-accessories": 10,
  clothes: 8,
  shoes: 3,
  toys: 4,
  keychains: 7,
  gifts: 3,
  decor: 7,
};

let fails = 0;
const check = (label, ok, extra = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
};
const fmt = (p) => `₹${p.toLocaleString("en-IN")}`;

const all = [];
for (const b of blocks) {
  const id = b.match(/\bid: "(.*?)"/);
  const slug = b.match(/\bslug: "(.*?)"/);
  if (!id || !slug) continue;
  all.push({ id: id[1], slug: slug[1], body: b });
}
const dup = (a) => [...new Set(a.filter((x, i) => a.indexOf(x) !== i))];
check("no duplicate ids", dup(all.map((p) => p.id)).length === 0, JSON.stringify(dup(all.map((p) => p.id))));
check("no duplicate slugs", dup(all.map((p) => p.slug)).length === 0, JSON.stringify(dup(all.map((p) => p.slug))));

// --- Other categories untouched ---
const counts = {};
for (const [cat, n] of Object.entries(expectedCategoryCounts)) {
  counts[cat] = all.filter((p) => p.body.includes(`category: "${cat}"`)).length;
  check(`category "${cat}" has ${n} products`, counts[cat] === n, String(counts[cat]));
}

// --- Bags images on disk = 1..11 ---
const files = fs
  .readdirSync("public/images/products/bags")
  .map((f) => Number(f.match(/^(\d+)/)[1]))
  .sort((a, b) => a - b);
check("bag images on disk = 1..11", files.join(",") === files.map((_, i) => i + 1).join(","), files.join(","));

// --- Each bags product: one image, exact price, exact slug ---
const bags = all.filter((p) => p.body.includes('category: "bags"'));
check("11 bag products", bags.length === 11, String(bags.length));

const seen = new Set();
for (const b of bags) {
  const imgs = [...b.body.matchAll(/\/images\/products\/bags\/(\d+)\.jpeg/g)].map((m) => Number(m[1]));
  check(`${b.slug}: single image`, imgs.length === 1, imgs.join(","));
  const n = imgs[0];
  if (n === undefined) continue;
  seen.add(n);
  const price = Number(b.body.match(/\n    price: (\d+)/)[1]);
  const noteM = b.body.match(/priceNote: "(.*?)"/);
  const exp = expected[n];
  check(`${n}.jpeg -> ${fmt(exp.price)}`, price === exp.price, `got ${fmt(price)}`);
  check(`${n}.jpeg -> no priceNote`, noteM === null, noteM ? noteM[1] : "");
  check(`${n}.jpeg -> slug ${exp.slug}`, b.slug === exp.slug, b.slug);
  check(`${n}.jpeg -> name present`, /name: ".+?"/.test(b.body));
}
check(
  "every bag image used exactly once",
  seen.size === 11 && [...seen].sort((a, b) => a - b).join(",") === "1,2,3,4,5,6,7,8,9,10,11",
  [...seen].sort((a, b) => a - b).join(",")
);

// --- Ordered display strings, serial 1..11 ---
const byImg = {};
for (const b of bags) {
  const n = Number(b.body.match(/bags\/(\d+)\.jpeg/)[1]);
  const price = Number(b.body.match(/\n    price: (\d+)/)[1]);
  byImg[n] = fmt(price);
}
check(
  "serial 1..11 price strings",
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => byImg[i]).join(" | ") ===
    "₹3,299 | ₹549 | ₹2,849 | ₹799 | ₹849 | ₹2,799 | ₹2,899 | ₹800 | ₹199 | ₹249 | ₹249",
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => byImg[i]).join(" | ")
);

// --- Home page slices: featured count6, bestSeller count 5, one bags flag on image 1 ---
const featured = all.filter((p) => p.body.includes("featured: true")).length;
const bestSellers = all.filter((p) => p.body.includes("bestSeller: true")).length;
check("featured products = 6 (home grid)", featured === 6, String(featured));
check("bestSeller products = 5 (home grid)", bestSellers === 5, String(bestSellers));
const bagFeatured = bags.filter((p) => p.body.includes("featured: true"));
check("exactly one bags product featured", bagFeatured.length === 1, JSON.stringify(bagFeatured.map((p) => p.slug)));
check("bags featured is image 1 (daisy backpack)", bagFeatured[0]?.slug === "crochet-daisy-backpack", bagFeatured[0]?.slug ?? "none");

// --- Review names that must keep existing ---
const reviews = fs.readFileSync("data/reviews.ts", "utf8");
const reviewProducts = [...reviews.matchAll(/product: "(.*?)"/g)].map((m) => m[1]);
const names = new Set(bags.map((p) => p.body.match(/\n    name: "(.*?)"/)[1]));
for (const r of reviewProducts.filter((r) => ["Handmade Crochet Tote Bag", "Crochet Mini Handbag"].includes(r))) {
  check(`review product "${r}" still exists`, names.has(r));
}

console.log(fails === 0 ? "\nALL BAGS DATA CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
