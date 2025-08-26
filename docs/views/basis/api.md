---
title: 常用api的实现
date: 2019-10-27
tags:
  - 基础
---

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
  const obj = {};
  // 取得构造函数
  const F = [].shift.call(arguments);
  // 链接到了原型
  obj.__proto__ = F.prototype;
  // 绑定this，执行构造函数
  const result = F.apply(obj, arguments);
  // 看看构造函数返回了什么
  if (typeof result !== null && (typeof result === 'object' || typeof result === 'function')) {
    return result;
  }
  return obj;
}
```

## instanceof 实现

> 实现了一个 `new` 是不是也得判断一下，那我们来实现一个 `instanceof`

- `instanceof` 都做了什么事？
- `instanceof` 是拿着左边实例的 `__proto__` 与右边构造函数的 `prototype` 进行对比的
- 尝试着实现下

```js
function instance(L, R) {
  if (L.__proto__ === null) {
    return false;
  }
  if (L.__proto__ === R.prototype) {
    return true;
  }
  return instance(L.__proto__, R);
}
instance(p, Function); // false
instance(Function, Object); // true >> Function.__proto__.__proto__ === Object.prototype
```

还有种写法是直接把`L.__proto__` 直接赋值为 `L.__proto__.__proto__`，但是这样写会影响到原型，导致如果查询不到则会抛出异常，不推荐下面的写法

```js
function instance(L, R) {
  while (true) {
    if (L.__proto__ === null) {
      return false;
    }
    if (L.__proto__ === R.prototype) {
      return true;
    }
    L.__proto__ = L.__proto__.__proto__;
  }
}
```

## call 和 apply

::: tip call 和 apply
我们都知道 `js` 的函数中 `this` 是动态的，不同执行上下文会导致 `this` 执行不同的地方，总得来说 `this` 执行有四种情况

- 函数自执行，`this` 执行指向 `window`
- 谁打点调用函数，`this` 指向这个 `谁`，也就是 . 前面的那个对象
- `call` 和 `apply` 的硬绑定 `this`
- 函数加 `new` 关键字后，`this` 执行该构造函数的实例

那么第三条第四条规则为什么就会改变 `this` 执行，其实说白了函数中 `this` 应该都遵循 `1、2` 两条规则，`3、4` 其实都是在底层实现了，让其 `this` 执行了我们想要指向的地方，比如说 `new` 关键字，我们在本文的第一个 `api` 中就讲了他的实现，他是利用 `apply` 或者 `call` 来绑定上去的，这里我们来讲下 `call` 和 `apply` 的实现
:::

### 实现 call 和 apply

> `call` 和 `apply` 两者很像除了传递的参数不同，一个是传递的是值，一个传递的是一个数组

```js
// call
Function.prototype.call2 = function(context = window) {
  // example：fnA.call(obj, 1)
  context.fn = this;
  const args = [...arguments].slice(1);
  // 执行 context.fn(...args) 此时就相当于 obj.fnA(1)
  const result = context.fn(...args);
  delete context.fn;
  return result;
};
// apply
Function.prototype.apply2 = function(context = window) {
  context.fn = this;
  let result;
  // 看是否有第二个参数，也可以不传参数
  if (arguments[1]) {
    // 因为传递过来的是一个数组，所以要解构一下
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
};
```

::: warning 解释 call 实现原理
举个栗子： `fnA.call(obj, 1)` <br/>
call2 函数 第一个参数是要绑定的对象（obj）<br/>
我们根据谁打点调用函数 `this` 执行谁，我们在这个对象中新增一个属性 `fn`，给它赋值为此时的 **~~this~~** <br/>
那么就相当于 给我们传进来的 `obj` 新增一个属性 `fn`，让他等于这个 **~~this~~** <br/>
因为 `call2` 是定义在函数的原型的对象上的，那么此时这个 **~~this~~** 就是 调用 `call2` 方法函数的实例，也就是 **~~fnA~~** <br/>
也就是说 `context.fn` 就相当于 给 `obj` 新增了一个属性 `fn（fnA）`然后 `obj.fn` 执行了，那么谁打点调用 `this` 执行谁，此时 `this` 指向了 这个 `obj` <br/>
这就是 `call` 方法实现的基本思路 <br/>
<font size=2 >
<font color=red>注：</font>字体加粗并且有删除的 **~~this~~** 是 在 call 函数中的 this；有背景底色的 `this` 指的是我们绑定后的 this
</font>
:::

### 一道有趣的面试题

曾看到这么一道面试题：

```js
const arrayLike = {};
[].push.call(arrayLike, 1);
console.log(arrayLike); // { 0: 1, length: 1 }
// 接下来我们改成这样
const call = [].push.call;
call(arrayLike, 1);
console.log(arrayLike);
// 此时会打印什么？
// 答案是会报错，call is not a function
// 为什么？给自己一个思考问题的机会吧
```

## bind

### bind 用法

> bind 用法和 call 很类似，但是 bind 不会立即执行函数，而是返回一个绑定了 this 的新函数

```js
const obj = { name: 'cym' };
function fn(age) {
  console.log(this.name + '今年' + age + '岁了');
}
// 如上代码，我们要让 this 指向 obj
const bindFn = fn.bind(obj);
bindFn(24); // cym今年24岁了
```

### 基本功能的实现

根据上面的用法，我们不难 `bind` 的方法不仅可以绑定 `this` 还可以绑定参数，我们来简单实现一下

```js
Function.prototype.bind2 = function(ctx = globalThis) {
  // 取到我们要绑定的参数
  const args = [...arguments].slice(1);
  // 缓存 this，因为返回一个函数 this 就会变成新的函数
  const that = this;
  // 返回一个函数
  return function() {
    // 返回函数里面的 arguments 是返回函数传入的参数哦，别搞混了
    that.apply(ctx, args.concat([...arguments]));
  };
};
```

### 返回函数作为构造函数

`bind` 方法的实现其实蛮有意思的，因为 `bind` 方法返回一个函数，那么返回的这个函数如果被当做构造函数怎么办

```js
const obj = { name: 'cym' };
function fn() {
  console.log(this);
}
// 如上代码，我们要让 this 指向 obj
const bindFn = fn.bind(obj);
const instance = new bindFn(24); // fn {}
```

根据上面的代码返回结果来看，我们发现当绑定的函数作为构造函数来用的话，`this` 指向了原来的函数的实例，那么我们来实现一下完整的 `bind` 方法

```js
Function.prototype.bind2 = function(ctx = globalThis) {
  // 取得参数
  const args = [...arguments].slice(1);
  // 取得函数
  const that = this;
  // 要返回一个函数,还要判断是否有进行实例化的操作
  function Fn() {
    const allArgs = args.concat([...arguments]);
    // 如果被实例化了
    if (this instanceof Fn) {
      that.apply(this, allArgs);
    } else {
      that.apply(ctx, allArgs);
    }
  }
  // 但是我们需要保证原型不能丢失，还得是原来函数的实例
  // 这种写法可能不雅观，因为直接让两个原型指向了同一个地址，一般情况下我们会使用一个临时性构造函数来处理一下
  // Fn.prototype = this.prototype
  Fn.prototype = Object.create(this.prototype);
  // 返回这个绑定好 this 的函数
  return Fn;
};
```

来看下用法

```js
const obj = { name: 'cym' };
function fn() {
  console.log(this);
}
// 如上代码，我们要让 this 指向 obj
const bindFn = fn.bind2(obj);
const instance = new bindFn(); // fn {}
bindFn(); // {name: 'cym'}
```

## 柯利化

柯利化的核心是：`只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数`

比如说实现一个 add 函数

```js
const addFn = (a, b, c, d, e) => {
  return a + b + c + d + e;
};
const add = curry(addFn);
add(1)(2)(3)(4, 5); // 15
add(1)(2)(3, 4, 5); // 15
add(1, 2, 3)(4, 5); // 15
```

面试要求就是实现这么一个函数

```js
function curry(fn, ...args) {
  // 如果参数大于等于了要改变函数的参数了，那么直接执行就可以了
  if (args.length >= fn.length) {
    return fn(...args);
  }
  // 否则就返回一个函数，函数把所有参数都累积到一起
  return function(...args2) {
    return curry(fn, ...args, ...args2);
  };
}
```

## Number.isNaN

`NaN` 是一个特殊值，他和自身不相等，是一个非自反值（自反，reflexive，即 x === x 不成立）的值。但是 `NaN != NaN` 为 `true`

```js
// 根据此特性我们可以实现一下 Number.isNaN
if (!Number.isNaN) {
  Number.isNaN = function(n) {
    return n !== n;
  };
}
// 也可以使用window.isNaN来实现
if (!Number.isNaN) {
  Number.isNaN = function(n) {
    // window.isNaN(n) 不判断数据类型
    return typeof n === 'number' && window.isNaN(n);
  };
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
      return 1 / v1 === 1 / v2;
    }
    // 判断是否是 NaN
    if (v1 !== v1) {
      return v2 !== v2;
    }
    // 其他情况
    return v1 === v2;
  };
}
```

Object.is 主要用来处理一些特殊情况的，所以效率并不是很高，能使用 `==` 或 `===` 尽量使用。

## 防抖和节流

> scroll 事件本身会触发页面的重新渲染，同时 scroll 事件的 handler 又会被高频度的触发, 因此事件的 handler 内部不应该有复杂操作，例如 DOM 操作就不应该放在事件处理中。针对此类高频度触发事件问题（例如页面 scroll ，屏幕 resize，监听用户输入等），有两种常用的解决方法，防抖和节流。

### 防抖

> 每次触发高频事件都取消上次的延时操作

```js
function debounce(fn, delay) {
  let timer = null;
  return function() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}
