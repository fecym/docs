---
title: 面试题记录
date: 2021-08-04
tags:
  - interview
  - 基础
---

## 1. 关于函数的 length 属性

360 面试过程遇到一个很有趣的问题，是关于函数的 length 属性的，题简写如下

```js
(() => 1).length === 0; // 输出什么
```

我所理解的拥有 `length` 的对象一般都是数组或者类数组对象，或者定义了 `length` 属性的对象，所以我回答说这个应该是 `false` 吧，后来面试告诉我函数是有 `length` 属性的，函数的 `length` 属性就是函数参数的个数，瞬间我恍然大悟，函数的参数就是 `arguments` ，而 `arguments` 也是一个类数组对象所以他是有 `length` 属性的

```js
// so
(() => 1).length === 0; // 输出 true
(a => a).length; // 输出 1
```

## 2. 数组中字符串键值的处理

在 JavaScript 中数组是通过数字进行索引，但是有趣的是他们也是对象，所以也可以包含 `字符串` 键值和属性，但是这些不会被计算在数组的长度（length）内

如果字符串键值能够被强制类型转换为十进制数字的话，它就会被当做数字索引来处理

```js
const arr = [];
arr[0] = 1;
arr['1'] = '嘿嘿';
arr['cym'] = 'cym';
console.log(arr); // [1, '嘿嘿', cym: 'cym']
console.log(arr.length); // 2
```

## 3. 类型转换问题

原题：如何让 (a == 1 && a == 2 && a == 3) 的值为 true?

这个问题考查的数据类型转换， `==` 类型转换有个基本规则

- `NaN` 与任何值都不相等，包括自己本身
- `undefined` 与 `null` 相等(==)，其他都不等
- 对象与字符串类型做比较，会把对象转换成字符串然后做比较
- 其他类型比较都要转换成 `数字` 做比较

那么这个问题我们重写 `toString` 或者 `valueOf` 方法就可以了

```js
const a = {
  val: 1,
  toString() {
    return this.val++;
  },
};
if (a == 1 && a == 2 && a == 3) {
  console.log('ok');
}
```

还有一种方法实现

```js
var i = 1;
Object.defineProperty(window, 'a', {
  get() {
    return i++;
  },
});

if (a == 1 && a == 2 && a == 3) {
  console.log('OK');
}
```

### 拓展一下 [] == ![] 为什么是 true

上面隐式类型转换规则中提到，其他类型比较都要转换成数字做比较，这个就是对应那条规则的

- 首先 `[].toString()` 会得到一个 `''` 字符串
- `![]` 得到一个布尔值 `false`
- `''` 与 `false` 比较肯定要转换成数字比较
- 那么 `''` 转换则为 `0`， `false` 转换也是 `0`
- 所以这道题就是 `true`

## 3. 如何让 (a == 1 && a == 2 && a == 3) 的值为 true

- 这是一道经典的面试题，主要考察是数据类型转换，我们重写 toString 或者 valueOf 方法即可解决

```js
const n = {
  i: 1,
  toString() {
    return n.i++;
  },
  // 两个写一个即可
  valueOf() {
    return n.i++;
  },
};

if (n == 1 && n == 2 && n == 3) {
  console.log('通过');
}
```

- 当然也有其他解决技巧

```js
const n = 0;
!(n == 1 && n == 2 && n == 3); // true
```

- 利用数组 `toString` 方法会调用本身的 `join` 方法，这里把自己的 `join` 方法改写为 `shift` 方法，每次返回第一个元素，而且每次数组删除第一个值，正好可以使判断成立。

```js
var n = [1, 2, 3];
n.join = n.shift;
if (n == 1 && n == 2 && n == 3) {
  console.log('通过');
}
```

## 4. jsonp

当出现端口、协议、域名三者有一个不一样的时候就会出现跨域，跨域解决方案很多，这里实现一个 jsonp

`jsonp` 是利用 `script、img、iframe、link` 等带有的 `src` 属性请求可以跨域加载资源，而不受同源策略的限制。 每次加载时都会由浏览器发送一次 GET 请求，通过 `src` 属性加载的资源

```js
// callbackName 要与后端返回的一致
function jsonp(url, query, callbackName = 'getData') {
  return new Promise((resolve, reject) => {
    const scriptEl = document.createElement('script');
    const queryObj = parseQuery(query);
    const onDone = () => {
      delete window[callbackName];
      document.body.removeChild(scriptEl);
    };
    url += `?callback=${callbackName}${queryObj && '&' + queryObj}`;
    scriptEl.src = url;
    window[callbackName] = res => {
      onDone();
      if (res) {
        resolve(res);
      } else {
        reject('没有获取到数据');
      }
    };
    scriptEl.onerror = () => {
      onDone();
      reject('脚本加载失败');
    };
    document.body.appendChild(scriptEl);
  });
}

function parseQuery(query) {
  let queryStr = '';
  for (const key in query) {
    if (Object.hasOwnProperty.call(query, key)) {
      queryStr += `${key}=${query[key]}&`;
    }
  }
  return queryStr.slice(0, -1);
}

// 使用
jsonp('http://localhost:3000/getData', {
  a: 1,
  b: 2,
})
  .then(res => {
    console.log('🚀 ~ jsonp ~ res', res);
  })
  .catch(err => {
    console.log('🚀 ~ jsonp ~ err', err);
  });
```

## 5. 图片懒加载

工作中经常会用到图片，当图片过多的时候，通常会做懒加载优化加载请求，懒加载就是优先加载可视区域内的内容，其他部分等进入了可视区域内在去加载

图片懒加载的原理很简单，需要做到两点即可实现：

1. 图片是否要加载取决于它的 `src` 属性。在初始化的时候我们不给图片设置 src 属性，而给一个其他属性设置图片的真实地址，当图片需要加载时候在给图片的 `src` 设置属性，此时就可以做到懒加载

2. 当图片进入可视区域的时候，我们就需要加载图片了。可视区域就是当图片元素的相对于 `可视区域的高度` 小于 `可视区域的高度` 的时候说明元素进入视口了

### 可视区域高度

可是区域就是浏览器中我们可以看见的高度，可以使用 `window.innerHeight` 或者 `document.documentElement.clientHeight` 获取到

当元素 `顶边距离` 距离小于 `可视窗口` 时说明元素要进入可视区域了

### getBoundingClientRect

`element.getBoundingClientRect()` 返回值是一个 DOMRect 对象，这个对象是由该元素的 getClientRects() 方法返回的一组矩形的集合，就是该元素的 CSS 边框大小。返回的结果是包含完整元素的最小矩形，并且拥有 left, top, right, bottom, x, y, width, 和 height 这几个以像素为单位的只读属性用于描述整个边框。除了 width 和 height 以外的属性是 `相对于视图窗口的左上角` 来计算的。

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/img-lazy-load-rect.png')" height="260" />
</p>

我们可以用这个 api 来获取图片相对于可视区域左上角的高度，它永远是个相对高度，此时可以写一个是否进入可视区域的方法

```js
const viewHeight = window.innerHeight || document.documentElement.clientHeight;

function isInViewport(el) {
  const { top } = el.getBoundingClientRect;
  return top <= viewHeight;
}
```

对于滚动这种高频事件我们一般都会做防抖处理，连续触发后只执行最后一次

```js
function debounce(fn, delay = 500) {
  let timer;
  return function(...args) {
    if (timer) clearTimeout(timer);
    setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

贴上完整代码

```js
const viewHeight = window.innerHeight || document.documentElement.clientHeight;
// 是否满足加载条件
function isInViewport(el) {
  const { top } = el.getBoundingClientRect();
  return top <= viewHeight;
}

// 防抖处理
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    if (timer) clearTimeout(timer);
    setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 图片加载个数
let count = 0;

// 懒加载核心
function lazyLoad() {
  const imgs = document.getElementsByTagName('img');
  const len = imgs.length;
  for (let i = 0; i < len; i++) {
    const el = imgs[i];
    if (isInViewport(el)) {
      const src = el.getAttribute('data-src');
      if (src) {
        el.src = src;
        el.removeAttribute('data-src');
        if (++count === len) {
          // 图片都加载完成后移除事件
          removeEvent();
        }
      }
    }
  }
}

// 防抖处理懒加载函数，方便移除事件监听
function debounceLazyLoad() {
  return debounce(lazyLoad, 500)();
}

// 绑定事件函数
function bindEvent() {
  // 页面加载完成执行一次
  window.addEventListener('load', debounceLazyLoad);
  // 绑定滚动事件
  document.addEventListener('scroll', debounceLazyLoad);
}
// 满足条件后移除事件
function removeEvent() {
  window.removeEventListener('load', debounceLazyLoad);
  document.removeEventListener('scroll', debounceLazyLoad);
}
// 绑定事件
bindEvent();
```

## 6. Generator 问题

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
                return {
                    value: obj[idx],
                    done: idx++ >= obj.length,
                }
            }
        }
    }
}
// 此时对象就被添加了迭代器
[...obj] // 1 2 3 4
for (const val of obj) {
    console.log(val) // 1 2 3 4
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
        [Symbol.iterator]: function*() {
            let idx = 0
            while (idx !== this.length) {
                yield this[idx++]
            }
        }
```

### 实现一个字符串的迭代器

实现一个字符串的迭代器：传入一组字符串并返回单个字符的范例。一旦更新的字符串，输出也跟着替换掉旧的

```js
function generator(str) {
  let idx = 0;
  return {
    next() {
      return {
        value: str[idx],
        done: idx++ >= str.length,
      };
    },
  };
}
// 测试
const str = 'as';
let gen = generator(str);
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
gen = generator('str');
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());
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
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

function* read() {
  const name = yield readFile(path.resolve(__dirname, 'name.txt'), 'utf8');
  const age = yield readFile(path.resolve(__dirname, name), 'utf8');
  return age;
}

const it = read();

let { value, done } = it.next();
value.then(data => {
  let { value, done } = it.next(data);
  // console.log(data, '???')
  value.then(data => {
    let { value, done } = it.next(data);
    console.log(value);
  });
});
```

使用 co 库可以很容易解决这个问题

```js
const co = require('co');
// co 接受一个生成器
co(read()).then(data => {
  console.log(data);
});
// 那模拟一下
function _co(it) {
  // 首先返回一个 promise
  return new Promise((resolve, reject) => {
    // 因为可以传值的原因，不可以直接使用循环实现，需要使用 递归
    function next(data) {
      const { value, done } = it.next(data);
      if (done) return resolve(value);
      // 保证值是一个 promise
      Promise.resolve(value).then(data => {
        next(data);
      }, reject);
    }
    next();
  });
}
```

## 7. 斐波那契数列

- 今天新东方的面试还提到了斐波那契数列，其实这个东西蛮很有趣，简单介绍一下
- 1、1、2、3、5、8、13、21、34 ....
- 这道题有个规律，第一项加上第二项永远等于第三项：1 + 1 = 2；1 + 2 = 3；2 + 3 = 5；3 + 5 = 8 ....
- 要求是传入第几项，得到该值，根据这个规律来实现一下

### 经典写法

```js
function fibonacci(n) {
  // 第一项和第二项都返回1
  if (n === 1 || n === 2) return 1;
  // 我们只要返回 n - 1（n的前一项）与 n - 2（n的前两项）的和便是我们要的值
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

### 缓存写法

上面的写法，求 20 次以内的总和运行会很快，50 次以上特别慢，100 次 以上可能就爆栈了，所以我们需要优化写法，缓存每次计算后的值

```js
function feibo(n, sum1 = 1, sum2 = 1) {
  if (n === 1 || n === 2) return sum2;
  return feibo(n - 1, sum2, sum1 + sum2);
}
```

这种写法缓存了，每次计算后的值，执行效率会很高，100 次以上也会秒返回结果，这个也叫作尾递归优化

### 缓存写法

这中写法就有动态规划的意思了，利用 `dp[n] = dp[n - 1] + dp[n - 2]` 的递推公式，把所有计算结果缓存在 memo 里面，最后返回 memo[n] 即可

```js
function memory(n, memo = []) {
  if (n === 1 || n === 2) {
    return 1;
  } else if (!memo[n]) {
    memo[n] = memory(n - 1) + memory(n - 2);
  }
  return memo[n];
}
```

### 动态规划

动态规划直接根据递推公式 `dp[n] = dp[n - 1] + dp[n - 2]` 写就可以

```js
function dibDp(n) {
  const dp = [];
  dp[0] = 1;
  dp[1] = 1;
  for (let i = 2; i < n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n - 1];
}
```

## 8. 观察者与发布订阅

> 一直以来，我以为发布订阅和观察者是一个思路，一次偶然的机会我发现他们是两种不同的设计思路

虽然他们都是 `实现了对象的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖它的对象都将得倒通知，然后自动更新` 。但是他们之间是有一定区别的。

### 观察者模式

观察者模式会有 `观察者` 与 `被观察者(观察目标)` 两个对象存在，观察者可以有多个，观察目标可以添加多个观察者，可以通知观察者。观察者模式是面向与目标和观察者编程的，耦合目标和观察者

```js
// 被观察者
class Subject {
  constructor() {
    this.observes = [];
  }
  add(ob) {
    this.observes.push(ob);
    return this;
  }
  notify(...args) {
    this.observes.forEach(ob => ob.update(...args));
    return this;
  }
}
// 观察者
let id = 0;
class Observer {
  constructor(name) {
    this.name = name || ++id;
  }
  update(...args) {
    console.log(`${this.name} 收到了通知：${args}`);
  }
}

