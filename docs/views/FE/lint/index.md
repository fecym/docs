---
title: eslint 工作流
date: 2020-06-25
author: fecym
tags:
  - eslint
---

## 初尝禁果

- 需要依赖

  ```sh
  npm i -D eslint babel-eslint eslint-config-alloy
  ```

- 项目根目录下需要一个 `.eslintrc.js` 或者 `.eslintrc.json` 文件

  ```js
  module.exports = {
    extends: ['allow'],
  };
  ```

- 新建一个 `index.js` 文件，随便写入一句话

  ```js
  var myName = 'Tom';
  console.log(`My name is ${myName}`);
  ```

- 执行 `npx eslint index.js` 命令，会得倒以下输出，告诉我们代码哪里出了问题，然后提示我们使用 `--fix` 修复代码

  ```sh
  */**/lint/index.js
  1:1  error  Unexpected var, use let or const instead  no-var

  ✖ 1 problem (1 error, 0 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.
  ```

- 执行 `npx eslint index.js --fix` 修复代码，发现代码 `var` 声明的变量变成了 `let`

## 配合 typescript

- 由于 `Eslint` 默认使用 `Espree` 进行语法解析，无法识别 `Typescript` 的一些语法，需要安装 `@typescript-eslint/parser`，替换默认的解析器。还需要安装对应的插件 `@typescript-eslint/eslint-plugin` 作为 `eslint` 默认规则的补充，提供一些额外适用于 ts 语法的规则

  ```sh
  npm i -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
  ```

- 修改配置文件

  ```js
  module.exports = {
    extends: ['alloy'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
      // 禁止使用 var
      'no-var': 'error',
      // 优先使用 interface 而不是 type
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  };
  ```

  - 上面配置中，自定了两个规则，其中 `no-var` 是 `Eslint` 原生的规则（之前用到了这个规则，被包含在 `alloy` 中，这里会覆盖掉）；`@typescript-eslint/consistent-type-definitions` 是 `@typescript-eslint/eslint-plugin` 新增的规则

  - 规则取值一般是一个数组（例如上面的最后一项配置），其中第一项是 off、warn、error 中的一个，表示关闭、警告还是报错。后面的项是该规则的其他配置

  - 关闭、警告、报错：

    1. 关闭：禁用此规则
    2. 警告：代码检查时输出错误信息，但是不会影响到 `exit code`
    3. 报错：发现错误时，不仅会输出错误信息，而且 `exit code` 将被设为 1

  - 然后可以写一个测试文件测试同样执行之前提到的命令

## 脚本命令检查整个项目

一般情况下我们不会单独执行命令来检查某个文件或者修复某个文件，我们会使用脚本检查整个项目，在 `package.json` 中的 `scripts` 新增以下代码

```json
{
  "scripts": {
    // eslint 默认不会检查 .ts 后缀的文件，所以需要加上参数 --ext .ts
    "lint": "eslint src --ext .js,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.ts,.tsx --fix"
  }
}
```

## 使用 AlloyTeam 的配置

