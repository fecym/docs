---
title: webpack 介绍
date: 2019-05-21
tags:
  - webpack
---

## webpack 介绍

Webpack 可以直接执行 webpack 命令进行打包，也可以通过手动配置实现更复杂的打包需求。配置文件为 webpack.config.js，可以导出一个对象或函数，函数接受两个参数：env（环境对象）和 argv（描述传递给 webpack 选项的 map 对象）。

来看一下这两个参数：

```js
  // 在 webpack.config.js 中输入以下代码
  module.exports = function(env, argv) {
    console.log(env, argv)
  }
  // 在控制台执行
  webpack --env=chengyuming
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/webpack-arguments.jpg')" height="">
</p>

- 让 `webpack` 正常启动，至少需要两个 `npm` 包，`webpack、webpack-cli`

### 一、entry

> Webpack 采用模块化思想，所有文件和配置都是模块。entry 是顶层入口，Webpack 从入口开始，遍历和递归解析所有入口依赖的模块。

- `entry` 用法如下

<img :src="$withBase('/imgs/base-entry.jpg')">

- 当然也可以采用动态配置 `entry`， 采用箭头函数动态返回。

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/dynamic-entry.jpg')" height="400">
</p>

- 关于 `entry`， 我们要记住， 他有多种配置类型， 而且可以动态配置， 还可以为入口设置别名呐。
- 也可以引用定义三方模块的打包，配置如下

```js
  entry: {
    app: path.resolve('./src/main.js'),
    // 配置公共文件
    vender: ['./src/jquery.js']
  },
```

### 二、output

- `output` 是一个对象，里面包含一些列输出配置项
- 常用的语法如下：

```js
  output: {
    // 打包后的位置，必须是绝对地址
    path: path.resolve('./dist'),
    // 打包后的文件名，[name] 对应 entry 的名字
    filename: 'js/[name].[chunkHash].js',
    // 打包后静态资源的位置，cdn 的配置
    publicPath: '.'
  },
```

### 三、mode

> `webpack` 有三种 `mode`：`development`、`production`、`none`

- development：会将 `process.env.NODE_ENV` 的值设置为 `development`，启用 `NamedChunksPlugin` 和 `NamedModulesPlugin`。代码不压缩
- production：会将 `DefinePlugin` 中 `process.env.NODE_ENV` 的值设置为 `production`。启用 `FlagDependencyUsagePlugin`, `FlagIncludedChunksPlugin`, `ModuleConcatenationPlugin`, `NoEmitOnErrorsPlugin`, `OccurrenceOrderPlugin`, `SideEffectsFlagPlugin` 和 `TerserPlugin`。
- none：不使用任何默认优化。
- 如果没有设置，`webpack` 会把 `mode` 默认设置为 `production`，并发出警告。
- 我们可以通过控制台中输入 `--mode=development` 来设置 `webpack` 的模式，也可以在 `webpack.config.js` 中设置 `mode: development`
- 设置 `NODE_ENV` 并不会自动地设置 `mode`。
- 如下，一个简单的 web 打包机就配置成功了，编译、优化就是 `modules`、`plugins`、`optimization` 配置的事情，配置规则在基础篇已经介绍过了

```js
const path = require('path');
module.exports = function(env, argv) {
  return {
    mode: argv.mode || 'development',
    entry: path.resolve('./src/main'),
    output: {
      path: path.resolve('./dist'),
      filename: '[name].[hash].js',
    },
  };
};
```

### 四、module

#### 配置 loader

> 配置 `loader` 就是配置一堆规则，所以要放在 `module.rules` 中，先看一段代码

```javascript
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      // use可以是普通字符串数组，也可以是对象数组
      use: ['babel-loader?cacheDirectory'],
      use: [{
        loader: 'babel-loader',
        options: {
            cacheDirectory: true, //
        },
        enforce: 'post'
      }]
    },
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      exclude: path.resolve(__dirname, 'node_modules')
    },
    {
      // 对非文本文件采用 file-loader 加载
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use: ['file-loader'],
    }，
      //配置更多的其他loader
    ]
  }
