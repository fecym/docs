/*
 * @Description: 
 * @Author: chengyuming
 * @Date: 2019-09-03 19:43:14
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-11-16 23:14:17
 */
const { nav } = require('./nav')
module.exports = {
  themeConfig: {
    author: 'chengyuming',
    // type: 'blog',
    nav,
    sidebar: 'auto',
    sidebarDepth: 4,
    lastUpdated: '最后修改时间',

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
    // editLinks: true,
    // 默认为 "Edit this page"
    // editLinkText: '提出您宝贵的意见',
    // 新增reco
    // 博客设置
    blogConfig: {
      tag: {
        location: 2, // 在导航栏菜单中所占的位置，默认3
        text: '标签' // 默认 "标签"
      }
    },
    logo: '/imgs/head.png',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // 自动形成侧边导航
    sidebar: 'auto',
    valineConfig: {
      appId: 'to012rhNxJibimms3TuuGA6d-gzGzoHsz',// your appId
      appKey: 'VUz3rutrxvDjziwDisWL6DrT', // your appKey
      verify: true,
      placeholder: '你想说点什么...',
      pageSize: 10,
      // 是否记录评论者IP
      recordIP: true
    },
    isComment: true
  }
}