# 风起代码间 · fecym 的博客

基于 VitePress 与 `vitepress-theme-teek` 的个人技术博客模板，聚焦前端工程化与 Vue 生态实战。内容涵盖编码基础、CSS/HTML/JavaScript、Node、ECharts、Webpack/Vite、Git、Linux、ESLint、npm、面试题、工作技巧、MySQL、Nginx 及个人随笔等。

## 特性

- 基于 VitePress 构建，支持 Markdown + 组件增强，开发体验轻快
- 主题扩展：文章总览、分类、标签、归档、永久链接、卡片布局、阅读设置等
- 页面即路由：每篇文章支持 `date/title/categories/tags/permalink` 等前言信息
- 结构清晰：功能页与首页分离，便于迭代自定义
- 构建与部署简单：可部署到任意静态站点（Nginx/Apache/静态托管平台）

## 目录结构

```txt
├── docs
│   ├── .vitepress/
│   │   ├── config.ts               # 站点配置，扩展 Teek
│   │   ├── teekConfig.ts           # Teek 主题配置（本项目使用）
│   │   ├── teekConfig.template.ts  # Teek 配置模板（参考）
│   │   └── theme/                  # 自定义主题增强（可选）
│   ├── @pages/                     # 功能页（文章总览/分类/标签/归档/登录/风险链接）
│   │   ├── archivesPage.md
│   │   ├── articleOverviewPage.md
│   │   ├── categoriesPage.md
│   │   ├── loginPage.md
│   │   ├── riskLinkPage.md
│   │   └── tagsPage.md
│   ├── index.md                    # 首页（layout: home）
│   ├── intro.md                    # 关于博客
│   ├── personal.md                 # 赞助/个人页（可选）
│   └── public/                     # 静态资源（favicon、图片、二维码等）
├── package.json                    # 项目脚本与依赖
└── pnpm-lock.yaml
```

## 快速开始

- 开发预览：在浏览器打开本地开发服务器
- 构建静态：生成 `docs/.vitepress/dist` 静态资源
- 本地预览：本地服务预览构建产物

```bash
pnpm install
```

```bash
pnpm run docs:dev
```

```bash
pnpm run docs:build
```

```bash
pnpm run docs:preview
```

如果使用 npm 或 yarn，请将 `pnpm` 替换为对应命令。

## 写作与 Frontmatter

新建文章（任意子目录均可，推荐按主题归档），示例前言信息如下：

```markdown
---
title: 从 0 到 1 的前端工程化实践
date: 2025-01-10 10:00:00
permalink: /posts/fe-engineering-from-zero
categories:
  - 前端
  - 工程化
tags:
  - Vue
  - Vite
  - ESLint
outline: true        # 是否生成目录大纲
sidebar: true        # 是否显示侧边栏
article: true        # 标记为文章（Teek 会对文章做增强）
---

正文从这里开始...
```

建议：
- `permalink` 唯一且稳定，便于外链与 SEO
- `categories/tags` 用于主题聚合与检索
- 非文章页（如介绍/专题）可设置 `article: false` 或不设置

## 首页配置

首页在 `docs/index.md`，使用默认首页布局与 Teek 扩展样式。你可以自定义 `hero` 与 `features`：

```yaml
---
layout: home
hero:
  name: 风起代码间
  text: fecym 的博客
  tagline: 江湖有传言，任何可以使用 JavaScript 来编写的应用，最终会由 JavaScript 编写。
  actions:
    - theme: brand
      text: 关于本站
      link: /intro
    - theme: alt
      text: 所有文章
      link: /@pages/articleOverviewPage
    - theme: alt
      text: 分类导航
      link: /@pages/categoriesPage
    - theme: alt
      text: 标签索引
      link: /@pages/tagsPage
    - theme: alt
      text: 归档
      link: /@pages/archivesPage
features:
  - icon: 🧰
    title: 工程化与质量
    details: Vite/Webpack 优化、ESLint 规范，提升可维护性与稳定性。
  - icon: 🧩
    title: Vue 生态与实践
    details: 组件设计、状态管理、性能优化与 ECharts 可视化落地。
  - icon: 🚀
    title: 服务端与部署
    details: Node.js、Nginx、MySQL、Linux 运维与上线流程经验。
  - icon: 🤝
    title: 协作与效率
    details: Git、npm、CI/CD、规范化工作流，提升协作与交付速度。
---
```

