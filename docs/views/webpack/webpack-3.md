---
title: webpack 拓展
date: 2020-09-13
tags:
  - webpack
---

## 介绍

接前两篇，这篇内容介绍一下使用 webpack 一些小技巧，以及在根据一些实际业务场景我们可以自定义 loader 和 plugin。最近工作比较忙，这篇笔记也断断续续写了好久，写的可能比较杂乱，这篇文章日后也会不断优化

## 小技巧：require.context

- 在平时开发项目的时候，有时候需要引入的文件太多的时候，有什么好的方法解决嘛
- 这时我们可以用 `require.context` 函数来创建我们要引入文件的 `context`
- 该函数接受三个参数：要搜索的目录、是否搜索子目录、匹配文件的正则表达式

```js
// 语法如下
require.context(directory, (useSubdirectories = false), (regExp = /^\.\//));
```

- 该方法返回一个 `require` 函数，返回函数可以接受一个参数：`request`（满足 `require.context` 传参的文件地址）
- 返回函数拥有三个属性：`resolve、keys、id`
  - `resolve` 是一个函数，它返回 `request` 被解析后得到的模块 `id`。
  - `keys` 也是一个函数，返回一个数组，由所有可能被上下文模块处理的请求组成（满足 `require.context` 传参的文件相对路径，但是要是传入一个文件地址还是会报错，必须传入一个满足 `require.context` 传参的文件地址）
  - `id` 是上下文模块里面所包含的模块 `id`。它可能在你使用 `module.hot.accept` 的时候被用到
