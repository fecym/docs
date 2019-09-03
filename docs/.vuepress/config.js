/*
 * @Description: 
 * @Author: chengyuming
 * @Date: 2019-08-01 11:28:21
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-09-03 23:08:01
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
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  serviceWorker: true, // 是否开启 PWA
  themeConfig,
  markdown: {
    lineNumbers: true
  },
  plugins,
  // chainWebpack,
  // configureWebpack
}