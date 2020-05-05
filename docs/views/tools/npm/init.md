---
title: 你应该了解的npm知识
date: 2019-12-09
tags:
  - npm
  - 大前端
---

## npm init

初始化一个项目的时候，我们会在控制台输入 `npm init` 执行该命令后终端会依次询问 `name, version, description` 等字段，最后会为你生成一个 `package.json` 文件

如果想偷懒省去一路回车，可以在命令后面加 `--yes` 或者 `-y` 参数，这样会快速生成一个 `package.json` 文件

```sh
  npm init -y
```

这样生成出来的 `package.json` 是默认的配置，如果想要改变其默认配置怎么办？

## 修改 npm 配置

初始化 `package.json` 时的字段默认值是可以自己配置的，可以用下面的命令去修改默认配置：

```sh
  npm config set init.author.email "yumingtarget@gmail.com"
  npm config set init.author.name "chengyuming"
  npm config set init.author.url "https://github.com/fecym"
  npm config set init.license "MIT"
  # 默认版本是 0.0.1
  npm config set init.version "1.0.0"
```

此时我们在控制台输入 `npm init -y` 就可以得到一个以下的 `package.json`

```json
{
  "name": "npm-name",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "chengyuming <yumingtarget@gmail.com> (https://github.com/fecym)",
  "license": "MIT"
}
```

## npm run

使用 `npm init` 创建的 `package.json` 文件中有 `scripts` 字段，这个字段是可以定义脚本命令的

### 1. 执行命令

比如说我们跑项目经常执行的命令 `npm start` 或者 `npm run dev` 其实都是在这个字段里面配置的，比如我们新建一个 `index.js` 文件，然后修改 `scripts` 字段为以下内容：

```js
  "scripts": {
    "start": "node index",
    "dev": "node index"
  }
```

此时执行 `npm start` 或者 `npm run dev` 都可以执行到 `index.js` 文件中的内容了

### 2. 执行 node_modules/.bin 的命令

在 scripts 字段中也是可以获取到 `node_modules/.bin` 文件中的一些命令的，比如说没有全局安装 `webpack`（也不推荐你全局安装），本地安装了 `webpack` 之后，是可以直接在 `scripts` 下面使用的，

```sh {3}
  "scripts": {
    # 此时会默认去 node_modules/.bin 文件下面找 webpack 命令
    "start": "webpack",
    "dev": "node index"
  }
```

执行 `npm start` 之后，会自动创建一个 **shell** 脚本，这个 **shell** 脚本会将当前目录的 `node_modules/.bin` 子目录加入 PATH 变量，执行结束后，再将 `PATH` 变量恢复原样。
这意味着，当前目录的 `node_modules/.bin` 子目录里面的所有脚本，都可以直接用脚本名调用，而不必加上路径。

### 3. 通配符 \*

`*` 表示任意文件名，`**` 表示任意一层子目录。

当我们安装了 `eslit` 我们需要用 eslint 来校验代码是否合法的时候

```js
  "scripts": {
    "eslint": "eslint *.js",
    // 或者这么写，就不注释了
    "eslint": "eslint **/*.js",
  }
```

如果我们执行不带任何参数的 `npm run` 会列出所有可执行的命令

### 4. 脚本传参 --

有些脚本是可以传递参数的，此时我们可以使用 `--` 传参符号来传递参数，比如 `webpack-dev-server` 传递参数

```js
  "scripts": {
    // 启动项目的时候 mode=development，自动打开浏览器，显示滚动条
    "start": "webpack-dev-server --mode=development --open --progress",
    // 构建项目的时候 mode=production
    "build": "webpack --mode=production"
  },
```

## cross-env

这是一款可以跨平台设置和使用环境变量的插件，比如说项目中我们可能在项目中设置多个环境变量来区分是什么环境的，假如说设置了 `PROXY_EVN` 有三个值分别是 `dev、uat、prod` 来代表开发、UAT 和生产三个环境的请求地址，直接在 `package.json` 中写 `PROXY_EVN=prod yarn start` 这种情况在 `window` 下可能会报错，但是使用 `cross-env` 之后可以让这一切做到兼容

```js
  "scripts": {
    "start": "node index",
    "dev": "cross-env PROXY_ENV=dev yarn start",
    "uat": "cross-env PROXY_ENV=uat yarn start",
    "prod": "cross-env PROXY_ENV=prod yarn start",
  },
```

## 下载依赖 -D 和 -S 的区别

当我们下载一个项目依赖包的时候，会在下载的时候加一些参数 `-D` 或 `-S`，这样会把依赖添加到 `package.json` 中的 `devDependencies` 或 `dependencies` 字段中