- [内容摘自 webpack 官网](https://webpack.docschina.org/guides/dependency-management/#require-context)

拿 vue 项目来说，有下面目录结构我们来自动引入 route、store 以及自动注册全局组件

```sh
  ├── src
  │   ├── views
  │   ├── components
  │   │   ├── Header.vue
  │   │   ├── ...
  │   │   └── other.vue
  │   ├── routes
  │   │   ├── modules
  │   │   │   ├── user.js
  │   │   │   ├── ...
  │   │   │   └── other.js
  │   │   └── index.js
  │   ├── stores
  │   │   ├── modules
  │   │   │   ├── user.js
  │   │   │   ├── ...
  │   │   │   └── other.js
  │   │   └── index.js
  │   └── App.vue
  └── ...
```

### 路由自动引入

自动引入路由，我们可以在 routes 目录下新建一个 requireAll.js，用来写引入路由逻辑

```js
const webpackContext = require.context('./modules', false, /\.js$/);
// 让返回的这个函数执行，并传入相关的每一个文件的地址（由ctx.keys返回的）
const requireAll = ctx => ctx.keys().map(ctx);
// requireAll 执行完毕其实就得到了我们要的 modules 文件下的所有文件，但是我们是 default 里面的内容
const moduleRoutes = requireAll(webpackContext).map(route => route.default);
// 考虑到有的路由可能定义为对象的情况
const routes = [];
moduleRoutes.forEach(moduleRoute => {
  // 考虑路由定义为对象的情况
  const moduleRoutes = Array.isArray(moduleRoute) ? moduleRoute : [moduleRoute];
  routes.push(...moduleRoutes);
});
// 最后暴露出去
export default routes;
```

### 全局组件注册

> 全局注册组件也是利用 `require.context` 来实现的，得到一个文件数组后，利用 `Vue.component` 注册一下即可

`假如有以下目录，components` 目录下的组件在全局都可通用

```js
import Vue from 'vue';
const webpackContext = require.context('../components', false, /\.vue$/);
const requireAll = ctx => ctx.keys().map(ctx);
// 文件名字处理为大写
const dealName = name => (name ? name.replace(/\w/, v => v.toUpperCase()) : '');
requireAll(webpackContext).forEach(componentModule => {
  // 因为是 export default 导出的模块
  const { default: component } = componentModule;
  // 文件所在的地址，我们要取到文件的名字，来定义文件的 name
  const { __file: file } = component;
  // 如果有name属性直接取name属性，没有我们需要处理文件地址的最后一段作为文件的name，且要大写
  const name = dealName(component.name) || dealName(file.slice(file.lastIndexOf('/') + 1, -4));
  Vue.component(name, component);
});
```

### 自动引入 vuex

```js
// 获取文件
const modulesFiles = require.context('./modules', false, /\.js$/);
// 处理 modules
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
  // 获取模块
  const value = modulesFiles(modulePath);
  // 最终得到我们要的结果
  modules[moduleName] = value.default;
  return modules;
}, {});

export default modules;
```

## webpack loader

webpack 中 loader 用于对模块的源代码进行转换。loader 可以使你在 import 或 "load(加载)" 模块时预处理文件。因此，loader 类似于其他构建工具中"任务(task)"，并提供了处理前端构建步骤的得力方式。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 import CSS 文件！（摘自官网）

使用方法这里不做介绍，可以参考之前的文章或者查看[官网](https://webpack.docschina.org/concepts/loaders/)

接下来，我们开始开发 loader，新建一个项目，项目目录如下：

```sh
  ├── loaders             # 我们自定义的 loader
  │   └── ...             # 各种 loader
  ├── src
  │   └── index.js        # 入口文件
  ├── babel.config.js     # babel配置文件
  ├── package.json        # 项目配置文件
  └── webpack.config.js   # webpack 配置
```

我们先在 loaders 目录下新建一个 loader1.js 作为我们的第一个 loader 来做开发

一个 loader 本质就是一个方法，接受一个参数，该参数就是根据正则规则匹配到得源代码的字符串形式，在这个函数我们可以处理这个源代码，然后返回一个我们处理好的结果，`该方法必须有返回值`

```js
// loader1.js
function loader(source) {
  // source 就是获取到的源代码
  console.log('loader -> source', source);
  return source;
}

module.exports = loader;
```

### 使用

在 webpack 中，loader 是配置在 module.rules 中，module.rules 的含义是创建模块的规则，module.rules 的值是一个数组，数组里每一项都描述了如何去处理部分文件。`loader` 就像一个翻译员，能将源文件经过转换后输出新的结果，并且一个文件还可以链式地经过多个翻译员翻译。

```js
module.exports = {
  // 省略其他配置
  module: {
    rules: [{ test: /\.js$/, use: 'babel-loader' }],
  },
};
```

loader 也支持传参，可以写在 use.options 中，也可以 ? 拼接参数

```js
module.exports = {
  // 省略其他配置
  module: {
    rules: [
      {
        test: /\.js$/,
        // use: 'babel-loader?a=b',
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] },
        },
      },
    ],
  },
};
```

一般使用的话，我们只需要在 use 的时候写 loader 的名字（默认会在 node_modules 下查找）或者写 loader 的路径，因为我们这个不是 npm 包是本地开发的，所以需要些绝对路径

```js
module.exports = {
  // 省略其他配置
  module: {
    rules: [
      {
        test: /\.js$/,
        use: path.resolve(__dirname, 'loaders', 'loader1.js'),
      },
    ],
  },
};
```

这么配置，在 rules 规则中显的比较臃肿，我们可以考虑配置 `resolveLoader`

`resolveLoader` 是专门用来解析 loader 的，跟 resolve 不一样的是 resolve 是专门用来解析模块的

我们可以在 webpack 中配置别名

```js
module.exports = {
  // 省略其他配置
  resolveLoader: {
    alias: {
      loader1: path.resolve(__dirname, 'loaders', 'loader1.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'loader1',
      },
    ],
  },
};
```

其实上面这种写法和直接在 use 里面写路径是一样的，只是配置了别名，还是比较麻烦。其实我们还有更好的方案，配置 modules，配置 webpack 查找的地方，默认情况下是查找 `node_modules` 文件夹下，我们可以在这里把我们的 `loaders` 文件夹补充上，找不到 `node_modules` 后去 `loaders` 文件夹下查找

```js
module.exports = {
  // 省略其他配置
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'loader1',
      },
    ],
  },
};
```

此时，我们就可以直接在 use 的配置项中直接写 loader 的文件名字了，webpack 在 node_modules 目录下找不到后会自己去我们定义的 `loaders` 中查找

### 执行顺序

我们都知道 loader 执行顺序按照从后往前的顺序逆向执行的，当然 loader 的执行顺序也是可控的， 可以在 loader 中配置 `enforce` 参数为 `pre` 或者 `post` 来控制 loader 的执行的顺序

当然 loader 还有一种[内联 loader](https://webpack.docschina.org/concepts/loaders/#inline)，所以一般 loader 的执行顺序应该是：pre -> normal -> inline -> post

loader 默认是由两部分组成 pitchLoader 和 normalLoader，loader 执行的时候会先走 pitchLoader（从前面走到后面）然后获取到我们的资源，然后在反过来执行（从后执行到前面）

所有的 loader 都是先走 pitch，不管是否配置了 `enforce` 属性，具体可以参考我的代码，代码地址在后面会全部贴出来

<p align="center" class="p-images">
  <img :src="$withBase('/imgs//webpack-3-loader-pitch.png')" height="">
</p>

但是如果 pitchLoader 写了，并且有返回值，他会跳过后面的 loader 直接执行。

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/webpack-3-loader-pitch-2.png')" height="">
</p>

这段内容，先了解一下，具体需要参考代码调试查看结果

### loader 的特点

- 单一职责，一个 `loader` 只做一件事情，正因为职责越单一，所以 `loader` 的组合性强，可配置性好。
- `loader` 支持链式调用，上一个 `loader` 的处理结果可以传给下一个 `loader` 接着处理，上一个 `loader` 的参数 options 可以传递给下一个 loader，直到最后一个 loader，返回 webpack 所期望的 javascript
- loader 是一个纯函数，不能有状态(外界的状态)

### 开发 loader

我们来实现一个比较常见的功能删除代码中所有 console 打印，我们使用 ast 来实现这个功能，整个过程我们分为以下几步：

- 新建一个 removeConsole.js 文件
- 在 [`astexplorer`](https://astexplorer.net/) 中分析 `console` 语法树，找到 `console` 相关的特征
- 在代码中匹配到 console 语句，然后移除即可

最重要的阶段是分析语法树，我们是要分析 console 相关的执行语句，删除控制台中所有 console 的输出(log、error、warning 等)，所以拿 `console.log()` 为例分析语法树，下图为 console.log() 解析后的语法树

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/ast-remove-console.jpg')" height="">
</p>

在语法树中我们发现 `console.log()` 是一个调用表达式 `CallExpression`，`CallExpression` 的 `callee` 是个成语表达式 `MemberExpression`，成语对象的标识符 `Identifier` 是 `console`，既然我们找到它了，那么在这个节点把它移除掉就可以。所以我们就可以按照写 ast 的那套流程在代码中这么写，最后把我们写好的这个 `removeConsole` loader 配置到 webpack 中就可以使用了

```js
const babel = require('@babel/core');
const t = require('@babel/types');

function loader(source) {
  const removeConsolePlugin = {
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        if (t.isMemberExpression(callee) && t.isIdentifier(callee.object, { name: 'console' })) {
          path.remove();
        }
      },
    },
  };
  const ret = babel.transform(source, { plugins: [removeConsolePlugin] });
  return ret.code;
}

module.exports = loader;
```

如果你还不熟悉 ast 的话，可以查看我之前写过一篇[`关于 ast 的文章`](https://chengyuming.cn/views/webpack/AST.html)

### 异步写法

loader 也可以使用异步写法，只需要使用 `this.async` 来获取 callback 函数即可，我们使用异步的方式重新写一下 `removeConsole` 这个 loader ，这次使用正则替换内容

```js
function loader(source) {
  // 异步写法
  const callback = this.async();
  const consoleReg = /console\..+\(.+\)/g;
  const result = source.replace(consoleReg, '');
  callback(null, result);
}
module.exports = loader;
```

### loader 之间的关系

- 当我们编译 `js` 的时候我们会用 `babel-loader` 和 `@babel/core` 最少两个依赖，编译 `less` 的时候，会用 `less-loader` 和 `less` 最少两个包，为什么呢？

- 比如说 `@babel/core` 和 `babel-loader` 的关系，`@babel/core` 是核心编译 `babel-loader` 是把接受到的 `ctx` 传给`@babel/core`

```js
// babel-loader 和 @babel/core 的关系
function babelLoader(ctx) {
  return babelCore(ctx);
}
```

### loader-utils

loader 传递的参数可以在编写的 loader 的时候，使用 this.query 获取到传递过来的参数，但是都从 this.query 中获取可能会有点麻烦，所以 webpack 提供了一个库 `loader-utils` 专门处理 loader 的各种工具方法

使用 `loader-utils` 来处理 loader 参数的话，不管传递过来是字符串形式(?a=b)的还是对象形式的({a:b})参数都会给我们转成对象形式的参数，只需要使用他的 getOptions API 即可

模拟一个 babel-loader 的实现，传递参数 `presets: ['@babel/preset-env']`，`babel-loader` 的核心就是使用 babel 的核心转换源代码

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] },
        },
      },
    ],
  },
};

