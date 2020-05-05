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
      text: '基础',
      // icon: 'reco-category',
      icon: 'reco-api',
      items: [
        { text: 'css', link: '/views/basis/css' },
        { text: 'JavaScript', link: '/views/basis/javascript' },
        { text: '继承', link: '/views/basis/inherit' },
        { text: '常用 Api', link: '/views/basis/api' },
        { text: '实现 Promise', link: '/views/basis/promise' },
        { text: '浏览器缓存', link: '/views/basis/cache' },
        { text: '命令行参数', link: '/views/basis/command' },
        { text: '面试题记录', link: '/views/basis/issue' }
        // { text: '交接文档', link: '/views/other/doc' },
      ]
    },
    {
      text: '前端',
      icon: 'iconqianduan',
      items: [
        { text: 'webpack介绍', link: '/views/webpack/index' },
        { text: 'webpack实战', link: '/views/webpack/base' },
        { text: '从0搭建vue', link: '/views/webpack/vue' },
        { text: 'cli 的开发', link: '/views/tools/npm/cli' },
        { text: 'mapbox', link: '/views/FE/visualization/mapbox' },
        { text: '网站渲染流程', link: '/views/FE/process/websize-render' }
      ]
    },
    {
      text: '服务端',
      icon: 'reco-beian',
      items: [
        { text: 'fs文件系统', link: '/views/server-side/node/fs' },
        // { text: '进程', link: '/views/server-side/node/process' },
        { text: '服务器的配置', link: '/views/server-side/service-conf' },
        { text: '虚拟机', link: '/views/server-side/vmware' },
        { text: 'Linux命令', link: '/views/server-side/linux' },
        { text: 'http笔记', link: '/views/server-side/http' },
        { text: 'https笔记', link: '/views/server-side/https' },
        { text: '负载均衡', link: '/views/tools/nginx/requisite' },
        { text: 'HTTP认证方式', link: '/views/basis/jwt' },
        { text: '加密解密', link: '/views/server-side/node/crypto' }
      ]
    },
    {
      text: '工具',
      icon: 'reco-npm',
      items: [
        { text: 'npm', link: '/views/tools/npm/init' },
        { text: 'mysql', link: '/views/tools/mysql' },
        { text: 'redis', link: '/views/tools/redis/index' },
        { text: 'nginx', link: '/views/tools/nginx/index' }
      ]
    },
    {
      text: 'GitHub',
      icon: 'icongithub',
      link: 'https://github.com/fecym'
    }
  ]
}
