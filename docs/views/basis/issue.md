---
title: 小技巧及面试题
date: 2019-12-14
tags:
  - issue
  - 面试题
  - 基础
---

## 获取一个月有多少天

今天遇到一个需求，已知月份，得到这个月的第一天和最后一天作为查询条件查范围内的数据

`new Date(year, month, date, hrs, min, sec)`，`new Date` 可以接受这些参数创建一个时间对象
其中当我们把 `date` 设置为 `0` 的时候，可以直接通过 `getDate()` 获取到最后一天的日期然后得到我们要的最后一天

```js
new Date(2019, 12, 0).getDate() // 31
new Date(2018, 2, 0).getDate() // 28
// 根据这个我们可以得到一个方法
function getMonthLength(month) {
  const date = new Date(month)
  const year = date.getFullYear()
  // 月份是从 0 开始计算的
  const _month = date.getMonth() + 1
  return new Date(year, _month, 0).getDate()
}
```

## 关于函数的 length 属性

今天 360 面试过程遇到一个很有趣的问题，是关于函数的 length 属性的，题简写如下

```js
;(() => 1).length === 0 // 输出什么
```

我所理解的拥有 `length` 的对象一般都是数组或者类数组对象，或者定义了 `length` 属性的对象，所以我回答说这个应该是 `false` 吧，后来面试告诉我函数是有 `length` 属性的，函数的 `length` 属性就是函数参数的个数，瞬间我恍然大悟，函数的参数就是 `arguments`，而 `arguments` 也是一个类数组对象所以他是有 `length` 属性的

```js
// so
;(() => 1).length ===
  0(
    // 输出 true
    a => a
  ).length // 输出 1
```

## 数组中字符串键值的处理

在 JavaScript 中数组是通过数字进行索引，但是有趣的是他们也是对象，所以也可以包含 `字符串` 键值和属性，但是这些不会被计算在数组的长度（length）内

如果字符串键值能够被强制类型转换为十进制数字的话，它就会被当做数字索引来处理

```js
const arr = []
arr[0] = 1
arr['1'] = '嘿嘿'
arr['cym'] = 'cym'
console.log(arr) // [1, '嘿嘿', cym: 'cym']
console.log(arr.length) // 2
```

## NaN（not a number）

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

## void 运算符

`undefined` 是一个内置标志符，它的值为 `undefined`（除非被重新定义过），通过 `void` 运算符即可得到该值

在 `void` 之后的语句或表达式都将返回 `undefined`。`void` 并不会改变表达式的结果，只是让表达式不返回值

```js
void true // undefined
void 0 // undefined
```

`void` 运算符在其他地方也可以派上用场，比如不让表达式返回任何结果。

```js
// 该函数不需要有任何返回结果
function doSomething(sign) {
  if (!sign) {
    return void setTimeout(doSomething, 100)
  }
}
// 或许你经常向下面一样这么写
function doSomething(sign) {
  if (!sign) {
    setTimeout(doSomething, 100)
    return
  }
}
```

## 关于 JSON.stringify

`JSON.stringify` 和 `toString()` 效果基本相同，只不过序列化的结果总是字符串

```js
JSON.stringify(42) // "42"
JSON.stringify('42') // ""42""（含有双引号的字符串）
JSON.stringify(null) // "null"
JSON.stringify(true) // "true"
```

### 不安全的 JSON 值

所有安全的 `JSON` 值都可以使用 `JSON.stringify` 序列化，不安全的 `JSON` 值有：`undefined`、`function`、`symbol` 和 `循环引用`。`JSON.stringify`

在对象中遇到这些不安全的 `JSON` 值的时候会自动将其忽略，在数组中遇到则会返回 `null`，以保证数组成员位置不变

```js
JSON.stringify(undefined) // null
JSON.stringify(function() {}) // null
JSON.stringify([1, undefined, 2, function() {}, 3]) // "1, null, 2, null, 3"
JSON.stringify({ a: 2, b: function() {} }) // "{"a":2}"
```

### toJSON 方法

如果对象中定义了 `toJSON` 方法，那么在 `JSON` 序列化的时候优先调用该方法，主要是为了处理循环引用的时候，我们让其返回一个合理的值

也就是说 `toJSON` 方法应该返回一个能够被字符串安全化的 `JSON` 值

```js
const o = {
  a: 'cym',
  toJSON() {
    return { c: 'b' }
  }
}

JSON.stringify(o) // {"c":"b"}
```

### JSON.stringify 的第二个参数

我们可以向 `JSON.stringify` 中传递一个可选参数 `replacer`，他可以书数组也可以书函数，用来指定对象序列化的时候哪些属性应该被处理，哪些应该被排除，和 `toJSON` 很像

1. 当 `replacer` 是一个数组时，那么他必须是一个字符串数组，其中包含序列化要处理的对象的属性名称，除此之外的属性就会被忽略

```js
const obj = {
  a: 42,
  b: 30,
  c: 100
}
JSON.stringify(obj, ['a', 'c']) // {"a":42,"c":100}
```

2. 当 `replacer` 是一个函数时，他会对对象本身调用一次，然后在对对象中的每个属性各调用一次。每次传递两个参数（对象的键和值）。如果要忽略某个键就返回 `undecided`，否则就返回指定的值

```js
const obj = {
  a: 42,
  b: 30,
  c: 100
}
JSON.stringify(obj, (k, v) => {
  // 注意：第一次 k 是 undefined，v 是原对象
  if (k !== 'c') return v
}) // "{"a":42,"b":30}"
```

## 一元运算符

我们都知道一个字符串转换为数字，可以使用 `+ "12"` 转换为数字 12，也可以使用 `-`，这样的 `+、-` 是一元运算符，这样将数字转换为字符串的方法属于显示转换

`-` 运算符还有反转符号位的功能，当然不能把一元操作符连在一起写，不然会变成 `--`，当做递减运算符号来计算了，我们可以理解为 `-` 运算符出在单数次数会转符号位，出现双次数会抵消反转，比如说 `1 - - 1 === 2`

```py
# 这是 js 代码哦，不是 python
1 + - + - + - 1   # 0
1 - - 1           # 2
1 - - - 1         # 0
```

## 字位反转操作符 ~

`~` 返回 2 的补码，`~x` 大致等同于 `-(x+1)`

```js
~42 // -(42+1) ===> -43
```

在 `-(x+1)` 中唯一能够得到 0（或者严格来说时候 -0）的 x 值是 -1，也就是说 ~ 和一些数字在一起会返回一个假值 0，其他情况下则返回真值

-1 是一个 `哨位值`，哨位值是那些在各个类型中被赋予了特殊含义的值。在 C 语言中 -1 代表函数执行失败，大于等于 0 的值代表函数执行成功

比如在 JavaScript 中字符串的 indexOf 方法也遵循这一惯例，该方法在字符串中搜索指定的字符串，如果找到就返回该子字符串所在的位置，否则返回 -1

### ~ 的用途

我们知道在 JavaScript 中假值有：`undefined、null、false、+0、-0、NaN、''`，其他都为真值，所以负数也是真值，那么我们就可以拿着 `~` 和 `indexOf` 一起检结果强制类型转换为 真/假 值

```js
const str = 'hello world'
~str.indexOf('lo') // -4，真值
if (~str.indexOf('lo')) {
  // true
  // 找到匹配
}
~str.indexOf('ol') // 0，假值
!~str.indexOf('ol') // true
if (!~str.indexOf('ol')) {
  // true
  // 没有找到匹配
}
```

~ 要比 `>=0` 和 `== -1` 更简洁

### 字位截除

我们经常使用 `~~` 来截取数字值的小数部分，以为这是和 Math.floor 效果是一样的，实际上并非如此

`~~` 中第一个 ~ 执行 ToInt32 并反转字位，然后第二个在进行一次字位反转，就是将所有的字位反转回原值，最后得到的结果仍是 ToInt32 的结果

`~~` 只适用于 32 位的数字，更重要的是他对负数的处理与 Math.floor 不同，所以使用时要多加注意

```js
Math.floor(1.9) // 1
~~1.9 // 1
// 操作负数
Math.floor(-1.9) // -2
~~-1.9 // -1
```

`~~x` 能将值截除为一个 32 位的整数，`x | 0` 也可以，而且看起来更简洁哦，不过出于对运算符优先级的考虑，我们更倾向于使用 `~~x`

```js
~~1.9 // 1
1.9 | 0 // 1

~~-1.9 // -1
;-1.9 | 0 // -1
```

## 给定一组 url 实现并发请求

原题是这样的：给定一组 url，利用 js 的异步实现并发请求，并按顺序输出结果

### Promise.all

首先我们可以想到的是利用 `Promise.all` 来实现，代码实现如下