// babel-loader.js
const loaderUtils = require('loader-utils');
const babel = require('@babel/core');
function loader(source) {
  // loader 传递过来的参数在 this 上可以获取到
  // console.log(this.query);
  const callback = this.async();
  const options = loaderUtils.getOptions(this);
  babel.transform(source, { ...options }, (err, result) => {
    // 可以把 sourceMap 返回去，如果需要 sourceMap，需要设置 devtool为 'source-map',
    callback(err, result.code, result.map);
  });
}

module.exports = loader;
```

### 处理样式

loader 中样式处理一般常见的有 less-loader、css-loader、style-loader，less-loader 负责把 less 语法编译成 css 代码，style-loader 负责把 css 代码插入到 html 标签内，css-loader 处理的事情比较多，比如背景图的路径处理

他们实现也是蛮简单

```js
// less-loader
const less = require('less');
function loader(source) {
  const callback = this.async();
  less.render(source, (err, result) => {
    callback(err, result.css);
  });
}
module.exports = loader;

// style-loader
function loader(source) {
  const result = `
    const style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(source)};
    document.head.appendChild(style)
  `;
  return result;
}
module.exports = loader;
```

### 处理文件

一般我们使用 loader 来处理文本内容，loader 也是可以用来处理文件(二进制)。比如说 file-loader、url-loader 等，file-loader 作用就是劫持到引入的文件，然后生成新的文件到我们想要处理到的地方(比如默认生成到 dist 目录下)，然后返回一个路径。

在项目中我们可以用会用到各种格式的文件，一些常见的文件我们可以使用各种 loader 来处理，但是不同的业务也可能会遇到其他特殊的文件没有对应的 loader 处理，此时我们可以使用 file-loader 来处理，file-loader 会把源文件拷贝一份到 dist 目录下，不会存在副作用。

例如 create-react-app 脚手架中的 webpack 配置，会把没有匹配到的文件使用 file-loader 来处理

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/webpack-loader-react.png')" width="" style="border-radius: 8px;">
</p>

模拟一个 file-loader 的实现

在开发 loader 的时候接收的 source 参数默认会 toString 处理，处理文件或者二进制的时候我们就需要用到的是 buffer，不然就会乱码，此时需要告诉 loader 我们处理的文件内容是二进制

```js
const loaderUtils = require('loader-utils');
function loader(content) {
  console.log('loader -> content', content);
  const fileUrl = loaderUtils.interpolateName(this, '[hash].[ext]', { content });
  console.log('loader -> fileUrl', fileUrl);
  // 把文件发射到dist目录下
  this.emitFile(fileUrl, content);
  return `module.exports="${fileUrl}"`;
}
loader.raw = true;