```

::: tip 属性说明

1. `test/include/exclude`： 表示匹配到 `loader` 的文件或者文件范围；
2. `use`: 表示使用什么 `loader`， 它可以是一个字符串数组， 也可以是对象数组， 那多个 `loader` 时， 执行顺序是从右向左， 当然， 也可以使用 `enforce` 强制让某个 `loader` 的执行顺序放到最前面或者最后面；
3. `cacheDirectory`： 表示传给 `babel-loader` 的参数， 用于缓存 `babel` 的编译结果， 加快编译速度。
4. `enforce`：`post` 表示将改 `loader` 的执行顺序放到最前面，`pre` 则相反.
5. 多个 `loader` 时处理顺序：从后到前，即先交给 `sass-loader` 处理， 再将结果交给 `css-loader`, 最后交给 `style-loader`
   :::

#### 配置 noParse

::: tip noParse
`noParse` 可以用于让 `webpack` 忽略哪些没有采用模块化的文件， 不对这些文件进行编译处理， 这样做可以提高构建性能， 因为例如一些库： 如 `jquery` 本身是没有采用模块化标注的， 让 `webpack` 去解析这些文件即耗时， 也没什么意义。
:::

```javascript
  module: {
    rules: [],
    noParse: /jquery/,
    noParse: content => {
      return /jquery/.test(content);
    }
  }
```

::: tip 说明：

- `noParse` 的值可以是正则表达式， 也可以是一个函数；
- 被忽略的文件里不应该包含 `import、require、define` 等模块化语句， 不然会导致在构建出的代码中包含无法在浏览器环境下执行的模块化语句
  :::

#### 配置 parser

::: tip parser
因为 `Webpack` 是以模块化的 `JavaScript` 文件为入口的，所以内置了对模块化 `JavaScript` 的解析功能，支持 `AMD`, `CommonJS`、`SystemJS`、`ES6`。`parser` 属性可以更细粒度地配置哪些模块语法被解析、哪些不被解析。同 `noParse` 配置项的区别在于，`parser` 可以精确到语法层面，而 `noParse`只能控制哪些文件不被解析。
:::

```javascript
  module: {
    rules: [
      test: /\.js$/，
      use: ['babel-loader'],
      parse: [
        amd: false，                  // 禁用AMD
        commonjs: false,              // 禁用 CommonJS
        system: false,                // 禁用 SystemJS
        harmony: false，              // 禁用 ES6 import/export
        requireinclude: false,        // 禁用require.include
        requireEnsure: false,         // 禁用require.ensure
        requireContext: false,        // 禁用require.context
        browserify: false,            // 禁用
        browserify requireJs: false,  // 禁用 requirejs: false, //禁用requirejs
      ]
    ]
  }
```

::: tip 说明：

- `parse` 和 `noParse` 同级的属性，当然也可以嵌套到 `rules`，表示针对与某个 `loader` 应用到该属性的规则。
- 目前只要明白 `parse` 属性，是用于声明哪些模块语法被解析，哪些不被解析即可。
  :::

#### 单个规则配置多个 loader， 语法需要使用 use， 如图

```JavaScript
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // publicPath: '../',
          reloadAll: true
        }
      },
      'css-loader',
      'postcss-loader',
      'sass-loader'
    ]
  },
```

#### oneOf

每个文件对于 rules 中所有规则都会遍历一遍，使用 oneOf 就可以解决该问题，只要匹配一个即可退出（在 oneOf 中不能两个配置处理同一种类型文件）

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // 优先执行
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
          fix: true
        }
      },
      {
        // 以下 loader 只会匹配一个
        oneOf: [
          ...,
          {},
          {}
        ]
      }
    ]
  }
}
```

### 五、resolve

