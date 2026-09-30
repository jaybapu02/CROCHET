import fs from "node:fs";

const src = fs.readFileSync("data/products.ts", "utf8");
const blocks = src.split(/\n  \{\n/).slice(1);

const expectedHair = {
  1: { price: 259, note: undefined },
  2: { price: 459, note: undefined },
  3: { price: 99, note: "per pair" },
  4: { price: 99, note: undefined },
  5: { price: 99, note: undefined },
  6: { price: 359, note: "\u2014 Medium Size" },
  7: { price: 199, note: "\u2014 Small Size" },
  8: { price: 459, note: undefined },
  9: { price: 399, note: undefined },
  10: { price: 99, note: undefined },
};
const expectedGifts = { 1: 599, 2: 799, 3: 499 };

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
const hair = byCat("hair-accessories");
const gifts = byCat("gifts");
check("10 hair-accessories products", hair.length === 10, String(hair.length));
check("3 gifts products", gifts.length === 3, String(gifts.length));
check(
  "no leftover custom-crochet-gift",
  !all.some((p) => p.id === "custom-crochet-gift")
);

const filesIn = (dir) =>
  fs
    .readdirSync(`public/images/products/${dir}`)
    .map((f) => Number(f.match(/^(\d+)/)[1]))
    .sort((a, b) => a - b);

const verifyCat = (dir, products, expected) => {
  const files = filesIn(dir);
  check(`${dir}: files on disk = ${files.join(",")}`, files.join(",") === Object.keys(expected).join(","));
  const seen = new Set();
  for (const f of products) {
    const imgs = [...f.body.matchAll(new RegExp(`/images/products/${dir}/(\\d+)\\.jpeg`, "g"))].map((m) => Number(m[1]));
    check(`${dir}/${f.slug}: single image`, imgs.length === 1, imgs.join(","));
    const n = imgs[0];
    if (n === undefined) continue;
    seen.add(n);
    const exp = expected[n];
    const price = Number(f.body.match(/\n    price: (\d+)/)[1]);
    const noteM = f.body.match(/priceNote: "(.*?)"/);
    const note = noteM ? noteM[1] : undefined;
    check(`${dir} ${n}.jpeg -> \u20b9${exp.price ?? exp}`, price === (exp.price ?? exp), `got \u20b9${price}`);
    const expNote = exp.note;
    check(
      `${dir} ${n}.jpeg -> note ${expNote ? `"${expNote}"` : "none"}`,
      note === expNote,
      `got ${note === undefined ? "none" : `"${note}"`}`
    );
    check(`${dir} ${n}.jpeg -> name present`, /name: ".+?"/.test(f.body));
  }
  check(
    `${dir}: every image used exactly once`,
    seen.size === Object.keys(expected).length &&
      [...seen].sort((a, b) => a - b).join(",") === Object.keys(expected).join(","),
    [...seen].sort((a, b) => a - b).join(",")
  );
};

verifyCat("gifts", gifts, expectedGifts);
verifyCat("hair-accessories", hair, expectedHair);

const fmt = (p, n) => `\u20b9${p.toLocaleString("en-IN")}${n ? ` ${n}` : ""}`;
const display = {};
for (const f of [...hair, ...gifts]) {
  const dir = f.body.includes("hair-accessories") ? "hair-accessories" : "gifts";
  const n = Number(f.body.match(new RegExp(`${dir}/(\\d+)\\.jpeg`))[1]);
  const price = Number(f.body.match(/\n    price: (\d+)/)[1]);
  const noteM = f.body.match(/priceNote: "(.*?)"/);
  display[`${dir[0]}${n}`] = fmt(price, noteM ? noteM[1] : undefined);
}
check('hair 3 displays "\u20b999 per pair"', display.h3 === "\u20b999 per pair", display.h3);
check('hair 6 displays "\u20b9359 \u2014 Medium Size"', display.h6 === "\u20b9359 \u2014 Medium Size", display.h6);
check('hair 7 displays "\u20b9199 \u2014 Small Size"', display.h7 === "\u20b9199 \u2014 Small Size", display.h7);
check(
  "hair 1,2,4,5,8,9,10 prices",
  [1, 2, 4, 5, 8, 9, 10].map((i) => display[`h${i}`]).join(" | ") ===
    "\u20b9259 | \u20b9459 | \u20b999 | \u20b999 | \u20b9459 | \u20b9399 | \u20b999",
  [1, 2, 4, 5, 8, 9, 10].map((i) => display[`h${i}`]).join(" | ")
);
check(
  "gifts 1-3 prices",
  [1, 2, 3].map((i) => display[`g${i}`]).join(" | ") === "\u20b9599 | \u20b9799 | \u20b9499",
  [1, 2, 3].map((i) => display[`g${i}`]).join(" | ")
);

const slugs = new Set(all.map((p) => p.slug));
check(
  "qa.mjs slugs still valid",
  ["crochet-daisy-bouquet", "crochet-rose-bouquet"].every((s) => slugs.has(s))
);

const featured = all.filter((p) => p.body.includes("featured: true")).length;
console.log(`featured products: ${featured}`);

console.log(fails === 0 ? "\nALL DATA CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
