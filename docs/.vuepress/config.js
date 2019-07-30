module.exports = {
  // base: './',
  title: 'Today',
  description: 'Today, have you studied yet?',
  head: [
    ['link', { rel: 'icon', href: '/imgs/oops.png' }]
  ],
  dest: './love',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'webpack',
        items: [
          { text: 'webpack简介', link: '/views/webpack/index' },
          { text: '从0搭建vue', link: '/views/webpack/vue' }
        ]
      },
      // { text: 'mapbox', link: '/mapbox/index' },
      {
        text: '大前端',
        items: [
          { text: 'node简介', link: '/views/big-front-end/node/index' },
          { text: 'fs文件系统', link: '/views/big-front-end/node/fs' },
          { text: 'mysql', link: '/views/big-front-end/backend/mysql' },
          { text: 'nginx', link: '/views/big-front-end/nginx/index' }
        ]
      },
      {
        text: '数据可视化',
        items: [
          { text: 'mapbox', link: '/views/mapbox/index' },
          { text: 'echarts', link: '/views/echarts/index' }
        ]
      },
      {
        text: '基础',
        items: [
          { text: 'JavaScript', link: '/views/basis/javascript' },
          { text: 'css', link: '/views/basis/css' }
        ]
      },
      { text: 'vue', link: '/views/vue' },
    ],
    sidebar: 'auto',
    sidebarDepth: 4,
    lastUpdated: '最后更新时间',

    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: 'https://github.com/cym-git',
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: 'Github',

    // 以下为可选的编辑链接选项

    // 假如你的文档仓库和项目本身不在一个仓库：
    docsRepo: 'https://github.com/cym-git/docs',
    // 假如文档不是放在仓库的根目录下：
    docsDir: 'docs',
    // 假如文档放在一个特定的分支下：
    docsBranch: 'master',
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: '提出您宝贵的意见',
    serviceWorker: {
      updatePopup: true // Boolean | Object, 默认值是 undefined.
      // 如果设置为 true, 默认的文本配置将是: 
      // updatePopup: { 
      //    message: "New content is available.", 
      //    buttonText: "Refresh" 
      // }
    }
  },
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  // 添加plugins，使用插件
  plugins: [
    [
      '@vuepress/last-updated', {
        transformer: (timestamp) => {
          // 不要忘了安装 moment
          const moment = require('moment')
          moment.locale('zh-CN')
          return moment(timestamp).format('YYYY-MM-DD h:mm:ss a')
        }
      }
    ],
    [
      '@vssue/vuepress-plugin-vssue', {
        // 设置 `platform` 而不是 `api`
        platform: 'github',
        locale: 'zh', // 语言设置
        // 其他的 Vssue 配置
        owner: 'cym-git', // github账户名称
        repo: 'cym-git.github.io', // Github博客仓库
        clientId: '74b59bdd634bffbe5002', // github上面申请的clientId
        clientSecret: 'a6cf61f1223501b85583ab5a8901115e3ad0be05', // github上面申请的clientSecret
      }
    ],
    ['@vuepress/nprogress'],
    ['@vuepress/back-to-top'],
    ['@vuepress/medium-zoom', true],
    ['@vuepress/pwa', {
      serviceWorker: true,
      popupComponent: 'MySWUpdatePopup',
      updatePopup: {
        message: "新的风暴已经出现",
        buttonText: "盘他"
      }
    }]
  ]
}