::: tip resolve
`resolve` 配置 `webpack` 去寻找模块对应的文件，我们平常通过 `import` 导入的模块，`resolve` 可以告诉 `webpack` 如何去解析导入的模块
:::

#### 1. alias：配置路径别名

```javascript
  resolve: {
    alias: {
      '@': path.join(__dirname, '..', 'src')
    }
  }
```

#### 2. extensions：用于配置模块文件的后缀列表

> 用来配置文件可以不写后缀名

```javascript
resolve: {
  extension: ['.js', '.json', '.vue', '.jsx'];
}
```

#### 3. modules

::: tip
`resolve.modules` 配置的 `webpack` 默认会去 `node_modules` 目录下寻找，假如项目中遇到一些模块大量依赖和导入由于 其他模块 的位置不定， 针对不同的文件都要计算被导入的模块文件的相对路径，这个路径 有时会很长，例如：就像 `import ······ '../../../components/module-a.js'`，这时可以利用 `modules` 配置项优化。假如那些被大量导入的模块都在 `./src/components` 目录下，则将 `modules` 配置成这样
:::

```js
resolve: {
  modules: ['./src/components', 'node_modules'];
}
// 然后引入模块就会去这两个目录中寻找
import moduleA from 'module-a'; // module-a.js 在 ./src/components 目录下
```

::: warning
此时我们就可以简单的通过 `import ······ 'module-a'` 导入<br/>
注意： `modules` 和 `alisa` 的区别：`modules` 是用来配置一些公共模块，这些公共模块和 `node_modules` 类似，配置以后，我们就可以直接引用模块，前面不需要再加路径，而 `alias` 作用是配置路径别名，目的是可以让路径简化。两者是不一样的。 <br/>
除此之外，还有： <br>

1. `descriptionFiles`：配置描述第三方模块的文件名称：默认是 `package.json`
2. `enforceExtension`：配置后缀名是否必须加上
   :::

### 六、plugin

::: tip plugin

- `plugins` 其实包括 `webpack` 本身自带的插件，也有开源的其他插件，都可以使用，它的作用就是解决 `loader` 之外的其他任何相关构建的事情。
- `plugin` 的值是一个数组，可以传入多个插件实例，用法是直接 `new` 一个插件然后传入相应的配置即可
- `plugin` 如何配置并不是难点，难点是我们需要清楚常用的一些插件分别解决了什么样的问题，以及这些插件的配置项
  :::

```js
plugins: [
  // 处理vue
  new VueLoaderPlugin(),
  // 分离css，只需要传入相应的配置即可
  new MiniCssExtractPlugin({
    filename: 'css/[name].[hash].css',
    chunkFilename: 'css/[id].[hash].css',
  }),
];
```

### 七、optimization

