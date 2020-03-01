---
title: 命令行参数
date: 2020-03-01
tags:
  - 命令行
  - 基础
  - node
---

## 命令行

不管在 windows 还是 Mac、Linux 系统都会有很多命令来提供一些便捷的操作，比如在 window 中 打开 cmd 输入 `start snippingtool` 就可以打开绘图工具，cmd 里面执行的其实就是一个以 .bat 执行脚本，你也可以直接新建一个文件，然后在文件内部写入 `start snippingtool`，然后保存为 .bat 结尾的文件即可直接双击执行这个文件。在 Mac 和 Linux 中可以直接写内容，不需要后缀名，以 .sh 结尾也可以，但是 Mac 和 Linux 默认新建的脚本是没有执行权限的，需要 执行 `chmod +x 文件名` 给文件可执行权限

## 命令行参数

大部分命令是可以传递一个参数，然后来做不同的事情，比如说 `npm --version` 查看 npm 的版本号，人家定义了在命令后面输入 `--xxx` 来做什么处理，那这个是怎么实现的？

## 获取命令参数

在 node 中获取命令行参数是使用 `process.argv`，`process.argv` 返回一个数组，第一项是 node 所在的目录，第二个是该程序所在的目录(在项目里面使用)，第三项开始是我们传递的参数

我们新建一个 hello.js，里面就打印命令行参数，然后新建一个 hello.bat

```js
// hello.js
console.log('hello')
console.log(process.argv)
```

此时我们直接执行 `node hello.js --name=cym` 就可以看到打印的参数了。

也可以在 window 中需要新建一个 .bat 脚本，让他们帮我们执行

```bat
:: %1 %2 就是在命令行中输入参数
node hello.js %1 %2
```

此时我们在控制台中输入 `hello --name=cym`，同样我们打印出来了命令行参数

## 惊叹有病

一般像上面的 hello.js 文件需要在第一行写入一句话 `#! /usr/bin/env node` 就是声明该文件的执行环境是哪个，比如我们要执行的是 node 环境后面指定环境为 node 就可以，如果是 bash 就写 bash，这个有个好的记忆方法就是 `惊叹有病`。

此时执行这个文件的时候就不需要用 `node 文件名`，只需要 `./ 文件名` 就可以执行（windows 系统不可以），当然你需要给执行权限

## yargs

`yargs` 工具可以帮我解析命令行参数，然后把它变成一个对象，可以方便我们开发

```js
  const yargs = require('yargs)
  console.log(yargs.argv)
```

此时我们在控制台中打印就可以看到 `yargs` 把我们传入的参数解析成了一个对象

## 制作一个命令行

`yargs` 功能不止这么简单，还有很多更有趣的用法，这个工具是专门用来解析命令行参数，而且用法超简单，下面来制作一个简单的命令行工具来使用一下 `yargs`

### 新建项目

```sh
# 创建一个文件夹并且打开它
mkdir hello && cd hello
# 初始化一个项目
npm init -y
# 安装 yargs
npm i yargs -s
# 新建主入口文件
touch index.js
# 新建命令入口文件
mkdir bin && cd bin && touch www
```

最终目录结构如下

```sh
├── bin
│   └── www             命令入口，核心命令文件
├── node_modules        文件需要的依赖目录
├── index.js            主入口文件
├── package-lock.json   npm 依赖锁文件
└── package.json        项目配置文件
```

### 主文件

此时我们在 index.js 目录下写一个简单的 Hello 方法

```js
// hello.js
class Hello {
  constructor(argv) {
    console.log(argv)
  }
  start() {
    console.log('此处省略一万行代码...')
  }
}

module.exports = Hello
```

### 命令文件

在 www 中写入以下代码，为什么要放在 `bin/www` 里面，这算一个约定俗成吧

```js
#! /usr/bin/env node
const yargs = require('yargs')
const Hello = require('..')

const argv = yargs
  .option('n', {
    alias: 'name',
    demand: true,
    // default: 'cym',
    description: '请输入您的姓名',
  })
  .usage('hello [options]')
  // 示例
  .example('hello --name cym', '执行 hello 命令，然后传入 name 参数为 cym')
  // 版本号，不传任何值会默认从 package.json 中获取版本号
  .version()
  // 版本号别名
  .alias('v', 'version')
  // 帮助信息
  .help('h')
  .alias('h', 'help').argv

const hello = new Hello(argv)
hello.start()
```

### 配置 bin

然后我们修改 `package.json` 文件，新增 `bin` 字段， `bin` 字段中配置的东西，npm 会自动给你匹配到全局中

```json
  {
    ...
    "bin": {
      "hello": "bin/www"
    },
    ...
  }
```

### npm link

配置完之后，我们可以执行 `npm link` 命令，我们会得到以下的输出，此时我们命令行工具就可以使用了，直接输入 `hello --name=xxx` 便可以测试

<p class="p-images">
  <img :src="$withBase('/imgs/basis-command-yargs-hello.png')" height="" title="npm link" />
</p>

如果你想让别人也用到你的这个工具，你可以把它发布到 npm 中，直接在控住台中登录 npm 然后，`npm publish` 就发布上去了

### 源码地址

完整代码已开源，[地址](https://github.com/cym-git/hello-command.git)