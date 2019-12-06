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

```js
// 关于对象
const obj = {}
// 所有对象都是Object的实例，
obj.__proto__ === Object.prototype
// 原型链终点
Object.prototype.__proto__ === null
obj.__proto__.__proto__ === null

// 关于函数
const bar = function() {}
// 所有的函数都是Function的实例，包括Function本身
bar.__proto__ === Function.prototype
// Function的原型继承了Object
Function.prototype.__proto__ === Object.prototype
// 原型链终点
Object.prototype.__proto__ === null

// Object是由Function构造的
Object.__proto__ === Function.prototype
// Function也是由Function构造的
Function.__proto__ === Function.prototype
Function.__proto__.__proto__ === Object.prototype
Function.prototype.__proto__ === Object.prototype
Function.__proto__.__proto__ === Function.prototype.__proto__
// 原型链终点
Object.prototype.__proto__ === null

// 函数也是对象的实例
Function instanceof Object
Object instanceof Function
Function instanceof Function
```

- 根据上面的代码，我们可以得到一些结论

  - 根据（`obj.__proto__ === Object.prototype`）得出所有的对象都有 `__proto__` 属性
  - 根据（`obj.__proto__ === Object.prototype`）还可以得出所有的对象都是 `Object` 的实例
  - 根据（`bar.__proto__ === Function.prototype`）得出函数也是有 `__proto__` 属性
  - 根据（`Function instanceof Object 和 Function.__proto__.__proto__ === Object.prototype`）得出函数也是对象（js 一切皆对象还是有点道理的），`Function` 也是 `Object` 的实例
  - 而 `prototype` 是函数的属性，对象是没有的，所以说函数也是对象，但是函数却不包括对象，但是可以构造对象
  - 根据（`bar.__proto__ === Function.prototype`）得出，所有的函数都是由 `Function` 构造出来的，所有的函数都是 `Function` 的实例
  - 根据（`Function.__proto__ === Function.prototype`）得出， `Function` 也是 `Function` 的实例，更加证明了上句话
  - 根据（`Object.__proto__ === Function.prototype`）得出，上句话是正确的....
  - 根据（`Function instanceof Object`）得出，函数是对象的实例
  - 根据（`Object instanceof Function`）得出，对象也是函数的实例
  - 总结出来就是这么几句话
    1. 所有的对象都是 `Object` 的实例
    2. 函数也是对象
    3. 所有的函数都是 `Function` 的实例，包括 `Function` 本身，当然也包括 `Object` 这个构造函数
    4. `Object` 也是 `Function` 的实例，`Function` 也是 `Object` 的实例

### 误区

一直以来我都以为 `对象的 __proto__` 和 `函数的 prototype` 属性都指向一个对象

```js
// 比如说
function F() {}
const f = new F()
typeof f.__proto__ === 'object'
typeof F.prototype === 'object'
// f.__proto__ 是一个对象，F.prototype 是一个对象
```

但是今天在群里为群友指点原型相关的知识的时候，有个群友说，`Function.prototype` 是一个函数不是一个对象，然后我才去试了一下才发现我错了

```js
typeof Function.prototype === 'function' // true
typeof Function.__proto__ === 'function' // true
typeof Object.__proto__ === 'function' // true
```

## 继承

### 原型链继承

::: tip 原型链继承
&emsp; 原型链继承的核心是 `把子类的 prototype 对象的 设置为 父类的实例`
:::

```js {4}
function Parent() {}
function Child() {}
// 继承的关键
Child.prototype = new Parent()
```

**特点和缺点：**

- 父类属性和方法可以被复用（优点）
- 每个实例对 `引用类型属性` 的修改都会被其他的实例共享
  - 不会对父类的属性造成影响，`自身属性或方法与原型链上相同会屏蔽原型链上的属性或方法`
- 每个实例对 `非引用类型属性` 的修改不会影响其他实例
- 子类会丢失自身的 `构造函数`
- 在创建 `Child` 实例的时候，无法向 `Parent` 传参。这样就会使 `Child` 实例没法自定义自己的属性

