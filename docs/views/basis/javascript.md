---
title: JavaScript 基础知识
date: 2019-05-12
tags:
  - JavaScript
  - 基础
---

## 类型转换

### 一个有趣的问题

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/basis-javascript-type-change.jpg')" height="260" />
</p>

> 看到了这个我亲自尝试了下，结果发现自己对 js 基础越来越陌生了，现在好好复习下吧

```js
0 == '0' // true
0 == [] // true
'0' == [] // false
```

#### 为什么？

> 为什么 '0' == [] 是 false ？<br>
> 为什么 为什么 0 == [] 是 true？<br>
> 为什么 [] == ![] 是 true

带着这三个疑问来解释下这个问题

首先，`==` 转换有几个基本规则：

1. `NaN` 与任何值都不相等，包括自己本身
2. `undefined` 与 `null` 相等(==)，其他都不等
3. 对象与字符串类型做比较，会把对象转换成字符串然后做比较
4. 其他类型比较都要转换成 `数字` 做比较

#### 1. 为什么 '0' == [] 是 false ？

这个对应上面的第三条规则 `对象与字符串类型做比较，会把对象转换成字符串然后做比较`，那么 `[].toString()` 返回一个 `''` 所以就是 false

#### 2. 为什么 0 == [] 是 true？

这个对应第四条规则：会把 `[]` 转换成数字进行比较，`[]` 转数字会变成 `0`，所以这个也是 `true`

拓展一下：`Number([]) => 0、Number([''] => 0、Number([1]) => 1)`

#### 3. 为什么 [] == ![] 是 true

这个也对应第四条规则

- 首先 `[].toString()` 会得到一个 `''` 字符串
- `![]` 得到一个布尔值 `false`
- `''` 与 `false` 比较肯定要转换成数字比较
- 那么 `''` 转换则为 `0`， `false` 转换也是 `0`
- 所以这道题就是 `true`

```js
Number([]) // 0
Number(![]) // 0
Number(!![]) // 1
```

### 类型转换规则

> 在 js 中类型转换有三种情况：转布尔值；转数字；转字符串。如果发生了隐式转换，那么各种类型互转符合下面的规则：

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/js-type-transform.jpg')" width="" style="border-radius: 8px;">
</p>

### 显示数据类型转换

- 转数字：`Number()`
  - 如果是 `number` 类型的字符串，那么转换的时候回返回自己
  - 如果不是 `number` 类型的字符串，那么转换结果是 `NaN`
  - 如果是 `''`，那么转换结果是 `0`
- 转数字：`parseInt`
  - 忽略掉前面的空格，直到找到第一个非空字符串，还会降后面的非数字字符串去掉
  - 如果第一个字符不是数字符号或者负号，则返回 `NaN`
  - 会向下取整
- 转数字：`parseFloat`

  - 同上，但是会保留小数

- 转字符串：`String()、toString()`
- 转 boolean：`Boolean()`
  - 在进行转换 `boolean` 的时候，所有的结果都为 `true`，除了 `false、''、0、-0、NaN、undefined、null`

### 隐式转换

- 转 `number`：减乘除取余都可以让字符串隐式转换为 `number`
- 转 `string`：可以通过加 `''` 字符串来转换 `a = a + ''`
- 转 `boolean`：可以通过加 `!` 来转换 `a = !!a`
- 在条件判断时，除了 `false、''、0、-0、NaN、undefined、null`，其他值都可以转为 `true`，包括所有对象

### 对象转原始类型

- 对象转换类型的时候，会调用内置的 `[toPrimitive]` 函数，对于该函数来说，算法逻辑如下：
  - 如果已经是原始类型了，那就不需要转换了
  - 调用 `x.valueOf()` ，如果转为基础类型，就返回转换的值
  - 调用 `x.toString()` ，如果转为基础类型，就返回转换的值
  - 如果都没有返回原始类型，就会报错
  - 当然也可以重写 `[Symbol.toPrimitive]`，该方法在转换原始类型时调用优先级最高
  ```js
  const obj = {
    valueOf() {
      return 0
    },
    toString() {
      return '1'
    },
    [Symbol.toPrimitive]() {
      return 2
    },
  }
  obj + 1 // 3
  ```
