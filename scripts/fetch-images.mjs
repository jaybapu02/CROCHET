// Dev-only helper: downloads candidate photos from the Openverse API into
// .cache/img-candidates/<subject>/ so we can pick the best ones for the site.
// Usage: node scripts/fetch-images.mjs [subjectKey]
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), ".cache", "img-candidates");

const SUBJECTS = {
  "daisy-bouquet": ["crochet daisy flower", "crochet flowers bouquet", "knitted flowers"],
  "rose-bouquet": ["crochet rose", "crocheted roses", "yarn rose flower"],
  "tulip-bouquet": ["crochet tulip", "knitted tulips", "crochet flower bouquet"],
  "tote-bag": ["crochet bag", "crochet tote", "knitted bag handmade"],
  "mini-handbag": ["crochet purse", "crochet handbag", "knitted purse"],
  "teddy-bear": ["crochet teddy bear", "amigurumi bear", "crochet bear toy"],
  "bunny": ["crochet bunny", "amigurumi rabbit", "knitted bunny toy"],
  "flower-keychain": ["crochet flower brooch", "crochet flower small", "crochet keychain"],
  "heart-keychain": ["crochet heart", "knitted heart", "crochet heart keychain"],
  "coasters": ["crochet coaster", "crocheted coasters", "crochet doily"],
  "table-decor": ["crochet home decor", "crochet table runner", "crochet decor"],
  "gift": ["crochet gift", "crochet baby blanket", "handmade crochet gifts"],
  hero: ["crochet hands", "crocheting yarn hook", "handmade crochet"],
  about: ["woman crocheting", "crochet workshop", "crocheting at home"],
  gallery: ["crochet handmade", "crochet blanket", "crochet plush"],
};

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; site-image-picker/1.0)",
};

async function search(query, pageSize = 12) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=${pageSize}&mature=false`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`search ${res.status} for ${query}`);
  return (await res.json()).results || [];
}

async function download(url, dest) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 20000) throw new Error("too small");
  await fs.writeFile(dest, buf);
  return buf.length;
}

const only = process.argv[2];
const report = [];

for (const [key, queries] of Object.entries(SUBJECTS)) {
  if (only && only !== key) continue;
  const dir = path.join(OUT, key);
  await fs.mkdir(dir, { recursive: true });
  const seen = new Set();
  let n = 0;
  for (const q of queries) {
    let results = [];
    try {
      results = await search(q);
    } catch (e) {
      report.push(`${key}: search failed ${q} (${e.message})`);
      continue;
    }
    for (const r of results) {
      if (n >= 8) break;
      const u = r.url;
      if (!u || seen.has(u)) continue;
      seen.add(u);
      const w = Number(r.width || 0);
      const h = Number(r.height || 0);
      if (w && w < 700 && h < 700) continue;
      const ext = u.includes(".png") ? "png" : u.includes(".webp") ? "webp" : "jpg";
      const dest = path.join(dir, `${String(n).padStart(2, "0")}_${r.source || "x"}.${ext}`);
      try {
        const size = await download(u, dest);
        n++;
        report.push(`${key}/${path.basename(dest)} ${size}b <- ${u}`);
      } catch {
        /* skip */
      }
    }
    if (n >= 8) break;
  }
  report.push(`== ${key}: ${n} candidates`);
}

await fs.writeFile(path.join(OUT, "report.txt"), report.join("\n"), "utf8");
console.log(report.filter((l) => l.startsWith("==") || l.startsWith("search")).join("\n"));