module.exports = loader;
```

此时引入图片，然后打包结果为

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/webpack-loader-file-loader.png')" width="" style="border-radius: 8px;">
</p>

相应的 url-loader 是专门用来处理图片，比如对图片的做一下限制，文件内容小于多少的图片可以直接转 base64

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/webpack-loader-url-limit.png')" width="" style="border-radius: 8px;">
</p>

```js
const loaderUtils = require('loader-utils');
const mime = require('mime');
function loader(source) {
  const { limit } = loaderUtils.getOptions(this);
  if (limit > source.length) {
    // base64的格式：data:{文件格式};base64,{文件内容}
    const base64 = `data:${mime.getType(this.resourcePath)};base64,${source.toString('base64')}`;
    return `module.exports = "${base64}"`;
  } else {
    return require('./file-loader').call(this, source);
  }
}
loader.raw = true;

module.exports = loader;
```

此时引入图片文件小于配置的 15kb，文件被打包为 base64

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/webpack-loader-url-loader.png')" width="" style="border-radius: 8px;">
</p>

## webpack plugins

webpack 配置中的 `plugins` 是一个数组，接收一组的 plugin，每一个 plugin 是一个类，使用时需要 new 这个插件类。插件目的在于解决 loader 无法实现的其他事，`plugins` 专注处理 webpack 编译过程中某个特定的任务的功能模块

webpack 打包是一个事件流机制，是将各个插件串联起来，核心是用了 tapable。并且在 webpack 中负责编译的 Compiler 和负责创建 bundles 的 Compilation 都是 tapable 构造函数的实列。

### tapable

tapable 类似于 node 中的 EventEmitter，但更专注于自定义事件的触发和处理。webpack 通过 tapable 将实现与流程解耦，所有具体实现通过插件的形式存在。tapable 中主要提供了同步与异步两种钩子

```js
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} = require('tapable');
```

以最简单的 SyncHook 为例：

```js
const { SyncHook } = require('tapable');
// 创建实列
const syncHook = new SyncHook(['name', 'age']);

