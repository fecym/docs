---
title: Webpack 进阶篇
date: 2020-03-08 08:00:00
tagsPage: true
categories:
  - Webpack
permalink: /tools/webpack-2
---

## 安装

- 推荐本地安装，不推荐全局安装
- 安装本地 Webpack：npm i webpack webpack-cli -D

## webpack 可以进行 0 配置

- 不需要配置任何东西，直接执行 webpack 就可以打包我们的代码
- 打包工具 -> 输出后的结果 (js 模块)
- 打包（支持 js 模块化）

## 手动配置 webpack

- 默认配置文件是 webpack.config.js
- 但是如果你不想使用这个文件也是可以的，可以使用 `--config webpack.other.js` 来让 webpack 使用其他的配置文件

## 传参

- 如果需要在命令行后面传参，需要使用 `--`

```sh
npm run build -- --config ./basics/webpack.config.js
```

## 配置 HTML

- 配置 HTML 需要用到 html-webpack-plugin 插件
- 基本用法如下：

```js
plugins: [
    new htmlWebpackPlugin({
      // 模板放的位置
      template: resolveFile('./src/index.html'),
      // 打包后的名字
      filename: 'index.html',
      minify: {
        // 删除属性的双引号
        removeAttributeQuotes: true,
        // 折叠空行
        collapseWhitespace: true,
      },
      hash: true,
    }),
  ],
```

## 配置 css

- 配置 css 需要配置 module，需要给 module 配置规则，所以需要在 rules 中配置
- loader 执行顺序，从右往左，从下到上
- style-loader 是将样式写入 style 标签里面
- css-loader 解析 @import 这种语法的
- 如果不想让 css 写入到 style 标签里面，需要抽离 css ，使用 mini-css-extract-plugin，然后替换 style-loader，并且配置 plugins

```js
new MiniCssExtractPlugin({
  // 抽离出来的文件名字
  filename: 'css/[name].[hash:8].css',
}),
```

- 自动添加浏览器前缀需要用到 autoprefixer 和 postcss-loader 两个插件
- 处理浏览器前缀，需要在解析 css 之前加上前缀，所以 post-loader 的顺序要写在 css-loader 后面
- 并且需要配置一个 postcss.config.js 配置文件（使用 post-loader 就会调用这个文件），当然也可以直接在 loader 的 options 里面配置

```js
{
  loader: 'postcss-loader',
  options: {
    ident: 'postcss',
    plugins: [require('autoprefixer')],
  },
},
```

- 压缩 css 需要使用插件 optimize-css-assets-webpack-plugin，[mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin) 官网推荐的，这个需要配置在 optimization 里面，但是使用了它之后 js 就不会压缩了，还需要使用另外一个插件 uglifyjs-webpack-plugin 来压缩 js

```js
optimization: {
  minimizer: [
    // 压缩 css 需要使用它
    new OptimizeCssAssetsPlugin({}),
    // 然后还要手动压缩一下 js
    new UglifyJsPlugin({
      cache: true,
      // 使用多线程压缩，并发数量默认为 os.cpus().length - 1
      parallel: true,
      sourceMap: true
    }),
  ],
},
```

## 编译 js

- 编译 js 需要用到 babel-loader，然后需要 babel 的核心模块 @babel/core，需要一个转换 es5 的模块 @babel/preset-env，所以需要执行下面的命令

```sh
npm i babel-loader @babel/core @babel/preset-env -D
```

