/**
 * 补齐「VitePress 在 Rollup 之外直接写盘」文件的预压缩产物。
 *
 * 背景：vite-plugin-compression 基于 Rollup 的 generateBundle 钩子，只能处理 bundle 内的资源。
 * VitePress 的 chunks/metadata.*.js（js 的 hash map + 全站 site data）是通过
 * fs.writeFileSync 直接写到 outDir 的，因此一直是唯一没有 .gz/.br 的大文件，
 * 而它恰好又是首屏最大的单文件。
 *
 * 这里在 VitePress 的 buildEnd 钩子（页面渲染、sitemap 生成之后）统一补齐。
 * HTML 不在此处理：交给服务器动态压缩，避免产物里多出上百个 .gz/.br 文件。
 */
import {readdir, readFile, stat, writeFile} from "node:fs/promises";
import {join} from "node:path";
import {promisify} from "node:util";
import {brotliCompress, gzip} from "node:zlib";

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

/** 与 vite-plugin-compression 的 threshold 保持一致（10 KB） */
const SIZE_THRESHOLD = 10 * 1024;

/** 需要预压缩的扩展名（HTML 由服务器动态压缩，不在此列） */
const TARGET_EXTENSIONS = /\.(js|mjs|json|css)$/i;

async function collectFiles(dir: string, files: string[] = []) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) await collectFiles(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

async function exists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

export async function compressMissingAssets(siteConfig: {outDir: string; logger?: any}) {
  const logger = siteConfig.logger ?? console;
  const files = await collectFiles(siteConfig.outDir);
  let created = 0;
  let rawBytes = 0;
  let compressedBytes = 0;

  for (const file of files) {
    if (!TARGET_EXTENSIONS.test(file)) continue;

    const [hasGzip, hasBrotli] = await Promise.all([exists(file + ".gz"), exists(file + ".br")]);
    if (hasGzip && hasBrotli) continue;

    const {size} = await stat(file);
    if (size < SIZE_THRESHOLD) continue;

    const content = await readFile(file);
    if (!hasGzip) {
      const gzipContent = await gzipAsync(content, {level: 9});
      await writeFile(file + ".gz", gzipContent);
      created++;
      rawBytes += size;
      compressedBytes += gzipContent.length;
    }
    if (!hasBrotli) {
      const brotliContent = await brotliAsync(content);
      await writeFile(file + ".br", brotliContent);
      created++;
      rawBytes += size;
      compressedBytes += brotliContent.length;
    }
  }

  if (created > 0) {
    logger.info(
      `[compress-missing] 补齐 ${created} 个预压缩文件：${(rawBytes / 1024).toFixed(0)} KB → ${(compressedBytes / 1024).toFixed(0)} KB`,
    );
  }
}
