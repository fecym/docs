---
title: 常用api的实现
date: 2019-10-27
tags:
  - api
  - 基础
---

> 使用一个 api 我们要了解它到底做了什么才可以实现我们想要的功能，不仅要会用还要知道为什么

## 实现一个 new 操作符

> 函数执行前面加个 `new` 做了哪些事情，为啥就会构造一个对象出来

- 创建了一个新对象
- 链接到了原型
- 执行函数，绑定了 this 指向新创建的对象上
- 返回一个对象，如果函数中有`return`关键字，看 return 了什么出来，如果是一个对象，那么返回这个对象，如果不是则返回我们新建的这个对象
- 实现过程如下：

```js
function New() {
  // 创建了一个新对象
  const obj = {}
  // 取得构造函数
  const F = [].shift.call(arguments)
  // 链接到了原型
  obj.__proto__ = F.prototype
  // 绑定this，执行构造函数
  const result = F.apply(obj, arguments)
  // 看看构造函数返回了什么
  if (
    typeof result !== null &&
    (typeof result === 'object' || typeof result === 'function')
  ) {
    return result
  }
  return obj
}
```

## instanceof 实现

> 实现了一个 `new` 是不是也得判断一下，那我们来实现一个 `instanceof`

- `instanceof` 都做了什么事？
- `instanceof` 是拿着左边实例的 `__proto__` 与右边构造函数的 `prototype` 进行对比的
- 尝试着实现下

```js
function instanceOf(left, right) {
  // while (true) {
  //   if (left.__proto__ === null) return false
  //   if (left.__proto__ === right.prototype) return true
  //   left.__proto__ = left.__proto__.__proto__
  // }
  if (left.__proto__ === null) return false
  if (left.__proto__ === right.prototype) return true
  left.__proto__ = left.__proto__.__proto__
  instanceOf(left, right)
}
instanceOf(Function, Object) // true >> Function.__proto__.__proto__ === Object.prototype
```

## call 和 apply

::: tip call 和 apply
我们都知道 `js` 的函数中 `this` 是动态的，不同执行上下文会导致 `this` 执行不同的地方，总得来说 `this` 执行有四种情况

- 函数自执行，`this` 执行指向 `window`
- 谁打点调用函数，`this` 指向这个 `谁`，也就是 . 前面的那个对象
- `call` 和 `apply` 的硬绑定 `this`
- 函数加 `new` 关键字后，`this` 执行该构造函数的实例

那么第三条第四条规则为什么就会改变 `this` 执行，其实说白了函数中 `this` 应该都遵循 `1、2` 两条规则，`3、4` 其实都是在底层实现了，让其 `this` 执行了我们想要指向的地方，比如说 `new` 关键字，我们在本文的第一个 `api` 中就讲了他的实现，他是利用 `apply` 或者 `call` 来绑定上去的，这里我们来讲下 `call` 和 `apply` 的实现
:::

### 实现 call 和 apply

> `call` 和 `apply` 两者很像除了传递的参数不同，一个是传递的是值，一个传递的是一个数组

```js
// call
Function.prototype.call2 = function(context = window) {
  // example：fnA.call(obj, 1)
  context.fn = this
  const args = [...arguments].slice(1)
  // 执行 context.fn(...args) 此时就相当于 obj.fnA(1)
  const result = context.fn(...args)
  delete context.fn
  return result
}
// apply
Function.prototype.apply2 = function(context = window) {
  context.fn = this
  let result
  // 看是否有第二个参数，也可以不传参数
  if (arguments[1]) {
    // 因为传递过来的是一个数组，所以要解构一下
    result = context.fn(...arguments[1])
  } else {
    result = context.fn()
  }
  delete context.fn
  return result
}
```

::: warning 解释 call 实现原理
举个栗子： `fnA.call(obj, 1)` <br/>
call2 函数 第一个参数是要绑定的对象（obj）<br/>
我们根据谁打点调用函数 `this` 执行谁，我们在这个对象中新增一个属性 `fn`，给它赋值为此时的 **~~this~~** <br/>
那么就相当于 给我们传进来的 `obj` 新增一个属性 `fn`，让他等于这个 **~~this~~** <br/>
因为 `call2` 是定义在函数的原型的对象上的，那么此时这个 **~~this~~** 就是 调用 `call2` 方法函数的实例，也就是 **~~fnA~~** <br/>
也就是说 `context.fn` 就相当于 给 `obj` 新增了一个属性 `fn（fnA）`然后 `obj.fn` 执行了，那么谁打点调用 `this` 执行谁，此时 `this` 指向了 这个 `obj` <br/>
这就是 `call` 方法实现的基本思路 <br/>
<font size=2 >
<font color=red>注：</font>字体加粗并且有删除的 **~~this~~** 是 在 call 函数中的 this；有背景底色的 `this` 指的是我们绑定后的 this
</font>
:::

