const { themeConfig } = require('./config/themeConfig')
const { plugins } = require('./config/plugins')
module.exports = {
  title: "chengyuming",
  description: 'Today, have you studied yet?',
  dest: './love',
  head: [
    ['link', { rel: 'icon', href: '/imgs/oops.png' }],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  theme: diyTheme,
  serviceWorker: true, // 是否开启 PWA
  themeConfig,
  markdown: {
    lineNumbers: true
  },
  plugins,
}