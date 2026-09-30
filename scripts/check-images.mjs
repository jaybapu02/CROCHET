// Dev helper: verifies every /images/... path referenced in the source exists.
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

const missing = [];
const found = new Set();

for (const root of roots) {
  for (const file of await walk(root)) {
    const source = await fs.readFile(file, "utf8");
    for (const match of source.matchAll(/["'(](\/images\/[\w\-/]+\.(?:webp|jpg|jpeg|png|avif))/g)) {
      const rel = match[1];
      found.add(rel);
      const target = path.join("public", rel);
      const exists = await fs
        .stat(target)
        .then(() => true)
        .catch(() => false);
      if (!exists) missing.push(`${rel}  (referenced in ${file})`);
    }
  }
}

console.log(`checked ${found.size} image references`);
if (missing.length) {
  console.log("MISSING:");
  missing.forEach((m) => console.log(" -", m));
  process.exitCode = 1;
} else {
  console.log("all images present");
}