[AlloyTeam Eslint](https://github.com/AlloyTeam/eslint-config-alloy/blob/master/README.zh-CN.md) 是腾讯全端团队开发的一套可自定义拓展的 Eslint 规则，它已经帮我们集成了各种技术栈

1. 安装技术栈相关依赖

```sh
// Eslint
npm install --save-dev eslint babel-eslint eslint-config-alloy
// React
npm install --save-dev eslint babel-eslint eslint-plugin-react eslint-config-alloy
// Vue
npm install --save-dev eslint babel-eslint vue-eslint-parser eslint-plugin-vue eslint-config-alloy
// TypeScript
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-alloy
// TypeScript React
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-config-alloy
```

2. 配置 `.eslintrc.js` 文件

```js
module.exports = {
  extends: [
    'alloy', // 必须
    'alloy/vue', // vue项目需要
    'alloy/react', // react项目需要
    'alloy/typescript', // ts项目需要
  ],
  env: {
    // 设置的环境变量（包含多个预定义的全局变量）
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 设置的全局变量（设置为 false 表示它不允许被重新赋值）
    // myGlobal: false
  },
  rules: {
    // 自定义规则
  },
};
```

## 结合 Prettier 使用

`Prettier` 是一个代码格式化工具，相比于 `Eslint` 中的代码格式化规则，它提供了更少的选项，但是却更专业。

`AlloyTeam` 推荐用 `Prettier` 管理格式化相关的规则，用 `ESLint` 来检查它更擅长的逻辑错误。

### 安装 Prettier

```sh
npm i -D prettier
```

### 配置 `prettier.config.js`

仅供草考

```js
module.exports = {
  // 一行最多 100 字符
  printWidth: 100,
  // 使用 4 个空格缩进
  tabWidth: 4,
  // 不使用缩进符，而使用空格
  useTabs: false,
  // 行尾需要有分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // jsx 不使用单引号，而使用双引号
  jsxSingleQuote: false,
  // 末尾不需要逗号
  trailingComma: 'none',
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  // jsx 标签的反尖括号需要换行
  jsxBracketSameLine: false,
  // 箭头函数，只有一个参数的时候，也需要括号
  arrowParens: 'always',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // 换行符使用 lf
  endOfLine: 'lf',
};
```

### cli

对代码进行格式化操作或者检测操作，可以在 `package.json` 中加入相应执行脚本

```json
{
  "scripts": {
    "prettier:check": "prettier --check src/.",
    "prettier": "prettier --write src/."
  }
}
```

## Git 代码预检

我们希望在代码推送到远程代码库的时候对代码进行预检，防止不规范的代码被提交到远程仓库

### 整个流程

1. 待提交的代码
2. `git add` 添加暂存区
3. 执行 `git commit`（此时进行代码预检）
4. `husky` 注册在 `git pre-commit` 的钩子调起 `lint-staged`
5. `lint-staged` 取得所有被提交的文件依从执行写好的任务
6. 如果有错误（没有通过 `eslint` 检查）则停止任务，等待下次 `commit`，同时打印错误信息
7. 成功提交，`git push` 推动到远程库

### git hook

我们执行 `git init` 的时候会生成一个 `.git` 文件夹，或者从 `github、gitlab` 中 `download` 下来的代码都会有这么一个文件夹，`git hook` 就是这个文件夹的 hooks 下的一些钩子函数，特定时期他们将会被调用

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/git-hooks.png')" width="" style="border-radius: 8px;">
</p>

里面的文件分为以 `.sample` 结尾的文件和没有这个结尾的文件

`.sample` 为各个钩子的案例脚本，可以把 sample 去掉，直接编写 shell 脚本来执行

我们可以利用插件 `husky` 和 `pre-commit` 来使钩子生效

### husky 注册 git-hook

```sh
npm i -D husky
```

`package.json` 增加 `husky` 字段

```json
{
  "husky": {
    // 当然也可以写成在 scripts 中定义的脚本
    "hooks": {
      "pre-commit": "eslint src/**/*.js"
    }
  }
}
```

每次执行 `git commit` 提交代码的时候，就行先对代码进行检查，没有问题才会被提交，但是这样每次提交，`eslint` 都会检查所有代码，如果报错过多一定奔溃

### lint-staged

`lint-staged` 只 lint 改动的代码，未改动的代码不会被 lint（要求 node 版本子啊 10.13.0+）

```sh
npm i lint-staged -D
```

新增 `package.json` 配置：

```json
{
  "lint-staged": {
    "*.{js,jsx,vue}": ["eslint --fix", "prettier --write", "git add"]
  }
}
```

## 参考链接

[从零构建前端 ESLint 工作流](https://mp.weixin.qq.com/s/fR5TD-ibsOffS9bo0l9iWA)