### 一道有趣的面试题

曾看到这么一道面试题：

```js
const arrayLike = {}
;[].push.call(arrayLike, 1)
console.log(arrayLike) // { 0: 1, lenght: 1 }
// 接下来我们改成这样
const call = [].push.call
call(arrayLike, 1)
console.log(arrayLike)
// 此时会打印什么？
// 答案是会报错，call is not a function
// 为什么？给自己一个思考问题的机会吧
```

## bind

### bind 用法

> bind 用法和 call 很类似，但是 bind 不会立即执行函数，而是返回一个绑定了 this 的新函数

```js
const obj = { name: 'cym' }
function fn(age) {
  console.log(this.name + '今年' + age + '岁了')
}
// 如上代码，我们要让 this 指向 obj
const bindFn = fn.bind(obj)
bindFn(24) // cym今年24岁了
```

### 基本功能的实现

根据上面的用法，我们不难 `bind` 的方法不仅可以绑定 `this` 还可以绑定参数，我们来简单实现一下

```js
Function.prototype.bind2 = function(ctx = globalThis) {
  // 取到我们要绑定的参数
  const args = [...arguments].slice(1)
  // 缓存 this，因为返回一个函数 this 就会变成新的函数
  const that = this
  // 返回一个函数
  return function() {
    // 返回函数里面的 arguments 是返回函数传入的参数哦，别搞混了
    that.apply(ctx, args.concat([...arguments]))
  }
}
```

### 返回函数作为构造函数

`bind` 方法的实现其实蛮有意思的，因为 `bind` 方法返回一个函数，那么返回的这个函数如果被当做构造函数怎么办

```js
const obj = { name: 'cym' }
function fn() {
  console.log(this)
}
// 如上代码，我们要让 this 指向 obj
const bindFn = fn.bind(obj)
const instance = new bindFn(24) // fn {}
```

根据上面的代码返回结果来看，我们发现当绑定的函数作为构造函数来用的话，`this` 指向了原来的函数的实例，那么我们来实现一下完整的 `bind` 方法

```js
Function.prototype.bind2 = function(ctx = globalThis) {
  // 取得参数
  const args = [...arguments].slice(1)
  // 取得函数
  const that = this
  // 要返回一个函数,还要判断是否有进行实例化的操作
  function Fn() {
    const allArgs = args.concat([...arguments])
    // 如果被实例化了
    if (this instanceof Fn) {
      that.apply(this, allArgs)
    } else {
      that.apply(ctx, allArgs)
    }
  }
  // 但是我们需要保证原型不能丢失，还得是原来函数的实例
  // 这种写法可能不雅观，因为直接让两个原型指向了同一个地址，一般情况下我们会使用一个临时性构造函数来处理一下
  // Fn.prototype = this.prototype
  Fn.prototype = Object.create(this.prototype)
  // 返回这个绑定好 this 的函数
  return Fn
}
```

来看下用法

```js
const obj = { name: 'cym' }
function fn() {
  console.log(this)
}
// 如上代码，我们要让 this 指向 obj
const bindFn = fn.bind2(obj)
const instance = new bindFn() // fn {}
bindFn() // {name: 'cym'}
```

## 柯利化

柯利化的核心是：`只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数`

比如说实现一个 add 函数

```js
const addFn = (a, b, c, d, e) => {
  return a + b + c + d + e
}
const add = curry(addFn)
add(1)(2)(3)(4, 5) // 15
add(1)(2)(3, 4, 5) // 15
add(1, 2, 3)(4, 5) // 15
```

面试要求就是实现这么一个函数

```js
function curry(fn, ...args) {
  // 如果参数大于等于了要改变函数的参数了，那么直接执行就可以了
  if (args.length >= fn.length) {
    return fn(...args)
  }
  // 否则就返回一个函数，函数把所有参数都累积到一起
  return function(...args2) {
    return curry(fn, ...args, ...args2)
  }
}
```

## Number.isNaN

`NaN` 是一个特殊值，他和自身不相等，是一个非自反值（自反，reflexive，即 x === x 不成立）的值。但是 `NaN != NaN` 为 `true`

```js
// 根据此特性我们可以实现一下 Number.isNaN
if (!Number.isNaN) {
  Number.isNaN = function(n) {
    return n !== n
  }
}
// 也可以使用window.isNaN来实现
if (!Number.isNaN) {
  Number.isNaN = function(n) {
    // window.isNaN(n) 不判断数据类型
    return typeof n === 'number' && window.isNaN(n)
  }
}
```

对了，在 `JavaScript` 中 `1 / 0` 返回的不是 `NaN` 而是 `Infinity`，但是 `Infinity / Infinity` 返回 `NaN`

## Object.is

ES6 新增了一个工具方法，判断两个值是否绝对相等，可以用来处理 `-0` 的情况，因为 `-0 === 0`

```js
// Object.is 的实现
if (!Object.is) {
  Object.is = function(v1, v2) {
    // 判断是否为 -0，因为-0 === 0
    if (v1 === 0 && v2 === 0) {
      // 因为 1 / 0 === Infinity，1 / -0 === -Infinity
      return 1 / v1 === 1 / v2
    }
    // 判断是否是 NaN
    if (v1 !== v1) {
      return v2 !== v2
    }
    // 其他情况
    return v1 === v2
  }
}
```

Object.is 主要用来处理一些特殊情况的，所以效率并不是很高，能使用 `==` 或 `===` 尽量使用。

## 防抖和节流

> scroll 事件本身会触发页面的重新渲染，同时 scroll 事件的 handler 又会被高频度的触发, 因此事件的 handler 内部不应该有复杂操作，例如 DOM 操作就不应该放在事件处理中。针对此类高频度触发事件问题（例如页面 scroll ，屏幕 resize，监听用户输入等），有两种常用的解决方法，防抖和节流。

### 防抖

> 每次触发高频事件都取消上次的延时操作

```js
function debounce(fn, delay) {
  let timer = null
  return function() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}
```

### 节流

> 每次执行函数先判断是否有还在等待执行的函数，若没有则执行

```js
function throttle(fn, delay) {
  let canRun = true
  return function() {
    if (!canRun) return
    canRun = false
    setTimeout(() => {
      fn.apply(this, arguments)
      canRun = true
    }, delay)
  }
}
// 测试
var a = 0
setInterval(
  throttle(() => {
    a++
    console.log(a)
  }, 2000),
  500
)
```

## mixins 实现

```js
function mixins() {
  const target = [].shift.call(arguments, 1)
  const args = arguments
  for (let i = 0, len = args.length; i < len; i++) {
    if ([].toString.call(args[i]) !== '[object Object]')
      throw 'The argument must be an object'
    for (let key in args[i]) {
      if (!(key in target)) {
        target[key] = args[i][key]
      }
    }
  }
  return target
}
```

## 数组的一些 api 的实现

### 插入 insert

