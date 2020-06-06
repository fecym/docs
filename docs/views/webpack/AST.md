---
title: AST 团队分享
date: 2020-06-05
tags:
  - webpack
  - ast
---

## 背景

## 什么是 AST

抽象语法树（`Abstract Syntax Tree`）简称 `AST`，是源代码的抽象语法结构的树状表现形式。`webpack`、`eslint` 等很多工具库的核心都是通过抽象语法书这个概念来实现对代码的检查、分析等操作。今天我为大家分享一下 JavaScript 这类解释型语言的抽象语法树的概念

## 词法分析和语法分析

`JavaScript` 是解释型语言，一般通过 词法分析 -> 语法分析 -> 语法树，就可以开始解释执行了

词法分析：也叫`扫描`，是将字符流转换为记号流(`tokens`)，它会读取我们的代码然后按照一定的规则合成一个个的标识

比如说：`var a = 2` ，这段代码通常会被分解成 `var、a、=、2`

```js
;[
  { type: 'Keyword', value: 'var' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'Numeric', value: '2' },
]
```

当词法分析源代码的时候，它会一个一个字符的读取代码，所以很形象地称之为扫描 - `scans`。当它遇到空格、操作符，或者特殊符号的时候，它会认为一个话已经完成了。

语法分析：也称`解析器`，将词法分析出来的数组转换成树的形式，同时验证语法。语法如果有错的话，抛出语法错误。

```js
{
  ...
  "type": "VariableDeclarator",
  "id": {
    "type": "Identifier",
    "name": "a"
  },
  ...
}
```