// 注册事件
syncHook.tap('one', (name, age) => {
  console.log('one', name, age);
});
syncHook.tap('two', (name, age) => {
  console.log('two', name, age);
});

// 触发事件，让监听函数执行
syncHook.call('fecym', 25);
// one fecym 25
// two fecym 25
```

可以看到当我们执行 syncHook.call 时会依次执行前面 syncHook.tap 中的回调函数。通过 SyncHook 创建同步钩子，使用 tap 注册回调，再调用 call 来触发。这是 tapable 提供的多种钩子中比较简单的一种，通过 EventEmitter 也能轻松的实现这种效果。

其他同步钩子：

- SyncBailHook：类似于 SyncHook，执行过程中注册的回调返回非 undefined 时就停止不在执行。
- SyncWaterfallHook：接受至少一个参数，上一个注册的回调返回值会作为下一个注册的回调的参数。
- SyncLoopHook：有点类似 SyncBailHook，但是是在执行过程中回调返回非 undefined 时继续再次执行当前的回调。

tapable 中还有一些异步钩子，最基本的两个异步钩子分别是 AsyncParallelHook 和 AsyncSeriesHook。其他的异步钩子都是在这两个钩子的基础上添加了一些流程控制，类似于 SyncBailHook 之于 SyncHook 的关系。

具体了解 tapable 可以在下面的[参考链接](#参考链接)中具体查看

### Compiler 和 Compilation

在开发 plugin 时我们最常用的两个对象就是 Compiler 和 Compilation。

Compiler 对象包含了 webpack 环境所有的配置信息，包含 options，loaders, plugins 这些项，这个对象在 webpack 启动时候被实例化，它是全局唯一的。可以理解为 webpack 的实列。

Compilation 对象包含了当前的模块资源、编译生成资源、文件的变化等。当 webpack 在开发模式下运行时，每当检测到一个文件发生改变的时候，那么一次新的 Compilation 将会被创建。从而生成一组新的编译资源。

Compiler 对象的事件钩子以及作用

| 勾子            | 参数                       | 作用              | 类型  |
| --------------- | -------------------------- | ----------------- | ----- |
| after-plugins   | 设置完一组初始化插件之后   | compiler          | sync  |
| after-resolvers | 设置完 resolvers 之后      | compiler          | sync  |
| run             | 在读取记录之前             | compiler          | async |
| compile         | 在创建新 compilation 之前  | compilationParams | sync  |
| compilation     | compilation 创建完成       | compilation       | sync  |
| emit            | 在生成资源并输出到目录之前 | compilation       | async |
| after-emit      | 在生成资源并输出到目录之后 | compilation       | async |
| done            | 完成编译                   | stats             | sync  |

下面根据具体的案例来了解一下 Compiler 和 Compilation

### 实现一个资源分析插件

实现一个资源分析插件：在打包完成之后，统计所有打包后资源的大小

在 webpack 中使用插件的时候需要 new 这个插件，那么这个插件一定是个类(构造函数)。webpack 执行时，先生成插件的实例对象，之后会调用插件上的 apply 方法，并将 compiler 对象作为参数传递给 apply。所以这个构造函数里面有个核心的 apply 方法

我们要做一个资源分析的插件，所以是在生成资源后输出到目录之前注册一个事件，这个事件函数接收一个 compilation 对象，compilation.assets 是我们所有的资源文件对象，每一个对象里面都有 source 和 size 方法，我们可以这里面控制输出的资源

```js
class AssetsAnalysePlugin {
  constructor({ filename = 'analyse.md' }) {
    // 接收传递过来的参数
    this.filename = filename;
  }
  apply(compiler) {
    // 因为我们要统计打包后资源的大小，所以在生成资源后输出到目录之前注册事件
    compiler.hooks.emit.tap('AssetsAnalysePlugin', compilation => {
      const assets = compilation.assets;
      // 字符串拼接大法
      let content = `# 资源统计 \r\n\r\n| 资源名称 | 资源大小 |\r\n| ------ | ------ |`;
      let size = 0;
      const assetsEntries = Object.entries(assets);
      assetsEntries.forEach(([filename, fileObj]) => {
        content += `\r\n| ${filename} | ${fileObj.size()} b |`;
        size += fileObj.size();
      });
      content += `\r\n\r\n共有 ${assetsEntries.length} 个资源，共 ${(size / 1024).toFixed(2)} kb`;
      assets[this.filename] = {
        source() {
          return content;
        },
        size() {
          return content.length;
        },
      };
    });
  }
}

