import fs from "node:fs";

/**
 * Data checks for the Keychain, Baby Shoes and Baby Toys update.
 * Run: node scripts/verify-keychain-shoes-toys.mjs
 */
const src = fs.readFileSync("data/products.ts", "utf8");
const blocks = src.split(/\n  \{\n/).slice(1);

const expectedKeychains = {
  1: { price: 120 },
  2: { price: 160, variants: [["Single", 160], ["Pair", 299]] },
  3: { price: 160, variants: [["Single", 160], ["Pair", 299]] },
  4: { price: 150 },
  5: { price: 150 },
  6: { price: 180 },
  7: { price: 180 },
};
const expectedShoes = { 1: { price: 649 }, 2: { price: 549 }, 3: { price: 549 } };
const expectedToys = {
  1: { price: 1399 },
  2: { price: 1999 },
  3: { price: 999, note: "\u2014 Small Size" },
  4: { price: 2599 },
};

let fails = 0;
const check = (label, ok, extra = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} | ${label}${extra ? " | " + extra : ""}`);
};

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
console.log(`total products: ${all.length}`);

const byCat = (cat) => all.filter((p) => p.body.includes(`category: "${cat}"`));
const keychains = byCat("keychains");
const shoes = byCat("shoes");
const toys = byCat("toys");
check("7 keychain products", keychains.length === 7, String(keychains.length));
check("3 baby shoes products", shoes.length === 3, String(shoes.length));
check("4 baby toys products", toys.length === 4, String(toys.length));

const filesIn = (dir) =>
  fs
    .readdirSync(`public/images/products/${dir}`)
    .map((f) => Number(f.match(/^(\d+)/)[1]))
    .sort((a, b) => a - b);

const fmt = (p, n) => `\u20b9${p.toLocaleString("en-IN")}${n ? ` ${n}` : ""}`;
const display = {};

const verifyCat = (dir, products, expected) => {
  const files = filesIn(dir);
  check(
    `${dir}: files on disk = ${files.join(",")}`,
    files.join(",") === Object.keys(expected).join(",")
  );
  const seen = new Set();
  for (const f of products) {
    const imgs = [...f.body.matchAll(new RegExp(`/images/products/${dir}/(\\d+)\\.jpeg`, "g"))].map((m) => Number(m[1]));
    check(`${dir}/${f.slug}: exactly one image`, imgs.length === 1, imgs.join(","));
    const n = imgs[0];
    if (n === undefined) continue;
    seen.add(n);
    const exp = expected[n];
    if (!exp) {
      check(`${dir}/${n}.jpeg has a price mapping`, false, "unexpected image");
      continue;
    }
    const price = Number(f.body.match(/\n    price: (\d+)/)[1]);
    check(`${dir} ${n}.jpeg -> \u20b9${exp.price.toLocaleString("en-IN")}`, price === exp.price, `got \u20b9${price.toLocaleString("en-IN")}`);
    const noteM = f.body.match(/priceNote: "(.*?)"/);
    const note = noteM ? noteM[1] : undefined;
    check(
      `${dir} ${n}.jpeg -> note ${exp.note ? `"${exp.note}"` : "none"}`,
      note === exp.note,
      `got ${note === undefined ? "none" : `"${note}"`}`
    );
    const variantM = [...f.body.matchAll(/\{ label: "(.*?)", price: (\d+) \}/g)].map((m) => [m[1], Number(m[2])]);
    const variants = variantM.length ? variantM : undefined;
    const expVariants = exp.variants;
    check(
      `${dir} ${n}.jpeg -> variants ${expVariants ? JSON.stringify(expVariants) : "none"}`,
      JSON.stringify(variants ?? null) === JSON.stringify(expVariants ?? null),
      JSON.stringify(variants ?? null)
    );
    const key = `${dir === "keychains" ? "k" : dir === "shoes" ? "s" : "t"}${n}`;
    display[key] = variantM.length
      ? variantM.map(([label, p]) => fmt(p, `\u2014 ${label}`)).join(" / ")
      : fmt(price, exp.note);
    check(`${dir} ${n}.jpeg -> name present`, /name: ".+?"/.test(f.body));
  }
  check(
    `${dir}: every image used exactly once`,
    seen.size === Object.keys(expected).length &&
      [...seen].sort((a, b) => a - b).join(",") === Object.keys(expected).join(","),
    [...seen].sort((a, b) => a - b).join(",")
  );
};

verifyCat("keychains", keychains, expectedKeychains);
verifyCat("shoes", shoes, expectedShoes);
verifyCat("toys", toys, expectedToys);

check('keychain 1 shows "\u20b9120"', display.k1 === "\u20b9120", display.k1);
check(
  'keychain 2 shows "\u20b9160 \u2014 Single" and "\u20b9299 \u2014 Pair"',
  display.k2 === "\u20b9160 \u2014 Single / \u20b9299 \u2014 Pair",
  display.k2
);
check(
  'keychain 3 shows "\u20b9160 \u2014 Single" and "\u20b9299 \u2014 Pair"',
  display.k3 === "\u20b9160 \u2014 Single / \u20b9299 \u2014 Pair",
  display.k3
);
check(
  "keychain 4-7 prices",
  [4, 5, 6, 7].map((i) => display[`k${i}`]).join(" | ") ===
    "\u20b9150 | \u20b9150 | \u20b9180 | \u20b9180",
  [4, 5, 6, 7].map((i) => display[`k${i}`]).join(" | ")
);
check(
  "shoes 1-3 prices",
  [1, 2, 3].map((i) => display[`s${i}`]).join(" | ") ===
    "\u20b9649 | \u20b9549 | \u20b9549",
  [1, 2, 3].map((i) => display[`s${i}`]).join(" | ")
);
check(
  'toys 1-4 prices with "\u20b9999 \u2014 Small Size"',
  [1, 2, 3, 4].map((i) => display[`t${i}`]).join(" | ") ===
    "\u20b91,399 | \u20b91,999 | \u20b9999 \u2014 Small Size | \u20b92,599",
  [1, 2, 3, 4].map((i) => display[`t${i}`]).join(" | ")
);

const slugs = new Set(all.map((p) => p.slug));
check(
  "qa.mjs slugs still valid",
  ["crochet-daisy-bouquet", "crochet-rose-bouquet"].every((s) => slugs.has(s))
);
check("no stale toys/5.jpeg reference", !src.includes("toys/5.jpeg"));
check(
  "no leftover crochet-baby-sandals / crochet-lamb",
  !all.some((p) => p.id === "crochet-baby-sandals" || p.id === "crochet-lamb")
);

const src2 = fs.readFileSync("data/categories.ts", "utf8");
const imageRefs = [...src2.matchAll(/"(\/images\/products\/[^"]+)"/g)].map((m) => m[1]);
check(
  "categories.ts images all exist",
  imageRefs.every((p) => fs.existsSync(`public${p}`)),
  imageRefs.join(" ")
);

console.log(fails === 0 ? "\nALL DATA CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
