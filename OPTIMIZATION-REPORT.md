# 风起代码间博客 · 构建产物优化报告

> 项目：fecym-blog（VitePress 1.6.3 + vitepress-theme-teek 1.5.4）
> 时间：2026-09-22
> 范围：产物体积、首屏加载、归档页贡献图响应式、冗余资源清理
> 验证方式：对照构建（`pnpm exec vitepress build docs`）+ 模块级 bundle 分析 + ECharts 布局实测

---

## 一、结论速览

| # | 优化项                  | 收益                                          |
|---|----------------------|---------------------------------------------|
| 1 | echarts 改异步 + 按需注册   | 首屏 JS 少 1.04 MB（gzip -340 KB），仅归档页按需加载      |
| 2 | 补齐 `metadata.js` 预压缩 | 首屏最大单文件 413 KB → gzip 113 KB / brotli 18 KB |
| 3 | 归档页贡献图响应式            | 移动端不再横向溢出；窄屏自动缩放；过窄自动隐藏                     |
| 4 | 清理冗余资源               | 图片 -1.30 MB、LLM 产物 -1.24 MB、字体 -263 KB      |

整体结果：

- **产物总量 20503 KB → 16818 KB（-3.60 MB，-18%）**，文件数 477 → 415
- **首页首屏 gzip 997 KB → 360 KB（-64%）**，brotli 895 KB → 229 KB（-74%）
- 归档页贡献图在 700~1220px 容器下均完整显示，留白从上下各约 80px 收敛到 28/12px

---

## 二、问题分析

### 2.1 echarts 全量代码进入所有页面首屏（最严重）

**现象**：全局 `theme.*.js` 达 1,486,324 字节，且每个页面的 HTML 都有
`<link rel="modulepreload" href="/assets/chunks/theme.*.js">`。

**定位过程**：用一个 `generateBundle` + `getModuleInfo` 的分析插件导出模块级数据
（chunk / 模块路径 / 渲染后体积 / importers），按分组归类后发现：

| 分组                    |   渲染前体积 | 占 theme chunk |
|-----------------------|--------:|--------------:|
| **echarts + zrender** | 2712 KB |     **74.2%** |
| teek 主题自身             |  597 KB |         16.3% |
| @vue/compiler-core    |  132 KB |          3.6% |
| vitepress 运行时         |  119 KB |          3.3% |
| @iconify/vue          |   47 KB |          1.3% |
| js-yaml               |   25 KB |          0.7% |

**根因**：`docs/.vitepress/theme/components/ContributeChart.vue` 使用 `import * as echarts from "echarts"`
全量引入，而该组件被 `TeekLayoutProvider.vue` **同步 import** 进全局 Layout；
组件实际只在归档页的 `teek-archives-top-before` 插槽渲染，却让 45 篇文档、首页、清单页
等所有页面首屏都下载了完整 echarts（含 line / bar / treemap / gauge / timeline 等全部图表类型）。

**依赖链**（Rollup `importers` 实测）：

```
echarts/index.js
  ← ContributeChart.vue?vue&type=script
     ← ContributeChart.vue
        ← TeekLayoutProvider.vue   （全局 Layout）
```

### 2.2 `metadata.js` 是首屏最大文件，却没有预压缩

**现象**：全站 JS/CSS 都生成了 `.gz` + `.br`，唯独 `assets/chunks/metadata.*.js`（413~423 KB）没有。

**根因**：VitePress 在渲染阶段直接写盘（源码 `generateMetadataScript()` 中的
`fs.writeFileSync(resolvedMetadataFile, metadataContent)`），绕过了 Rollup 的 `generateBundle` 钩子，
因此 `vite-plugin-compression` 完全看不到它。

**内容构成**（执行该文件后解析 `window.__VP_SITE_DATA__`）：

| 字段                          |           大小 |
|-----------------------------|-------------:|
| `themeConfig`               |     263.6 KB |
| 　└ `posts`（45 篇文章的 8 份派生列表） | **240.6 KB** |
| 　└ `docAnalysisInfo`        |      18.7 KB |
| `__VP_HASH_MAP__`           |         2 KB |