// 使用
const o1 = new Observer('fecym');
const o2 = new Observer('ys');
const o3 = new Observer();
const o4 = new Observer();

const s = new Subject();
// 添加观察者
s.add(o1)
  .add(o2)
  .add(o3)
  .add(o4);
// 通知观察者
s.notify('你好');
```

### 发布订阅模式

发布订阅模式会有一个调度中心的概念。是面向调度中心编程的，对发布者与订阅者解耦，例如 node 中的 emitter

```js
class Emitter {
  constructor() {
    this.callbacks = {};
  }
  on(type, fn) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }
    this.callbacks[type].push(fn);
    return this;
  }
  emit(type, ...args) {
    if (!this.callbacks[type]) return;
    this.callbacks[type].forEach(fn => fn(...args));
    return this;
  }
  off(type, fn) {
    if (!this.callbacks[type]) return;
    this.callbacks[type].find((handler, idx) => {
      if (fn === handler) {
        this.callbacks[type].splice(idx, 1);
      }
    });
    return this;
  }
  once(type, fn) {
    const wrapFn = (...args) => {
      fn(...args);
      this.off(type, fn);
    };
    this.on(type, wrapFn);
  }
}
const em = new Emitter();

const fn1 = (a, b) => console.log('哈哈哈哈哈第一次', a, b);
const fn2 = a => console.log('哈哈哈哈哈第二次', a);
const fn3 = a => console.log('测试 once', a);
em.on('fecym', fn1);
em.on('fecym', fn2);
em.emit('fecym', 1, 2);
em.off('fecym', fn2);
em.emit('fecym', 1, 132);
em.once('aaa', fn3(1));
```

## 9. 下面代码输出什么，为什么

```js
var obj = {
  '2': 3,
  '3': 4,
  length: 2,
  splice: Array.prototype.splice,
  push: Array.prototype.push,
};
obj.push(1);
obj.push(2);
console.log(obj);
```

结果：输出 obj 是 `[empty × 2, 1, 2, splice: ƒ, push: ƒ]`

- 一个对象如果有 length 属性，length 属性可以告诉我们对象的元素个数，基本上就满足一个类数组对象了
- 当对象带有数组的 `splice` 方法并且 `length` 属性的值可以转为数值时，对象将会被当做数组打印。

- obj 调用数组的 push 方法自身的 length 属性就会 ++，此时调用两次，length 就变成了 4

  1. 第一次 push：`obj[2] = 1; obj.length += 1`
  2. 第二次 push：`obj[3] = 2; obj.length += 1`
  3. 使用 console.log 输出的时候，因为 obj 具有 length 属性和 `splice` 方法，故将其作为数组进行打印，没有 `splice` 还是以对象形式打印
  4. 打印时因为数组未设置下标为 0 1 处的值，故打印为 empty，主动 obj[0] 获取为 undefined

## 10. 输出以下代码的执行结果并解释为什么

```js
var a = {
  n: 1,
};
var b = a;
a.x = a = {
  n: 2,
};

console.log(a.x);
console.log(b.x);
```

结果： `a.x 为 undefined；b.x 为 { n: 2 }`

1. 首先 `.` 的优先级要比 `=` 优先级要高，所以 a.x 要先执行；
2. 相当于为 a（或者 b）所指向的 `{ n: 1 }` 对象新增了一个属性 x，即此时对象将变为 `{ n: 1, x: undefined}` 。
3. 随后按照正常赋值从右往左进行赋值，在执行 `a = { n: 2 }` 时，a 的引用发生改变，指向了新对象，而不会对 b 造成影响
4. 接着执行 `a.x = { n：2 }`的时候，并不会重新解析一遍 a，而是沿用最初解析 a.x 时候的 a，所以此时旧对象的 x 的值为 `{ n：2 }`，旧对象为 `{ n: 1, x: { n：2 } }`，它被 b 引用着。
5. 所以最终打印结果：`a.x 为 undefined；b.x 为 { n: 2 }`

参考: [优先级和结合性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence#precedence_and_associativity)

## 11. 打印出 1 - 10000 之间的所有对称数

对称数：121，1331 之类的，只要数字反转后等于原来值，就满足我们要的结果

```js
let i = 10000;
const res = [];
const reverse = x =>
  Number(
    x
      .toString()
      .split('')
      .reverse()
      .join('')
  );
while (i >= 0) {
  if (i === reverse(i)) {
    res.push(i);
  }
  i--;
}
```
