#!/usr/bin/env node
/**
 * 校验构建产物里的静态资源引用是否都能找到对应文件。
 *
 * 覆盖来源：HTML 的 src / href / srcset、CSS 的 url()。
 * 默认只检查图片，加 --all 可检查全部本地资源（js / css / 字体等）。
 *
 * 用法：
 *   node scripts/check-asset-refs.mjs            # 检查 love/
 *   node scripts/check-asset-refs.mjs .analyze/dist
 *   node scripts/check-asset-refs.mjs --all
 */
import {existsSync, readdirSync, readFileSync} from "node:fs";
import {join, relative, resolve} from "node:path";

const args = process.argv.slice(2);
const checkAll = args.includes("--all");
const outDir = resolve(args.find(arg => !arg.startsWith("--")) ?? "love");

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|ico|avif)$/i;
const TEXT_EXT = [".html", ".css", ".js", ".json", ".xml", ".txt"];
/** HTML 属性 + CSS url() 里的引用 */
const REF_RE = /(?:src|href)="([^"]+)"|url\((['"]?)([^'")]+)\2\)/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (TEXT_EXT.some(ext => entry.name.endsWith(ext))) files.push(full);
  }
  return files;
}

if (!existsSync(outDir)) {
  console.error(`产物目录不存在：${outDir}`);
  process.exit(1);
}

const files = walk(outDir);
const missing = [];
const checked = new Set();

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(REF_RE)) {
    const ref = match[1] ?? match[3];
    if (!ref) continue;
    // 跳过外链、锚点、data URI、协议相对地址
    if (/^(https?:)?\/\//i.test(ref) || ref.startsWith("#") || ref.startsWith("data:")) continue;
    const pathname = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!pathname) continue;
    // JS 中通过字符串拼接 / 模板字符串得到的地址不是静态引用，跳过
    if (/[+'`\\$]/.test(pathname)) continue;
    if (!checkAll && !IMAGE_EXT.test(pathname)) continue;
    if (checked.has(pathname)) continue;
    checked.add(pathname);

    // 产物里的引用可能是绝对路径（/assets/x.js）或相对路径（../assets/x.js）
    const candidates = pathname.startsWith("/")
      ? [join(outDir, pathname)]
      : [resolve(join(file, ".."), pathname)];
    if (!candidates.some(candidate => existsSync(candidate))) {
      missing.push({file: relative(outDir, file), ref: pathname});
    }
  }
}

console.log(`检查目录：${outDir}`);
console.log(`扫描文件：${files.length} 个，唯一引用：${checked.size} 个`);
console.log(`缺失引用：${missing.length} 个`);
for (const item of missing.slice(0, 40)) {
  console.log(`  ${item.ref}    ← ${item.file}`);
}
if (missing.length > 40) console.log(`  … 其余 ${missing.length - 40} 个`);
