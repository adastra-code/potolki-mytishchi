import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "dist");
const OLD = "https://adastra-code.github.io/potolki-mytishchi";
const NEW = "https://akademynp.ru";
const INDEXABLE = process.argv.includes("--indexable");

const KEEP_TOP = new Set([
  "robots.txt",
  "sitemap.xml",
]);

const ASSET_RULES = [
  { dir: "css", exts: null },
  { dir: "js", exts: null },
  { dir: "assets/cases", exts: new Set([".webp"]) },
  { dir: "assets/fonts", exts: null },
  { dir: "assets/og", exts: null },
  { dir: "assets/gallery/thumb", exts: new Set([".webp"]) },
  { dir: "assets/gallery/full", exts: new Set([".webp"]) },
  { dir: "assets/img", exts: new Set([".webp"]) },
];

const TEXT_EXT = new Set([".html", ".css", ".js", ".txt", ".xml", ".json", ".webmanifest"]);

const ensureDir = (dir) => mkdir(dir, { recursive: true });

const transform = async (target) => {
  const ext = path.extname(target).toLowerCase();
  if (!TEXT_EXT.has(ext)) return;
  const source = await readFile(target, "utf8");
  let next = source.split(OLD).join(NEW).split("adastra-code.github.io/potolki-mytishchi").join("akademynp.ru");
  if (INDEXABLE && ext === ".html") {
    next = next.replace(/[ \t]*<meta\s+name="robots"[^>]*noindex[^>]*>\s*\r?\n?/gi, "");
  }
  if (next !== source) await writeFile(target, next, "utf8");
};

const copyTree = async (relative, exts) => {
  const sourceDir = path.join(ROOT, relative);
  const targetDir = path.join(OUT, relative);
  await ensureDir(targetDir);
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(sourceDir, entry.name);
    const to = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyTree(path.join(relative, entry.name), exts);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (exts && !exts.has(ext)) continue;
    await cp(from, to);
    await transform(to);
  }
};

await rm(OUT, { recursive: true, force: true });
await ensureDir(OUT);

const topFiles = (await readdir(ROOT, { withFileTypes: true })).filter((entry) => entry.isFile());
for (const entry of topFiles) {
  if (entry.name.endsWith(".html") || KEEP_TOP.has(entry.name)) {
    await cp(path.join(ROOT, entry.name), path.join(OUT, entry.name));
    await transform(path.join(OUT, entry.name));
  }
}

for (const rule of ASSET_RULES) {
  await copyTree(rule.dir, rule.exts);
}

if (INDEXABLE) {
  await writeFile(
    path.join(OUT, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${NEW}/sitemap.xml\n`,
    "utf8"
  );
}

let total = 0;
let count = 0;
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(target);
    else {
      const { size } = await import("node:fs/promises").then((m) => m.stat(target));
      total += size;
      count += 1;
    }
  }
};
await walk(OUT);
console.log(`dist: ${count} files, ${(total / 1048576).toFixed(2)} MB`);
console.log(`domain: ${NEW}`);
console.log(`indexing: ${INDEXABLE ? "open" : "closed (noindex + Disallow)"}`);