## 主题与站点配置

- 站点配置：`docs/.vitepress/config.ts`（导航、搜索、站点信息、head 等）
- 主题配置：`docs/.vitepress/teekConfig.ts`（首页开关、作者信息、底部信息、代码块增强、分享、插件等）

更新站点描述（SEO 友好，建议简洁表达核心能力）：

```ts
// docs/.vitepress/config.ts 片段
const description = [
  "fecym 的技术博客：前端工程师，专注 Vue 全家桶与工程化",
  "记录编码基础、CSS/HTML/JavaScript、Node、ECharts、Webpack/Vite",
  "覆盖 Git、Linux、MySQL、Nginx、ESLint、npm、面试与实用技巧"
].join(" · ");
```

启用/关闭首页风格、作者与版权信息：

```ts
// docs/.vitepress/teekConfig.ts 片段
export const teekConfig = defineTeekConfig({
  teekHome: false,      // Teek 首页（博客风格）
  vpHome: true,         // VitePress 默认首页
  author: { name: "fecym", link: "https://github.com/fecym" },
  footerInfo: {
    theme: { name: `Theme By Teek` },
    copyright: { createYear: 2025, suffix: "Teek" },
  },
  articleShare: { enabled: true }
});
```

## 常用页面

由 Teek 提供的功能页（可直接使用）：

- 文章总览：`/@pages/articleOverviewPage` 或 `/articleOverview`
- 分类页：`/@pages/categoriesPage` 或 `/categories`
- 标签页：`/@pages/tagsPage` 或 `/tags`
- 归档页：`/@pages/archivesPage` 或 `/archives`
- 登录页：`/@pages/loginPage` 或 `/login`
- 风险链接页：`/@pages/riskLinkPage?target=<链接>`

可以在导航栏或首页中增加入口链接，提升可发现性与导览体验。

## 静态资源与品牌

- Favicon/Logo：位于 `docs/public`，在 `docs/.vitepress/config.ts` 的 `head` 中配置
- 替换图标：将 `teek-logo-mini.svg` 或 `favicon.ico` 替换为你的图标，并更新 `href` 路径
- 图片与二维码：统一放在 `docs/public/imgs` 或 `docs/public/qrcode`，便于管理

```ts
// docs/.vitepress/config.ts 片段（示例）
head: [
  { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
  { rel: "icon", type: "image/png", href: "/favicon.ico" }
]
```

## 构建与部署

- 构建产物输出目录：`docs/.vitepress/dist`
- 可部署到任意静态托管（Nginx/Apache/Netlify/Vercel/GitHub Pages）

GitHub Pages（最简脚本示例）：

```bash
pnpm run docs:build
```

```bash
cd docs/.vitepress/dist
```

```bash
git init
```

```bash
git add -A
```

```bash
git commit -m "deploy"
```

```bash
git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages
```

Nginx 示例（将 `root` 指向构建后的 `dist`）：

```bash
# /etc/nginx/sites-enabled/your-site.conf
```

```bash
server {
  listen 80;
  server_name your.domain.com;
  root /path/to/docs/.vitepress/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

修改后重载 Nginx 配置：

```bash
nginx -s reload
```

## 开发提示

- 修改 `config.ts` 或 `teekConfig.ts` 通常可热更新；少数场景（路由/插件）需重启开发服务
- 文章页可按需使用 `outline/sidebar/article` 控制页面行为
- 统一用 `permalink/categories/tags` 做结构化内容管理，便于聚合与复盘
- 推荐使用 `pnpm` 管理依赖（更快更稳），如需改用 npm/yarn 请按需替换命令

## 参考

- VitePress 文档：https://vitepress.dev/
- Teek 主题文档：https://vp.teek.top/

---
如需将首页扩展为“精选专题/推荐文章卡片组件”，或集成评论系统（如 Waline/Artalk），我可以继续为你补充示例与配置。