- `devDependencies` 主要是存放用于本地开发的
- `dependencies` 会在我们开发的时候带到线上
- `-D` 会添加到 `devDependencies` 里面，`-S` 会添加到 `dependencies`
- `--save-dev` 也会添加到 `devDependencies`
- `--save` 会添加到 `dependencies`
- 如果什么参数都不带，那么默认添加到 `dependencies` 中

```sh
  # 添加到 devDependencies
  npm install -D xxxx
  # 添加到 dependencies
  npm install -S xxxx
```

## npx

> 在 `npm v5.2.0` 引入了一个新的命令 `npx`，是 `npm` 的一个包执行器。`npm` 和 `npx` 的区别在于 `npm` 会把包下载到本地，而 `npx` 只是零时安装，用完就删除。而且 `npx` 可以帮我们执行 依赖包里面的二进制文件。在下面的例子中我们来体验下 `npx` 这款神器。

### 1. 执行远程依赖包

```sh
  # npm
  npm install -g create-react-app
  create-react-app my-app
  # npx
  npm create-react-app my-app
```

### 2. 使用不同版本的 node 执行命令

```sh
  npx node@4 -e 'console.log(process.version)'
  npx node@6 -e 'console.log(process.version)'
```

## package.json

> `package.json` 文件是执行 `npm init` 之后生成的一个文件，该文件定义了这个项目所需要的各种模块，以及项目的配置信息（比如名称、版本、许可证等元数据）。`npm install` 命令根据这个配置文件，自动下载所需的模块。这里来记录一下每个字段代表的含义。

### 1. scripts

`scripts` 字段在上面也提到过，这是用来指定脚本运行命令的缩写，比如下面的 start 代替了 `node index.js`

```json
  "scripts": {
    "start": "node index.js",
    "dev": "cross-env PROXY_ENV=dev yarn start",
    "uat": "cross-env PROXY_ENV=uat yarn start",
    "prod": "cross-env PROXY_ENV=prod yarn start"
  }
```

### 2. dependencies，devDependencies

`dependencies，devDependencies` 在上面也提到过了，是项目依赖管理的，指定项目开发所需要的模块和项目运行时所需要的依赖以及版本号

```json
  "dependencies": {
    "axios": "^0.18.0",
    "babel-plugin-component": "^1.1.1",
    "compression-webpack-plugin": "^3.0.0",
    "js-cookie": "^2.2.0",
    "normalize.css": "^8.0.1",
  },
  "devDependencies": {
    "@types/echarts": "^4.1.10",
    "@types/jest": "^24.0.11",
    "@types/js-cookie": "^2.2.1",
    "@types/nprogress": "^0.0.29",
    "@types/webpack-env": "^1.13.9"
  }
```

### 3. bin

`bin` 字段指定了各个内部命令对应的可执行文件的位置。添加了这个命令之后，我们把 npm 包传到 npm，别人下载下来之后会自动添加到 `node_modules/.bin` 下面此时，我们就可以直接执行 我们暴露出来的命令

```json
  "bin": {
    "cym-blog": "./index.js"
  }
```

此时安装 `cym-blog` 这个模块之后，可以看到 `node_modules/.bin` 就有了 `cym-blog` 环境变量

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-npm-init-cym-blog.png')" height="" title="node_modules/.bin 中环境变量" />
</p>

此时我们就可以执行 `cym-blog init my-blog` 来创建一个博客项目

当然需要在 主入口文件下面 加入一句话 `#!/usr/bin/env node` 指定执行环境为 node

最后生成的 `cym-blog` 内容如下

- bash 脚本

```sh
  #!/bin/sh
  basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

  case `uname` in
      *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
  esac

  if [ -x "$basedir/node" ]; then
    "$basedir/node"  "$basedir/../cym-blog/bin/index.js" "$@"
    ret=$?
  else
    node  "$basedir/../cym-blog/bin/index.js" "$@"
    ret=$?
  fi
  exit $ret
```

- cmd 脚本

```batch
  @IF EXIST "%~dp0\node.exe" (
    "%~dp0\node.exe"  "%~dp0\..\cym-blog\bin\index.js" %*
  ) ELSE (
    @SETLOCAL
    @SET PATHEXT=%PATHEXT:;.JS;=;%
    node  "%~dp0\..\cym-blog\bin\index.js" %*
  )
```

### 4. main

`main` 很重要，它记录了项目的主要入口文件，`require('moduleName')` 就会加载这个文件。默认为 `index.js`，会在根目录下面寻找这个文件作为主入口文件

### 5. config

`config` 字段用于添加命令行的环境变量。

```json
{
  "name": "foo",
  "config": {"port": "8080"},
  "scripts": {"start": "node server.js"}
}
```

然后，在 `server.js` 脚本就可以引用 `config` 字段的值。

```js
  http
    .createServer(...)
    .listen(process.env.npm_package_config_port)
```

执行 `npm start` 命令时，这个脚本就可以得到值。

