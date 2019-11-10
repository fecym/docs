/*
 * @Description: 
 * @Author: chengyuming
 * @Date: 2019-08-01 11:28:21
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-11-10 00:35:38
 */
const { themeConfig } = require('./config/themeConfig')
const { plugins } = require('./config/plugins')
const { chainWebpack, configureWebpack } = require('./config/webpackConfig')
module.exports = {
  title: "chengyuming",
  description: 'Today, have you studied yet?',
  dest: './love',
  head: [
    ['link', { rel: 'icon', href: '/imgs/oops.png' }],
    // 给iOS添加到主屏的图标
    ['link', { rel: 'apple-touch-icon', href: '/imgs/iOS.jpg' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  serviceWorker: true, // 是否开启 PWA
  themeConfig,
  markdown: {
    lineNumbers: true
  },
  plugins,
  chainWebpack,
  configureWebpack
}