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
      { text: 'mapbox', link: '/mapbox/index' },
      { text: 'vue', link: '/vue' },
    ],
    sidebar: 'auto',
    lastUpdated: '最后更新时间'
  },
  markdown: {
    lineNumbers: true // 代码块显示行号
  }
}