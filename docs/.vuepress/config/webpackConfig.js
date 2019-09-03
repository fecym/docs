/*
 * @Description:
 * @Author: chengyuming
 * @Date: 2019-09-03 22:38:46
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-09-03 23:06:35
 */
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
// 进度条
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')
module.exports = {
  chainWebpack: (config, isServer) => {
    
  },
  configureWebpack: (config, isServer) => {
    // if (!isServer) {
      // mutate the config for client
      config.plugins.push(
        new ProgressBarPlugin({
          format:
            '  编译进度：[:bar] ' +
            chalk.green.bold(':percent') +
            ' (已用时 :elapsed 秒)',
          clear: false
        })
      )
      config.plugins.push(
        new ParallelUglifyPlugin({
          uglifyJS: {
            output: {
              beautify: false,
              comments: false
            },
            warnings: false,
            compress: {
              drop_console: true,
              collapse_vars: true,
              reduce_vars: true
            }
          }
        })
      )
      // 打包生产.gz包
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8
        })
      )
    }
  // }
}
