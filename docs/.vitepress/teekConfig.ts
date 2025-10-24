// @ts-ignore
import {defineTeekConfig} from "vitepress-theme-teek/config";

export const teekConfig = defineTeekConfig({
  teekHome: false, // 是否开启博客首页
  vpHome: true, // 是否隐藏 VP 首页
  sidebarTrigger: true, // 是否开启侧边栏折叠功能
  author: {name: "fecym", link: "https://github.com/fecym"},
  footerInfo: {
    theme: {
      show: false,
      // name: `Theme By Teek@${version}`,
      name: `MIT Licensed | Copyright © 2019 - present `,
    },
    copyright: {
      show: true,
      createYear: 2019,
      suffix: "fecym · CC BY-NC-SA 4.0",
    },
    icpRecord: {
      name: "京ICP备19052475号",
      link: "http://beian.miit.gov.cn",
    }
  },
  codeBlock: {
    copiedDone: (TkMessage: { success: (arg0: string) => any; }) => TkMessage.success("复制成功！"),
  },
  riskLink: {
    enabled: false,
    title: "即将离开，请注意财产安全",
    whitelist: [/https:\/\/github.com/],
  },
  private: {
    enabled: false,
    // siteLogin: true,
    realm: {
      common: [
        {username: "fecym", password: "12345678910", role: "admin"},
      ]
    },
  },
  // category: {
  //   enabled: true, // 是否启用分类卡片
  //   path: "/categories", // 分类页访问地址
  //   pageTitle: "${icon}全部分类", // 分类页卡片标题
  //   homeTitle: "${icon}文章分类", // 卡片标题
  //   moreLabel: "更多 ...", // 查看更多分类标签
  //   emptyLabel: "暂无文章分类", // 分类为空时的标签
  //   limit: 5, // 一页显示的数量
  //   autoPage: false, // 是否自动翻页
  //   pageSpeed: 4000, // 翻页间隔时间，单位：毫秒。autoPage 为 true 时生效
  // },
  // // 标签卡片配置
  // tag: {
  //   enabled: true, // 是否启用标签卡片
  //   path: "/tags", // 标签页访问地址
  //   pageTitle: "${icon}全部标签", // 标签页页卡片标题
  //   homeTitle: "${icon}热门标签", // 卡片标题
  //   moreLabel: "更多 ...", //  查看更多分类标签
  //   emptyLabel: "暂无标签", // 标签为空时的标签
  //   limit: 21, // 一页显示的数量
  //   autoPage: false, // 是否自动翻页
  //   pageSpeed: 4000, // 翻页间隔时间，单位：毫秒。autoPage 为 true 时生效
  // },
  siteAnalytics: [
    // {
    //   provider: "umami",
    //   options: {
    //     id: "9922019-8b52-4992-8469-92fa1e24d6c9",
    //     src: "https://cloud.umami.is/script.js",
    //   },
    // },
    {
      provider: "google",
      options: {
        id: "G-YWW3LNBLWQ",
      },
    },
  ],
  articleShare: {enabled: true},
  vitePlugins: {
    autoFrontmatter: true,
    sidebarOption: {
      initItems: true,
      ignoreList: ['views', '-undone.md']
    },
  },
  comment: {
    provider: "giscus",
    options: {
      repo: "fecym/docs",
      repoId: "MDEwOlJlcG9zaXRvcnkxOTUxOTUyNjI=",
      category: "Announcements",
      categoryId: "DIC_kwDOC6Jxfs4Cw9xT",
    }
  }
});
