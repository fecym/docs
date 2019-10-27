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

> call 和 apply 两者很像除了传递的参数不同，一个是一个个的值，一个直接传递一个数组

```js
// call
Function.prototype.call2 = function(context) {
  context.fn = this
  const args = [...arguments].slice(1)
  const result = context.fn(...args)
  Reflect.deleteProperty(context, 'fn')
  return result
}
```