- @babel/preset-env 是需要放在 presets 里面的
- @babel/plugin-proposal-decorators [类的装饰器](https://babeljs.io/docs/en/babel-plugin-proposal-decorators#simple-class-decorator)

```js
plugins: [
  [
    '@babel/plugin-proposal-decorators',
    {legacy: false, decoratorsBeforeExport: true},
  ],
  // ['@babel/plugin-proposal-class-properties', {loose: true}],
],
```

- @babel/plugin-transform-runtime 这个包用来节省代码大小，可以把公共代码抽离出来
- @babel/runtime 生产时需要依赖这个包

```sh
npm install --save-dev @babel/plugin-transform-runtime
npm install --save @babel/runtime
```

- 默认 babel 不会编译 es6 以上的语法，此时需要加入 @babel/polyfill 模块来编译

```sh
npm install --save @babel/polyfill
```

### eslint

- 安装 eslint，然后在官网上找到 demo 进去可以自己根据情况配置一份 eslint 的配置，然后下载下来，放到根目录下面 .eslintrc.json

- loader 是从下到上从左到右的执行，eslint 也是校验 js 的，所以有 eslint-loader，但是校验语法我们要保证在最前面执行，所以可以增加配置项 enforce

```js
{
  // loader 是从下到上从左到右的执行
  test: /\.js$/,
  // 使用 enforce 可以改变 loader 的执行顺序，让监测代码保持最早先执行
  enforce: 'pre', // previous   post
  use: ['eslint-loader'],
},
{
  test: /\.js$/,
  use: ['babel-loader'],
  // 减少代码查找体积
  include: resolveFile('../'),
  // 排除编译代码的路径
  exclude: /node_modules/,
},
```

### 三方模块的处理

- loader 有几种类型，pre 在前面执行的 loader、normal 普通的 loader、内联 loader、后置 loader（postoader）
- 内联 loader ，比如说 jQuery 模块，我们想把 & 暴露到全局，比如说 window 对象上面，此时我们可以使用 expose-loader

```js
// import $ from 'jquery'
// 暴露给全局
import $ from 'expose-loader?$!jquery';
```

- 也可以直接在 webpack 中配置

```js
{
  test: require.resolve('jquery'),
  // 同 import $ from 'expose-loader?$!jquery' 写法
  use: 'expose-loader?$'
},
```

- 但是我们可能想把 \$ 注入到所有的文件中，不需要每个文件都单独引一次了
- 那就需要在 plugins 中配置一个 webpack 自带的插件 ProvidePlugin

```js
// 全局注入
new webpack.ProvidePlugin({
  // 在每个模块中都注入 $
  $: 'jquery',
});
```

- 假如 cdn 引入了 jQuery，在项目中我又写了 import \$ from 'jquery'。此时会把 jQuery 在打包到项目中，配置 externals 可以解决这个问题

```js
externals: {
  // cdn 引入了，但是我又 import $ from 'jquery'，这样会把 jQuery 有打包进去
  // 这么配置可以解决这个问题
  jquery: 'jQuery'
},
```

### 引入一个模块三种方法

1. expose-loader 暴露给 window
2. ProvidePlugin 注入到所有文件
3. externals 引入不打包

## 打包图片

### 引入图片

- 使用图片有三种情况

  - 在 js 中创建图片引入
  - 在 css 的 background 中使用
  - `<img src="" alt="">` 直接引入

### file-loader

- 处理图片我们可以用 file-loader 来处理文件
- file-loader 会在内部生成一张图片到 打包后的 目录下，并保持原来的名字

  - 如果在 HTML 中引入图片，但是打包完图片之后原 HTML 中的图片是找不到的，此时我们可以用 html-withimg-loader 来编译

    - 在这里可能会出一个问题 file-loader 4.2 的时候是没有这个问题的，但是 file-loader 5.0 以上会出现，图片地址返回了一个对象
    - `<img src={"default":"3e5e5663e90681a73033ca3e3ac17655.png"} alt="">`
    - 此时我们需要在 file-loader 中配置 options: {esModule: false} 便可以[解决这个问题](https://blog.csdn.net/qq_38702877/article/details/103384626)

    ```js
    {
      test: /\.(png|gif|jpg|bmp)$/,
      use: [{loader: 'file-loader', options: {esModule: false}}],
    }
    ```
    
- file-loader 主要作用是将这些文件复制到输出目录，并返回相对 URL，以便在代码中引用

  ```js
    module.exports = {
      module: {
        rules: [
          {
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/, // 匹配需要处理的文件类型
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[hash:8].[ext]', // 生成文件的命名规则
                  outputPath: 'assets/', // 输出目录
                  publicPath: 'assets/', // 公共路径
                },
              },
            ],
          },
        ],
      },
  };
  ```

### url-loader

- 一般情况下图片处理不会使用 file-loader，一般使用 url-loader
- url-loader 可以做一个限制，当图片小于多少 k 的时候我们可以减少 http 请求，只用使用 base64 来转换图片，可用通过 name 来控制图片打包完后放到哪

```js
{
  test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        // limit: 200 * 1024,
        limit: 200,
        esModule: false,
        name: 'img/[name].[hash:8].[ext]',
        // 只有图片需要配置 cdn
        // publicPath: '.'
      },
    },
  ],
},
```

### 背景图片地址对不上问题

- 当我们把 css、js、图片都分开打包放到不同的目录下面之后，发现了一个问题

  - css 中引入的背景图最后找图片去 css/ 目录下找 img 目录了所以图片找不到了
  - 此时我们可以在 MiniCssExtractPlugin.loader 中配置，publicPath 便可以[解决这个问题](https://blog.csdn.net/a806488840/article/details/80920291)

  ```js
  {
    test: /\.(le|c|sc|sa)ss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '..',
        },
      },
      'css-loader',
      'postcss-loader',
    ],
  },
  ```

### html-withing-loader 引发的问题

- 使用 html-withing-loader 或者 html-loader 之后，html-webpack-plugin 的注入就会失效，此时假如我们注入好多东西就可能出问题
- 所以这两个 loader 用的时候考虑以下，因为他们是处理 HTML 中引入图片问题的
- 我们也可以不使用这个 loader，直接在 HTML 引入图片我们也可以直接注入一些变量引图片进来
- 直接使用 require 把图片引进来，对了新版本的需要加 default 哦

```html
<body>
  <img src="<%= require('../../images/webpack-resolve.png').default %>" alt="" />
</body>
```

### cdn 配置

- 假如项目中静态资源使用了 cdn，我们需要让项目中静态资源自动加上 cdn 的前缀，我们可以在 output.publicPath 中配置
- 如果只有图片配置了 cdn 我们可以在 url-loader 的 options 中单独配置 publicPath 字段

## 代码地址 - 基础相关

代码以存放到 github，[地址](https://github.com/fecym/relearn-webpack.git)，分支是 basis

基础暂时完结，下面是常用配置篇

## 配置多页

- 首先我们需要在 entry 中配置改为一个对象，然后不同页面的逻辑以不同的名字来命令
- 然后修改 output.filename 的配置不使用死的名字，改为 \[name\].js
- 最后需要在 HTMLWebpackPlugin 插件中配置，打包后对应的 HTML 文件名字，有多个就多实例化一次 HTMLWebpackPlugin，然后在 配置项里面配置 chunks 配置需要引用的 js 文件

```js
// entry 配置
entry: {
  home: resolve('../src/index.js'),
  other: resolve('../src/other.js'),
},
// output 配置
output: {
  path: resolve('../love/'),
  filename: 'js/[name]-[hash:8].js',
},
// plugins 的配置
plugins: [
  new HTMLWebpackPlugin({
    template: resolve('../src/index.html'),
    filename: 'home.html',
    title: '多页面配置 - home',
    // 注意这个，引入哪个文件配置哪个 chunkname
    chunks: ['home']
  }),
  new HTMLWebpackPlugin({
    template: resolve('../src/index.html'),
    filename: 'other.html',
    title: '多页面配置 - other',
    chunks: ['other']
  })
]
```

## sourceMap

- 当我们代码编译之后出错了，然后查看错误信息，结果都是压缩后的代码，然后我们定位不到问题出在哪里，此时我们可以配置 devtool
- devtool 增加映射，可以帮助我们调试远程代码，他有几个选项
  - source-map：会单独生成一个 sourcemap 文件，出错了会标识当前报错的列和行
  - eval-source-map：不会生产单独的 sourcemap 文件，但是可以显示报错的行和列，集成在打包后的文件中
  - cheap-module-source-map：不会产生行和列，但是是一个单独的映射文件
  - cheap-module-eval-source-map：不会产生行和列，也不会产生文件，集成在打包后的文件中

## watch

- webpack 可以实时去监控我们打包的文件
- 我们只需要在配置中增加 watch: true，便可以，当然也是可以配置一些配置的，需要在 watchOptions 中配置

```js
// 实时去监控我们打包的文件
watch: true,
watchOptions: {
  // 每秒问多少次
  poll: 1000,
  // 防抖，500 ms 后在打包
  aggregateTimeout: 500,
  // 不需要监控那个文件
  ignored: /node_modules/
},
```

## 常用的小插件

- CleanWebpackPlugin
- copyWebpackPlugin
- bannerPlugin

### CleanWebpackPlugin

- 这个插件是一个可以用来删除文件一个插件
- 使用时候需要解构出来，以前版本不需要，目前版本都需要解构出来，配置是一个对象，可以不传递，默认值够用了
- 我还是喜欢使用 `rm -rf file` 来删除文件更加暴力一点

### copyWebpackPlugin

- 该插件可以把项目一些其他的文件原封不动的复制到打包后的目录下面，比如说项目中写了一些文档，我们就可以用这个插件处理一下

```js
// 参数是一个数组
new CopyWebpackPlugin([
  {
    from: resolve('../doc'),
    to: resolve('../love/doc'),
  },
]),
```

### bannerPlugin

- 这个插件是做版权的一个插件，可以让编译后的代码假如作者信息，说明是作者是谁 `/*! make 2020 by chengyuming */`

- 该插件是 webpack 内置的插件

```js
new webpack.BannerPlugin('make 2020 by chengyuming');
```

## 解决跨越

### http-proxy

- 在 node 中有 http-proxy 插件可以做代理，集成到了 webpack 中，可以直接拿来用
- 可以在 devServer 中配置 proxy，把我们的请求地址修改为服务器地址，同时也可以重写地址

```js
  // 后端 api 地址：http:localhost:3000/api/v2/user，
  devServer: {
    port: 8080,
    progress: true,
    open: true,
    contentBase: resolve('../love'),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {
          // 重写地址
          '/api': '/api/v2/'
        }
      }
    }
  },
```

### mock 数据

- 如果只是想单纯的模拟数据，我们可以直接在 sevServer 中提供的钩子函数(before)中进行模拟，因为 webpack 也是 express 框架做的，所以我们可以直接模拟数据
- 在 before 中接受一个参数 app，就是我们的服务器

```js
devServer: {
  port: 8080,
  progress: true,
  open: true,
  contentBase: resolve('../love'),
  // 模拟数据
  before(app) {
    app.get('/api/user', (req, res) => {
      res.json({
        name: 'cym'
      })
    })
  }
},
```

### 使用 node 端跑 webpack

- 有些时候呢，我们有服务端，但是不想用代理来处理跨域，在服务端中启动 webpack，端口用服务端的端口
- 此时我们可以在服务器引入 webpack 把 webpack 以中间件的形式处理，此时需要一个插件 webpack-dev-middleware
- 然后我们把 webpack 处理成中间件然后交给 node 来处理，此时 node 服务跑起来后，webpack 也跑起来了，端口号同 node 服务的端口，此时就不会存在跨越问题了

```js
// node 端代码
const express = require('express');
const app = express();

const webpack = require('webpack');
const middle = require('webpack-dev-middleware');
// 引入 webpack 配置
const config = require('../config/webpack.config-proxy');
// 取得 webpack 的编译结果
const compiler = webpack(config);
// 把 webpack 编译结果处理成中间件交给node来处理
app.use(middle(compiler));

app.get('/api/v2/user', (req, res) => {
  res.json({ name: 'cym' });
});

app.listen(3000);
```

## 缩小查询范围

### extensions

- 在开发中，我们可能有时候不想写后缀名，但是也能找到我们想要的那个文件，此时我们可以配置 `resolve.extensions` 字段，来让 webpack 查找的时候自动配置对应的拓展名

```js
resolve: {
  // 记得加点哦
  extensions: ['.js', '.json', '.ts', '.jsx', '.css', '.scss', '.vue'],
},
```

### modules

- 我们可以在 webpack 中配置查的第三方包的路径，比如说我们 require 的时候默认找到的 node_modules 下面的文件，也可以让他找其他目录下的文件
- 此时我们就需要在 resolve.modules 中配置，它是一个数组，可以配置多个
- 比如说我们配置了工具函数的文件夹 utils，utils 下面有个 a 方法，我们引用的时候就可以直接引入便可

```js
resolve: {
  modules: [path.resolve('node_modules'), resolve('../src/utils')],
}
// 其他文件
import a from 'a'
```

### alias

- 配置别名可以加快 webpack 查找模块的速度

- 别名是我们经常用的，比如说 src 目录我们会配置成 @，此时都是在 webpack 下面配置的

```js
resolve: {
  alias: {
    bootstrap: path.resolve(__dirname, 'node_modules/bootstrap/dist/css/bootstrap.css'),
    '@': resolve('../src/')
  }
}
```

### mainFields

- 默认情况下，webpack 查找模块，会找模块下面的 package.json 中的 main 字段，main 字段指向哪个地址那就是哪个地址，这个查看顺序其实也是可以更改的，比如说 bootstrap 他会默认找 `dist/js/bootstrap`，但是我们只想用他的样式，我们就需要把它改成默认查找 style 属性 `dist/css/bootstrap.css`

<!-- ![bootstrap]('./images/webpack-resolve.png') -->
<p align="center" class="p-images">
  <img src="/imgs/webpack-resolve.png" />
</p>

- 此时我们可以通过 mainFields 字段来控制查找的先后顺序

```js
resolve: {
  modules: [path.resolve('node_modules'), resolve('../src/utils')],
  alias: {
    // bootstrap: 'bootstrap/dist/css/bootstrap.css',
    '@': resolve('../src/')
  },
  // 控制查找的先后顺序
  mainFields: ['style', 'main']
},
```

### mainFiles

当目录下没有 package.json 文件时，我们说会默认使用目录下的 index.js 这个文件，其实这个也是可以配置的

```js
resolve: {
  mainFiles: ['index'], // 你可以添加其他默认使用的文件名
},
```

### resolveLoader

`resolveLoader` 用于配置解析 loader 时的 resolve 配置，默认的配置：

```js
module.exports = {
  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js', '.json'],
    mainFields: ['loader', 'main'],
  },
};
```

我们可以配置 `resolveLoader.modules` 来减少我们自定义开发 loader 时的位置

```js
resolveLoader: {
  modules: ['node_modules', path.resolve(__dirname, 'loaders')]
},
```

## 环境变量

- 工作中我们经常会根据一些环境变量来区分是开发环境还是生产环境还是其他环境
- 比如说我们请求的接口地址，不同环境可能地址是不一样的，我们就可以根据环境变量来判断
- webpack 内置了一个插件可以帮我们实现这个功能 DefinePlugin 来定义一些常用的环境变量

```js
plugins: [
  new webpack.DefinePlugin({
    // 引号里面放入的其实是一个js的变量
    // DEV: 'dev' // console.log(dev)
    // DEV: '"dev"'
    DEV: JSON.stringify('dev'), // 'dev'
    FLAG: 'true',   // true
    EXPRESSION: '1+1', // 2
    EXPRESSION2: JSON.stringify('1+1'), // '1+1'
  }),
],
```

## 区分环境配置

- 有个 webpack-merge 插件可以帮我们合并配置，此时我们就可以区分环境来做不同的配置文件
- 然后根据传递的参数来启动相应的 webpack 配置文件
- 一般我们会有三个配置文件，开发环境、生产环境以及一个最基本的配置
- 在开发和生产环境的配置中直接把基础配置合并过来就可以了

```js
// 使用 webpack-merge 插件
const { smart } = require('webpack-merge');
const baseConf = require('./webpack.base.config');
module.exports = smart(baseConf, {
  // merge 了最基础的配置然后根据不同环境做不同的配置
});
```

- 然后使用的使用只需要在 package.json 文件中执行 webpack 的时候增加 config 参数来改变 webpack 要执行的配置文件

```json
{
  "scripts": {
    "start": "webpack-dev-server --config ./config/webpack.config-dev.js --mode development",
    "build": "rm -rf ./dist && webpack --config ./config/webpack.config-prod.js --mode production",
    "build:dev": "rm -rf ./dist && webpack --config ./config/webpack.config-prod.js --mode development"
  }
}
```

## 代码地址 - 配置相关

代码以存放到 github，[地址](https://github.com/fecym/relearn-webpack.git)，分支是 config

常用配置篇暂时完结，下面是项目优化篇

## noParse

- 当我们引入一个依赖，知道他里面没有其他的依赖，我们可以告诉 webpack 让他不去解析这个包的依赖关系，从而加速构建或者打包的速度

```js
module: {
  rules: [],
  // noParse: /jquery/,
  noParse: content => {
    return /jquery/.test(content);
  }
}
```

## exclude 和 include

- 可以设置 loader 解析文件要排除的哪些目录，比如 node_modules
- 有排除就有包含，也可以设置让 loader 解析时只处理特定目录，比如 src 目录

## IgnorePlugin

- 这是 webpack 自带的一款插件，可以忽略掉 模块内部的引用，
- 比如插件 moment，该插件假如我们只用他格式化了一下时间，但是打包后看到项目明显变大了好多
- 它默认引入了所有语言包，可以配置忽略掉

```js
plugins: [new webpack.IgnorePlugin(/\.\/locale/, /moment/)];
```

- 此时我们会发现，之前设置 moment 的语言包实效了，此时我们就需要手动引入以下我们用到的语言包

```js
import moment from 'moment';
// 手动引入中文语言包
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const current = moment()
  .endOf('day')
  .fromNow();
```

## 动态链接库 DLLPlugin

- 有些第三方库比较大，每次打包都打包他们比较耗时，此时我们可以把第三方包先打包一下
- 这样做呢，每次打包的时候就会先去看看有没有打过包，如果打过了就直接走链接库，不需要给那些提取出来的包在打包了，打包一次可以一直使用，只要包的版本没变就可以一直使用
- 每次打包出来的模块，如果有暴露出来东西，我们可以把暴露出来的东西执行一个值，此时我们可以在 output 里面配置 library 给一个变量来接受
- 默认是用 var 声明了我们传递过去的变量，我们用默认就可以了
- 实现动态链接库需要以下几步：

  - 我们单独穿件一个 webpack 配置文件，作为动态链接库的配置，然后在 entry 中配置要做链接的库的名字或者路径
  - output 中配置打包后的名字和存放位置，定义 library 接受
  - 在 plugins 中配置 manifest.json 的映射地址，附上一个完整配置

  ```js
  const path = require('path');
  const resolve = dir => path.resolve(__dirname, dir);
  const webpack = require('webpack');
  module.exports = {
    entry: {
      react: ['react', 'react-dom'],
    },
    output: {
      filename: '[name].dll.js',
      path: resolve('../public/dll'),
      // 定义一个接受的变量
      library: '_dll_[name]',
      // libraryTarget: 'var', // var、this、umd、commonjs
    },
    plugins: [
      new webpack.DllPlugin({
        // name 要和 library 一样
        name: '_dll_[name]',
        // 映射路径
        path: resolve('../public/dll/[name].manifest.json'),
      }),
    ],
  };
  ```

  - 在主 webpack 配置中，新增动态链接库引用的插件

  ```js
  // 主 webpack 配置
  plugins: [
    // 引用 dll 插件
    new webpack.DllReferencePlugin({
      // 打包的时候先去找这么一个清单，如果找不到了在去打包
      manifest: require('../public/dll/react.manifest.json'),
    }),
  ];
  ```

  - 最后需要在 HTML 中引入打包的这个动态链接库的 js 文件
  - 不可能每次修改都去引，所以我们可以使用一个插件（add-asset-html-webpack-plugin）动态的注入的 HTML 里面

  ```js
  plugins: [
    new AddAssetHtmlPlugin([
      {
        // 要添加到编译中的文件的绝对路径，以及生成的HTML文件。支持 globby 字符串
        filepath: require.resolve(path.resolve(__dirname, '../public/dll/react.dll.js')),
        // 文件输出目录
        outputPath: 'dll',
        // 脚本或链接标记的公共路径
        publicPath: 'dll',
      },
    ]),
  ];
  ```

- 有一个要注意的地方，需要把 AddAssetHtmlPlugin 的配置写在 HTMLWebpackPlugin 插件的后面，不然可能不会把资源注入进去

## happypack

- happypack 可以实现多线程打包
- 之前在匹配的 js 的时候我们用 babel-loader 处理，现在改成 'happypack/loader?id=js' 后面加一个 id
- 然后在 plugins 中配置 happypack 的插件，然后把之前在 loader 中写配置写在 plugins 中，对应好想引的 id 就行
- 如果有多个 loader 需要开启多线程，那就多 new 几个 happypack 的实例即可，如果项目比较小的话，不推荐使用，因为在开启多线程也是需要时间的

```js
module: {
  rules: [
    {
      test: /\.js$/,
      // use: [
      //   {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env', '@babel/preset-react'],
      //       plugins: ['@babel/plugin-transform-runtime'],
      //     },
      //   },
      // ],
      // 改用happypack
      use: 'Happypack/loader?id=js',
      include: resolve('../src/'),
    },
  ],
},
plugins: [
  new Happypack({
    // id 对应好
    id: 'js',
    // 把 js 写好的放到这里
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/plugin-transform-runtime'],
        },
      },
    ],
  }),
],
```

## webpack 自带的优化

- webpack 自身帮我们做了两个优化，都是在生产环境才做的优化
- import 在生产环境下，会自动去除没有删除没用的代码（tree-shaking），require 是不可以的
  - 比如说引用了一个代码，但是没有使用，webpack 打包后自动帮我们删除掉那份代码
- scope hosting 作用域提升，webpack 会帮我优化代码，比如说

```js
// 代码这么写
let a = 1
let b = 2
let c = 3
let d = a + b + c
// 在 webpack 中会自动省略，可以简化代码
console.log(d, '-----------')
// 编译之后的代码
... 省略其他的
})([
  function(e, t, r) {
    'use strict'
    r.r(t)
    console.log(6, '-----------')
  },
])
```

## 分割代码块

- 代码中不同文件出现相同的代码，我们可以把他们抽离出来，在 optimization.splitChunk 中可以配置代码抽离逻辑
- 在以前的配置中叫 commonChunkPlugins，在 webpack4 中改名字了

```js
optimization: {
  // 分割代码块
  splitChunks: {
    // 异步文件可以分割成几个模块
    maxAsyncRequest: 5,
    // 入口文件可以分割成几个模块
    maxInitialRequest: 3,
    // 缓存组
    cacheGroups: {
      // 公共的模块
      common: {
        // 从哪开始找
        chunks: 'initial',
        minSize: 0,
        // 使用多少次抽离
        minChunks: 2,
      },
  }
}
```

- 也可以专门配置第三方模块，而且可以设置权重

```js
// 第三方模块的抽离
vender: {
  // 设置权重
  priority: 1,
  test: /node_modules/,
  // 从哪开始找
  chunks: 'initial',
  minSize: 0,
  // 使用多少次抽离
  minChunks: 2,
}
```

## 懒加载

- webpack 提供了懒加载语法，在 Es 新版本中该语法也成为了规范 `import('./modules.js').then(res => {})`

```js
const btn = document.createElement('button');
btn.addEventListener('click', () => {
  import('./source.js').then(res => {
    console.log(res.default);
  });
});
btn.innerHTML = 'hello';
document.body.append(btn);
```

## 热更新

- 首先可以在 devServer 中配置 hot 为 true 开启热更新，然后在 plugins 里面配置 NamedModulesPlugin 和 HotModuleReplacementPlugin

```js
plugins: [
  // 查看那个模块更新了
  new webpack.NamedModulesPlugin(),
  // webpack 的热更新插件
  new webpack.HotModuleReplacementPlugin()
],
```

```log
# 可以看到 ./optimizers/src/source.js 模块更新了
[HMR] Updated modules:
app-63bb3ae5.js:1 [HMR]  - ./optimizers/src/source.js
```

## 源码地址 - 优化相关

代码以存放到 github，[地址](https://github.com/fecym/relearn-webpack.git)，分支是 optimizers

本篇到此基本也就告一段落了
