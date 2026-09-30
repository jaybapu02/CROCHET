// Dev-only: builds review contact sheets from generated WebP artwork.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CELL = 260;
const LABEL = 22;
const COLS = 5;

async function walk(dir) {
  let out = [];
  try {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) out = out.concat(await walk(p));
      else if (e.name.endsWith(".webp")) out.push(p);
    }
  } catch {}
  return out;
}

async function makeSheet(items, dest) {
  const rows = Math.ceil(items.length / COLS) || 1;
  const comp = [];
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    const x = (i % COLS) * CELL;
    const y = Math.floor(i / COLS) * (CELL + LABEL);
    try {
      const t = await sharp(f).resize(CELL, CELL, { fit: "cover" }).toBuffer();
      comp.push({ input: t, left: x, top: y });
      const label = path.basename(f).replace(".webp", "");
      const svg = Buffer.from(
        `<svg width="${CELL}" height="${LABEL}"><rect width="${CELL}" height="${LABEL}" fill="#111827"/><text x="4" y="16" font-family="monospace" font-size="12" fill="#fff">${label}</text></svg>`,
      );
      comp.push({ input: svg, left: x, top: y + CELL });
    } catch (e) {
      console.log("skip", f, e.message);
    }
  }
  const w = COLS * CELL;
  const h = rows * (CELL + LABEL);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await sharp({ create: { width: w, height: h, channels: 3, background: "#ffffff" } })
    .composite(comp)
    .jpeg({ quality: 80 })
    .toFile(dest);
  console.log(dest, items.length);
}

const products = (await walk("public/images/products")).filter((f) => /-1\.webp$/.test(f));
const scenes = [
  ...(await walk("public/images/hero")),
  ...(await walk("public/images/about")),
  ...(await walk("public/images/categories")),
];
await makeSheet(products, ".cache/review/products.jpg");
await makeSheet(scenes, ".cache/review/scenes.jpg");
await makeSheet(await walk("public/images/gallery"), ".cache/review/gallery.jpg");
