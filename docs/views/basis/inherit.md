---
title: 继承
date: 2019-10-16
tags:
  - 继承
  - 基础
---

# 继承

> 继承是一个老生常谈的问题，因为它的晦涩难懂，且它又是前端基础的重中之重。本篇文章将围绕着我所遇到的继承以及我所认识的理解的继承做一下记录。

## 原型

### 野史

> 根据野史记载，**Brendan Eich** 用了一周的时间创造了今天的 **JavaScript**，当 **Brendan Eich** 在为 **JavaScript** 设计面向对象系统时，借鉴了 **Self** 和 **Smalltalk** 这两门基于原型的语言。而且 **Brendan Eich** 一开始就没有打算在 **JavaScript** 中加入类的概念，所以 **JavaScript** 是一门基于原型的语言。在原型编程的思想中，类并不是必须的，对象未必需要从类中创建而来，一个对象是通过另一个对象而得到的。

- 在曾探的《设计模式》中提到 **JavaScript** 中的原型继承会遵循以下这些原型编程的基本规则：
  - 所有的数据都是对象
  - 要得到一个对象，不是通过实例化类，而是找到一个对象为原型并克隆它
  - 对象会记住他的原型
  - 如果无法响应某个请求，它会把这个请求委托给它自己的原型

### 原型是什么？

- 我们知道在 **JavaScript** 中创建一个对象可以使用构造函数语法（通过 `new` 调用的函数通常被称为构造函数）来创建一个新的对象，如下

```js
function Person(name) {
  this.name = name
}
// 创建一个新对象
var person = new Person('cym')
```

- 这和一般面向对象编程语言中创建对象的语法很类似，但是 `new` 后面跟的不是类，而是构造函数。在面向对象语言中这样创建的对象除了属性一样外，并没有其他的任何联系，对象之间无法共享属性和方法。每当我们新建一个对象时，都会方法和属性分配一块新的内存，这是极大的资源浪费。
- 考虑到这一点，**JavaScript** 的设计者 **Brendan Eich** 决定为构造函数设置一个属性。
- 这个属性指向一个对象，所有实例对象**需要共享的属性和方法**，都放在这个对象里面，那么**不需要共享的属性和方法**就放在构造函数里面。实例一旦被创建，就会自动引用这个对象的属性和方法。
- 实例对象的属性和方法，分为两种，一种是本地的不共享的，一种是引用的共享的，这个对象就是原型对象，简称原型

### 自己的理解

- 所有的对象都拥有 `__proto__` 属性，指向一个对象，一个对象就意味着拥有一个 `__proto__` 属性
- 所有的函数都拥有 `prototype` 属性，指向自己的原型对象
```js
  const obj = {}
  // 所有对象都是Object的实例，
  obj.__proto__ === Object.prototype
  const bar = function() {}
  // 所有的函数都是Function的实例，包括Function本身
  bar.__proto__ === Function.prototype
  Function.__proto__ === Function.prototype
  // Function的原型继承了Object
  Function.prototype.__proto__ === Object.prototype
  // Object是由Function构造的
  Object.__proto__ === Function.prototype
```
- 持续记录中...