`posts` 里 `allPosts` / `originPosts` / `sortPostsByDateAndSticky` / `sortPostsByDate` /
`groupPostsByYear` / `groupPostsByYearMonth` / `groupPosts` / `groupCards` 是同一批文章的不同视图，
数据重复 8 次；单篇字段中 `capture`（摘要）占 13.4 KB。

### 2.3 归档页贡献图在移动端展示异常

三层原因叠加：

1. **整页横向溢出**：组件样式给归档页内容区写死 `width: 1220px`，手机视口（375~430px）
   下整页横向滚动，图表被裁到只剩左边一小部分。
2. **几何约束**：日历热力图宽度 ≈ `53 周 × 格子尺寸 + 标签`。`cellSize: 20` 时约需 1140px，
   手机宽度必然放不下。
3. **留白过大**（用户截图反馈）：容器高度写死 260px，而内容高度只有 `7 × 格子尺寸`；
   格子尺寸按 3 档保守取值（1111px 宽只选到 14px）。实测该场景下日历只占 `742 × 98`，
   左/右留白 104/265px、上/下留白 60/102px。

### 2.4 冗余资源

| 资源                                             | 问题                                                             |
|------------------------------------------------|----------------------------------------------------------------|
| `docs/public/blog/bg1~bg4.webp`                | 1.3 MB，全项目（配置 / CSS / markdown）零引用                             |
| `llms.txt` + `llms-full.txt` + 52 个页面 `.md` 副本 | 1.27 MB；且 `llms.txt` 的链接全部指向 `.md` 副本，只删副本会造成全量死链              |
| Inter 字体 14 个子集                                | 628 KB，其中 cyrillic / greek / vietnamese 共 10 个文件（259 KB）在本站用不到 |

---

## 三、优化过程

### 3.1 定位方法

新增一个临时分析插件（保留为 `docs/.vitepress/config.analyze.ts`），在 `vite.plugins` 中加一行即可启用：

```ts
{
  name: "vitepress-bundle-analyze",
    generateBundle(options, bundle)
  {
    // 逐 chunk、逐模块导出：build / chunk / module / size / importers
    // 写入 /private/tmp/bundle-report.jsonl
  }
,
}
```

配合对照构建（基线 `/private/tmp/vp-base`、实验 A/B、最终产物 `love`）逐项量化。
说明：VitePress 1.6.3 的 CLI 只接受 `root` / `outDir` 位置参数，不支持 `--config`，
因此该文件作为插件模块由主配置引入，而不是独立配置文件。

### 3.2 第一批：首屏体积

**改动 1 — 组件异步化**（`TeekLayoutProvider.vue`）

```ts
const ContributeChart = defineAsyncComponent(() => import("./ContributeChart.vue"));
```

**改动 2 — echarts 按需注册**（`ContributeChart.vue`）

```ts
import * as echarts from "echarts/core";
import {HeatmapChart} from "echarts/charts";
import {CalendarComponent, TooltipComponent, VisualMapComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";

echarts.use([HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent, CanvasRenderer]);
```

**改动 3 — 补齐预压缩**（`config.ts` 的 `buildEnd` + 新增 `compressMissing.ts`）

VitePress 的 `buildEnd` 在页面渲染、sitemap 生成之后触发，此时 `metadata.js` 已落盘。
在此阶段扫描 `outDir`，为「>10 KB 且缺少 `.gz`/`.br`」的 js/css/json 补齐两种压缩产物
（HTML 交给服务器动态压缩，避免产物里多出上百个压缩文件）。

**结果**：

| 指标             |           基线 |                                第一批后 |
|----------------|-------------:|------------------------------------:|
| 全局 theme chunk |  1,486,324 B |                           445,356 B |
| echarts chunk  | 打进 theme（全局） |   1,037,908 B → 按需后 446,543 B（仅归档页） |
| `metadata.js`  |  413 KB（无压缩） | 413 KB + gzip 113 KB + brotli 18 KB |
| 首页首屏 gzip      |       997 KB |                              661 KB |

### 3.3 第二批：移动端适配与冗余清理

