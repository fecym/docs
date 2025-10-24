import {defineConfig} from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import {teekConfig} from "./teekConfig";
import viteCompression from "vite-plugin-compression";

const description = [
  "fecym 的技术博客：前端工程师，专注 Vue 全家桶与工程化",
  "记录编码基础、CSS/HTML/JavaScript、Node、ECharts、Webpack/Vite",
  "覆盖 Git、Linux、MySQL、Nginx、ESLint、npm、面试与实用技巧"
].join(" · ");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  title: "风起代码间",
  description: description,
  cleanUrls: false,
  lastUpdated: true,
  lang: "zh-CN",
  // @ts-ignore
  base: process.env.BUILD_TYPE ? "/docs/" : '/',
  // 构建产物输出到项目根 love
  outDir: "../love",
  // 将 VitePress 缓存目录移动到项目根（原来是 docs/.vitepress/cache）
  cacheDir: "../.vitepress/cache",
  head: [
    [
      "link",
      {rel: "icon", type: "image/svg+xml", href: "/teek-logo-mini.svg"},
    ],
    ["link", {rel: "icon", type: "image/png", href: "/teek-logo-mini.png"}],
    ["meta", {property: "og:type", content: "website"}],
    ["meta", {property: "og:locale", content: "zh-CN"}],
    ["meta", {property: "og:title", content: "fecym | 风起代码间"}],
    ["meta", {property: "og:site_name", content: "fecym"}],
    ["meta", {property: "og:image", content: ""}],
    ["meta", {property: "og:url", content: ""}],
    ["meta", {property: "og:description", description}],
    ["meta", {name: "description", description}],
    ["meta", {name: "author", content: "fecym"}],
    // 禁止浏览器缩放
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
      },
    ],
    ["meta", {name: "keywords", description}],
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
    hostname: "https://chengyuming.cn", // ** 换成你的域名
    transformItems: (items) => {
      const permalinkItemBak: typeof items = [];
      // 使用永久链接生成 sitemap
      const permalinks = (globalThis as any).VITEPRESS_CONFIG.site.themeConfig
        .permalinks;
      items.forEach((item) => {
        const permalink = permalinks?.map[item.url];
        if (permalink)
          permalinkItemBak.push({url: permalink, lastmod: item.lastmod});
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
      {text: "首页", link: "/"},
      {
        text: '前端',
        link: "/basic/interview",
        activeMatch: "/01.前端/",
      },
      {
        text: '服务端',
        link: "/service/linux",
        activeMatch: "/02.服务端/",
      },
      {
        text: '工具',
        link: "/git/git-1",
        activeMatch: "/03.工具/",
      },
      {
        text: '经典',
        link: "/scriptures/sutra",
        activeMatch: "/04.经典摘录/",
      },
      {
        text: '归档',
        link: "/archives",
      },
      {
        text: '清单',
        link: "/articleOverview",
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/fecym",
      },
    ],
    search: {
      provider: "local",
    },
    // editLink: {
    //   text: "在 GitHub 上编辑此页",
    //   pattern:
    //     "https://github.com/Kele-Bingtang/vitepress-theme-teek/edit/master/docs/:path",
    // },
  },
  vite: {
    // 插件：生产不加载 llmstxt，避免 SSR 构建清空 .temp 导致 app.js 缺失
    plugins: [
      llmstxt() as any,
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
        deleteOriginFile: false,
      }),
    ],

    // optimizeDeps: {
    //   include: ["vue", "echarts", "@giscus/vue", "vitepress-theme-teek"],
    // },

    build: {
      target: "es2019",
      cssCodeSplit: true,
      sourcemap: false,
      reportCompressedSize: false,
      minify: "esbuild",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          //   manualChunks(id) {
          //     if (id.includes("node_modules")) {
          //       if (id.includes("/vue")) return "vendor-vue";
          //       if (id.includes("echarts")) return "vendor-echarts";
          //       if (id.includes("@giscus/vue")) return "vendor-giscus";
          //       if (id.includes("vitepress-theme-teek")) return "vendor-teek";
          //       return "vendor";
          //     }
          //   },
          //   entryFileNames: "assets/[name]-[hash].js",
          //   chunkFileNames: "assets/[name]-[hash].js",
          //   assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    // 将 Vite 预构建缓存也移动到项目根（默认在 node_modules/.vite）
    cacheDir: "../.vite",
  },
});
