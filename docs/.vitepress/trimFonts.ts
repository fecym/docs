/**
 * 用裁剪版字体样式替换 VitePress 默认主题的 fonts.css。
 *
 * 默认主题会在 client/theme-default/index.js 中 import './styles/fonts.css'，
 * 该文件包含 Inter 的 14 个字形子集（cyrillic / greek / vietnamese / latin-ext / latin …），
 * 全部会在构建时拷进 assets。本站正文是中文（走系统字体），只需保留 latin / latin-ext。
 *
 * 这里用 load 钩子拦截该文件并返回裁剪版内容；因为 load 返回的内容仍以原文件路径为基准
 * 解析 url()，所以裁剪版 CSS 里沿用 ../fonts/xxx.woff2 的相对路径即可。
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";

const FONT_CSS_RE = /vitepress[\\/]dist[\\/]client[\\/]theme-default[\\/]styles[\\/]fonts\.css$/;

export function trimFontsPlugin() {
  let siteRoot = process.cwd();

  return {
    name: "trim-fonts",
    enforce: "pre" as const,
    configResolved(config: {root: string}) {
      siteRoot = config.root;
    },
    load(id: string) {
      if (!FONT_CSS_RE.test(id)) return null;
      return readFileSync(join(siteRoot, ".vitepress/theme/styles/fonts-trimmed.css"), "utf8");
    },
  };
}