**归档页自适应**：

- 内容区 `width: 1220px` → `width: 100%; max-width: 1220px`（宽屏视觉不变，窄屏不再溢出）；
- 贡献图按容器宽度选择格子尺寸、跟随宽度重绘（`ResizeObserver`）；
- 视口过窄时隐藏图表（日历最小可读宽度约 630px）。

**字体裁剪**：新增 `trimFonts.ts`，用 Vite `load` 钩子把 vitepress 默认主题的
`theme-default/styles/fonts.css` 替换为 `theme/styles/fonts-trimmed.css`（只保留
Inter 的 latin / latin-ext 罗马体与斜体，保留中文标点 `Punctuation SC` 的 `local()` 规则）。

**移除 LLM 产物**：`llms.txt` 的每条链接都指向插件生成的 `.md` 副本
（例如 `[常见的 HTTP 认证方式](/01.前端/04. 浏览器/jwt.md)`），只删副本会得到一份全量死链的索引，
因此整体移除 `vitepress-plugin-llms`（同时首页的 “Are you an LLM? View /llms.txt” 提示一并消失）。

**删除零引用图片**：`docs/public/blog/bg1~bg4.webp`（1.3 MB）。

### 3.4 第三批：贡献图留白精修

针对用户截图中「边缘区域太大」的问题：

- 格子尺寸按宽度精算：`floor((宽度 - 100) / 53)`，限制在 10~20px（不再按 3 档跳）；
- 容器高度贴合内容：`高度 = 7 × 格子尺寸 + 28（月份标签）+ 12（底部留白）`；
- `calendar.top` 固定 28。

---

## 四、优化结果

### 4.1 首屏传输（HTML 中 `modulepreload` / `script` / `preload` 声明的资源合计）

| 页面  | 指标     |      基线 |        优化后 |       变化 |
|-----|--------|--------:|-----------:|---------:|
| 首页  | 原始     | 2259 KB |    1240 KB |     -45% |
| 首页  | gzip   |  997 KB | **360 KB** | **-64%** |
| 首页  | brotli |  895 KB | **229 KB** | **-74%** |
| 文章页 | gzip   |  991 KB |     354 KB |     -64% |
| 文章页 | brotli |  890 KB |     224 KB |     -75% |

优化后首页首屏构成：`theme.js` 435 KB（gz 145 / br 122）、`metadata.js` 413 KB（gz 113 / br 18）、
`framework.js` 135 KB（gz 53）、`theme.css` 245 KB（gz 41 / br 34）、页面 chunk 13 KB。

### 4.2 产物体积

| 类别             |       基线 |          优化后 |     变化 |
|----------------|---------:|-------------:|-------:|
| 产物总量           | 20503 KB | **16818 KB** | -18.0% |
| 文件数            |      477 |          415 | -13.0% |
| JS             |  6671 KB |      6080 KB |  -8.9% |
| JS（gzip 后合计）   |  1213 KB |      1131 KB |  -6.7% |
| JS（brotli 后合计） |   961 KB |       830 KB | -13.7% |
| 图片             |  4202 KB |      2871 KB | -31.7% |
| 字体             |   628 KB |       365 KB | -41.9% |
| LLM 产物         |  1274 KB |         0 KB |  -100% |
| HTML           |  4940 KB |      4929 KB |  -0.2% |

### 4.3 归档页贡献图布局

所有档位均由 ECharts `getRect()` 实测（非估算），内容完整落在容器内：

|         容器 |   格子 | 日历内容       | 左右留白    | 上下留白    |
|-----------:|-----:|------------|---------|---------|
| 1220 × 180 | 20px | 1060 × 140 | 80 / 80 | 28 / 12 |
| 1111 × 173 | 19px | 1007 × 133 | 52 / 52 | 28 / 12 |
|  950 × 152 | 16px | 848 × 112  | 51 / 51 | 28 / 12 |
|  800 × 131 | 13px | 689 × 91   | 56 / 56 | 28 / 12 |
|  700 × 117 | 11px | 583 × 77   | 59 / 59 | 28 / 12 |
| 视口 < 720px |    — | —          | —       | 隐藏图表    |