```js
function Parent() {
  this.name = 'inherit'
  this.colors = ['red', 'green']
}
Parent.prototype.sayName = function() {
  return this.name
}
function Child() {}
// 继承的关键
Child.prototype = new Parent()
// 原型链继承会让子类丢失构造函数，所以让构造函数指向自身
Child.prototype.constructor = Child
const c1 = new Child()
const c2 = new Child()
const p = new Parent()
// 子类修改 引用类型
c1.colors.push('blue')
// 子类修改 非引用类型属性
c1.name = '哈哈哈'
console.log(c1.name, c2.name) // 哈哈哈，inherit
console.log(c1.colors, c2.colors) // ['red', 'green', 'blue']，['red', 'green', 'blue']
// 子类修改引用类型不会对父类造成影响
console.log(p.colors) // ['red', 'green']
console.log(c1.sayName === p.sayName) // true
```

### 借用构造函数

::: tip 借用构造函数
&emsp; 借用构造函数，也是经典继承，也叫作类式继承，核心是 `在子类中执行父类构造函数，并且绑定this到子类上`，此时就会把父类函数的内容复制了一份到子类。这也是所有继承中唯一用不到 `prototype` 的继承
:::

```js {6}
function Parent(name) {
  this.name = name
}
function Child(name) {
  // 继承关键
  Parent.call(this, name)
}
```

**特点和缺点：**

- 解决了每个实例对引用类型属性的修改都会被其他的实例共享的问题（优点）
  - 子类之间不会在受对方的影响了
- 子类可以向父类传参（优点）
- 子类不会在丢失自己的构造函数了
- 父类的方法不能复用，每次子类构造实例都得执行一次父类函数（缺点）

```js
function Parent(name) {
  this.name = name
  this.colors = ['red', 'green']
}
Parent.prototype.sayName = function() {
  return this.name
}
function Child(name) {
  Parent.call(this, name)
}
// 子类可以传参
const c1 = new Child('小铭')
const c2 = new Child('小白')
const p = new Parent('父亲')
// 子类修改 引用类型
c1.colors.push('blue')
// 子类修改 非引用类型属性
c1.name = '哈哈哈'
console.log(c1.name, c2.name) // 哈哈哈，小白
console.log(c1.colors, c2.colors) // ['red', 'green', 'blue']，['red', 'green']
console.log(p.colors) // ['red', 'green']
// 父类的方法不能复用了
console.log(c1.sayName()) // Uncaught TypeError: c1.sayName is not a function
```

### 组合继承

::: tip 组合继承
&emsp; 组合继承，就是融合了原型链继承和借用构造函数两种方法，充分发挥两者的优势
:::

```js
function Parent(name) {
  this.name = name
}
Parent.prototype.sayName = function() {
  return this.name
}
function Child(name) {
  // 融合两种继承继承写法
  Parent.call(this, name)
}
// 融合两种继承继承写法
Child.prototype = new Parent()
Child.prototype.constructor = Child
```

**特点和缺点：**

- 解决了每个实例修改引用类型会影响到其他子类的问题
- 子类可以向父类传参
- 可以实现父类方法的复用
- 需执行两次父类构造函数（缺点）
  - 一是 `Child.prototype = new Parent()`
  - 二是 `Parent.call(this, name)`
  - 造成不必要的浪费

```js
function Parent(name) {
  this.name = name
  this.colors = ['red', 'green']
}
Parent.prototype.sayName = function() {
  return this.name
}
function Child(name) {
  Parent.call(this, name)
}
Child.prototype = new Parent()
Child.prototype.constructor = Child
const c1 = new Child('小铭')
const c2 = new Child('小白')
const p = new Parent('父亲')
// 修改子类的引用属性
c1.colors.push('blue')
console.log(c1.colors, c2.colors) // ['red', 'green', 'blue']，['red', 'green']
console.log(p.colors) // ['red', 'green']
console.log(p.colors === c2.colors) // false
console.log(c1.sayName()) // 小铭
```

### 原型式继承

::: tip 原型式继承
&emsp; 原型式继承最初由道格拉斯·克罗克福德于 2006 年在一篇题为 《Prototypal Inheritance in JavaScript》(JavaScript 中的原型式继承) 的文章中提出. 他的想法是借助原型可以基于已有的对象创建新对象， 同时还不必因此创建自定义类型 <br/>
&emsp; 核心：在函数内部先创建一个临时性的构造函数，然后将传入的参数作为这个构造函数的原型，最后返回这个临时构造函数的实例
:::

