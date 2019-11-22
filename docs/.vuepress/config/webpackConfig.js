/*
 * @Description:
 * @Author: chengyuming
 * @Date: 2019-09-03 22:38:46
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-11-11 23:36:01
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
module.exports = {
  // css: {
  //   // 是否使用css分离插件 ExtractTextPlugin
  //   extract: true,
  //   // 开启 CSS source maps?
  //   sourceMap: false,
  //   // css预设器配置项
  //   loaderOptions: {},
  //   // 启用 CSS modules for all css / pre-processor files.
  //   modules: false
  // },
  chainWebpack: (config, isServer) => {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')
    // 移除 preload 插件
    // config.plugins.delete('preload');
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true
      })
      .end()
    if (!isServer) {
      // 分割vendor
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 9,
            chunks: 'initial' // 只打包初始时依赖的第三方
          },
          vue: {
            name: 'vue',
            test: /[\\/]node_modules[\\/]vue[\\/]/,
            priority: 50
          },
          vueRouter: {
            name: 'vue-router',
            test: /[\\/]node_modules[\\/]vue-router[\\/]/,
            priority: 70
          },
          common: {
            chunks: 'all',
            test: /[\\/]src[\\/]js[\\/]/,
            name: 'common',
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 60
          },
          styles: {
            name: 'styles',
            test: /\.(sa|sc|c)ss|styl$/,
            chunks: 'all',
            enforce: true
          }
        }
      })
    }
  },
  configureWebpack: (config, isServer) => {
    // 打包生产.gz包
    config.plugins.push(
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
      })
    )
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'assets/css/[name].[hash].css',
        chunkFilename: 'assets/css/[id].[hash].css'
      })
    )
    // config.plugins.push(
    //   new BundleAnalyzerPlugin({
    //     analyzerPort: 8989
    //   })
    // )
  }
}