用户截图场景（1111px 宽）前后对比：

|     | 容器尺寸       |       日历内容 | 左/右留白     | 上/下留白    |
|-----|------------|-----------:|-----------|----------|
| 调整前 | 1111 × 260 |   742 × 98 | 104 / 265 | 60 / 102 |
| 调整后 | 1111 × 173 | 1007 × 133 | 52 / 52   | 28 / 12  |

### 4.4 改动文件清单

| 文件                                                        | 类型     | 说明                                                                                  |
|-----------------------------------------------------------|--------|-------------------------------------------------------------------------------------|
| `docs/.vitepress/config.ts`                               | 修改     | 注册 `trimFontsPlugin()`；`buildEnd: compressMissingAssets`；移除 `vitepress-plugin-llms` |
| `docs/.vitepress/theme/components/TeekLayoutProvider.vue` | 修改     | ContributeChart 改 `defineAsyncComponent`                                            |
| `docs/.vitepress/theme/components/ContributeChart.vue`    | 修改     | echarts 按需注册；容器/格子自适应；过窄隐藏；高度贴合内容                                                   |
| `docs/.vitepress/compressMissing.ts`                      | 新增     | `buildEnd` 阶段补齐 Rollup 之外写盘文件的 `.gz`/`.br`                                          |
| `docs/.vitepress/trimFonts.ts`                            | 新增     | 用 Vite `load` 钩子替换默认 `fonts.css`                                                    |
| `docs/.vitepress/theme/styles/fonts-trimmed.css`          | 新增     | 仅保留 Inter latin / latin-ext + 中文标点规则                                                |
| `docs/.vitepress/config.analyze.ts`                       | 新增（工具） | bundle 模块级分析插件，按需引入，不参与常规构建                                                         |
| `docs/public/blog/bg1~bg4.webp`                           | 删除     | 零引用资源 1.3 MB                                                                        |

---

## 五、验证方法与证据

1. **构建**：`pnpm exec vitepress build docs` 退出码 0，日志输出
   `[compress-missing] 补齐 2 个预压缩文件：826 KB → 131 KB`。
2. **压缩覆盖**：扫描产物，`assets` 下所有 >10 KB 的 `.js`/`.css` 均已带 `.gz` 与 `.br`
   （基线中 `metadata.js` 是唯一缺口）。
3. **首屏隔离**：`index.html`、`basic/interview.html` 中 echarts 出现次数为 0；
   `archives.html` 保留 SSR 图表容器，`ContributeChart` 的 JS/CSS 仅归档页按需加载。
4. **按需注册完整性**：用相同模块组合在 Node 中 SSR 渲染，产出 369 个 path、21 个文本标签
   （含 2025/2026 年份与中文月份/星期），运行期零告警——缺模块时 ECharts 会打印
   “Component ... not exists”。
5. **布局正确性**：第四节表格中的日历占位尺寸均来自 ECharts `getRect()` 实测。
6. **字体**：产物仅剩 4 个 woff2；CSS 中 `cyrillic|greek|vietnamese` 匹配数为 0。
7. **LLM 产物**：产物中 `.md` 副本 0 个、`*.txt` 0 个。

**未覆盖**：本机无头 Chrome 启动受阻（多次尝试，非网络问题），因此移动端效果仅在
布局计算层面验证，未做真机截图核对。

---

## 六、遗留事项与后续建议

| 项              | 说明                                                                                          | 预期收益          |
|----------------|---------------------------------------------------------------------------------------------|---------------|
| 真机确认归档页        | 建议用手机或 DevTools 移动模拟核对贡献图隐藏/缩放表现                                                            | —             |
| `posts` 数据重复   | site data 中同一批文章存了 8 份派生列表（240 KB），需改主题机制                                                   | gzip 后约 40 KB |
| `echarts` 依赖归类 | 实际是客户端运行时依赖，却声明在 `devDependencies`                                                          | 0（语义修正）       |
| 部署方式与预压缩       | `deploy.sh` 推 GitHub Pages，`.gz`/`.br` 不会被使用；若改自建 Nginx，需开启 `gzip_static` / `brotli_static` | 视部署方式         |
| 搜索索引           | `@localSearchIndexroot.*.js` 872 KB（懒加载），当前可接受                                              | 内容继续增长时再评估    |