语法分析成 AST ，我们可以在这里在线看到效果 [http://esprima.org](https://esprima.org/demo/parse.html)

## 有什么用

- 代码语法检查、代码风格检查、代码格式化、代码高亮、代码错误提示、自动补全等
- 代码混淆压缩
- 优化变更代码，改变代码结构等

比如说，有个函数 `function a() {}` 我想把它变成 `function b() {}`

比如说，在 `webpack` 中代码编译完成后 `require('a') --> __webapck__require__("*/**/a.js")`

下面来介绍一套工具，可以把代码转成语法树然后改变节点以及重新生成代码

## AST 解析流程

准备工具：

- esprima：code => ast 代码转 ast
- estraverse: traverse ast 转换树
- escodegen: ast => code

在推荐一个常用的 AST 在线转换网站：[https://astexplorer.net/](https://astexplorer.net/)

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

## babel 工作原理

提到 AST 我们肯定会想到 babel，自从 Es6 开始大规模使用以来，babel 就出现了，它主要解决了就是一些浏览器不兼容 Es6 新特性的问题，其实就把 Es6 代码转换为 Es5 的代码，兼容所有浏览器，babel 转换代码其实就是用了 AST，babel 与 AST 就有着很一种特别的关系。

那么我们就在 babel 的中来使用 AST，看看 babel 是如何编译代码的（不讲源码啊）

需要用到两个工具包 `@babel/core`、`@babel/preset-env`

当我们配置 babel 的时候，不管是在 `.babelrc` 或者 `babel.config.js` 文件里面配置的都有 `presets` 和 `plugins` 两个配置项（还有其他配置项，这里不做介绍）

```json
// .babelrc
{
  "presets": ["@babel/preset-env"],
  "plugins": []
}
```

当我们配置了 `presets` 中有 `@babel/preset-env`，那么 `@babel/core` 就会去找 `preset-env` 预设的插件包，它是一套

现在我们有一个箭头函数，要想把它转成普通函数，我们就可以直接这么写：

```js
const babel = require('@babel/core')
const code = `const fn = (a, b) => a + b`
// babel 有 transform 方法会帮我们自动遍历，使用相应的预设或者插件转换相应的代码
const r = babel.transform(code, {
  presets: ['@babel/preset-env'],
})
console.log(r.code)
// 打印结果如下
// "use strict";
// var fn = function fn() { return a + b; };
```

此时我们可以看到最终代码会被转成普通函数，但是我们，只需要箭头函数转通函数的功能，不需要用这么大一套包，只需要一个箭头函数转普通函数的包，我们其实是可以在 `node_modules` 下面找到有个叫做 `plugin-transform-arrow-functions` 的插件，这个插件是专门用来处理 箭头函数的，我们就可以这么写：

```js
const r = babel.transform(code, {
  plugins: ['@babel/plugin-transform-arrow-functions'],
})
console.log(r.code)
// 打印结果如下
// const fn = function () { return a + b; };
```

我们可以从打印结果发现此时并没有转换我们变量的声明方式还是 const 声明，只是转换了箭头函数

## 编写自己的插件

> 此时，我们就可以自己来写一些插件，来实现代码的转换，中间处理代码的过程就是使用前面提到的 AST 的处理逻辑

### 箭头函数转普通函数

现在我们来个实战把 `const fn = (a, b) => a + b` 转换为 `const fn = function(a, b) { return a + b }`

### 分析 AST 结构

首先我们在在线分析 AST 的网站上分析 `const fn = (a, b) => a + b` 和 `const fn = function(a, b) { return a + b }`看两者语法树的区别

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/ast-arrow-to-fn.jpg')" width="" style="border-radius: 8px;">
</p>

根据我们分析可得：

1. 变成普通函数之后他就不叫箭头函数了，而是函数表达式了
2. 所以首先我们要把 `箭头函数表达式(ArrowFunctionExpression)` 转换为 `函数表达式(FunctionExpression)`
3. 要把 `二进制表达式(BinaryExpression)` 放到一个 `代码块中(BlockStatement)`
4. 其实我们要做就是把一棵树变成另外一颗树，说白了其实就是拼成另一颗树的结构，然后生成新的代码，就可以完成代码的转换

### 访问者模式

在 babel 中，我们开发 plugins 的时候要用到访问者模式，就是说在访问到某一个路径的时候进行匹配，然后在对这个节点进行修改，比如说上面的当我们访问到 `ArrowFunctionExpression` 的时候，对 `ArrowFunctionExpression` 进行修改，变成普通函数

那么我们就可以这么写：

```js
const babel = require('@babel/core')
const code = `const fn = (a, b) => a + b` // 转换后 const fn = function(a, b) { return a + b }
const arrowFnPlugin = {
  // 访问者模式
  visitor: {
    // 当访问到某个路径的时候进行匹配
    ArrowFunctionExpression(path) {
      // 拿到节点
      const node = path.node
      console.log('ArrowFunctionExpression -> node', node)
    },
  },
}

const r = babel.transform(code, {
  plugins: [arrowFnPlugin],
})

console.log(r)
```

### 修改 AST 结构

此时我们拿到的结果是这样的节点结果是 [这样的](https://chengyuming.cn/json/arrowFn.json)，其实就是 `ArrowFunctionExpression` 的 AST，此时我们要做的是把 `ArrowFunctionExpression` 的结构替换成 `FunctionExpression`的结构，但是需要我们组装类似的结构，这么直接写很麻烦，但是 babel 为我们提供了一个工具叫做 [`@babel/types`](https://babeljs.io/docs/en/babel-types)

`@babel/types` 有两个作用：

1. 判断这个节点是不是这个节点（ArrowFunctionExpression 下面的 path.node 是不是一个 ArrowFunctionExpression）
2. 生成对应的表达式

然后我们使用的时候，需要经常查文档，因为里面的节点类型特别多，不是做编译相关工作的是记不住怎么多节点的

那么接下来我们就开始生成一个 `FunctionExpression`，然后把之前的 `ArrowFunctionExpression` 替换掉，我们可以看 `types` 文档，找到 `functionExpression`，该方法接受相应的参数我们传递过去即可生成一个 `FunctionExpression`

```js
t.functionExpression(id, params, body, generator, async)
```

- id: Identifier (default: null) id 可传递 null
- params: Array\<LVal\> (required) 函数参数，可以把之前的参数拿过来
- body: BlockStatement (required) 函数体，接受一个 `BlockStatement` 我们需要生成一个
- generator: boolean (default: false) 是否为 generator 函数，当然不是了
- async: boolean (default: false) 是否为 async 函数，肯定不是了

还需要生成一个 `BlockStatement`，我们接着看文档找到 `BlockStatement` 接受的参数

```js
t.blockStatement(body, directives)
```

看文档说明，blockStatement 接受一个 body，那我们把之前的 body 拿过来就可以直接用，不过这里 body 接受一个数组

我们细看 AST 结构，函数表达式中的 `BlockStatement` 中的 `body` 是一个 `ReturnStatement`，所以我们还需要生成一个 `ReturnStatement`

现在我们就可以改写 AST 了

```js
const babel = require('@babel/core')
const t = require('@babel/types')
const code = `const fn = (a, b) => a + b` // const fn = function(a, b) { return a + b }
const arrowFnPlugin = {
  // 访问者模式
  visitor: {
    // 当访问到某个路径的时候进行匹配
    ArrowFunctionExpression(path) {
      // 拿到节点然后替换节点
      const node = path.node
      console.log('ArrowFunctionExpression -> node', node)
      // 拿到函数的参数
      const params = node.params
      const body = node.body
      const functionExpression = t.functionExpression(
        null,
        params,
        t.blockStatement([body])
      )
      // 替换原来的函数
      path.replaceWith(functionExpression)
    },
  },
}
const r = babel.transform(code, {
  plugins: [arrowFnPlugin],
})
console.log(r.code) // const fn = function (a, b) { return a + b; };
```

## 具体语法书

和抽象语法树相对的是具体语法树（通常称作分析树）。一般的，在源代码的翻译和编译过程中，语法分析器创建出分析树。一旦 AST 被创建出来，在后续的处理过程中，比如语义分析阶段，会添加一些信息。

## 补充

关于 node 类型，全集大致如下：

```sh
(parameter) node: Identifier | SimpleLiteral | RegExpLiteral | Program | FunctionDeclaration | FunctionExpression | ArrowFunctionExpression | SwitchCase | CatchClause | VariableDeclarator | ExpressionStatement | BlockStatement | EmptyStatement | DebuggerStatement | WithStatement | ReturnStatement | LabeledStatement | BreakStatement | ContinueStatement | IfStatement | SwitchStatement | ThrowStatement | TryStatement | WhileStatement | DoWhileStatement | ForStatement | ForInStatement | ForOfStatement | VariableDeclaration | ClassDeclaration | ThisExpression | ArrayExpression | ObjectExpression | YieldExpression | UnaryExpression | UpdateExpression | BinaryExpression | AssignmentExpression | LogicalExpression | MemberExpression | ConditionalExpression | SimpleCallExpression | NewExpression | SequenceExpression | TemplateLiteral | TaggedTemplateExpression | ClassExpression | MetaProperty | AwaitExpression | Property | AssignmentProperty | Super | TemplateElement | SpreadElement | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | ClassBody | MethodDefinition | ImportDeclaration | ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration | ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier
```

## 参考链接

1. [JavaScript 语法解析、AST、V8、JIT](https://cheogo.github.io/learn-javascript/201709/runtime.html)
2. [详解 AST 抽象语法树](https://blog.csdn.net/huangpb123/article/details/84799198)
3. [@babel/types](https://babeljs.io/docs/en/babel-types)
