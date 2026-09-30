import fs from "node:fs";

const src = fs.readFileSync("data/products.ts", "utf8");
const blocks = src.split(/\n  \{\n/).slice(1);
const expected = {
  1: { price: 180, note: "per piece" },
  2: { price: 699, note: "(Large Size)" },
  3: { price: 160, note: "per piece" },
  4: { price: 580, note: undefined },
  5: { price: 1399, note: undefined },
  6: { price: 1999, note: undefined },
  7: { price: 250, note: undefined },
  8: { price: 449, note: undefined },
  9: { price: 499, note: undefined },
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

const flowers = all.filter((p) => p.body.includes('category: "flowers"'));
check("9 flower products", flowers.length === 9, String(flowers.length));

const files = fs
  .readdirSync("public/images/products/flowers")
  .map((f) => Number(f.match(/^(\d+)/)[1]))
  .sort((a, b) => a - b);
check("flower images on disk = 1..9", files.join(",") === files.map((_, i) => i + 1).join(","), files.join(","));

const seen = new Set();
for (const f of flowers) {
  const imgs = [...f.body.matchAll(/\/images\/products\/flowers\/(\d+)\.jpeg/g)].map((m) => Number(m[1]));
  check(`${f.slug}: single image`, imgs.length === 1, imgs.join(","));
  const n = imgs[0];
  if (n === undefined) continue;
  seen.add(n);
  const price = Number(f.body.match(/\n    price: (\d+)/)[1]);
  const noteM = f.body.match(/priceNote: "(.*?)"/);
  const note = noteM ? noteM[1] : undefined;
  const exp = expected[n];
  check(`${n}.jpeg -> ₹${exp.price.toLocaleString("en-IN")}`, price === exp.price, `got ₹${price.toLocaleString("en-IN")}`);
  if (exp.note) check(`${n}.jpeg -> note "${exp.note}"`, note === exp.note, `got ${note ?? "none"}`);
  else check(`${n}.jpeg -> no note`, note === undefined, `got ${note ?? "none"}`);
  check(`${n}.jpeg -> name present`, /name: ".+?"/.test(f.body));
}
check("every flower image used exactly once", seen.size === 9 && [...seen].sort((a, b) => a - b).join(",") === "1,2,3,4,5,6,7,8,9", [...seen].sort((a, b) => a - b).join(","));

const fmt = (p, n) => `₹${p.toLocaleString("en-IN")}${n ? ` ${n}` : ""}`;
const byImg = {};
for (const f of flowers) {
  const n = Number(f.body.match(/flowers\/(\d)\.jpeg/)[1]);
  const price = Number(f.body.match(/\n    price: (\d+)/)[1]);
  const noteM = f.body.match(/priceNote: "(.*?)"/);
  byImg[n] = fmt(price, noteM ? noteM[1] : undefined);
}
check('1 shows "₹180 per piece"', byImg[1] === "₹180 per piece", byImg[1]);
check('2 shows "₹699 (Large Size)"', byImg[2] === "₹699 (Large Size)", byImg[2]);
check('3 shows "₹160 per piece"', byImg[3] === "₹160 per piece", byImg[3]);
check("4-9 prices", [4, 5, 6, 7, 8, 9].map((i) => byImg[i]).join(" | ") === "₹580 | ₹1,399 | ₹1,999 | ₹250 | ₹449 | ₹499", [4, 5, 6, 7, 8, 9].map((i) => byImg[i]).join(" | "));

// qa.mjs referenced slugs still exist
const slugs = new Set(all.map((p) => p.slug));
check("qa.mjs slugs still valid", ["crochet-daisy-bouquet", "crochet-rose-bouquet"].every((s) => slugs.has(s)));

console.log(fails === 0 ? "\nALL DATA CHECKS PASSED" : `\n${fails} CHECK(S) FAILED`);
process.exit(fails ? 1 : 0);
