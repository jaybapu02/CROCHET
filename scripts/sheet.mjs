// Dev-only helper: builds labelled contact sheets from downloaded candidates.
// Usage: node scripts/sheet.mjs <subjectKey> ...
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), ".cache", "img-candidates");
const SHEETS = path.join(process.cwd(), ".cache", "sheets");

const CELL_W = 300;
const CELL_H = 300;
const LABEL_H = 26;
const COLS = 4;

async function sheetFor(key) {
  const dir = path.join(OUT, key);
  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch {
    return;
  }
  if (!files.length) return;
  const rows = Math.ceil(files.length / COLS);
  const composites = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const x = (i % COLS) * CELL_W;
    const y = Math.floor(i / COLS) * (CELL_H + LABEL_H);
    try {
      const thumb = await sharp(path.join(dir, f))
        .resize(CELL_W, CELL_H, { fit: "cover" })
        .toBuffer();
      composites.push({ input: thumb, left: x, top: y });
      const label = f.replace(/\.[a-z0-9]+$/i, "");
      const svg = Buffer.from(
        `<svg width="${CELL_W}" height="${LABEL_H}"><rect width="${CELL_W}" height="${LABEL_H}" fill="#1f2937"/><text x="6" y="18" font-family="monospace" font-size="14" fill="#ffffff">${label}</text></svg>`,
      );
      composites.push({ input: svg, left: x, top: y + CELL_H });
    } catch {
      /* skip broken */
    }
  }
  const width = COLS * CELL_W;
  const height = rows * (CELL_H + LABEL_H);
  await fs.mkdir(SHEETS, { recursive: true });
  const out = path.join(SHEETS, `${key}.jpg`);
  await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(out);
  console.log(out);
}

for (const key of process.argv.slice(2)) await sheetFor(key);
