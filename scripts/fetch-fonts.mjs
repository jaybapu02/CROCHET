// Dev-only: downloads open-license webfonts (Google Fonts / OFL) and stores
// them in app/fonts so the site never needs network access at build time.
import fs from "node:fs/promises";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const FAMILIES = [
  { file: "Fraunces", url: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&display=swap" },
  { file: "Inter", url: "https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap" },
];

const OUT = path.join(process.cwd(), "app", "fonts");
await fs.mkdir(OUT, { recursive: true });

for (const fam of FAMILIES) {
  const res = await fetch(fam.url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${fam.file}: css ${res.status}`);
  const css = await res.text();
  const blocks = css.split("@font-face").slice(1);
  const wanted = [];
  for (const b of blocks) {
    if (!/unicode-range:[^;]*U\+0000-00FF/.test(b)) continue; // latin only
    const m = b.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    const w = b.match(/font-weight:\s*([^;]+);/);
    if (m) wanted.push({ url: m[1], weight: (w ? w[1] : "400").trim() });
  }
  if (!wanted.length) throw new Error(`${fam.file}: no latin woff2 found`);
  const first = wanted[0];
  const dest = path.join(OUT, `${fam.file}.woff2`);
  const bin = await fetch(first.url, { headers: { "User-Agent": UA } });
  await fs.writeFile(dest, Buffer.from(await bin.arrayBuffer()));
  console.log(fam.file, "->", dest, "weight", first.weight);
}
