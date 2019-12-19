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
  (() => 1).length === 0  // 输出什么
```

我所理解的拥有 `length` 的对象一般都是数组或者类数组对象，或者定义了 `length` 属性的对象，所以我回答说这个应该是 `false` 吧，后来面试告诉我函数是有 `length` 属性的，函数的 `length` 属性就是函数参数的个数，瞬间我恍然大悟，函数的参数就是 `arguments`，而 `arguments` 也是一个类数组对象所以他是有 `length` 属性的

```js
  // so
  (() => 1).length === 0  // 输出 true
  (a => a).length         // 输出 1
```

持续记录中...
