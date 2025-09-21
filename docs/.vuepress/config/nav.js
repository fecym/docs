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
      icon: 'reco-api',
      items: [
        { text: 'css', link: '/views/basis/css' },
        { text: 'JavaScript', link: '/views/basis/javascript' },
        { text: '继承', link: '/views/basis/inherit' },
        { text: '常用 Api 实现', link: '/views/basis/api' },
        { text: '数组 Api 实现', link: '/views/basis/array' },
        { text: '实现 Promise', link: '/views/basis/promise' },
        { text: '浏览器缓存', link: '/views/basis/cache' },
        { text: '命令行参数', link: '/views/basis/command' },
        { text: '工作小技巧', link: '/views/basis/issue' },
        { text: '面试题收录', link: '/views/basis/interview' },
        // { text: '交接文档', link: '/views/other/doc' },
      ]
    },
    {
      text: '前端',
      icon: 'iconqianduan',
      items: [
        { text: 'webpack介绍', link: '/views/webpack/webpack-1' },
        { text: 'webpack实战', link: '/views/webpack/webpack-2' },
        { text: 'webpack拓展', link: '/views/webpack/webpack-3' },
        { text: '如何优雅的解决端口被占用', link: '/views/webpack/getport' },
        { text: '树在工作面试中的应用', link: '/views/algorithms/tree' },
        { text: '从0搭建vue', link: '/views/webpack/vue' },
        { text: 'AST团队分享', link: '/views/webpack/AST' },
        { text: 'eslint 工作流', link: '/views/FE/lint' },
        { text: 'Vue 源码分析', link: '/views/basis/vue' },
        { text: 'cli 开发', link: '/views/tools/npm/cli' },
        { text: '优雅的解决 vite 同名组件无法区分问题', link: '/views/plugins/vite-plugin-unique-page-chunks' },
        { text: 'vscode 开发记录', link: '/views/plugins/vscode' },
        { text: 'Chrome 开发记录', link: '/views/plugins/chrome' },
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
        { text: 'redis', link: '/views/tools/redis' },
        { text: 'nginx', link: '/views/tools/nginx/index' },
        { text: 'git基础篇', link: '/views/tools/git/git-1' },
        { text: 'git进阶篇', link: '/views/tools/git/git-2' },
        { text: 'git子模块', link: '/views/tools/git/git-submodules' },
      ]
    },
    {
      text: 'GitHub',
      icon: 'icongithub',
      link: 'https://github.com/fecym'
    }
  ]
}
