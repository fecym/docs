---
title: 小技巧
date: 2019-12-14
tags:
  - issue
  - 基础
---

# 记录一些工作遇到的小技巧

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
