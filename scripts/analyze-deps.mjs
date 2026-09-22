#!/usr/bin/env node
/**
 * 查询 pnpm analyze 采集到的依赖数据（.analyze/bundle-report.jsonl）
 *
 *   pnpm deps <关键词>            匹配模块：所在 chunk、体积、直接上下游依赖
 *   pnpm deps <关键词> --up 3     向上追溯 3 层「谁引用了它」（定位体积来源）
 *   pnpm deps <关键词> --down 2   向下展开 2 层「它引用了谁」
 *   pnpm deps --chunks            列出 chunk 体积排行
 *   pnpm deps <关键词> --limit 20 匹配结果较多时调整显示数量
 *
 * 数据文件可用 VP_ANALYZE_REPORT 指定；默认 <项目根>/.analyze/bundle-report.jsonl
 */
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";

const argv = process.argv.slice(2);
const options = {};
const keywords = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--up" || arg === "--down" || arg === "--limit") {
    options[arg.slice(2)] = Number(argv[++i] ?? 3);
  } else if (arg === "--chunks") {
    options.chunks = true;
  } else {
    keywords.push(arg);
  }
}

const reportFile =
  process.env.VP_ANALYZE_REPORT ?? resolve(process.cwd(), ".analyze/bundle-report.jsonl");

if (!existsSync(reportFile)) {
  console.error(`找不到依赖数据：${reportFile}`);
  console.error(`请先执行：pnpm analyze`);
  process.exit(1);
}

const records = readFileSync(reportFile, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map(line => JSON.parse(line));

const client = records.filter(r => r.build === "client");
const byModule = new Map();
for (const record of client) {
  if (!byModule.has(record.module)) byModule.set(record.module, record);
}

const short = id =>
  id
    .replace(/^.*?node_modules\/\.pnpm\/[^/]+\/node_modules\//, "")
    .replace(/^.*?node_modules\//, "")
    .replace(/^.*?\/vite-docs\//, "");

const MAX_LINES = 60;

function printChunks() {
  const sizes = new Map();
  for (const record of client) {
    sizes.set(record.chunk, (sizes.get(record.chunk) ?? 0) + record.size);
  }
  console.log(`\nchunk 体积排行（渲染前，共 ${client.length} 个模块记录）\n`);
  for (const [chunk, size] of [...sizes].sort((a, b) => b[1] - a[1]).slice(0, options.limit ?? 15)) {
    console.log(`  ${(size / 1024).toFixed(0).padStart(6)}K  ${chunk}`);
  }
  console.log();
}

const UPWARD = [
  {key: "importers", arrow: "←", label: "被静态引用"},
  {key: "dynamicImporters", arrow: "⇠", label: "被动态导入（异步 chunk）"},
];
const DOWNWARD = [
  {key: "importedIds", arrow: "→", label: "静态引用了"},
  {key: "dynamicImportedIds", arrow: "⇢", label: "动态导入了"},
];

function printDirect(record, groups) {
  let total = 0;
  for (const {key, arrow, label} of groups) {
    const items = record[key] ?? [];
    total += items.length;
    if (!items.length) continue;
    console.log(`   ${label}（${items.length}）`);
    for (const item of items.slice(0, 8)) console.log(`     ${arrow} ${short(item)}`);
    if (items.length > 8) console.log(`     … 其余 ${items.length - 8} 个`);
  }
  if (!total) console.log(`   （无）`);
}

function printChain(startId, groups, depth) {
  let printed = 0;
  const seen = new Set([startId]);
  const walk = (id, level) => {
    if (level >= depth || printed >= MAX_LINES) return;
    const record = byModule.get(id);
    if (!record) return;
    for (const {key, arrow} of groups) {
      for (const next of record[key] ?? []) {
        if (printed >= MAX_LINES) return;
        const indent = "     " + "  ".repeat(level);
        console.log(`${indent}${arrow} ${short(next)}`);
        printed++;
        if (seen.has(next)) continue;
        seen.add(next);
        walk(next, level + 1);
      }
    }
  };
  walk(startId, 0);
}

if (options.chunks || keywords.length === 0) {
  printChunks();
  if (!keywords.length) {
    console.log("用法：pnpm deps <模块关键词> [--up N] [--down N] [--chunks]");
  }
  process.exit(0);
}

const hits = client.filter(record => keywords.some(keyword => record.module.includes(keyword)));

if (!hits.length) {
  console.log(`\n没有匹配「${keywords.join(" ")}」的模块。可先执行 pnpm deps --chunks 看看有哪些 chunk。\n`);
  process.exit(0);
}

const limit = options.limit ?? 8;
const sorted = [...hits].sort((a, b) => b.size - a.size);
const showDetail = Boolean(options.up || options.down) || sorted.length === 1;

// 命中多个模块时先给出清单（按体积排序），避免一次打印几十条依赖链
if (!showDetail) {
  const shown = sorted.slice(0, limit).map(hit => ({
    size: `${hit.size.toLocaleString()} 字节`,
    name: short(hit.module),
    chunk: hit.chunk.replace(/^assets\/(chunks\/)?/, ""),
  }));
  const nameWidth = Math.min(64, Math.max(...shown.map(row => row.name.length)));
  console.log(`\n匹配 ${sorted.length} 个模块（按体积排序，显示前 ${shown.length} 个）\n`);
  for (const row of shown) {
    console.log(`  ${row.size.padStart(12)}  ${row.name.padEnd(nameWidth)}  ${row.chunk}`);
  }
  console.log(`\n查看依赖链：pnpm deps <更精确的关键词> --up 3`);
  console.log(`例如：pnpm deps echarts/index.js --up 3   或   pnpm deps ContributeChart --up 3\n`);
  process.exit(0);
}

console.log(`\n匹配 ${sorted.length} 个模块\n`);

for (const [index, hit] of sorted.slice(0, limit).entries()) {
  console.log(`${index + 1}) ${short(hit.module)}`);
  console.log(`   所在 chunk  ${hit.chunk}`);
  console.log(`   体积        ${hit.size.toLocaleString()} 字节（渲染前）`);
  if (options.up) {
    console.log(`   引入链（向上 ${options.up} 层）：`);
    printChain(hit.module, UPWARD, options.up);
  } else {
    printDirect(hit, UPWARD);
  }
  if (options.down) {
    console.log(`   依赖链（向下 ${options.down} 层）：`);
    printChain(hit.module, DOWNWARD, options.down);
  } else {
    printDirect(hit, DOWNWARD);
  }
  console.log();
}
