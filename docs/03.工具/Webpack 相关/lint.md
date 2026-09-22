---
title: 一文带你打造eslint工作流
date: 2022-10-24
author: fecym
permalink: /tools/eslint
tags:
  - eslint
  - node
categories:
  - 前端
---

## 简介

本项目使用 express 脚手架初始化，并对其进行改造，从而实现一套完整的 eslint 工作流的 node 项目。本项目将全程使用 `pnpm` 作为包管理工具

本文将从以下几个方面过一遍 eslint 工作流

<!-- ![](https://chengyuming.cn/imgs/eslint-process.svg) -->
<p align="center">
  <img src="/imgs/eslint-process.svg"/>
</p>

## 初始化项目

```sh
npx express-generator --view=pug express-template
```

也可以下全局下载 `express-generator` ，然后执行 `express --view=pug express-template` 初始化项目

## 开启 debug

```shell
# 在 MacOS 或 Linux 中，通过如下命令启动此应用：
DEBUG=myapp:\* npm start
# 在 Windows 命令行中，使用如下命令：
set DEBUG=myapp:\* & npm start
# 在 Windows 的 PowerShell 中，使用如下命令：
env: DEBUG='myapp:\*'; npm start
```

为了兼容其他系统，安装 cross-env 工具来处理

```shell
pnpm add cross-env -D
```

## 安装 nodemon

nodemon 用来监视 node.js 应用程序中的任何更改并自动重启服务, 非常适合用在开发环境中。

nodemon 不需要对代码或开发方法进行任何额外的更改。 nodemon 是 node 的替代包装器。

nodemon 可全局设置也可以项目设置，我们为项目设置即可

```shell
pmpm add nodemon -D
touch nodemon.json
```

nodemon.json 各配置项含义，也可以 nodemon --[options] 使用

- restartable：重启模式
- verbose：日志输出模式，true 为详细
- watch：需要监听的文件
- ignore：忽略的文件
- delay：设置延迟时间
- exec：执行的命令
- ext：文件后缀名

```json nodemon.json
{
  "ignore": [".git", "node_modules/**/node_modules", "package-lock.json", "npm-debug.log*"]
}
```

## 安装 babel

安装 babel 来支持 es6 语法，需要用到的包 `@babel/core、@babel/node、@babel/preset-env` ，如果用到命令行的话还需要用到 `@babel/cli`

```shell
pnpm add @babel/core @babel/node @babel/preset-env @babel/cli -D
# 增加 babel 配置文件
touch .babelrc
```

.babelrc 文件配置，一般用到 `@babel/preset-env` 就够用了， `preset-env` 是官方提供的预设用于编译 es2015+ 的语法， `preset-env` 是一套插件包的集合

当我们配置了 `presets` 中有 `@babel/preset-env` ，那么 `@babel/core` 就会去找 `preset-env` 预设的插件

babel 核心包并不会去转换代码，核心包只提供一些核心 API，真正的代码转换工作由插件或者预设来完成，比如要转换箭头函数，会用到个 plugin `@babel/plugin-transform-arrow-functions` ，当需要转换的要求增加时，我们不可能去一一配置相应的 plugin，这个时候就可以用到预设了，也就是 presets。presets 是 plugins 的集合，一个 presets 内部包含了很多 plugin。

```json .babelrc
{
  "presets": ["@babel/preset-env"]
}
```

### 改造项目

增加配置后就可以把项目用到的 var 和 require 换成为 es6 语法

更改项目目录，创建 src 目录，把要开发的文件都放到 src 目录下，方便编译文件（public 和 views 不需要）

在 package.json 增加启动和打包脚本

```json package.json
{
  "scripts": {
    "dev": "node ./src/app",
    "start": "cross-env NODE_ENV=development debug=express-template:* nodemon ./src/app --exec babel-node",
    "clean": "rm -rf dist",
    "babel": "babel ./src --out-dir dist",
    "build": "cross-env NODE_ENV=production npm run clean && npm run babel"
  }
}
```

增加一个项目启动后提示启动 IP 端口展示

使用 chalk 优化终端展示颜色，不要下载 5 版本

```shell
pnpm add chalk@^4.1.2
```

```js
// 获取 IP
const interfaces = require('os').networkInterfaces();

function getIp() {
  let IpAddress = '';
  for (let devName in interfaces) {
    interfaces[devName].forEach(ip => {
      if (ip.family === 'IPv4' && ip.address !== '127.0.0.1' && !ip.internal) {
        IpAddress = ip.address;
      }
    });
  }
  return IpAddress;
}

// 更新 onListening
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log(`
    Server running at:
    - Local:   ${chalk.hex('#66D9EF')('http://localhost:' + port)}
    - Network: ${chalk.hex('#66D9EF')('http://' + getIp() + ':' + port)}
  `);
}
```

最终效果如下：

<!-- ![](https://chengyuming.cn/imgs/express-template-start.webp) -->
<p align="center">
  <img src="/imgs/express-template-start.webp"/>
</p>

## eslint 和 prettier

### eslint

> 问：为什么要使用 eslint?
>
> 答：由于 js 的动态弱类型语言特性，导致在开发中如果不加以约束会容易出错，也正是因为这种特性导致当程序出现错误的时候，我们需要花费更多的时间在执行的过程中不断去调试，eslint 的出现就是为了让开发人员可以在开发的过程中就发现错误而非在执行过程中

下载依赖并且创建 `.eslintrc.js` 或者 `.eslintrc.json` 文件

```shell
pnpm i eslint @babel/eslint-parser -D
touch .eslintrc.js
```

```js .eslintrc.js
module.exports = {
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es6: true,
  },
  globals: {},
  rules: {},
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
};
```

package.json 增加 lint 脚本，即可对代码进行检测以及格式化

```json package.json
{
  "scripts": {
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix"
  }
}
```

### eslint 配置简介

下面是 eslint 配置文件的常见字段：

```js
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  env: {
    node: true,
    es6: true,
  },
  globals: {
    jQuery: 'readonly',
    defineProps: 'readonly',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
};
```

- root: 使用配置文件时 eslint 将自动在要检测的文件目录里(`.eslintrc.* 和 package.json`)寻找它们，紧接着是父级目录，一直到文件系统的根目录，eslint 一旦发现配置文件中有 "root": true，它就会停止在父级目录中寻找。

- extends: 用于开启一系列预设的规则。可以添加两类预设：

  1. 配置包: 配置包用于专门导出共享的配置内容。配置 extends 时名称包含 `eslint-config-` 可省略，比如 `prettier` 即为 `eslint-config-prettier`
  2. 插件包: 插件包通常输出一系列规则，但同时还能导出一个或多个命名配置供用户选择，这些配置与配置包的导出内容一致。配置到 extends 时格式为 `plugin:包名/配置名称` ，包名可省略 eslint-plugin- 前缀，比如 `plugin:prettier/recommended`

- plugins: 插件，可省略插件名称中的 `eslint-plugin-` 前缀，但 @scope 不能省略(extends 同样适用)。添加插件后即可以在 rules 字段配置对应规则

```js
module.exports = {
  extends: ['@vue/standard'], // @vue/eslint-config-standard
  plugins: [
    '@typescript-eslint', // @typescript-eslint/eslint-plugin
    '@byted/check-css-modules', // @byted/eslint-plugin-check-css-modules
  ],
};
```

- env: env 预定义了一组的全局变量，下面列举一些常见的，全部的可参考[ Specifying Environments ](https://eslint.bootcss.com/docs/user-guide/configuring#specifying-environments)

```js
module.exports = {
  env: {
    browser: true, // 浏览器环境中的全局变量。window、document 就可以使用
    node: true, // Node.js 全局变量和 Node.js 作用域。process 等可以使用
    commonjs: true, // CommonJS 全局变量和 CommonJS 作用域 (用于 Browserify/WebPack 打包的只在浏览器中运行的代码)。
    'shared-node-browser': true, // Node.js 和 Browser 通用全局变量。
    es6: true, // 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6）。
    worker: true, // Web Workers 全局变量。
    amd: true, // 将 require() 和 define() 定义为像 amd 一样的全局变量。
  },
};
```

- globals: 设置脚本在执行期间访问的额外的全局变量，当访问当前源文件内未定义的变量时，no-undef 规则将发出警告，比如 vue 升级 2.7 之后可以使用 vue3 的语法，但是 `defineProps` 之类的 eslint 校验不通过，此时可以配置这个，对应值有 `writable` 和 `readonly`

```js
module.exports = {
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
  },
};
```

- rules: 启用的规则及其各自的错误级别。eslint 附带有大量规则，可以使用注释或配置文件修改你项目中要使用的规则，要改变一个规则设置，必须将规则 ID 设置为下列值之一：

  1. off 或 0 - 关闭规则
  2. warn 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
  3. error 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)

- parser: eslint 默认使用 Espree 作为其解析器，我们可以配置其他不同的解析器，官方目前给出了三个 [Esprima](https://www.npmjs.com/package/esprima)、[@babel/eslint-parser](https://www.npmjs.com/package/@babel/eslint-parser)、[@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)

- parserOptions：设置解析器选项，可用选项有：
  1. ecmaVersion: es 版本，默认为 3，5，可以使用 6、7、8、9 或 10 来指定，也可以使用 2015、2016 等基于年份的命名，还可以直接用 `latest` 声明最新版本
  2. sourceType: 默认为 `script`，如果代码是 ECMAScript 模块可以设置为 `module`
  3. ecmaFeatures: 是个对象，表示你想使用的额外的语言特性

```js
module.exports = {
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: true, // 允许在全局作用域下使用 return 语句
      impliedStrict: true, // 启用全局 strict mode (如果 ecmaVersion 是 5 或更高)
      jsx: true, // 启用 JSX
    },
  },
};
```

缺少配置遇到的错误：

- `The keyword 'const' is reserved`：遇到这个错误需要把 `env.es6` 打开即可解决
- `'import' and 'export' may appear only with 'sourceType: module'`：把 `parserOptions.sourceType` 设置为 `module` 即可解决

### prettier

> 问：用了 eslint 为什么还要用 prettier?
>
> 答：prettier 是一个代码风格的约束工具，对于代码可能产生的 Bug 等并不关心，虽然说 eslint 其实也具备一定的代码风格的格式化能力，但是在实践中，我们一般采用 eslint 来做代码质量的约束，用 prettier 来做代码风格的约束。

安装脚本

```shell
pnpm add prettier eslint-config-prettier -D
```

使用 `eslint-config-prettier` 是为了解决 eslint 和 prettier 的规则冲突，本质上这个工具其实就是禁用掉了一些不必要的以及和 prettier 相冲突的 eslint 规则

eslint 给 extends 增加 'prettier'

```js
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
};
```

创建配置文件 `.prettierrc` 或者 `prettier.config.js` 进行一些简单配置，配置项不多，可参考[ prettier options ](https://prettier.io/docs/en/options.html)

prettier 格式化代码也很简单，只需要执行 `npx prettier --write src.` ，如果只是检测执行 `npx prettier --check src/.`

## git hook

执行 git init 的时候会生成一个 `.git` 文件夹，或者从 github、gitlab 中 download 下来的代码都会有这么一个文件夹，git hook 就是这个文件夹的 hooks 下的一些钩子函数，特定时期他们将会被调用，完整钩子参考[ git hooks ](https://git-scm.com/docs/githooks)

<!-- ![](https://chengyuming.cn/imgs/git-hooks.webp) -->
<p align="center">
  <img src="/imgs/git-hooks.webp"/>
</p>

里面的文件分为以 .sample 结尾的文件和没有这个结尾的文件

.sample 为各个钩子的案例脚本，可以把 sample 去掉，直接编写 shell 脚本来执行

我们可以利用插件 husky 和 pre-commit 来使钩子生效

### husky

git hooks 保存在 `.git` 文件夹中。git 是一个多人协作工具，那按理说 git 仓库中的所有文件都应该被跟踪并且上传至远程仓库的。但是有个例外， `.git` 文件夹不会，这就导致一个问题，我们在本地配置好 git hooks 后，怎么分享给其他小伙伴儿呢？copy 吗？那未免太 low 了，都用 git 了还 copy，也太不优雅了。这时候我们可以用 [husky](https://www.npmjs.com/package/husky)

husky 是一个让配置 git 钩子变得更简单的工具。husky 的原理是让我们在项目根目录中写一个配置文件，然后在安装 husky 的时候把配置文件和 git hooks 关联起来，这样我们就能在团队中使用 git hooks 了。也可以直接执行 `husky install` 来生成 git hooks

根据官网配置走一遭

```shell
pnpm add husky -D
npm set-script prepare "husky install"
npm run prepare
# 添加一个 hook
npx husky add .husky/pre-commit "npm run prettier"
# husky@9.x 以上用 npx husky init
git commit -m "Keep calm and commit"
# `npm run prettier` will run
```

husky 在 version@5.x 之后已经不自动生成 git hooks 了

使用 husky 4 之前，会在 install 的时候自动安装 git hooks。使用 husky 5 之后，可以选择，而且很明确。

Husky 5 更接近 Git，并且抽象更少。它不仅使它更易于理解，而且非常快速和小，零依赖。具体信息可参考[ What's new in husky 5 ](https://dev.to/typicode/what-s-new-in-husky-5-32g5)

至于 husky 为什么要抛弃传统的 JS 配置，husky 作者专门写了一篇解释，可参考[ Why husky has dropped conventional JS config ](https://blog.typicode.com/husky-git-hooks-javascript-config/)

### npm 钩子 prepare

上面我们用到了一些 npm 的钩子函数， `npm set-script prepare "husky install"` ，这句话的意思是说给 npm 设置一个执行脚本 `prepare` 它要执行的命令是 `husky install` ，这时 package.json 的 scripts 中就会多一个脚本

相当于我们手动在 package.json 中写入 `"prepare": "husky install"` ，其中 `prepare` 是 npm 的一个钩子函数，是 npm 4 引入的一个新的钩子，行为等同于 `prepublish`

`prepublish` 这个钩子不仅会在 `npm publish` 命令之前运行，还会在 `npm install（不带任何参数）` 命令之前运行。这种行为很容易让用户感到困惑，所以在 npm 4 的时候引入了这个钩子，从 npm 5 开始， `prepublish` 将只在 `npm publish` 命令之前运行。

所以这个钩子 `只会在 npm install 命令之前运行` ，每次在 install 的时候安装 husky (确保别人拉下代码后项目中有 git hooks)

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### npm 钩子

npm 脚本有 `pre` 和 `post` 两个钩子。举例来说，build 脚本命令的钩子就是 prebuild 和 postbuild

```json
{
  "scripts": {
    "prebuild": "echo I run before the build script",
    "build": "babel ./src --out-dir dist",
    "postbuild": "echo I run after the build script"
  }
}
```

用户执行 npm run build 的时候，会自动按照下面的顺序执行。

`npm run prebuild && npm run build && npm run postbuild`

因此，可以在这两个钩子里面，完成一些准备工作和清理工作。

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "prebuild": "cross-env NODE_ENV=production npm run clean",
    "build": "babel ./src --out-dir dist"
  }
}
```

npm 默认提供下面这些钩子

```txt
prepublish，postpublish
preinstall，postinstall
preuninstall，postuninstall
preversion，postversion
pretest，posttest
prestop，poststop
prestart，poststart
prerestart，postrestart
```

自定义的脚本命令也可以加上 pre 和 post 钩子。比如，myscript 这个脚本命令，也有 premyscript 和 postmyscript 钩子。不过，双重的 pre 和 post 无效，比如 prepretest 和 postposttest 是无效的。

npm 提供一个 `npm_lifecycle_event` 变量，返回当前正在运行的脚本名称，比如 pretest、test、posttest 等等。

那么最终我们 package.json 的 scripts 就改造成了这个

```json package.json
{
  "scripts": {
    "prestart": "cross-env NODE_ENV=development debug=express-template:*",
    "start": "nodemon ./src/app --exec babel-node",
    "clean": "rm -rf dist",
    "prebuild": "cross-env NODE_ENV=production npm run clean",
    "build": "babel ./src --out-dir dist",
    "prelint": "eslint src/**/*.js --fix",
    "lint": "prettier --write src/**/*.js",
    "prepare": "husky install"
  }
}
```

### lint-stage

上面执行的 lint 命令会格式化整个项目，比较耗资源，其实我们只需要格式化本次修改的代码就行，此时我们就可以用到 lint-stage

官网有句话叫 Run linters against staged git files and don't let 💩 slip into your code base!

使用也很简单，下载 lint-staged 包

```shell
pnpm add lint-staged -D
```

在 package.json 中增加 lint-staged 配置，或者单独创建 .lintstagedrc 之类的配置文件也可以

.lintstagedrc 文件

```json .lintstagedrc
{
  "src/**/*.js": "npm run lint"
}
```

然后修改 `.husky/pre-commit` 文件，把里面的 `npm run prettier` 修改为 `npx lint-staged`

```shell
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

此时项目就改造完成了

小技巧：因这个项目是第一次提交，要不断地撤回然后在次 commit 来调试代码格式化的结果，所以这里可以用 `git update-ref -d HEAD` 命令来撤销第一次提交

## 增加 pm2

说起项目自动重启，就不得不在介绍一下 pm2，pm2 是开源的基于 Nodejs 的进程管理器，包括守护进程、监控、日志的一整套完整的功能

pm2 全称 `Process Manager 2` 是 node.js 和 io.js 应用程序的生产进程管理器，具有内置的负载均衡器。它允许您永远保持应用程序的活性，在不停机的情况下重新加载它们，并促进常见的系统管理任务。

【io.js 黑暗史】曾与 node.js 有冲突，核心开发者自立门户建立了分支 io.js 并行一段时间后与 node.js 合并

在生产模式下使用只需要执行 `pm2 start app.js` 就行

对于线上项目，如果直接通过 node app 来启动，如果报错了可能直接停止导致整个服务崩溃，而 pm2 带有负载均衡功能，可以保持 node 应用进程永远运行在后台

pm2 需要全局安装，然后本地直接使用即可

```shell
npm i -g pm2
# 到项目根目录下执行
pm2 init
# 此时会生成 ecosystem.config.js 文件，可以在里面提供一些配置
```

常用配置项说明:

- apps: apps 是一个数组，每一个数组成员就是对应一个 pm2 中运行的应用
- name: 应用程序名称，默认为不带扩展名的脚本文件名
- cwd: 应用程序所在目录
- script: 应用程序脚本路径，相对于 pm2 start 的脚本路径
- args: 包含通过 CLI 传递给脚本的所有参数的字符串
- log_date_format: 日志日期格式
- error_file: 错误文件路径 (默认为：$HOME/.pm2/logs/xxxerr.log)
- out_file: 输出文件路径 (默认为：$HOME/.pm2/logs/xxxout.log)

详细配置可查看 [Configuration File](https://pm2.keymetrics.io/docs/usage/application-declaration/)

pm2 常用命令

- `pm2 start xxx`: 启动应用程序，不仅可以启动 js 脚本，同时还可以启动其他类型的应用程序，如 bash 命令、脚本、二进制文件，例如 `pm2 start "ls -la"`
- `pm2 restart [xxx|all]`: 重启
- `pm2 show [id|name]`: 查看应用程序数据
- `pm2 [list|ls|l|status]`: 列出所有正在运行的应用程序
- `pm2 delete [id|name|all]`: 删除某个启动的服务
- `pm2 monit`: 打开监控面板，查看内存和 CPU

为 package.json 增加一个执行脚本

```json
{
  "scripts": {
    "pm2": "pm2 start ecosystem.config.js"
  }
}
```

至此我们项目就搭建完了，为 node 项目支持了 es6，并增加了一套代码规范以及 git 提交时自动格式化代码，本地开发使用 `npm start` 部署到服务器上后则执行 `npm run pm2` 即可

## 源码地址

[https://github.com/fecym/express-template](https://github.com/fecym/express-template)

## 参考链接

1. [npm scripts 使用指南](https://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)
2. [What's new in husky 5](https://dev.to/typicode/what-s-new-in-husky-5-32g5)
3. [Configuring ESLint](https://eslint.bootcss.com/docs/user-guide/configuring)
4. [ESLint 插件开发基础](https://juejin.cn/post/7078137861039456264)