```js
const urls = ['./1.json', './2.json', './3.json']
function getData(url) {
  // 返回一个 Promise 利用 Promise.all 接受
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response)
        }
      }
    }
    xhr.open('GET', url, true)
    xhr.send(null)
  })
}
function getMultiData(urls) {
  // Promise.all 接受一个包含 promise 的数组，如果不是 promise 数组会被转成 promise
  Promise.all(urls.map(url => getData(url))).then(results => {
    console.log(results)
  })
}
```

### 不用 Promise

原题是不用 `Promise` 来实现，我们可以写一个方法，加个回调函数，等数据全部回来之后，触发回调函数传入得到的数据，那么数据全部回来的就是我们要考虑的核心问题，我们可以用个数组或者对象，然后判断一下数组的 length 和传入的 url 的长度是否一样来做判断

#### 使用对象做映射

```js
const urls = ['./1.json', './2.json', './3.json']
function getAllDate(urls, cd) {
  const result = {}
  function getData(url, idx) {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          result[idx] = xhr.response
          // 如果两者 length 相等说明都请求完成了
          if (Object.keys(result).length === urls.length) {
            // 给对象添加length属性，方便转换数组
            result.length = urls.length
            cd && cd(Array.from(result))
          }
        }
      }
    }
  }
  // 触发函数执行
  urls.forEach((url, idx) => getData(url, idx))
}
// 使用
getAllDate(urls, data => {
  console.log(data)
})
```

#### 使用数组实现

和上面的基本思路差不多，不过这次换成了数组，也可以给个信号量来做判断

```js
function getGroupData(urls, cb) {
  const results = []
  let count = 0
  const getData = url => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'json'
    xhr.onreadystatechange = _ => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          results.push(xhr.response)
          if (++count === urls.length) {
            cb && cb(results)
          }
        }
      }
    }
    xhr.open('GET', url, true)
    xhr.send(null)
  }
  urls.forEach(url => getData(url))
}

getGroupData(urls, data => {
  console.log(data)
})
```

## 类型转换问题

原题：如何让 (a == 1 && a == 2 && a == 3) 的值为 true?

这个问题考查的数据类型转换，`==` 类型转换有个基本规则

- `NaN` 与任何值都不相等，包括自己本身
- `undefined` 与 `null` 相等(==)，其他都不等
- 对象与字符串类型做比较，会把对象转换成字符串然后做比较
- 其他类型比较都要转换成 `数字` 做比较

那么这个问题我们重写 `toString` 或者 `valueOf` 方法就可以了

```js
const a = {
  val: 1,
  toString() {
    return this.val++
  }
}
if (a == 1 && a == 2 && a == 3) {
  console.log('ok')
}
```

还有一种方法实现

```js
var i = 1
Object.defineProperty(window, 'a', {
  get() {
    return i++
  }
})

if (a == 1 && a == 2 && a == 3) {
  console.log('OK')
}
```

### 拓展一下 [] == ![] 为什么是 true

上面隐式类型转换规则中提到，其他类型比较都要转换成数字做比较，这个就是对应那条规则的

- 首先 `[].toString()` 会得到一个 `''` 字符串
- `![]` 得到一个布尔值 `false`
- `''` 与 `false` 比较肯定要转换成数字比较
- 那么 `''` 转换则为 `0`， `false` 转换也是 `0`
- 所以这道题就是 `true`

## 1..toString 的问题

有时候我们看到别人的代码中会写到数字调其他类型的方法的时候会写成 `1..toString()` 这样的写法

因为直接用整数型数字调方法就会报错，但是如果是一个浮点数的话就不会报错了

因为可能在 `.` 上面存在争议，一个数字后面加点，解释器他不知道你这是小数还是要调取方法，所以就跑异常了

```js
1.toString()     // Uncaught SyntaxError: Invalid or unexpected token
1..toString()    // '1'
1.2.toString()   // '1.2'
```

## 深拷贝问题

深拷贝问题一直是面试过程中被问到频率特别高的问题

拷贝分两种，浅拷贝和深拷贝，分别来实现一下

工作中遇到深拷贝的问题的话，我们一般会选择 `lodash` 库中的 `deepClone` 来处理

### 浅拷贝

浅拷贝很简单只要第一层地址不一样便可以

