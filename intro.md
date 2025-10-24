---
url: /docs/intro.md
---

## 关于博客

* 本博客现已使用 VitePress 搭建，并基于 `vitepress-theme-teek` 主题扩展
* VitePress 是一个基于 Vite 的静态站点生成器，使用 Markdown 编写并享受更快的开发体验
* Teek 在默认主题基础上增强，提供文章概览、分类/标签、归档、永久链接、卡片布局等博客能力
* 每个页面预渲染静态 HTML，加载后作为 SPA 运行
* 参考：
  * VitePress 官方文档：<https://vitepress.dev/>
  * Teek 主题文档（配置参考）：<https://vp.teek.top/>

## 快速上手

> 先看项目目录结构

### 项目基本结构

```txt
├── docs
│   ├── .vitepress/
│   │   ├── config.ts         # 站点配置，扩展 Teek
│   │   ├── teekConfig.ts     # Teek 主题配置（本项目使用）
│   │   ├── teekConfig.template.ts  # Teek 配置模板（参考用）
│   │   └── theme/            # 自定义主题增强（可选）
│   ├── @pages/               # Teek 功能页（文章总览/分类/标签/归档/登录/风险链接）
│   │   ├── archivesPage.md
│   │   ├── articleOverviewPage.md
│   │   ├── categoriesPage.md
│   │   ├── loginPage.md
│   │   ├── riskLinkPage.md
│   │   └── tagsPage.md
│   ├── index.md              # 首页（layout: home）
│   ├── intro.md              # 本页：博客说明
│   ├── personal.md           # 支持赞助页
│   └── public/               # 静态资源（favicon、图片、二维码等）
```

### 启动与构建

* 开发预览：`pnpm run docs:dev`
* 构建静态：`pnpm run docs:build`
* 本地预览构建产物：`pnpm run docs:preview`

构建输出目录：`docs/.vitepress/dist`

## 配置首页

本项目首页使用 VitePress 默认首页布局（支持 Teek 扩展样式）。在 `docs/index.md` 的 frontmatter 指定 `layout: home`，并配置 `hero` 与 `features`：

你也可以用 Teek 的 UI 能力优化首页视觉与交互（例如阅读设置按钮、动画等），示例已在 `docs/index.md` 中实现。

## 主题与站点配置

站点配置在 `docs/.vitepress/config.ts`，通过 `extends: teekConfig` 继承 Teek 主题配置，并配置导航、搜索、站点信息等：

Teek 配置在 `docs/.vitepress/teekConfig.ts`，用于控制主题增强能力：

```ts
// @ts-ignore
import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  teekHome: false,        // 是否启用 Teek 的首页（博客风格）
  vpHome: true,           // 是否启用 VitePress 默认首页
  sidebarTrigger: true,   // 侧边栏折叠触发器
  author: { name: "fecym", link: "https://github.com/fecym" },
  footerInfo: {
    theme: { name: `Theme By Teek@${version}` },
    copyright: { createYear: 2025, suffix: "Teek" },
  },
  codeBlock: {
    copiedDone: (TkMessage) => TkMessage.success("复制成功！"),
  },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: { initItems: true },
  },
});
```

更多可选配置请参考模板文件 `teekConfig.template.ts`（涵盖约 95% 的 Teek 配置项）。

## 功能页入口

* 站点已内置以下功能页（由 Teek 提供）：
  * 文章总览：`/@pages/articleOverviewPage` 或 `/articleOverview`
  * 分类页：`/@pages/categoriesPage` 或 `/categories`
  * 标签页：`/@pages/tagsPage` 或 `/tags`
  * 归档页：`/@pages/archivesPage` 或 `/archives`
  * 登录页：`/@pages/loginPage` 或 `/login`
  * 风险链接提示页：`/@pages/riskLinkPage` 或 `/risk-link?target=<链接>`

你可以在导航栏或首页中为这些页面添加入口链接。

## 注意事项

* `.vitepress/config.ts` 与主题配置修改后，通常可热更新；少数场景（比如部分路由/插件）可能需要重启开发服务
* Markdown 支持行号、容器、图片懒加载等已在配置中启用，可按需调整
* 文章/页面 frontmatter 可使用 `outline: false`、`sidebar: false`、`article: false` 控制页面行为（Teek 会对 `article` 做额外处理）

## 线上部署

* 构建：`pnpm run docs:build`，生成静态资源到 `docs/.vitepress/dist`
* 部署到任何静态服务器（Nginx/Apache/静态托管平台）都可直接使用 `dist` 内容

示例（部署到 GitHub Pages 的基本脚本）：

```sh
#!/usr/bin/env sh
set -e

pnpm run docs:build
cd docs/.vitepress/dist

git init
git add -A
git commit -m 'deploy'

# 发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

你也可以使用 GitHub Actions 进行自动化部署（推荐），参考 VitePress 官方文档的 CI/CD 指南。

## 评论与交互（可选）

* Teek 未内置评论系统，但可与社区评论服务搭配使用（如 Waline、Artalk 等），通过在页面或主题增强里加载对应客户端即可
* 建议选择兼容 Vue 3 的方案，并在文章页底部挂载评论组件
* 如果你需要，我可以按你选择的评论服务提供集成示例

:tada: :100:
