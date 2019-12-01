---
title: 常用api的实现
date: 2019-10-27
tags:
  - api实现
  - 基础
---

# JavaScript 常用 api 的实现

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
  while (true) {
    if (left.__proto__ === null) return false
    if (left.__proto__ === right.prototype) return true
    left.__proto__ = left.__proto__.__proto__
  }
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

### bind 的实现

> bind 方法绑定了 `this` 并且返回了一个函数，参数和 `call、apply` 相似

- bind 方法的实现其实蛮有意思的，因为 bind 方法返回一个函数，那么返回的这个函数如果被当做构造函数怎么办

```js
function person(name, age) {
  console.log(name, age)
  console.log(this)
}
const obj = { name: 'obj' }
const barBind = person.bind(obj)
// 普通调用
barBind('cym', 24)
// 当做构造函数来用
new barBind('cym', 24)
```

- 打印结果如下

  <p align="left">
    <img :src="$withBase('/imgs/basis-javascript-api-bind.png')" height="160" />
  </p>

- 可以看到当做构造函数来用的时候，构造函数的 this 指向了 person 类型的对象
- 那我们来尝试着实现一下 bind 的方法

```js
Function.prototype.bind2 = function(context = window) {
  const that = this
  const args = [...arguments].slice(1)
  const fn = function() {
    // this instanceof fn 为 true 表示构造函数的情况。如 new barBind2('cym', 24)
    if (this instanceof fn) {
      // that.apply(that.prototype, args.concat(...arguments))
      that.apply(this, args.concat(...arguments))
    } else {
      that.apply(context, args.concat(...arguments))
    }
  }
  // 保证原函数的原型对象上的属性不丢失
  fn.prototype = Object.create(this.prototype)
  return fn
}
```

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

<p align="center">
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

### flat 扁平化

```js
function flat(arr) {
  let result = []
  for (let i = 0, len = arr.length; i < len; i++) {
    // if (Object.prototype.toString.call(arr[i]) === '[object Array]') {
    if (Array.isArray(arr[i])) {
      result = result.concat(flat(arr[i]))
    } else {
      result.push(arr[i])
    }
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

## 菲波那切数列

- 今天新东方的面试还提到了菲波那切数列，其实这个东西蛮很有趣，简单介绍一下
- 1、1、2、3、5、8、13、21、34 ....
- 这道题有个规律，第一项加上第二项永远等于第三项：1 + 1 = 2；1 + 2 = 3；2 + 3 = 5；3 + 5 = 8 ....
- 要求是传入第几项，得到该值，根据这个规律来实现一下

```js
function fibonacci(len) {
  // 第一项和第二项都返回1
  if (len === 1 || len === 2) return 1
  // 我们只要返回 len - 1（len的前一项）与 len - 2（len的前两项）的和便是我们要的值
  return fibonacci(len - 1) + fibonacci(len - 2)
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
  // 订阅事件，事件类型，事假回调
  on: function(type, handler) {
    if (!(this.handlers[type] in this.handlers)) {
      // 事件队列
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)
  },
  // 发布事件，订阅者执行相应的回调
  emit: function(type) {
    const args = [].slice.call(arguments, 1)
    this.handlers[type].forEach(handler => {
      handler.apply(this, args)
    })
  }
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
    const args = [...arguments].slice(1)
    this.handlers[type].forEach(handler => {
      handler.apply(this, args)
    })
  }
}
```

- 持续更新中....
