# 关于博客

## vuepress简介
- 我的博客是用 vuepress 快速搭建的
- vuepress是一个Vue 驱动的静态网站生成器，利用Markdown语法来快速书写
- 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- 享受 Vue + webpack 的开发体验，可以在 Markdown 中使用 Vue 组件，又可以使用 Vue 来开发自定义主题。
- VuePress 会为每个页面预渲染生成静态的 HTML，同时，每个页面被加载的时候，将作为 SPA 运行。
- 关于vuepress的简介可以查看官网的介绍，上手很容易 [传送门](https://vuepress.vuejs.org/zh/guide/#%E5%AE%83%E6%98%AF%E5%A6%82%E4%BD%95%E5%B7%A5%E4%BD%9C%E7%9A%84%EF%BC%9F)
- 下面来介绍下使用中遇到的一些问题，以及解决方法

## 快速上手

> 话不多少，先看看项目目录吧

### 项目基本结构

```sh
  ├── docs
  │   ├── .vuepress         # 可以理解为项目的配置文件吧
  │   │     └── config.js   # 项目配置文件
  │   │── other             # 其他要展示的页面
  │   └── README.md         # 首页
  ├── .travis.yml           # Travis CI 配置文件（配置自动化部署的关键，可以没有）
  ├── deploy.sh             # 项目部署脚本（可配置为自动化部署）
  └── package.json          # npm包依赖
```

### 搭建项目目录

- 那我们先搭建这些相关的文件目录，以及项目需要的依赖吧
```sh
  # 初始化项目
  npm init -y 
  # 下载依赖
  yarn add -D vuepress
  # 新建基本目录
  mkdir docs && cd docs
  mkdir .vuepress && cd .vuepress
  # 在 .vuepress 新建 config.js 文件
  touch config.js
  # 返回上一级新建READMEmd
  cd .. && touch README.md
  # 到根目录修改package.json文件，script脚本下写入以下命令
  "scripts": {
    "start": "vuepress dev docs",
    "build": "vuepress build docs"
  }
```
### 配置首页

- 此时我们基本的项目目录就搭建完毕了
- 此时我们就可以执行 yarn start 来运行我们的项目
- 默认的主题提供了一个首页（Homepage）的布局 (用于 这个网站的主页)。想要使用它，需要在你的根级 README.md 的 [YAML front matter](https://vuepress.vuejs.org/zh/guide/markdown.html#front-matter) 指定 home: true。以下是这个网站实际使用的数据：
```yaml
  ---
    home: true
    heroImage: /hero.png
    actionText: 快速上手 →
    actionLink: /zh/guide/
    features:
    - title: 简洁至上
      details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
    - title: Vue驱动
      details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
    - title: 高性能
      details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
    footer: MIT Licensed | Copyright © 2018-present Evan You
    ---
```
### 注意事项

::: warning 注意事项
  理论上vuepress搭建的文档是支持热加载的，但是README.me的修改，config.js的修改以及配置了侧边栏为自动生成的时候，侧边栏的生成都需要重启项目才可以看到效果，他们是不会热更新的
:::
### 主题配置

- 导航栏可能包含你的页面标题、搜索框、 导航栏链接、多语言切换、仓库链接，它们均取决于你的配置。
- 通过配置 .vuepress/config.js 来配置我们的导航，基本语法如下 [传送门](https://vuepress.vuejs.org/zh/default-theme-config/)

```js 
  module.exports = {
    // base用来配置部署github后的文件夹
    // base: './',
    // 文章的标题
    title: 'Today',
    // 文章的介绍
    description: 'Today, have you studied yet?',
    // 主题的配置，核心配置
    themeConfig: {
      // 导航的配置
      nav: [
        { text: '首页', link: '/' },
        // 可下拉的导航
        {
          text: 'webpack',
          items: [
            { text: 'webpack简介', link: '/webpack/index' },
            { text: '从0搭建vue', link: '/webpack/vue' }
          ]
        },
        { text: 'mapbox', link: '/mapbox/index' },
        { text: 'vue', link: '/vue' },
      ],
      // 导航栏的配置，自动生成
      sidebar: 'auto',
      // 显示最后更新时间
      lastUpdated: '最后更新时间'
    },
    // Markdown的配置，包括Markdown的拓展
    markdown: {
      // 代码块显示行号
      lineNumbers: true 
    }
  }
```
- 在nav中配置标题是text字段，链接要写在link中，也可以写外部链接
- 默认的 / 执行了docs目录，比如 /webpack/index 实际上是 /docs/webpack/index.md

## 线上部署