- 引用类型转换为 `Number` 类型，先调用 `valueOf` ，在调用 `toString`
- 引用类型转换为 `String` 类型，先调用 `toString` ，在调用 `valueOf`
- 若 `valueOf` 和 `toString` 都不存在，或者没有返回基本类型，则会抛出 `TypeError` 异常

```js
// 可以转换的
const obj = {
  valueOf() {
    console.log('valueOf')
    return 123
  },
  toString() {
    console.log('toString')
    return 'cym'
  },
}
console.log(obj - 1) // valueOf 122
console.log(`${obj} 你好`) // toString cym 你好
// 转换报错
const o = {
  valueOf() {
    console.log('valueOf')
    return {}
  },
  toString() {
    console.log('toString')
    return {}
  },
}
console.log(o - 1) // Uncaught TypeError: Cannot convert object to primitive value
console.log(`${o} 你好`) // Uncaught TypeError: Cannot convert object to primitive value
```

### 再来一张图

- 这张图可能理解会更好点

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/js-type-transform2.jpg')" width="" style="border-radius: 8px;">
</p>

### == 和 ===

> `===` 叫做严格相等，是指：左右两边不仅值要相等，类型也要相等，例如 `'1' === 1` 结果是 false，因为一边是 string，另一边是 number。其实这种说法不严格，严格来说是：`== 允许在相等比较中进行强制类型转换，而 === 不允许`