```js
// 可以直接使用 Es6 的 rest 语法实现
function copy(targte) {
  return { ...targte }
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
  sayHi: () => 'Hi'
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

## 数组的扁平化和增维

如下：一个多维数组，要求把数组扁平化成一个一维数组

```js
const arr = [1, 2, [21, 45, 88], 3, 4, [5, 6, [7, 8, [9, 11]]]]
// 结果：[ 1, 2, 21, 45, 88, 3, 4, 5, 6, 7, 8, 9, 11 ]
```

### 扁平化

- 扁平化有多种思路，我们可以直接暴力一点，直接用正则匹配所有的中括号然后替换为空

```js
const flatUseRegExp = arr => {
  const str = JSON.stringify(arr).replace(/\[|\]/g, '')
  return str.split(',').map(i => +i)
}
```

- 也可以更直接一点，利用数组 toString 之后会去掉所有括号直接处理

```js
const flatUseToString = arr => {
  return arr
    .toString()
    .split(',')
    .map(i => +i)
}
```

- 当然我们也可以规规矩矩的写递归，来解决这个问题

```js
const flat = arr => {
  let result = []
  arr.forEach(item => {
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

## 实现一个柯利化

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

## Generator

### 对象增加迭代器

类数组对象的特征：必须有长度、索引、能够被迭代，否则这个对象不可以使用 `...` 语法转数组，我们可以使用 Array.from 转，当然我们也可以给对象添加一个迭代器

```js
const obj = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  length: 4,
  [Symbol.iterator]() {
    let idx = 0
    return {
      next() {
        value: obj[idx],
        done: idx++ >= obj.length
      }
    }
  }
}
// 此时对象就被添加了迭代器
[...obj]  // 1 2 3 4
for (const val of obj) {
  console.log(val)  // 1 2 3 4
}
```

上面的问题可以字节使用生成器来实现，生成器返回一个迭代器，迭代器有 next 方法，调用 next 方法可以返回 value 和 done

```js
const obj = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  length: 4,
  [Symbol.iterator]: function* () {
    let idx = 0
    whele (idx !== this.length) {
      yield this[idx++]
    }
  }
```

### 实现一个字符串的迭代器

实现一个字符串的迭代器：传入一组字符串并返回单个字符的范例。一旦更新的字符串，输出也跟着替换掉旧的

```js
function generator(str) {
  let idx = 0
  return {
    next() {
      return {
        value: str[idx],
        done: idx++ >= str.length
      }
    }
  }
}
// 测试
const str = 'as'
let gen = generator(str)
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
gen = generator('str')
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
console.log(gen.next())
// { value: 'a', done: false }
// { value: 's', done: false }
// { value: undefined, done: true }
// { value: undefined, done: true }
// { value: 's', done: false }
// { value: 't', done: false }
// { value: 'r', done: false }
// { value: undefined, done: true }
```

### 简单模拟 co

模拟一下 co 的实现

首先来看一则例子

```js
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

function* read() {
  const name = yield readFile(path.resolve(__dirname, 'name.txt'), 'utf8')
  const age = yield readFile(path.resolve(__dirname, name), 'utf8')
  return age
}

const it = read()

let { value, done } = it.next()
value.then(data => {
  let { value, done } = it.next(data)
  // console.log(data, '???')
  value.then(data => {
    let { value, done } = it.next(data)
    console.log(value)
  })
})
```

使用 co 库可以很容易解决这个问题

```js
const co = require('co')
// co 接受一个生成器
co(read()).then(data => {
  console.log(data)
})
// 那模拟一下
function _co(it) {
  // 首先返回一个 promise
  return new Promise((resolve, reject) => {
    // 因为可以传值的原因，不可以直接使用循环实现，需要使用 递归
    function next(data) {
      const { value, done } = it.next(data)
      if (done) return resolve(value)
      // 保证值是一个 promise
      Promise.resolve(value).then(data => {
        next(data)
      }, reject)
    }
    next()
  })
}
```

## 使用 js 把一个字符串转出为一个 txt 文件

有个要求：纯前端实现，不可以使用 `node`

实现原理也很简单，就像我们平时下载一个本地文件一样，可以动态的创建一个可以下载的 `a` 标签，给它设置 `download` 属性，然后把下载的内容转 `blob` 创建下载链接下载即可

具体实现如下：

```js
function exportTxt(text, filename) {
  const eleLink = document.createElement("a");
  eleLink.download = filename;
  eleLink.style.display = "none";
  // 将内容转为 blob
  const blob = new Blob([text]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}
```

持续记录中...
