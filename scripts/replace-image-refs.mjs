#!/usr/bin/env node
/**
 * 把文档 / 代码里的图片引用从 .jpg|.jpeg|.png 换成 .webp
 *
 * 设计原则（为什么不是一句 sed 搞定）：
 *   1. 只替换「能在 docs/public 下找到同名 .webp」的引用 ——
 *      历史死链不会被改成同样不存在的 .webp，第三方的外链也不会被误伤；
 *   2. 跳过 markdown 代码块 —— 文章里的示例代码（如 webpack 的 test: /\.png$/）
 *      保持原样；
 *   3. 站点自有域名的外链（默认 chengyuming.cn）同样处理，因为它指向的就是
 *      public 目录里的同一张图，部署后会随 webp 一起失效。
 *
 * 用法：
 *   node scripts/replace-image-refs.mjs           # 预览，只打印不改文件
 *   node scripts/replace-image-refs.mjs --write   # 实际替换
 *
 * 可选参数：
 *   --skip-external   不处理指向本站自有域名的外链
 *   --root=<dir>      指定项目根目录（默认 = 脚本的上级目录）
 */
import {existsSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, join, relative, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const args = process.argv.slice(2);
const shouldWrite = args.includes("--write");
const skipExternal = args.includes("--skip-external");
const rootArg = args.find(arg => arg.startsWith("--root="));
const root = rootArg
  ? resolve(rootArg.slice("--root=".length))
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");

const docsDir = join(root, "docs");
const publicDir = join(docsDir, "public");
/** 站点自有域名：这些外链指向 public 下的图片，按本地文件处理 */
const SITE_HOSTS = ["chengyuming.cn"];
const SCAN_EXTS = [".md", ".vue", ".ts", ".css", ".scss", ".json"];
const IMAGE_REF_RE = /[^\s"'()<>[\]]+\.(?:jpe?g|png)\b/gi;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === "node_modules" || entry.name === "cache") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (SCAN_EXTS.includes(entry.name.slice(entry.name.lastIndexOf(".")))) files.push(full);
  }
  return files;
}

/**
 * 把一处引用解析成「它在 public 目录下对应的文件」。
 * 返回 null 表示这是不需要处理的外链（第三方域名）。
 */
function resolveTarget(file, ref) {
  if (/^https?:\/\//i.test(ref)) {
    const url = new URL(ref);
    if (skipExternal || !SITE_HOSTS.includes(url.hostname)) return null;
    return {target: join(publicDir, decodeURIComponent(url.pathname)), ref};
  }
  const target = ref.startsWith("/") ? join(publicDir, ref) : resolve(dirname(file), ref);
  return {target, ref};
}

const files = walk(docsDir).filter(file => !file.startsWith(publicDir + "/"));
const changed = [];
const skippedDead = [];
const skippedExternal = [];

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const lines = original.split("\n");
  const nextLines = [];
  let inCodeBlock = false;
  let fileChanges = [];

  for (const [index, line] of lines.entries()) {
    const isFence = /^\s*(```|~~~)/.test(line);
    if (isFence) inCodeBlock = !inCodeBlock;

    if (inCodeBlock) {
      nextLines.push(line);
      continue;
    }

    let nextLine = line;
    for (const match of line.matchAll(IMAGE_REF_RE)) {
      const ref = match[0];
      const resolved = resolveTarget(file, ref);
      if (!resolved) {
        skippedExternal.push({file, line: index + 1, ref});
        continue;
      }
      const webp = resolved.target.replace(/\.(jpe?g|png)$/i, ".webp");
      if (!existsSync(webp)) {
        // 原图/目标都不存在：历史死链，保持原样
        skippedDead.push({file, line: index + 1, ref});
        continue;
      }
      const replaced = ref.replace(/\.(jpe?g|png)$/i, ".webp");
      nextLine = nextLine.split(ref).join(replaced);
      fileChanges.push({line: index + 1, from: ref, to: replaced});
    }
    nextLines.push(nextLine);
  }

  if (fileChanges.length) {
    changed.push({file, changes: fileChanges});
    if (shouldWrite) writeFileSync(file, nextLines.join("\n"));
  }
}

const totalChanges = changed.reduce((sum, item) => sum + item.changes.length, 0);
console.log(`${shouldWrite ? "已替换" : "预览"}：${changed.length} 个文件，${totalChanges} 处引用`);
console.log(`跳过：历史死链 ${skippedDead.length} 处，第三方外链 ${skippedExternal.length} 处\n`);

for (const {file, changes} of changed) {
  console.log(`${relative(root, file)}  (${changes.length})`);
  if (process.env.VERBOSE) {
    for (const change of changes) console.log(`   ${change.line}: ${change.from} → ${change.to}`);
  }
}

if (skippedDead.length) {
  console.log(`\n跳过的历史死链（原图和 .webp 都不存在，保持原样）：`);
  for (const item of skippedDead) {
    console.log(`  ${relative(root, item.file)}:${item.line}  ${item.ref}`);
  }
}

if (skippedExternal.length) {
  console.log(`\n跳过的第三方外链：`);
  for (const item of skippedExternal) {
    console.log(`  ${relative(root, item.file)}:${item.line}  ${item.ref}`);
  }
}

if (!shouldWrite && totalChanges) {
  console.log(`\n预览模式未修改文件；确认后执行：node scripts/replace-image-refs.mjs --write`);
}
