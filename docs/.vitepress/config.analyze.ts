/**
 * 打包产物分析插件（bundle analyzer）
 * ---------------------------------------------------------------------------
 * 用途：构建时收集「每个 chunk 包含哪些模块、各占多少体积、被谁 import」，
 *      输出 JSONL 供聚合分析，用来定位产物体积来源。
 *
 * 输出：默认写到项目内 .analyze/bundle-report.jsonl（可用 VP_ANALYZE_REPORT 覆盖路径）
 *
 * 快速使用（config.ts 已按 VP_ANALYZE 环境变量条件注册本插件，无需改代码）：
 *
 *   pnpm analyze          # 构建并采集依赖数据（产物输出到 .analyze/dist）
 *   pnpm deps <关键词>     # 查模块所在 chunk、体积、上下游依赖
 *
 * 说明：VitePress 1.6.3 的 CLI 不支持 --config（只接受 root / outDir 等位置参数），
 *      因此本文件不作为独立配置文件使用，而是只导出插件，由主配置按需引入。
 *
 * 数据字段：
 *   build       client / server
 *   chunk       产物 chunk 文件名
 *   module      模块绝对路径
 *   size        模块在该 chunk 中渲染后的字节数（minify 前，用于比较占比）
 *   importers            静态引用该模块的上游
 *   importedIds          该模块静态引用的下游
 *   dynamicImporters     动态 import（异步 chunk）该模块的上游
 *   dynamicImportedIds   该模块动态导入的下游
 *
 * 数据为 JSONL（每行一个模块），可用 pnpm deps 查询，也可自行聚合分析。
 */
import {appendFileSync, mkdirSync, rmSync} from "node:fs";
import {dirname, resolve} from "node:path";

/** 模块级分析数据输出路径（默认落在项目内 .analyze/，可不入库） */
export const analyzeReportFile =
  process.env.VP_ANALYZE_REPORT ?? resolve(process.cwd(), ".analyze/bundle-report.jsonl");

let reportInitialized = false;

/**
 * bundle 分析插件：产出模块级体积与依赖链数据
 */
export function bundleAnalyzePlugin() {
  return {
    name: "vitepress-bundle-analyze",
    apply: "build" as const,
    generateBundle(this: any, options: any, bundle: Record<string, any>) {
      // 本次构建的第一次调用：清空上一轮数据（client / server 两轮构建共用本实例）
      if (!reportInitialized) {
        reportInitialized = true;
        mkdirSync(dirname(analyzeReportFile), {recursive: true});
        rmSync(analyzeReportFile, {force: true});
      }

      const build = String(options?.dir ?? "").includes(".temp") ? "server" : "client";
      const rows: string[] = [];

      for (const [fileName, output] of Object.entries(bundle)) {
        if (output?.type !== "chunk") continue;
        for (const [id, mod] of Object.entries(output.modules ?? {})) {
          const info = this.getModuleInfo?.(id);
          rows.push(
            JSON.stringify({
              build,
              chunk: fileName,
              module: id,
              size: (mod as any)?.renderedLength ?? 0,
              importers: info?.importers ?? [],
              importedIds: info?.importedIds ?? [],
              dynamicImporters: info?.dynamicImporters ?? [],
              dynamicImportedIds: info?.dynamicImportedIds ?? [],
            }),
          );
        }
      }

      if (rows.length) appendFileSync(analyzeReportFile, rows.join("\n") + "\n");
    },
  };
}