::: tip optimization
`optimization` 很明显是优化代码的，比如说我们的压缩代码，就是在这里面配置，从 `webpack4` 开始，如果 `mode` 是 `production` 模式会默认压缩代码，具体可查看[官网文档](https://webpack.docschina.org/configuration/optimization/)
:::

```js
  optimization: {
    // 简单配置压缩代码
    minimize: true,
    // 分离代码
    splitChunks: {
      chunk: 'all',
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial' // 只打包初始时依赖的第三方
        },
        vue: {
          name: 'vue',
          test: /[\\/]node_modules[\\/]vue[\\/]/,
          priority: 11,
        },
        vueRouter: {
          name: 'vue-router',
          test: /[\\/]node_modules[\\/]vue-router[\\/]/,
          priority: 12,
        }
      }
    }
  }
```

### 八、devServer

::: tip devServer
`devServer` 主要用于本地开发的时候，配置本地服务的各种特性，常用的配置如下
:::

- hot： 是否开启模块热替换
- inline:  是否开启实时刷新， 即代码更改以后， 浏览器自动刷新
- contentBase: 用于配置本地服务的文件根目录
- header: 设置请求头
- host: 设置域名
- port:  设置端口
- allowedHosts: 只有请求的域名在该属性所配置的范围内， 才可以访问。
- https:  使用使用 https 服务， 默认为 false
- compress:  是否启用 Gzip 压缩， 默认为 false.
- open: // 是否开启新窗口
- devtool: 配置 webpack 是否生成 source Map， 以方便调试。
- watch: 默认为 true， 表示是否监听文件修改以后， 自动编译。

### 附上一个简单的配置

```js
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = function(env, argv) {
  return {
    mode: argv.mode || 'development',
    entry: path.resolve('./src/main'),
    output: {
      path: path.resolve('./dist'),
      filename: 'js/[name].[chunkHash].js',
      publicPath: '.',
    },
    module: {
      rules: [
        // 使用MiniCssExtractPlugin插件后的配置
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                reloadAll: true,
              },
            },
            'css-loader',
          ],
        },
      ],
    },
    plugins: [
      // 配置HTML
      new HTMLWebpackPlugin({
        // 源文件模板
        template: path.resolve('./public/index.html'),
        // 输出文件
        filename: 'index.html',
        title: 'fecym',
        inject: true,
        hash: true,
        showErrors: true,
      }),
      // 分离css
      new MiniCssExtractPlugin({
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[id].[hash].css',
      }),
    ],
    optimization: {
      minimize: true,
      runtimeChunk: {
        name: entryPoint => `runtime~${entryPoint.name}`,
      },
    },
  };
};
```

## webpack 一些概念

### 一、module，chunk 和 bundle

1. 对于同逻辑代码，当我们手写下一个个文件，他们都是 `module`；
2. 当我们写的 `module` 源文件传到 `webpack` 进行打包时，`webpack` 会根据文件引用关系生成 `chunk` 文件，`webpack` 会对这个 `chunk` 文件进行一些操作；
3. `webpack` 处理好 `chunk` 文件后，最后会输出 `bundle` 文件，这个 `bundle` 文件包含了经过加载和编译的最终源文件，所以它可以直接在浏览器中运行。

总结：`module、chunk、bundle` 其实就是同一份逻辑代码在不同转换场景下取了不同的名字：我们直接写出来的是 `module`，`webpack` 处理时是 `chunk`，最后在浏览器中可以直接运行的是 `bundle`

- module：我们手写的文件。
- chunk：Webpack 根据文件引用关系生成的中间文件。
- bundle：Webpack 处理后输出的最终文件，可直接在浏览器中运行。

### 二、filename 和 chunkFilename

1. `filename` 是一个很常见的配置，就是对应于 `entry` 里面的输入文件，经过 `webpack` 打包后输出文件的文件名；
2. `chunkFilename` 指未被列在 `entry` 中，却又需要被打包出来的 `chunk` 文件的名称。一般来说：这个 `chunk` 文件指的是要懒加载的代码（可以在 `output` 里面配置）
3. 总结：`filename` 指列在 `entry` 中，打包后输出的文件的名称；`chunkFilename` 指未被列在 `entry` 中，却又需要被打包出来的文件的名称

### 三、预请求和预加载

1. `preload chunk` 会在父 `chunk` 加载时，以并行方式开始加载。 `prefetch chunk` 会在父 `chunk` 加载结束后开始加载。
   `preload chunk` 具有中等优先级，并立即下载。`prefetch chunk` 在浏览器闲置时下载。
2. `preload chunk` 会在父 `chunk` 中立即请求，用于当下时刻。`prefetch chunk` 会用于未来的某个时刻。
3. 总结：`webpackChunkName` 是为预加载的文件取别名。`webpackPrefetch` 会在浏览器闲置时下载文件，`webpackPreload` 会在父 `chunk` 加载时并行下载文件。

### 四、hash、chunkHash 和 contentHash

> 哈希一般是结合 `CDN` 缓存来使用的。 如果文件内容改变的话， 那么对应文件哈希值也会改变， 对应的 `HTML` 引用的 `URL` 地址也会改变， 触发 `CDN` 服务器从源服务器上拉取对应数据， 进而更新本地缓存。

- hash： 计算是跟整个项目的构建相关，所有的文件共享一个 `hash`，一个文件发生改变，其他都会改变，`hash` 值是一个。
- chunkHash：跟 `hash` 差不多。区别在与 `chunkHash` 所有公共库的代码文件都用一个 `hash`，公共库的代码用一个 `hash`，当我们更新普通模块内容的时候，其他模块的 `hash` 值发生改变，但是公共模块的 `hash` 不会受到影响

```js
  // 简单配置如下
  {
    entry: {
      app: path.resolve('./src/main.js'),
      // 配置公共文件
      vender: ['./src/jquery.js']
    },
    output: {
      path: path.resolve('./love'),
      filename: 'js/[name].[chunkHash].js'
    },
  }
```

- contenthash：所有的文件的 `hash` 都是不一样的，哪个文件被改变，哪个文件的 `hash` 发生改变。 `index.js` 和 `index.css` 同为一个 `chunk`，如果 `index.js` 内容发生变化，但是 `index.css` 没有变化，打包后他们的 `hash` 都发生变化，这对 `css` 文件来说是一种浪费。 `contentHash` 将根据资源内容创建出唯一 `hash`，也就是说内容不变，`hash` 不变

- 总结：`hash` 要变一起变；`chunkhash` 公共内容 `hash` 不发生改变，其他一起变；`contenthash` 哪个文件内容发生变化，那么对应的 `hash` 才发生改变

### 五、webpack 指纹占位符

webpack 中有一些指纹占位符，比如以下配置：

```js
new MiniCssExtractPlugin({
  filename: 'css/[name].[hash].css',
  chunkFilename: 'css/[id].[hash].css',
}),
```

中括号中 `[name].[hash]`，其实就是一些占位符，其中 name 代表文件名称，hash 代码构建时生成的 hash 值，下面是完整的占位符表示

| 占位符名称  | 含义                                                          |
| ----------- | ------------------------------------------------------------- |
| name        | 文件名称                                                      |
| ext         | 资源后缀名                                                    |
| path        | 文件的相对路径                                                |
| folder      | 文件所在的文件夹                                              |
| hash        | 每次构建时生成一个唯一的 hash 值                     |
| chunkhash   | 根据 chunk 生成 hash 值，来源于同一个 chunk，则 hash 值就一样 |
| contenthash | 根据内容生成 hash 值，文件内容相同 hash 值就相同              |

### 六、path、publicPath、contentBase

> output.publicPath 和 devServer.publicPath

- output.publicPath：引用资源的前缀。
  - 就是项目要扔到服务器的哪个地址里面
- devServer.publicPath：静态文件的位置。
  - 表示的是打包生成的 静态文件 所在的位置
  - 配置了 `devServer.publicPath` 之后，打完包的项目会自动在请求地址上加上配置的那个文件夹名字
  - 比如说配置了 `address_v2`，那么此时请求的所有文件资源都是携带这个 `address_v2`，也就是说在你的请求地址最后面要加上`address_v2`，那么在服务器上也需要放这么一个文件夹，用来放置你打包完的项目
- devServer.contentBase：本地服务根目录。

### 七、webpack 处理 css 的一些介绍

> css loader （包括前处理器和后处理器）

- css 基础 loader

  - css-loader 和 style-loader

- css 前处理 less 两件套

  - less 和 less-loader

- css 前处理 sass 两件套

  - node-sass 和 sass-loader

- css 后处理 postcss 两件套

  - postcss-loader 和 autoprefixer
  - postcss 需要配置， 需要一个 postcss.config.js 配置文件

```javascript
module.exports = {
  plugins: [require('autoprefixer')],
};
```

本篇到此基本也就告一段落了，下一篇介绍 webpack 常用配置以及可能遇到的坑