```js
function insert(arr, item, idx) {
  // 循环为什么要倒着写？看下面解释
  for (let i = arr.length - 1; i > idx - 1; i--) {
    arr[i + 1] = arr[i]
  }
  arr[idx] = item
}
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/basis-api-array-insert.jpg')" title="循环为什么要倒着写？看下面解释" />
</p>

### 删除 remove

```js
function remove(arr, idx) {
  // 核心思想就是删除的那项的后一项等于删除那一项，以此类推，从删除项开始所有值左移一位，最后减去一个length即可
  for (let i = idx, len = arr.length; i < len; i++) {
    arr[i] = arr[i + 1]
  }
  arr.length--
}
```

### 转字符串 join

```js
function join(arr, chart = '') {
  // 核心思想是拼接字符串
  let result = arr[0]
  for (let i = 1, len = arr.length; i < len; i++) {
    result += chart + arr[i]
  }
  return result
}
```

### 截取 slice

```js
function slice(arr, start = 0, end = arr.length) {
  // 核心思想就是循环数组的start项到end项添加到一个数组里面
  const result = []
  for (let i = start; i < end; i++) {
    // 可以直接调用我们之前写好的insert
    insert(result, arr[i], result.length)
    // 也可以调用push
    // result.push(arr[i])
  }
  return result
}
```

### push 入栈

```js
// 入栈就是在数组最后面添加元素，可能传入多个元素，我们不考虑js最大边界情况
function push(arr, ...items) {
  const arrLen = arr.length
  const argsLen = items.length
  for (let i = 0; i < argsLen; i++) {
    // 数组最后一项加 i 项 赋值为新添加的元素
    arr[arrLen + i] = items[i]
  }
  return arr.length
}
```

### pop 出栈

```js
// 写法可能有点流氓，但是基本思路
function pop(arr) {
  if (!arr.length) return undefined
  const value = arr[arr.length - 1]
  arr.length--
  return value
}
```

### forEach 迭代数组

```js
// forEach不可以中止循环，
function forEach(arr, fn) {
  // forEach接受一个函数作为参数，其实就是执行这个函数，与map差不多
  for (let i = 0, len = arr.length; i < len; i++) {
    fn.call(null, arr[i], i, arr)
  }
}
```

### 如何中止 forEach

在 `forEach` 中用 `return` 是不会返回任何结果的，函数还会继续执行

中断方法：

- 使用 `try` 监视代码，在需要中断的地方抛出已成
- 官方推荐方法：用 `every` 和 `some` 替换 `forEach`
  - `every` 在碰到 `return false` 的时候，中止循环
  - `some` 在碰到 `return true` 的时候，中止循环
- 接下来我们看看 `some` 和 `every` 的实现

### some 有一项满足返回 true

```js
function some(arr, fn) {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (fn(arr[i], i, arr)) {
      return true
    }
  }
  return false
}
```

### every 全部满足返回 true

```js
function every(arr, fn) {
  for (let i = 0, len = arr.length; i < len; i++) {
    // 有一项不满足，就要返回false
    if (!fn(arr[i], i, arr)) {
      return false
    }
  }
  return true
}
```

### map 处理得到一个新的数组

```js
function map(arr, fn) {
  // map 与 forEach 唯一的区别就是 map返回了一个新数组，所以我们可以创建一个数组，保存一下
  const result = []
  for (let i = 0, len = arr.length; i < len; i++) {
    result[i] = fn.call(null, arr[i], i, arr)
  }
  return result
}
```

### filter 过滤

```js
function filter(arr, fn) {
  // filter的核心，返回满足这个条件的数组
  const result = []
  // 中间变量保存函数的执行结果
  let swap = null
  for (let i = 0, len = arr.length; i < len; i++) {
    // js有个小技巧，就是给变量赋值不带声明关键字的，会返回赋的那个值
    if ((swap = fn.call(arr[i], i, arr))) {
      // arr[i]满足这个条件
      result.push(arr[i])
    }
  }
  return result
}
```

### reduce 归并

```js
function reduce(arr, fn, init) {
  // reduce 其实也不复杂，参数多一些，有个初始值的概念，其实实现也很简单
  let result = init
  for (let i = 0, len = arr.length; i < len; i++) {
    // 把处理的结果赋值给result，result其实就是上一个值（初始值）
    result = fn.call(null, result, arr[i], i, arr)
  }
  return result
}
```

### concat 合并数组

```js
// 注意 concat 不会改变源数组哦
function concat(originArr) {
  const result = []
  // 取得目标数组
  const targetArrs = [].slice.call(arguments, 1)
  for (let i = 0; i < targetArrs.length; i++) {
    // 注意这里第二层循环要迭代目标数组第 i 项哦
    for (let j = 0; j < targetArrs[i].length; j++) {
      result.push(targetArrs[i][j])
    }
  }
  for (let i = 0; i < originArr.length; i++) {
    // 添加源数组的每一项
    result.push(originArr[i])
  }
  return result
}
```

## 数组的扁平化和增维

如下：一个多维数组，要求把数组扁平化成一个一维数组

```js
const arr = [1, 2, [21, 45, 88], 3, 4, [5, 6, [7, 8, [9, 11]]]]
// 结果：[ 1, 2, 21, 45, 88, 3, 4, 5, 6, 7, 8, 9, 11 ]
```

### 扁平化

- 扁平化有多种思路，我们可以直接暴力一点，直接用正则匹配所有的中括号然后替换为空

```js
const flatUseRegExp = (arr) => {
  const str = JSON.stringify(arr).replace(/\[|\]/g, '')
  return str.split(',').map((i) => +i)
}
```

- 也可以更直接一点，利用数组 toString 之后会去掉所有括号直接处理

```js
const flatUseToString = (arr) => {
  return arr
    .toString()
    .split(',')
    .map((i) => +i)
}
```

- 当然我们也可以规规矩矩的写递归，来解决这个问题

```js
const flat = (arr) => {
  let result = []
  arr.forEach((item) => {
    if (Array.isArray(item)) {
      result = result.concat(flat(item))
    } else {
      result.push(item)
    }
  })
  return result
}
```

### 增维

之前面试遇到一道题，有一个一维数组，我想要写个方法，方法接收两个参数，该数组和一个数字，然后得到一个根据这个数字而拆分成的多维数组，比如说我传递一个 3，那就数组中的成员就每三个成员组成一个新的数组

```js
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
// 结果：[ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 0 ] ]

