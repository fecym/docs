/*
 * @Description:
 * @Author: chengyuming
 * @Date: 2019-08-01 22:16:17
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-11-14 22:25:53
 */
module.exports = {
  nav: [
    { text: '首页', link: '/', icon: 'reco-home' },
    { text: '时间轴', link: '/timeLine/', icon: 'reco-date' },
    {
      text: '大前端',
      icon: 'reco-category',
      items: [
        { text: 'webpack介绍', link: '/views/webpack/index' },
        { text: '从0搭建vue', link: '/views/webpack/vue' },
        { text: 'npm', link: '/views/big-front-end/npm/init' },
        // { text: 'node简介', link: '/views/big-front-end/node/index' },
        { text: 'fs文件系统', link: '/views/big-front-end/node/fs' },
        { text: 'cli 的开发', link: '/views/big-front-end/npm/cli' },
        { text: 'mysql', link: '/views/big-front-end/backend/mysql' },
        { text: 'nginx介绍', link: '/views/big-front-end/nginx/index' },
        { text: 'redis', link: '/views/big-front-end/redis/index' },
        { text: 'mapbox', link: '/views/big-front-end/visualization/mapbox' },
        { text: '网站渲染流程', link: '/views/big-front-end/process/websize-render-process' },
        { text: '服务器的配置', link: '/views/big-front-end/system/init' },
        // { text: '虚拟机', link: '/views/big-front-end/system/vmware' },
        { text: 'Linux命令', link: '/views/big-front-end/system/linux' },
        { text: '反向代理与负载均衡', link: '/views/big-front-end/nginx/requisite' },
      ]
    },
    {
      text: '基础',
      icon: 'reco-three',
      items: [
        { text: 'css', link: '/views/basis/css' },
        { text: 'JavaScript', link: '/views/basis/javascript' },
        { text: '继承', link: '/views/basis/inherit' },
        { text: '常用api', link: '/views/basis/api' },
        { text: '小技巧', link: '/views/basis/issue' },
        { text: '浏览器缓存', link: '/views/basis/cache' },
        { text: 'cookie、session 和 jwt', link: '/views/basis/jwt' },
      ]
    },
  ]
}