```

### 节流

> 每次执行函数先判断是否有还在等待执行的函数，若没有则执行

```js
function throttle(fn, delay) {
  let canRun = true;
  return function() {
    if (!canRun) return;
    canRun = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      canRun = true;
    }, delay);
  };
}
// 测试
var a = 0;
setInterval(
  throttle(() => {
    a++;
    console.log(a);
  }, 2000),
  500
);
```

## mixins 实现

```js
function mixins() {
  const target = [].shift.call(arguments, 1);
  const args = arguments;
  for (let i = 0, len = args.length; i < len; i++) {
    if ([].toString.call(args[i]) !== '[object Object]') throw 'The argument must be an object';
    for (let key in args[i]) {
      if (!(key in target)) {
        target[key] = args[i][key];
      }
    }
  }
  return target;
}
```

## 深浅拷贝

深拷贝问题一直是面试过程中被问到频率特别高的问题

拷贝分两种，浅拷贝和深拷贝，分别来实现一下

工作中遇到深拷贝的问题的话，我们一般会选择 `lodash` 库中的 `deepClone` 来处理

### 浅拷贝

浅拷贝很简单只要第一层地址不一样便可以

```js
// 可以直接使用 Es6 的 rest 语法实现
function copy(target) {
  return { ...target };
}
// 也可以使用 for in 实现
function copy(target) {
  const result = {};
  for (let key in target) {
    result[key] = target[key];
  }
  return result;
}
```

### 深拷贝

深拷贝要求所有引用类型的地址都不是一个地址都是复制的值，那可以考虑使用递归来实现

```js
function deepClone(target) {
  if (typeof target !== 'object') return target;
  const result = Array.isArray(target) ? [] : {};
  for (let key in target) {
    result[key] = deepClone(target[key]);
  }
  return result;
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
  sayHi: () => 'Hi',
};
// 循环引用
obj.obj = obj;

