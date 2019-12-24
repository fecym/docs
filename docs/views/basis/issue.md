---
title: 小技巧
date: 2019-12-14
tags:
  - issue
  - 基础
---

# 记录日常遇到的小技巧以及一些问题

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

持续记录中...
