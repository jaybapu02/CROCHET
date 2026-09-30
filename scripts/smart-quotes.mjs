// Dev-only typography helper: turns straight apostrophes in contractions into
// typographic apostrophes (') in JSX/TSX copy. Run once: node scripts/smart-quotes.mjs
import fs from "node:fs/promises";
import path from "node:path";

const roots = ["app", "components", "data"];

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx|ts)$/.test(entry.name)) out.push(p);
  }
  return out;
}

let changed = 0;
for (const root of roots) {
  for (const file of await walk(root)) {
    const source = await fs.readFile(file, "utf8");
    const next = source.replace(/([A-Za-z])'([A-Za-z])/g, "$1\u2019$2");
    if (next !== source) {
      await fs.writeFile(file, next, "utf8");
      changed++;
      console.log("updated", file);
    }
  }
}
console.log(`${changed} files updated`);
