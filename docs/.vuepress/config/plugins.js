module.exports = {
  plugins: [
    [
      '@vuepress/last-updated', {
        transformer: (timestamp) => {
          // 不要忘了安装 moment
          const moment = require('moment')
          // moment.locale('zh-CN')
          return moment(timestamp).format('YYYY-MM-DD h:mm:ss a')
        }
      }
    ],
    ['@vuepress/plugin-blog', {
      permalink: '/:regular',
      frontmatters: [
        {
          id: 'tags',
          keys: ['tags'],
          path: '/tag/',
          layout: 'Tags',
          scopeLayout: 'Tag'
        },
        {
          id: 'categories',
          keys: ['categories'],
          path: '/categories/',
          layout: 'Categories',
          scopeLayout: 'Category'
        },
        {
          id: 'timeline',
          keys: ['timeline'],
          path: '/timeline/',
          layout: 'TimeLine',
          scopeLayout: 'TimeLine'
        }
      ]
    }],
    // 移除 vssue
    // [
    //   '@vssue/vuepress-plugin-vssue', {
    //     // 设置 `platform` 而不是 `api`
    //     platform: 'github',
    //     // locale: 'zh', // 语言设置
    //     // 其他的 Vssue 配置
    //     owner: 'fecym', // github账户名称
    //     repo: 'fecym.github.io', // Github博客仓库
    //     clientId: '74b59bdd634bffbe5002', // github上面申请的clientId
    //     clientSecret: 'a6cf61f1223501b85583ab5a8901115e3ad0be05', // github上面申请的clientSecret
    //   }
    // ],
    ['@vuepress/nprogress'],
    ['@vuepress/back-to-top'],
    ['@vuepress/medium-zoom', true],
    ['@vuepress/pwa', {
      serviceWorker: true,
      // popupComponent: 'MySWUpdatePopup',
      // updatePopup: true
      updatePopup: {
        message: "发现新内容可用",
        buttonText: "刷新"
      }
    }],
    // 移除 Google 监控
    // ['@vuepress/google-analytics', {
    //   ga: 'UA-151995186-1'  // Google Analytics ID
    // }],
  ]
}