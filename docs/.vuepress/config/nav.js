module.exports = {
  nav: [
    { text: '首页', link: '/', icon: 'reco-home' },
    { text: '时间轴', link: '/timeLine/', icon: 'reco-date' },
    {
      text: '大前端',
      icon: 'reco-category',
      items: [
        { text: 'webpack简介', link: '/views/webpack/index' },
        { text: '从0搭建vue', link: '/views/webpack/vue' },
        { text: 'node简介', link: '/views/big-front-end/node/index' },
        { text: 'fs文件系统', link: '/views/big-front-end/node/fs' },
        { text: 'mysql', link: '/views/big-front-end/backend/mysql' },
        { text: 'nginx', link: '/views/big-front-end/nginx/index' },
        { text: 'mapbox', link: '/views/big-front-end/visualization/mapbox' },
        { text: '网站渲染流程', link: '/views/big-front-end/process/websize-render-process' },
      ]
    },
    {
      text: '基础',
      icon: 'reco-three',
      items: [
        { text: 'JavaScript', link: '/views/basis/javascript' },
        { text: 'css', link: '/views/basis/css' }
      ]
    },
  ]
}