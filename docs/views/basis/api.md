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
  for (let i = arr.length - 1; i > idx - 1; i--) {
    arr[i + 1] = arr[i]
  }
  arr[idx] = item
}
```

### 删除 remove

```js
function remove(arr, idx) {
  for (let i = idx, len = arr.length; i < len; i++) {
    arr[i] = arr[i + 1]
  }
  arr.length--
}
```
