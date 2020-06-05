---
title: AST 团队分享
date: 2020-06-05
tags:
  - webpack
  - ast
---

## 背景

## 什么是 AST

抽象语法树（`Abstract Syntax Tree`）简称 `AST`，是源代码的抽象语法结构的树状表现形式。`webpack` 和 `eslint` 等很多工具库的核心都是通过 `Abstract Syntax Tree` 抽象语法书这个概念来实现对代码的检查、分析等操作。了解了抽象语法树的概念，我们也可以编写类似的工具

## 词法分析和语法分析

词法分析：是将字符流转换为记号流(`tokens`)，它会读取我们的代码然后按照一定的规则合成一个个的标识记号

比如说：`var a = 2` ，这段代码通常会被分解成 `var、a、=、2`

```js
[
  { type: 'Keyword', value: 'var' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'Numeric', value: '2' }
]
```

## 有什么用

- 代码语法检查、代码风格检查、代码格式化、代码高亮、代码错误提示、自动补全等
- 代码混淆压缩
- 优化变更代码，改变代码结构等

比如说，有个函数 `function a() {}` 我想把它变成 `function b() {}` <br/>

比如说，在 `webpack` 中代码编译完成后 `require('a') --> __webapck__require__("*/**/a.js")`

## 怎么用

使用 AST 只需要三步

1. 把代码转换成 AST 语法树
2. 遍历每一个树的节点（深度优先遍历）
3. 改变树的节点
4. 重新生成代码

## 准备工作

准备学习 AST 前，先准备一些东西，后面会用到

- AST 在线转换网站：[https://astexplorer.net/](https://astexplorer.net/)
- 使用工具包：
  - esprima：code => ast 代码转 ast
  - estraverse: traverse ast 转换树
  - escodegen: ast => code

### 流程

比如说一段代码 `function getUser() {}`，我们把函数名字更改为 `hello`，看代码流程

看以下代码，简单说明 `AST` 遍历流程

```js
const esprima = require('esprima')
const estraverse = require('estraverse')
const code = `function getUser() {}`
// 生成 AST
const ast = esprima.parseScript(code)
// 转换 AST，只会遍历 type 属性
// traverse 方法中有进入和离开两个钩子函数
estraverse.traverse(ast, {
  enter(node) {
    console.log('enter -> node.type', node.type)
  },
  leave(node) {
    console.log('leave -> node.type', node.type)
  },
})
```

输出结果如下：

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/ast-flow-code.jpg')" width="" style="border-radius: 8px;">
</p>

由此可以得到 AST 遍历的流程是深度优先，遍历过程如下：

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/ast-flow.jpg')" width="" style="border-radius: 8px;">
</p>

此时我们发现函数的名字在 `type` 为 `Identifier` 的时候就是该函数的名字，我们就可以直接修改它便可实现一个更改函数名字的 `AST` 工具

```js
// 转换树
estraverse.traverse(ast, {
  // 进入离开修改都是可以的
  enter(node) {
    console.log('enter -> node.type', node.type)
    if (node.type === 'Identifier') {
      node.name = 'hello'
    }
  },
  leave(node) {
    console.log('leave -> node.type', node.type)
  },
})
// 生成新的代码
const result = escodegen.generate(ast)
```

### 用法

<!-- 只会遍历 type 属性 -->

## babel 工作原理

## babel 插件的简单实现

## 具体语法书