> 原型式继承最初由道格拉斯·克罗克福德于 2006 年在一篇题为 《Prototypal Inheritance in JavaScript》(JavaScript 中的原型式继承) 的文章中提出. 他的想法是借助原型可以基于已有的对象创建新对象， 同时还不必因此创建自定义类型 <br/>
> 核心：在函数内部先创建一个临时性的构造函数，然后将传入的参数作为这个构造函数的原型，最后返回这个临时构造函数的实例

```js
// 该函数接受一个原型作为参数
function create(o) {
  // 临时性构造函数
  const F = function() {}
  F.prototype = o
  return new F()
}
```

- 在 **Es5** 中新增了 `Object.create()` 方法规范了原型式继承。
- `Object.create()` 接受两个参数
  - 一是，继承的对象（一般传入一个原型）
  - 二是，拓展的对象（可选）

**特点和缺点：**

- 父类方法可以复用（优点）
- 父类的引用属性会被所有子类所共享，并且子类会修改父类的引用属性（同一个引用地址）
- 子类不能向父类传参

```js
function create(o) {
  const F = function() {}
  F.prototype = o
  return new F()
}
const parent = {
  name: 'inherit',
  colors: ['red', 'green']
}
const o1 = create(parent)
// 自己本身没有，那么修改的是原型链上的引用
o1.colors.push('blue')
o1.name = '小铭'
const o2 = create(parent)
console.log(o1, o2) // F {name: "小铭"}，F {}
console.log(o1.colors === o2.colors) // true
console.log(o1.colors === parent.colors) // true
console.log(o1.__proto__.colors === parent.colors) // true
console.log(o1.colors) // ['red', 'green', 'blue']
```

### 寄生式继承

::: tip 寄生式继承
&emsp; 寄生式继承，也被叫做寄生增强对象，就是在原型继承的基础上，增强对象，返回构造函数
:::

```js {4}
  function createEnhance(o) {
    const obj = Object.create(o)
    // 增强对象
    obj.sayHi = function() { return 'hi }
    return obj
  }
```

- 寄生式继承仅提供一种思路，没什么优点
- 使用寄生式继承来为对象添加函数, 会由于不能做到函数复用而降低效率；这一点与构造函数模式类似。

### 寄生组合继承

::: tip 寄生组合继承
&emsp; 组合继承的时候，会调用两次父类的构造函数造成浪费，此时寄生组合式继承就完全可以解决这个问题
:::

```js
/**
 * @param {子类构造函数} child
 * @param {父类构造函数} parent
 */
function inheritPrototype(child, parent) {
  // 创建一个临时构造函数
  const F = function() {}
  // 临时类原型对象执向父类的原型对象
  F.prototype = parent.prototype
  // 子类原型指向 临时类的实例
  child.prototype = new F()
  // 为子类绑定构造函数
  child.prototype.constructor = child
}
// Es5 写法
function extend(child, parent) {
  child.prototype = Object.create(parent.prototype)
  child.prototype.constructor = child
}
```

- 这是最成熟的方法，也是现在库实现的方法

### Es6 继承 extends

::: tip Es6 继承
&emsp; Es6 继承的结果跟寄生组合继承相似，可以说是寄生组合继承的语法糖。<br>
&emsp; 但是，寄生组合继承是先创建子类实例对象，然后对其增强；<br>
&emsp; Es6 继承是先将父类实例对象的属性和方法，加到 `this` 上面（所以必须先调用 `super` 方法），然后在对子类构造函数修改 `this`
:::

```js
class Parent {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  sayName() {
    return this.name
  }
}
class Child extends Parent {
  constructor(name, age) {
    // super作为函数来用，相当于构造函数（Parent.call(name)）
    super(name, age)
    // super当做对象来用，相当于此时的this
    console.log(super.sayName()) // '小铭'
    super.sex = 'male'
  }
}

const p = new Parent('父亲', 46)
const c = new Child('小铭', 24)
console.log(c, c.sex) //  Child { name: '小铭', age: 24, sex: 'male' }，'male'
```

- 持续记录中...