- `==` 不像 `===` 那样严格，对于一般情况，只要值相等，就返回 `true`，但 `==` 还涉及一些类型转换，它的转换规则如下：

  - 两边类型是否相同，相同的话就比较值的大小，例如 `1 == 2`，返回 `false`
  - 判断的值是否是 `null` 和 `undefined`，是的话就返回 `true`（js 中只有 `null == undefined`）
  - 判断的类型是否 `String` 和 `Number`，是的话就把 `String` 转换成 `Number`，在进行比较
  - 判断其中一方是否是 `Boolean`，是的话就把 `Boolean` 转换成 `Number`，在进行比较（遇到布尔值会转换为数字进行比较）
  - 判断其中一方是否是 `Object`，且另一方为 `String、Number、Symbol`，会将 `Object` 转成字符串，在进行比较
  - 此段内容摘自[掘金 - 原生 JS 灵魂之问](https://juejin.im/post/5dac5d82e51d45249850cd20#heading-17)

- 对象的 `==` 和 `===` 比较的时候工作原理是一样的，都是判断其地址是否一致

```js
console.log({a: 1} == true) // false
console.log({a: 1} == '[object Object]') // true
```

### 假值常规和非常规的情况

```js
  '0' == null         // false
  '0' == undefined    // false
  '0' == false        // true   -- 嘿嘿
  '0' == NaN          // false
  '0' == 0            // true
  '0' == ''           // false

  false == null       // false
  false == undefined  // false
  false == NaN        // false
  false == 0          // true   -- 嘿嘿
  false == ''         // true   -- 嘿嘿
  false == []         // true   -- 嘿嘿
  false == {}         // false

  '' == null          // false
  '' == undefined     // false
  '' == NaN           // false
  '' == 0             // true   -- 嘿嘿
  '' == []            // true   -- 嘿嘿
  '' == {}            // false

  0 == null           // false
  0 == undefined      // false
  0 == NaN            // false
  0 == []             // true   -- 嘿嘿
  0 == {}             // false

  [] == ![]           // true   -- 嘿嘿嘿
```

## 枚举

- 声明一个变量然后直接赋值，会返回一个 _undefined_
- 声明一个变量之后，在为其赋值，将会返回你赋的那个值
- 那么一个 ts 的枚举就是利用这个来实现的

```js
var Days = {}
function enumerate(Enum = {}) {
  Enum[(Enum['a'] = 1)] = 'a'
  Enum[(Enum['b'] = 2)] = 'b'
  Enum[(Enum['c'] = 3)] = 'c'
  Enum[(Enum['d'] = 4)] = 'd'
  Enum[(Enum['e'] = 5)] = 'e'
  return Enum
}
// 那么枚举的实现应该这么写
function creatEnum(Enum = {}, args = []) {
  if (!args.length) return {}
  for (let i = 0, len = args.length; i < len; i++) {
    Enum[(Enum[i] = i)] = args[i]
  }
  return Enum
}
```

## 传值和传址

### 基础概念

> 对于一个引用类型，把这个引用类型赋值给其他的引用类型的后，对该引用类型的某个属性进行修改，则另外一个也会变，但是覆盖后，则对另一个不会有影响

```js
const obj = {a: 1, b: '我是b'}
let b = obj
// 对其某个属性修改，则会另外一个对象也会变，因为是同一个引用
b.b = '我是b'
console.log(obj, b) // {a: 1, b: "我是b"} {a: 1, b: "我是b"}
// 对其覆盖，则不会影响另一个对象
b = {c: '我是b的c'}
console.log(obj, b) // {a: 1, b: "我是b"} {c: "我是b的c"}
```

### 函数的传值和传址

- 传值：传给函数的是值的一个复制，函数中对其的修改 **不会影响到外面的值**
- 传址：传给函数的是一个引用，函数中 **对引用的属性做修改会影响到外部的对象**，但用 **新引用覆盖其则在不会影响到外面的引用**

```js
let a = [1, 2, 3]
let b = [5, 6]
function change(a, b) {
  a[0] = 4 // 对其属性的修改外部可见
  let c = a
  a = b // 用新引用覆盖
  b = c
  console.log(a) // '5, 6'
  console.log(b) // '4, 2, 3'
}
change(a, b)
console.log(a) // '4, 2, 3'
console.log(b) // '5, 6'
```

### 如何解决函数内传址带来的影响

根据上面的情况我们发现：当传递给函数参数是一个引用的时候，在函数中修改该引用会影响到外面的引用类型，因为他们是同一个地址

那么我不想影响到函数外面的引用类型怎么办？

在 《你不知道的 JavaScript》中卷中，有这么一句话：`如果通过值复制的方式来传递复合值（如数组），就需要为其创建一个副本，这样传递的就不再是原始值`

也就是说我们传递一个引用类型的副本给函数，那么修改了也是对这个副本的引用有影响，对原来的引用值没有影响，还是不理解？那么看下面的代码：

```js
const arr = [1, 2, 3]
function fn(arr) {
  arr.push(8)
}
// 执行函数fn传递数组的副本过去，此时，我们在打印外面的 arr 发现是没有变化的
fn(arr.slice())
// 为什么呢？因为这么写就相当于我们用了引用覆盖了原来的引用，当然不会对原来的引用造成影响了
// 相当于这么写
let copyArr = arr
copyArr = arr.slice()
fn(copyArr)
```

## this

在《你不知道的 JavaScript》上卷中提到 `this` 绑定有四种规则，分别是默认绑定（函数自执行）、隐式绑定（对象打点调用）、显示绑定（call 之类绑定）、new 绑定（构造函数）

### 默认绑定

默认绑定也是最常用的函数调用类型，也就是函数自执行，此时函数中 · 执行全局中最顶层对象，浏览器中就是 `window`、`node` 中就是 `global`

如果是在严格模式下，则不能将全局对象用于默认绑定，因此 `this` 会被绑定到 `undefined`

### 隐式绑定

1. 隐式绑定其实就是看调用位置是否有上下文对象，或者说是否被某个对象拥有或者所包含，当函数拥有上下文对象时，隐式绑定会把函数中的 `this` 绑定到这个上下文对象上

2. 对象属性引用链中只有上一层或者说最后一层调用位置中起作用，来看以下代码：

```js
function print_a() {
  console.log(this.a)
}
const obj2 = {
  a: 42,
  print_a,
}
const obj1 = {
  a: 2,
  obj2,
}
// 最后一层调用链中起作用
obj1.obj2.print_a() // 42
```

3. `dom` 编程中事件函数中的 `this`（事件函数不是箭头函数的情况）指向了绑定事件的元素，说白了还是谁调用函数那么 `this` 就指向谁

4. 隐式绑定可能会出现丢失的情况，看以下代码：

```js
function print_a() {
  console.log(this.a)
}
const obj = {a: 2, print_a}
// 我们把函数赋值给了一个变量来保存
const fn = obj.print_a
var a = '我是window的a'
// 此时执行这个函数，其实就是相当于函数的自执行的，那么就会走默认绑定的规则
fn() // 我是window的a
```

### 显示绑定

显示绑定分两种情况：使用 [`call、apply、bind`](/views/basis/api.html#call-和-apply) 方法绑定 `this` 和 `api` 调用的上下文

```js
// api 调用的上下文
function foo(el) {
  console.log(el, this.id)
}
const obj = {id: 'awesome'}[
  // 调用 foo 时把 this 绑定到 obj 上
  (1, 2, 3)
].forEach(foo, obj) // 1 awesome 2 awesome 3 awesome
```

### new 绑定

`new` 绑定也是可以影响函数中 this 绑定行为的方法，也是这四种规则中优先级最高的一个，详细可以看 [`new的实现`](/views/basis/api.html#实现一个-new-操作符)

### 箭头函数

箭头函数不会使用 `this` 四种标准规则，而是根据外层（函数或者全局）作用域来决定 `this`，其实一个简单的理解就是我们在箭头函数出来之前经常用的一种方法，在函数外面 `var that = this`，然后在内层函数中使用 `that` 此时就保留了外层的 `this` 值

```js
var name = 'cym'
const fn = () => console.log(this.name)
const obj = {name: 'obj'}
// this 不会被改变
fn.call(obj) // cym

// 来个面试题理解下
const obj1 = {
  name: 'obj1',
  print: function() {
    return () => console.log(this.name)
  },
}
const obj2 = {name: 'obj2'}
obj1.print()() // obj1
obj1.print().call(obj2) // obj1
obj1.print.call(obj2)() // obj2
```

## 防抖和节流

### 防抖

- 防抖：触发高频事件后 n 秒内只会执行一次，如果 n 秒内高频事件再次被触发，则重新计算时间。
- 思路：每次触发事件时都取消之前的延时调用

```js
function debounce(fn, step) {
  let timer = null
  return function() {
    clearTimeout(timer)
    // 每次调用前先清除
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, step)
  }
}
```

### 节流

- 高频事件触发，但在 n 秒内只会执行一次，所以节流会稀释函数的执行频率
- 思路：每次触发事件时都判断当前是否有等待执行的延时函数

```js
  function throttle(fn, step) {
    ley canRun = true
    return function() {
      if (!canRun) return
      canRun = false
      setTimeout(() => {
        fn.apply(this, arguments);
        canRun = true
      }, step)
    }
  }
```

### 补充

- 以前我认为防抖和节流都差不多，但是有一次在开发地图的时候发生改变
- 需求是这样的，我们要模仿百度地图的搜索，搜索完之后，把后台返回的数据展示为一个列表，然后对应的点显示上去
- 鼠标悬停列表后地图上的点也改变其颜色，如下图

  <p align="center" class="p-images">
    <img :src="$withBase('/imgs/javascript-basis-mapbox.jpg')" width="700" style="border-radius: 8px;">
  </p>

- 鼠标滑动事件是高频事件，一定需要阻止一下，否则一会页面就卡死了，我想都没有想就想到了节流，限制事件的执行频率，代码如下

```html
<!-- vue结构 -->
<div
  v-for="(item, idx) in aoiNameList"
  :key="idx"
  class="item"
  @click="showDetails(item)"
  @mouseover="changeMapLocationIcon(idx)"
  @mouseout="clearTimer"
></div>
```

```typescript
  // 节流处理
  protected throttle: boolean = true
  // 根绝鼠标悬停改变mapbox中的样式
  protected changeMapLocationIcon(idx: number) {
    if (!this.throttle) return
    this.throttle = false
    setTimeout(() => {
      this.markerList.forEach((item: any, index: number) => {
        item._element.classList.remove('active')
        if (idx === index) {
          console.log(item)
          item._element.classList.add('active')
        }
      })
      this.throttle = true
    }, 200)
  }
```

- 我鼠标不停的滑动来切换，我发现 mapbox 上的图标颜色没有改变，
- 我才想到，这么玩的话，在满足条件再次执行该函数的时候，永远保持上一个状态，他只会记住一次状态，所有我们应该选择防抖而不是节流
- 于是，我把代码改了下:

```ts
  // 防抖处理高频事件
  protected timer: any = null
  protected changeMapLocationIcon(idx: number) {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.markerList.forEach((item: any, index: number) => {
        item._element.classList.remove('active')
        if (idx === index) {
          item._element.classList.add('active')
        }
      })
    }, 300)
  }
  protected clearTimer() {
    clearTimeout(this.timer)
  }
  protected beforeDestroy() {
    clearTimeout(this.timer)
  }
```

## Reflect

::: tip
*Reflect*对象与*Proxy*对象一样，都是 Es6 为了操作对象而提供的新 API。*Reflect*对象的设计目的有这样几个

- 将*Object*对象的一些明显属于语言内部的方法（比如*Object.defineProperty*），放到*Reflect*对象上。现阶段，某些方法同时在*Object*和*Reflect*对象上部署，未来新的方法将只部署在*Reflect*对象上。也就是说，从*Reflect*对象上可以拿到语言内部的方法。
- 修改某些*Object*方法的返回结果，让其变得更合情合理。比如，*Object.defineProperty(obj, name, desc)*在无法定义属性时会抛出一个错误，而*Reflect.definProperty(obj, name, desc)*则会返回*false*
- 让*Object*操作都变成函数行为。某些*Object*操作都是命令式，比如*name in obj*和*delete obj[name]*，而*Reflect.has(obj, name)*和*Reflect.deleteProperty(obj, name)*让他它们变成了函数行为
- *Reflect*对象的方法与*Proxy*对象的方法一一对应，只要是*Proxy*对象的方法，就能在*Reflect*对象上找到对应的方法。这就让*Proxy*对象可以方便地调用对应的*Reflect*方法，完成默认行为，作为修改行为的基础。也就是说，**不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为**。
  :::

## 发布订阅机制

> 发布订阅模式也是观察者模式，它定义了一种一对多的关系，让多个订阅对象同时监听某一个主题对象，这个主题对象某一状态发生改变的时候就会通知所有订阅者。它有两类对象组成：发布者和订阅者，发布者负责发布消息，同时订阅者通过订阅这些事件来观察主题。发布者和订阅者是完全解耦的，彼此不知道对方的存在，两者仅仅共享一个自定义事件的名称。（摘自博客园）

- 今天上午提到的 **Redis** 的发布订阅，就是一个发布订阅模式 [传送门](/views/big-front-end/redis/#redis-发布订阅)
- **node** 中的 **events** 模块中的 **EventEmitter** 类就是一个发布订阅模式

```js
// 演示下node中的发布订阅
const Emitter = require('events').EventEmitter
const emitter = new Emitter()
emitter.on('test', msg => {
  console.log(msg, '第一个')
})
emitter.on('test', (...msg) => {
  console.log(msg, '第二个')
})
emitter.on('test', msg => {
  console.log(msg, '第三个')
})
emitter.emit('test', 'chengyuming')
emitter.emit('test2', '嘿嘿嘿', '哈哈哈')
```

- 让我们来实现一个简单发布订阅模式
  - 首先我们要有一个 **Emitter** 类
  - 这个类里有个属性里面用来存放我们的消息队列
  - 这个类的实例要有两个方法，一个发布一个订阅

```js
class Emitter {
  constructor() {
    // 消息队列，以及消息类型
    this.handlers = {}
  }
  // 订阅事件，绑定函数
  on(eventType, handler) {
    // 判断消息队列里面有没有该事件，有则继续push没有则赋值空[]
    if (!(eventType in this.handlers)) {
      this.handlers[eventType] = []
    }
    this.handlers[eventType].push(handler)
  }
  // 发布消息
  emit(eventType) {
    // 获取到发布的所有消息
    const messages = Array.prototype.slice.call(arguments, 1)
    // 触发订阅事件的函数执行
    this.handlers[eventType].forEach(handler => {
      handler.apply(this, messages)
    })
  }
}
```
