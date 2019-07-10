module.exports = {
  // base: './',
  title: 'Today',
  description: 'Today, have you studied yet?',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'webpack',
        items: [
          { text: 'webpack简介', link: '/webpack/index' },
          { text: '从0搭建vue', link: '/webpack/vue' }
        ]
      },
      // { text: 'mapbox', link: '/mapbox/index' },
      {
        text: 'node',
        items: [
          { text: 'node简介', link: '/node/index' },
          { text: 'fs文件系统', link: '/node/fs' }
        ]
      },
      { text: 'vue', link: '/vue' },
    ],
    sidebar: 'auto',
    lastUpdated: 'Last Updated',

    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'vuejs/vuepress',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: '查看源码',

    // 以下为可选的编辑链接选项

    // 假如你的文档仓库和项目本身不在一个仓库：
    docsRepo: 'vuejs/vuepress',
    // 假如文档不是放在仓库的根目录下：
    docsDir: 'docs',
    // 假如文档放在一个特定的分支下：
    docsBranch: 'master',
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: '帮助我们改善此页面！'
  },
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  // 添加plugins，使用插件
  plugins: {
    '@vssue/vuepress-plugin-vssue': {
      // 设置 `platform` 而不是 `api`
      platform: 'github',
      locale: 'zh', // 语言设置
      // 其他的 Vssue 配置
      owner: 'cym', // github账户名称
      repo: 'https://cym-git.github.io/', // Github博客仓库
      clientId: '74b59bdd634bffbe5002', // github上面申请的clientId
      clientSecret: 'a6cf61f1223501b85583ab5a8901115e3ad0be05', // github上面申请的clientSecret
    },
  }
}