也可以更改这个值

```sh
  npm config set foo:port 80
```

## package-lock.json

`package-lock.json` 是在 `npm v5` 之后增加的一个依赖锁文件，用来锁定依赖的安装结构。如果查看这个 `json` 的结构，会发现与 `node_modules` 目录的文件层级结构是一一对应的。
以依赖关系为: `app{webpack}` 的 'app' 项目为例, 其 `package-lock` 文件包含了这样的片段。

```json
{
  "name": "app",
  "version": "0.1.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
    // ... 其他依赖包
    "webpack": {
      "version": "1.8.11",
      "resolved": "https://registry.npmjs.org/webpack/-/webpack-1.8.11.tgz",
      "integrity": "sha1-Yu0hnstBy/qcKuanu6laSYtgkcI=",
      "requires": {
        "async": "0.9.2",
        "clone": "0.1.19",
        "enhanced-resolve": "0.8.6",
        "esprima": "1.2.5",
        "interpret": "0.5.2",
        "memory-fs": "0.2.0",
        "mkdirp": "0.5.1",
        "node-libs-browser": "0.4.3",
        "optimist": "0.6.1",
        "supports-color": "1.3.1",
        "tapable": "0.1.10",
        "uglify-js": "2.4.24",
        "watchpack": "0.2.9",
        "webpack-core": "0.6.9"
      }
    },
    "webpack-core": {
      "version": "0.6.9",
      "resolved": "https://registry.npmjs.org/webpack-core/-/webpack-core-0.6.9.tgz",
      "integrity": "sha1-/FcViMhVjad76e+23r3Fo7FyvcI=",
      "requires": {
        "source-list-map": "0.1.8",
        "source-map": "0.4.4"
      },
      "dependencies": {
        "source-map": {
          "version": "0.4.4",
          "resolved": "https://registry.npmjs.org/source-map/-/source-map-0.4.4.tgz",
          "integrity": "sha1-66T12pwNyZneaAMti092FzZSA2s=",
          "requires": {
            "amdefine": "1.0.1"
          }
        }
      }
    }
    //... 其他依赖包
  }
}
```

看懂 `package-lock` 文件并不难，其结构是同样类型的几个字段嵌套起来的，主要是`version, resolved, integrity, requires, dependencies` 这几个字段而已。

- `version, resolved, integrity` 用来记录包的准确版本号、内容 hash、安装源的，决定了要安装的包的准确 "身份" 信息
- 假设盖住其他字段，只关注文件中的 `dependencies: {}` 我们会发现，整个文件的 `JSON` 配置里的 `dependencies` 层次结构与文件系统中 `node_modules` 的文件夹层次结构是完全对照的
- 只关注 `requires: {}` 字段又会发现，除最外层的 `requires` 属性为 `true` 以外, 其他层的 `requires` 属性都对应着这个包的 `package.json` 里记录的自己的依赖项

本段内容摘自 [2018 年了，你还是只会 npm install 吗？](https://juejin.im/post/5ab3f77df265da2392364341#heading-6)，具体详情可查看这里

## package.json 的变量

比如最初我们执行 `npm init -y` 之后生成的 `package.json` 文件，我们可以使用 `process.env.npm_package_xxx` 来获取到在 `package.json` 定义的变量

```js
console.log(process.env.npm_package_name) // npm-name
console.log(process.env.npm_package_version) // 1.0.0
console.log(process.env.npm_package_description) //
console.log(process.env.npm_package_main) // index.js
console.log(process.env.npm_package_license) // MIT
```

## npm 发布包

### 登录发布包

`npm` 发布包其实蛮简单，首先你需要有一个 `npm` 账号，然后你需要在控制台登录你的 `npm` 账号，然后直接 `npm publish` 即可发布

```sh
  # 登录 npm，根据提示输入账号、密码和邮箱即可登录
  npm login
  # 发布包
  npm publish
  # 更新包
  npm version patch
  npm publish
```

### npm version 说明

`npm version` 后面可以跟三个参数：

- `patch`：小变动，比如 bug 修复等，版本号变动 **v1.0.0 -> v1.0.1**
- `minor`：增加新功能，不影响现有功能，版本号变动 **v1.0.0 -> v1.1.0**
- `major`：模块大改动，可能不向后兼容，版本号变动 **v1.0.0 -> v2.0.0**

## 参考链接

1. [你真的懂 package.json 吗](https://juejin.im/post/5dea1095e51d4558083322e2)
2. [package.json 文件](https://javascript.ruanyifeng.com/nodejs/packagejson.html)
3. [2018 年了，你还是只会 npm install 吗？](https://juejin.im/post/5ab3f77df265da2392364341)
4. [用 npm script 打造超溜的前端工作流](https://www.kancloud.cn/sllyli/npm-script/1243450)
