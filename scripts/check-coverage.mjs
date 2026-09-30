import fs from "node:fs";
import path from "node:path";
const root = path.join(process.cwd(), "public", "images", "products");
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else files.push("/" + path.relative(path.join(process.cwd(), "public"), p).split(path.sep).join("/"));
  }
})(root);
const src = ["data/products.ts", "data/categories.ts"].map((f) => fs.readFileSync(f, "utf8")).join("\n");
const unused = files.filter((f) => !src.includes(f));
console.log("total files:", files.length, "| unreferenced:", unused.length);
unused.forEach((f) => console.log("  UNUSED", f));