module.exports = AssetsAnalysePlugin;
```

用法

```js{10}
module.exports = {
  // ... 其他配置
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[name].[hash:6].css' }),
    new HtmlWebpackPlugin({
      template: path.resolve('./public/index.html'),
      filename: 'index.html',
    }),
    // 使用我们的插件
    new AssetsAnalysePlugin({ filename: 'analyse.md' }),
  ],
};
```

### 实现一个静态资源替换插件

再来资源替换插件，熟悉一下 plugin 的开发。把打包后的静态资源替换成我们的 cdn 地址，或者服务器上的绝对地址

```js
// 需求：把所有的引入中的静态资源 static 变成 http://chengyuming.cn/
const fs = require('fs');
class StaticAssetsPlugin {
  constructor({ isProd = true, outputPath = 'dist', staticPath = 'static', cdnAddr = '/' }) {
    this.isProd = isProd;
    this.outputPath = outputPath;
    this.staticPath = staticPath;
    this.cdnAddr = cdnAddr;
  }
  apply(compiler) {
    if (!this.isProd) return;
    compiler.hooks.done.tapAsync('StaticAssetsPlugin', compilation => {
      const outputPath = compiler.options.context + '/' + this.outputPath;
      const assets = compilation.toJson().assets;
      const staticPathReg = new RegExp('([../]+)/' + this.staticPath + '/', 'g');
      assets.forEach(fileObj => {
        const filePath = outputPath + '/' + fileObj.name;
        console.log('apply -> filePath', filePath);
        fs.readFile(filePath, (err, res) => {
          if (err) throw err;
          let result = res.toString();
          result = result.replace(staticPathReg, this.cdnAddr);
          fs.writeFileSync(filePath, result);
        });
      });
    });
  }
}

module.exports = StaticAssetsPlugin;
```

```js
// webpack.config.js
const StaticAssetsPlugin = require('./plugins/StaticAssetsPlugin');
module.exports = function(env, argv) {
  return {
    // ... 其他配置
    plugins: [
      new StaticAssetsPlugin({
        isProd: true,
        outputPath: 'dist',
        staticPath: 'static',
        cdnAddr: 'http://chengyuming.cn/',
      }),
    ],
  };
};
```

```js
// 测试
const webpackContext = require.context('../static/imgs/', false, /\.(jpg|jpeg|png)$/);
const requireAll = ctx => ctx.keys().map(ctx);
const imgs = requireAll(webpackContext).map(r => r.default);

const fragment = document.createDocumentFragment();

imgs.forEach(item => {
  const img = new Image();
  img.src = `<img src="../static/${item}">`;
  fragment.appendChild(img);
});

document.getElementById('root').appendChild(fragment);
```

### 两个插件的结果

最终使用两个插件的结果如下：

`StaticAssetsPlugin` 的结果

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/webpack-plugin-StaticAssetsPlugin.png')" width="" style="border-radius: 8px;">
</p>

`AssetsAnalysePlugin` 的结果

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/webpack-plugin-AssetsAnalysePlugin.png')" width="" style="border-radius: 8px;">
</p>

webpack 的 plugin 功能很强大，当然学习成本比较大，当你熟悉之后可以根据业务来实现各种你想要的功能

## 源码地址

代码以存放到 github，[地址](https://github.com/fecym/webpack-share)

## 相关链接

1. [珠峰架构课内容](http://www.zhufengpeixun.cn/)
2. [webpack loader](https://www.webpackjs.com/concepts/loaders/)
3. [webpack plugins](https://www.webpackjs.com/concepts/plugins/)
4. [Webpack 之 loader 配置详解](https://juejin.im/post/6847902222873788430)
5. [关于 tapable 你需要知道这些](https://zhuanlan.zhihu.com/p/79221553)
6. [webpack4 核心模块 tapable 源码解析](https://www.cnblogs.com/tugenhua0707/p/11317557.html)
7. [如何编写一个 WebPack 的插件原理及实践](https://www.cnblogs.com/tugenhua0707/p/11332463.html)
