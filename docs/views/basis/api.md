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
    console.log(1)
    left.__proto__ = left.__proto__.__proto__
  }
}
// test
instanceOf(Function, Object) // true >> Function.__proto__.__proto__ === Object.prototype
```

## call 和 apply

> `call` 和 `apply` 两者很像除了传递的参数不同，一个是传递的是值，一个传递的是一个数组

```js
// call
Function.prototype.call2 = function(context = window) {
  context.fn = this
  const args = [...arguments].slice(1)
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

### forEach 迭代数组

```js
function forEach(arr, fn) {
  // forEach接受一个函数作为参数，其实就是执行这个函数，与map差不多
  for (let i = 0, len = arr.length; i < len; i++) {
    fn.call(null, arr[i], i, arr)
  }
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
