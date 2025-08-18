import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";
import llmstxt from "vitepress-plugin-llms";


const description = [
  "欢迎来到 vitepress-theme-teek 使用文档",
  "Teek 是一个基于 VitePress 构建的主题，是在默认主题的基础上进行拓展，支持 VitePress 的所有功能、配置",
  "Teek 拥有三种典型的知识管理形态：结构化、碎片化、体系化，可以轻松构建一个结构化知识库，适用个人博客、文档站、知识库等场景",
].toString();

const teekConfig = defineTeekConfig({
  sidebarTrigger: true,
  author: { name: "Teeker", link: "https://github.com/Kele-Bingtang" },
  blogger: {
    avatar: "https://testingcf.jsdelivr.net/gh/Kele-Bingtang/static/user/avatar1.png",
    shape: "circle-rotate",
    name: "天客",
    slogan: "朝圣的使徒，正在走向编程的至高殿堂！",
    circleBgImg: "/blog/bg4.webp",
    color: "#ffffff",
  },
  footerInfo: {
    theme: {
      name: `Theme By Teek@${version}`,
    },
    copyright: {
      createYear: 2025,
      suffix: "Teek",
    },
  },
  codeBlock: {
    copiedDone: TkMessage => TkMessage.success("复制成功！"),
  },
  post: {
    showCapture: true,
  },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
    },
  },
  markdown: {
    demo: {
      githubUrl: "https://github.com/Kele-Bingtang/vitepress-theme-teek/blob/master/docs",
    },
  },
});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  title: "vitepress-theme-teek",
  description: description,
  cleanUrls: false,
  lastUpdated: true,
  lang: "zh-CN",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/teek-logo-mini.svg" }],
    ["link", { rel: "icon", type: "image/png", href: "/teek-logo-mini.png" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh-CN" }],
    ["meta", { property: "og:title", content: "Teek | VitePress Theme" }],
    ["meta", { property: "og:site_name", content: "Teek" }],
    ["meta", { property: "og:image", content: "" }],
    ["meta", { property: "og:url", content: "" }],
    ["meta", { property: "og:description", description }],
    ["meta", { name: "description", description }],
    ["meta", { name: "author", content: "Teek" }],
    // 禁止浏览器缩放
    // [
    //   "meta",
    //   {
    //     name: "viewport",
    //     content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
    //   },
    // ],
    ["meta", { name: "keywords", description }],
  ],
  markdown: {
    // 开启行号
    lineNumbers: true,
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
    // 更改容器默认值标题
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
  sitemap: {
    hostname: "https://vp.teek.top", // ** 换成你的域名
    transformItems: items => {
      const permalinkItemBak: typeof items = [];
      // 使用永久链接生成 sitemap
      const permalinks = (globalThis as any).VITEPRESS_CONFIG.site.themeConfig.permalinks;
      items.forEach(item => {
        const permalink = permalinks?.map[item.url];
        if (permalink) permalinkItemBak.push({ url: permalink, lastmod: item.lastmod });
      });
      return [...items, ...permalinkItemBak];
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/teek-logo-mini.svg",
    darkModeSwitchLabel: "主题",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "返回顶部",
    lastUpdatedText: "上次更新时间",
    outline: {
      level: [2, 4],
      label: "本页导航",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "指南",
        link: "/guide/intro",
        activeMatch: "/01.指南/",
      },
      { text: "配置", link: "/reference/config", activeMatch: "/10.配置/" },
      { text: "开发", link: "/develop/intro", activeMatch: "/15.主题开发/" },
      {
        text: "功能页",
        items: [
          { text: "归档页", link: "/archives" },
          { text: "清单页", link: "/articleOverview" },
          { text: "登录页", link: "/login" },
          { text: "风险链接提示页", link: "/risk-link?target=https://vp.teek.top" },
          { text: "分类页", link: "/categories" },
          { text: "标签页", link: "/tags" },
        ],
      },
      { text: "✨ 赞赏", link: "/personal/" },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Kele-Bingtang/vitepress-theme-teek" }],
    search: {
      provider: "local",
    },
    editLink: {
      text: "在 GitHub 上编辑此页",
      pattern: "https://github.com/Kele-Bingtang/vitepress-theme-teek/edit/master/docs/:path",
    },
  },
  vite: {
    plugins: [llmstxt() as any],
  },
  // transformHtml: (code, id, context) => {
  //   if (context.page !== "404.md") return code;
  //   return code.replace("404 | ", "");
  // },
});
