---
title: 记一次开发自己的cli
date: 2019-12-12
tags:
  - cli
  - node
  - npm
  - 大前端
---

# 记一次开发自己的 cli

> 之前 58 面试被问到一个问题，请你说一下做一个脚手架整个流程，当时因为自己只是为了满足工作中的需求，直接用了别人的脚手架搭建现成的项目，根本没有研究过那些脚手架是怎么做出来的，他的整个流程，思路是什么。当时那么面试官跟我说作为一个高级工程师，我们要做的不只是满足于现在的需求，而是简化整个开发流程，做出一些比较优秀的工作来方便其他人来提高整个团队的效率，那时候我才知道自己差在哪了。前段时间在自己闲的时候我也尝试着做了一个自己的脚手架，一个基于自己这个博客项目的脚手架。这里来记录下当初的整个流程。

## 思考

要开发一个脚手架需要捋清楚，脚手架是如何工作的？拿 `vue-cli` 来说，`vue-cli` 是将项目的模板放在 git 上面，执行 cli 命令的时候，再根据用户的交互选择不同的模板，然后经过模板引擎渲染出来生成项目。这样做将模板与脚手架分离，可以各自维护。

那我们先准备两套项目，一套作为自己的脚手架项目，一个作为模板

回想在使用 `vue-cli` 的时候，我们直接执行 `vue create projetcName` 然后进行一些交互便可以生成一个项目，生成的项目会拿到我们与用户交互的时候一些配置，会改变我们想要改变的一些文件。那我们就需要做完自己的脚手架后需要生成一个可以直接执行的环境变量，然后可以与用户直接交互，所以我们需要一个与用户交互的工具。我们既然有模板文件，那么就需要下载这个模板，模板一般放在 github 上，所以我们需要一个下载 github 上文件的工具

此时整理一下需要的几个核心的工具包：`commander（解析命令和参数）、inquirer（用户做交互）、download-git-repo（下载远程的模板）、handlebars（模板引擎）`

还需要一些其他工具来协助开发：`ora（提供下载动画）、chalk（给字体添加颜色）、log-symbols（在终端显示不同的图标）`

## 初始化项目

首先创建一个空项目，命名为 cym-blog（名字随便起就行），执行 `npm init -y` 生成一个 `package.json` 文件。最后安装上面需要用到的依赖。

### bin 字段

```sh
  # 为什么是 -S？因为这些依赖我们既是发布到 npm 之后也是依赖这些工具的
  npm i -S commander inquirer download-git-repo handlebars ora chalk log-symbols
```

然后我们在 package.json 文件中要加入 `bin` 字段

```json
  {
    "name": "cym-blog",
    "version": "1.0.0",
    ...
    "bin": {
      "cym-blog": "index.js"
    },
    ...
  }
```

### index.js 的写法

在项目根目录新建一个 `index.js` 文件作为主入口文件，我们需要在这个文件的第一行加入 `#!/usr/bin/env node` 来告诉系统执行这个文件的时候我们是以 `node` 为环境执行的，不同的系统默认执行的是不一样的，比如说 Linux 默认执行就是 bash，下面是 `index.js` 的内容

```js
  #!/usr/bin/env node
  require('./src/init')
```

对了我们新建一个 src 目录来开发我们的核心逻辑

## 处理用户交互

首先，我们处理与用户交互的命令，代码如下

```js
const program = require('commander')
const symbols = require('log-symbols')
const inquirer = require('inquirer')

program
  .command(`init <name>`)
  .description('项目的描述')
  .action(name => {
    // 判断该目录是否以及使用
    if (fs.existsSync(name)) {
      console.log(symbols.error, chalk.red('Error：项目已存在'))
      return process.exit(0)
    }
    // 处理与用户的交互
    inquirer
      .prompt([
        {
          name: 'description',
          message: '请输入项目描述：'
        },
        {
          name: 'author',
          message: '请输入作者姓名：'
        }
      ])
      .then(answers => {
        // 得到与用户的交互逻辑
        console.log(answers)
      })
  })
// 切记一定要 parse 到 process.argv 否则项目都无法测试
program.version('1.0.0', '-v, --version').parse(process.argv)
```

## 处理模板下载

```js
// download.js
const downloadGit = require('download-git-repo')
// const { templateHerf } = require('./config')
const templateHerf = `https://github.com/cym-git/cym-blog-template.git`

module.exports = function(projectName) {
  return new Promise((resolve, reject) => {
    downloadGit(
      `direct:${templateHerf}#master`,
      projectName,
      { clone: true },
      err => {
        if (err) reject(err)
        resolve(true)
      }
    )
  })
}
```

## 下载模板

```js
// 测试 download.js
const ora = require('ora')
const spinner = ora('downloading template ...')
const symbols = require('log-symbols')
const chalk = require('chalk')
const rimraf = require('rimraf')
const downloadFn = require('../src/utils/download')
// 测试下载名
const projectName = 'test-name'
// 项目开始下载
spinner.start()
downloadFn(projectName)
  .then(_ => {
    spinner.succeed()
    console.log(symbols.success, chalk.green('下载成功'))
  })
  .catch(err => {
    spinner.fail()
    console.log(symbols.error, chalk.red(err))
    process.exit(0)
  })
```

## 修改模板元信息

```js
downloadGit(name)
  .then(_ => {
    spinner.succeed()
    // 处理元信息
    const meta = {
      name,
      description: answers.description,
      author: answers.author
    }
    // 处理模板文件
    const templateName = path.resolve(__dirname, './utils/template.json')
    // 获取到一个 buffer 需要转字符串
    const templateContent = fs.readFileSync(templateName).toString()
    // 填充模板信息
    const result = handlebars.compile(templateContent)(meta)
    // 重写 package.json
    fs.writeFileSync(`${name}/package.json`, result)
    spinner.succeed()
    console.log(symbols.success, chalk.green('项目初始化完成'))
    console.log(symbols.success, chalk.green('执行以下命令运行您的项目'))
    console.log(symbols.info, chalk.green(`cd ${name}`))
    console.log(symbols.info, chalk.green(`npm install`))
    console.log(symbols.info, chalk.green(`npm start`))
    process.exit(0)
  })
  .catch(err => {
    spinner.fail()
    console.log(symbols.error, chalk.red(err))
    process.exit(0)
  })
```

