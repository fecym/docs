---
title: 你应该了解的npm知识
date: 2019-12-09
tags:
  - npm
  - 大前端
---

# 你应该了解的 npm 知识

## 基础知识

<!-- > npm 是什么 -->

### npm init

初始化一个项目的时候，我们会在控制台输入 `npm init` 执行该命令后终端会依次询问 `name, version, description` 等字段，最后会为你生成一个 `package.json` 文件

如果想偷懒省去一路回车，可以在命令后面加 `--yes` 或者 `-y` 参数，这样会快速生成一个 `package.json` 文件

```sh
  npm init -y
```

这样生成出来的 `package.json` 是默认的配置，如果想要改变其默认配置怎么办？

### 修改 npm 配置

初始化 `package.json` 时的字段默认值是可以自己配置的，可以用下面的命令去修改默认配置：

```sh
  npm config set init.author.email "yumingtarget@gmail.com"
  npm config set init.author.name "chengyuming"
  npm config set init.author.url "https://github.com/cym-git"
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
  "author": "chengyuming <yumingtarget@gmail.com> (https://github.com/cym-git)",
  "license": "MIT"
}
```

### npm run

使用 `npm init` 创建的 `package.json` 文件中有 `scripts` 字段，这个字段是可以定义脚本命令的

#### 1. 执行命令

比如说我们跑项目经常执行的命令 `npm start` 或者 `npm run dev` 其实都是在这个字段里面配置的，比如我们新建一个 `index.js` 文件，然后修改 `scripts` 字段为以下内容：

```js
  "scripts": {
    "start": "node index",
    "dev": "node index"
  }
```

此时执行 `npm start` 或者 `npm run dev` 都可以执行到 `index.js` 文件中的内容了

#### 2. 执行 node_modules/.bin 的命令

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

#### 3. 通配符 \*

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

#### 4. 脚本传参 --

有些脚本是可以传递参数的，此时我们可以使用 `--` 传参符号来传递参数，比如 `webpack-dev-server` 传递参数

```js
  "scripts": {
    // 启动项目的时候 mode=development，自动打开浏览器，显示滚动条
    "start": "webpack-dev-server --mode=development --open --progress",
    // 构建项目的时候 mode=production
    "build": "webpack --mode=production"
  },
```

### package.json 的变量

比如最初我们执行 `npm init -y` 之后生成的 `package.json` 文件，我们可以使用 `process.env.npm_package_xxx` 来获取到在 `package.json` 定义的变量

```js
console.log(process.env.npm_package_name) // npm-name
console.log(process.env.npm_package_version) // 1.0.0
console.log(process.env.npm_package_description) //
console.log(process.env.npm_package_main) // index.js
console.log(process.env.npm_package_license) // MIT
```

- 持续更新中...

<!-- ### 下载依赖 -D 和 -S 的区别 -->