// 可以使用 Map 对象对一层比较即可处理这个问题
function clone(target, map = new Map()) {
  if (typeof target !== 'object') return target;
  if (map.get(target)) return map.get(target);
  const result = Array.isArray(target) ? [] : {};
  map.set(target, result);
  for (let key in target) {
    result[key] = clone(target[key], map);
  }
  return result;
}
```

## Emitter

- `node` 事件流基本是基于发布订阅模式来实现的监听的（观察者和发布订阅介绍，看[这里](/views/basis/issue.html#观察者与发布订阅)），尝试着实现下
- 里面有几个常用的方法，一个订阅事件，一个发布事件，一旦发布事件触发订阅者执行相应的回调

```js
class Emitter {
  handlers = {}

  on(type, fn) {
    if (!this.handlers[type]) {
      this.handlers[type] = []
    }
    this.handlers[type].push(fn)
  }

  emit(type, ...args) {
    if (!this.handlers[type]) return
    const fns = this.handlers[type]
    for (let i = 0; i < fns.length; i++) {
      fns[i](...args)
    }
  }

  off(type, fn) {
    if (!this.handlers[type]) return
    const fns = this.handlers[type]
    let res;
    // 要倒着循环, 否则会丢项
    for (let i = fns.length - 1; i >= 0; i--) {
      if (fns[i] === fn) {
        res = fns.splice(i, 1)
        break
      }
    }
  }

  rm(type) {
    if (!this.handlers[type]) return
    delete this.handlers[type]
  }

  once(type, fn) {
    const wrapper = (...args) => {
      fn(...args)
      this.off(type, wrapper)
    }
    this.on(type, wrapper)
  }
}
```

- 持续更新中....