const newaxis = (arr, offset) => {
  const len = arr.length
  // 偏移量计算如果正好能被整除那么就取传入的偏移量，否则就向下取整后加1
  const offsetNum = len % offset === 0 ? offset : ~~(len / offset + 1)
  const result = []
  for (let i = 0; i < offsetNum; i++) {
    result.push(arr.slice(i * offset, i * offset + offset))
  }
  return result
}
```

## 深浅拷贝

深拷贝问题一直是面试过程中被问到频率特别高的问题

拷贝分两种，浅拷贝和深拷贝，分别来实现一下

工作中遇到深拷贝的问题的话，我们一般会选择 `lodash` 库中的 `deepClone` 来处理

### 浅拷贝

浅拷贝很简单只要第一层地址不一样便可以

```js
// 可以直接使用 Es6 的 rest 语法实现
function copy(target) {
  return { ...target }
}
// 也可以使用 for in 实现
function copy(target) {
  const result = {}
  for (let key in target) {
    result[key] = target[key]
  }
  return result
}
```

### 深拷贝

深拷贝要求所有引用类型的地址都不是一个地址都是复制的值，那可以考虑使用递归来实现

```js
function deepClone(target) {
  if (typeof target !== 'object') return target
  const result = Array.isArray(target) ? [] : {}
  for (let key in target) {
    result[key] = deepClone(target[key])
  }
  return result
}
```

### 循环引用

但是上面的方法如果对象中出现循环引用了，那么就不能用了，需要单独考虑，考虑以下对象

```js
const obj = {
  name: 'cym',
  age: 25,
  home: { name: '北京' },
  hobbies: ['抽烟', '喝酒', '打游戏'],
  sayHi: () => 'Hi',
}
// 循环引用
obj.obj = obj

// 可以使用 Map 对象对一层比较即可处理这个问题
function clone(target, map = new Map()) {
  if (typeof target !== 'object') return target
  if (map.get(target)) return map.get(target)
  const result = Array.isArray(target) ? [] : {}
  map.set(target, result)
  for (let key in target) {
    result[key] = clone(target[key], map)
  }
  return result
}
```

## 观察者 Emitter

- 观察者也叫发布订阅模式，`node` 事件流基本都是基于观察者来实现的监听的，尝试着实现下
- 里面有两个方法，一个订阅事件，一个发布事件，一旦发布事件触发订阅者执行相应的回调

```js
function Emitter() {
  // 事件对象，用来存储各种类型的事假
  this.handlers = {}
}
Emitter.prototype = {
  // 订阅事件，事件类型，事件回调
  on: function(type, handler) {
    if (!(this.handlers[type] in this.handlers)) {
      // 事件队列
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)
  },
  // 发布事件，订阅者执行相应的回调
  emit: function(type) {
    if (!this.handlers[type]) return
    const args = [].slice.call(arguments, 1)
    this.handlers[type].forEach((handler) => {
      handler.apply(this, args)
    })
  },
  off: function(type, handler) {
    const handlers = this.handlers[type]
    if (!handlers) return undefined
    let result = undefined
    for (let i = 0, len = handlers.length; i <= len; i++) {
      if (handlers[i] === handler) {
        result = handlers.splice(i, 1)
      }
    }
    return result
  },
}
```

- 虽然实现的一些基本的 api 都是用底层语言来实现，但是用 `Es6` 来实现 `Emitter` 很好看，接下来用 `Es6` 来实现一下，而且好理解，还是 `Es6` 好看

```js
class Emitter {
  constructor() {
    this.handlers = {}
  }
  on(type, handler) {
    if (!(this.handlers[type] in this.handlers)) {
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)
  }
  emit(type) {
    if (!this.handlers[type]) return
    const args = [...arguments].slice(1)
    this.handlers[type].forEach((handler) => {
      // 执行函数
      handler.apply(this, args)
    })
  }
  off(type, handler) {
    if (!this.handlers[type]) return void 0
    return this.handlers[type].find((fn, idx) => {
      if (fn === handler) {
        return this.handlers[type].splice(idx, 1)
      } else {
        return void 0
      }
    })
  }
}
```

- 持续更新中....