---

## 十一、图片资源 webp 化

### 背景与数据

`docs/public` 下的 118 张 jpg/png 统一转为 webp：

| | 数量 | 体积 |
|---|---:|---:|
| 原 jpg/png | 118 | 2.79 MB |
| 现 webp | 118 | 2.06 MB |

净减少 0.73 MB（-26%）。

### 引用替换

扫描 69 个文档/配置文件，共发现 118 处本地图片引用：

| 类别 | 数量 | 处理 |
|---|---:|---|
| 存在同名 `.webp` | 106 | 已替换（104 处站内 + 2 处自有域名外链 `chengyuming.cn`） |
| 历史死链（原图本就不存在） | 6 | 保持原样 |
| 第三方外链（jsdelivr 头像） | 2 | 保持原样 |

补充说明：

- 104 处站内引用全部是绝对路径（`/imgs/xxx.jpg`），不存在相对路径歧义；
- 替换时跳过 markdown 代码块，避免改坏文章里的示例代码（如 webpack 的 `test: /\.png$/`）；
- 涉及 3 处代码引用：`theme/components/404.vue`、`theme/index.ts`（赞赏二维码）、`@pages/loginPage.md`（登录页背景）；
- `teekConfig.template.ts` 只改了 1 处真实引用（`/appreciate-qrcode.jpg`），其中 4 处 `/img/bg*.jpg` 属死链未动。

### 配套脚本（保留在 scripts/）

| 脚本 | 用途 |
|---|---|
| `scripts/replace-image-refs.mjs` | 精确替换图片引用；默认预览，`--write` 落盘，自带死链/外链排除 |
| `scripts/check-asset-refs.mjs` | 校验产物里的资源引用是否都能落地（`pnpm check:assets`） |

### 验证结果

1. 替换脚本复跑：**0 个文件、0 处可替换**（幂等）；
2. `pnpm build` 成功，`pnpm check:assets`：产物 110 处图片引用，**缺失 0 处**；
3. 顺带发现（与本次改动无关）：
   - 文章正文里有 10 处指向旧站路径的链接（`/views/basis/css.html`、`/node/fs.html`、`/views/webpack/` 等）；
   - teek 主题自带的 `iconfont.woff2/woff/ttf` 在产物中缺失，构建时即有 3 条 warning（主题包问题）。

## 附录 A：复现命令

```bash
# 常规构建（产物输出到项目根 love/）
pnpm build

# 依赖分析：构建 + 采集模块级数据（产物 .analyze/dist，数据 .analyze/bundle-report.jsonl）
pnpm analyze

# 查询依赖
pnpm deps --chunks                          # chunk 体积排行
pnpm deps echarts                           # 匹配模块清单（按体积排序）
pnpm deps echarts/core.js --up 3            # 向上追溯 3 层：谁引用了它
pnpm deps ContributeChart --up 3 --down 1   # 上下游一起看（⇠ / ⇢ 表示异步 chunk 边界）

# 对照构建（输出到指定目录）
pnpm exec vitepress build docs --outDir /private/tmp/vp-base
```

## 附录 B：相关产物与数据

| 路径                                        | 内容                                        |
|-------------------------------------------|-------------------------------------------|
| `.analyze/bundle-report.jsonl`            | 项目内依赖数据（`pnpm analyze` 生成，已 gitignore）    |
| `.analyze/dist`                           | 分析构建的产物（一次性，可随时删除）                        |
| `/private/tmp/vp-base`                    | 优化前基线产物                                   |
| `/private/tmp/vp-opt`、`vp-opt2`、`vp-opt3` | 各批次优化后的对照产物                               |
| `/private/tmp/bundle-report.jsonl`        | 模块级原始数据（chunk / 模块 / 体积 / importers）      |
| `/private/tmp/vp-analysis/`               | 聚合数据：chunk 体积 CSV、theme chunk 模块构成、分析过程记录 |
