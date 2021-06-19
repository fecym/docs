---
title: 小技巧及面试题
date: 2019-12-14
tags:
  - issue
  - 基础
---

## 获取一个月有多少天

今天遇到一个需求，已知月份，得到这个月的第一天和最后一天作为查询条件查范围内的数据

`new Date(year, month, date, hrs, min, sec)`，`new Date` 可以接受这些参数创建一个时间对象
其中当我们把 `date` 设置为 `0` 的时候，可以直接通过 `getDate()` 获取到最后一天的日期然后得到我们要的最后一天

```js
new Date(2019, 12, 0).getDate(); // 31
new Date(2018, 2, 0).getDate(); // 28
// 根据这个我们可以得到一个方法
function getMonthLength(month) {
  const date = new Date(month);
  const year = date.getFullYear();
  // 月份是从 0 开始计算的
  const _month = date.getMonth() + 1;
  return new Date(year, _month, 0).getDate();
}
```

## 关于函数的 length 属性

360 面试过程遇到一个很有趣的问题，是关于函数的 length 属性的，题简写如下

```js
(() => 1).length === 0; // 输出什么
```

我所理解的拥有 `length` 的对象一般都是数组或者类数组对象，或者定义了 `length` 属性的对象，所以我回答说这个应该是 `false` 吧，后来面试告诉我函数是有 `length` 属性的，函数的 `length` 属性就是函数参数的个数，瞬间我恍然大悟，函数的参数就是 `arguments`，而 `arguments` 也是一个类数组对象所以他是有 `length` 属性的

```js
// so
(() => 1).length === 0; // 输出 true
(a => a).length; // 输出 1
```

## 数组中字符串键值的处理

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

## void 运算符

`undefined` 是一个内置标志符，它的值为 `undefined`（除非被重新定义过），通过 `void` 运算符即可得到该值

在 `void` 之后的语句或表达式都将返回 `undefined`。`void` 并不会改变表达式的结果，只是让表达式不返回值

```js
void true; // undefined
void 0; // undefined
```

`void` 运算符在其他地方也可以派上用场，比如不让表达式返回任何结果。

```js
// 该函数不需要有任何返回结果
function doSomething(sign) {
  if (!sign) {
    return void setTimeout(doSomething, 100);
  }
}
// 或许你经常向下面一样这么写
function doSomething(sign) {
  if (!sign) {
    setTimeout(doSomething, 100);
    return;
  }
}
```

## 关于 JSON.stringify

`JSON.stringify` 和 `toString()` 效果基本相同，只不过序列化的结果总是字符串

```js
JSON.stringify(42); // "42"
JSON.stringify('42'); // ""42""（含有双引号的字符串）
JSON.stringify(null); // "null"
JSON.stringify(true); // "true"
```

### 不安全的 JSON 值

所有安全的 `JSON` 值都可以使用 `JSON.stringify` 序列化，不安全的 `JSON` 值有：`undefined`、`function`、`symbol` 和 `循环引用`。`JSON.stringify`

在对象中遇到这些不安全的 `JSON` 值的时候会自动将其忽略，在数组中遇到则会返回 `null`，以保证数组成员位置不变

```js
JSON.stringify(undefined); // null
JSON.stringify(function() {}); // null
JSON.stringify([1, undefined, 2, function() {}, 3]); // "1, null, 2, null, 3"
JSON.stringify({ a: 2, b: function() {} }); // "{"a":2}"
```

### toJSON 方法

如果对象中定义了 `toJSON` 方法，那么在 `JSON` 序列化的时候优先调用该方法，主要是为了处理循环引用的时候，我们让其返回一个合理的值

也就是说 `toJSON` 方法应该返回一个能够被字符串安全化的 `JSON` 值

```js
const o = {
  a: 'cym',
  toJSON() {
    return { c: 'b' };
  },
};

JSON.stringify(o); // {"c":"b"}
```

### JSON.stringify 的第二个参数

我们可以向 `JSON.stringify` 中传递一个可选参数 `replacer`，他可以书数组也可以书函数，用来指定对象序列化的时候哪些属性应该被处理，哪些应该被排除，和 `toJSON` 很像

1. 当 `replacer` 是一个数组时，那么他必须是一个字符串数组，其中包含序列化要处理的对象的属性名称，除此之外的属性就会被忽略

```js
const obj = {
  a: 42,
  b: 30,
  c: 100,
};
JSON.stringify(obj, ['a', 'c']); // {"a":42,"c":100}
```

2. 当 `replacer` 是一个函数时，他会对对象本身调用一次，然后在对对象中的每个属性各调用一次。每次传递两个参数（对象的键和值）。如果要忽略某个键就返回 `undecided`，否则就返回指定的值

```js
const obj = {
  a: 42,
  b: 30,
  c: 100,
};
JSON.stringify(obj, (k, v) => {
  // 注意：第一次 k 是 undefined，v 是原对象
  if (k !== 'c') return v;
}); // "{"a":42,"b":30}"
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
~42; // -(42+1) ===> -43
```

在 `-(x+1)` 中唯一能够得到 0（或者严格来说时候 -0）的 x 值是 -1，也就是说 ~ 和一些数字在一起会返回一个假值 0，其他情况下则返回真值

-1 是一个 `哨位值`，哨位值是那些在各个类型中被赋予了特殊含义的值。在 C 语言中 -1 代表函数执行失败，大于等于 0 的值代表函数执行成功

比如在 JavaScript 中字符串的 indexOf 方法也遵循这一惯例，该方法在字符串中搜索指定的字符串，如果找到就返回该子字符串所在的位置，否则返回 -1

### ~ 的用途

我们知道在 JavaScript 中假值有：`undefined、null、false、+0、-0、NaN、''`，其他都为真值，所以负数也是真值，那么我们就可以拿着 `~` 和 `indexOf` 一起检结果强制类型转换为 真/假 值

```js
const str = 'hello world';
~str.indexOf('lo'); // -4，真值
if (~str.indexOf('lo')) {
  // true
  // 找到匹配
}
~str.indexOf('ol'); // 0，假值
!~str.indexOf('ol'); // true
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
Math.floor(1.9); // 1
~~1.9; // 1
// 操作负数
Math.floor(-1.9); // -2
~~-1.9; // -1
```

`~~x` 能将值截除为一个 32 位的整数，`x | 0` 也可以，而且看起来更简洁哦，不过出于对运算符优先级的考虑，我们更倾向于使用 `~~x`

```js
~~1.9; // 1
1.9 | 0; // 1

~~-1.9; // -1
-1.9 | 0; // -1
```

## 给定一组 url 实现并发请求

原题是这样的：给定一组 url，利用 js 的异步实现并发请求，并按顺序输出结果

### Promise.all

首先我们可以想到的是利用 `Promise.all` 来实现，代码实现如下

```js
const urls = ['./1.json', './2.json', './3.json'];
function getData(url) {
  // 返回一个 Promise 利用 Promise.all 接受
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response);
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.send(null);
  });
}
function getMultiData(urls) {
  // Promise.all 接受一个包含 promise 的数组，如果不是 promise 数组会被转成 promise
  Promise.all(urls.map(url => getData(url))).then(results => {
    console.log(results);
  });
}
```

### 不用 Promise

原题是不用 `Promise` 来实现，我们可以写一个方法，加个回调函数，等数据全部回来之后，触发回调函数传入得到的数据，那么数据全部回来的就是我们要考虑的核心问题，我们可以用个数组或者对象，然后判断一下数组的 length 和传入的 url 的长度是否一样来做判断

#### 使用对象做映射

```js
const urls = ['./1.json', './2.json', './3.json'];
function getAllDate(urls, cd) {
  const result = {};
  function getData(url, idx) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          result[idx] = xhr.response;
          // 如果两者 length 相等说明都请求完成了
          if (Object.keys(result).length === urls.length) {
            // 给对象添加length属性，方便转换数组
            result.length = urls.length;
            cd && cd(Array.from(result));
          }
        }
      }
    };
  }
  // 触发函数执行
  urls.forEach((url, idx) => getData(url, idx));
}
// 使用
getAllDate(urls, data => {
  console.log(data);
});
```

#### 使用数组实现

和上面的基本思路差不多，不过这次换成了数组，也可以给个信号量来做判断

```js
function getGroupData(urls, cb) {
  const results = [];
  let count = 0;
  const getData = url => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = _ => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          results.push(xhr.response);
          if (++count === urls.length) {
            cb && cb(results);
          }
        }
      }
    };
    xhr.open('GET', url, true);
    xhr.send(null);
  };
  urls.forEach(url => getData(url));
}

getGroupData(urls, data => {
  console.log(data);
});
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

## 1..toString 的问题

有时候我们看到别人的代码中会写到数字调其他类型的方法的时候会写成 `1..toString()` 这样的写法

因为直接用整数型数字调方法就会报错，但是如果是一个浮点数的话就不会报错了

因为可能在 `.` 上面存在争议，一个数字后面加点，解释器他不知道你这是小数还是要调取方法，所以就跑异常了

```js
1.toString()     // Uncaught SyntaxError: Invalid or unexpected token
1..toString()    // '1'
1.2.toString()   // '1.2'
```

## 如何让 (a == 1 && a == 2 && a == 3) 的值为 true

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

## jsonp

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
jsonp('http://localhost:3000/getData', { a: 1, b: 2 })
  .then(res => {
    console.log('🚀 ~ jsonp ~ res', res);
  })
  .catch(err => {
    console.log('🚀 ~ jsonp ~ err', err);
  });
```

## 图片懒加载

工作中经常会用到图片，当图片过多的时候，通常会做懒加载优化加载请求，懒加载就是优先加载可视区域内的内容，其他部分等进入了可视区域内在去加载

图片懒加载的原理很简单，需要做到两点即可实现：

1. 图片是否要加载取决于它的 `src` 属性。在初始化的时候我们不给图片设置 src 属性，而给一个其他属性设置图片的真实地址，当图片需要加载时候在给图片的 `src` 设置属性，此时就可以做到懒加载

2. 当图片进入可视区域的时候，我们就需要加载图片了。可视区域就是当图片元素的相对于 `可视区域的高度` 小于 `可视区域的高度` 的时候说明元素进入视口了

### 可视区域高度

可是区域就是浏览器中我们可以看见的高度，可以使用 `window.innerHeight` 或者 `document.documentElement.clientHeight` 获取到

当元素 `顶边距离` 距离小于 `可视窗口` 时说明元素要进入可视区域了

### getBoundingClientRect

`element.getBoundingClientRect()` 返回值是一个 DOMRect 对象，这个对象是由该元素的 getClientRects() 方法返回的一组矩形的集合，就是该元素的 CSS 边框大小。返回的结果是包含完整元素的最小矩形，并且拥有 left, top, right, bottom, x, y, width, 和 height 这几个以像素为单位的只读属性用于描述整个边框。除了 width 和 height 以外的属性是`相对于视图窗口的左上角`来计算的。

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

## 滚动加载

开发移动端经常会遇到滚动加载，滚动加要满足 `"页面真实内容高度" 超过 "可视窗口" 的高度`，那么说明需要加载新的数据了

此时我们就需要知道几个高度值：

1. 页面的真实高度
2. 可视区域的高度
3. 页面滚动的高度

页面的真实高度 = 可是区域的高度 + 页面的滚动高度

### 和元素高度、滚动、位置相关的属性

每个 HTML 元素都具有 `clientHeight`、`offsetHeight`、`scrollHeight`、`offsetTop`、`scrollTop` 这 5 个和元素高度、滚动、位置相关的属性

clientHeight 和 offsetHeight 属性和元素的滚动位置没有关系，它代表着元素的高度：

- clientHeight 包括 padding 但不包括 margin、border 和水平滚动条的高度，对于 inline 的元素这个属性一直是 0，单位 px，只读属性

- offsetHeight 包括 padding、border 和水平滚动条但不包括 margin 的高度，对于 inline 的元素这个属性一直是 0，单位 px，只读属性

当父元素的子元素比父元素高且 overflow=scroll 时，父元素会滚动，此时：

- scrollHeight：因为子元素比父元素高，父元素不想被子元素撑的一样高就显示了滚动条，在滚动过程中子元素有部分隐藏被隐藏，scrollHeight 就是子元素可见高度与不可见高度的真实高度，而可见高度就是 clientHeight。也就是 `scrollHeight > clientHeight` 时会出现滚动条，没有滚动条时 `scrollHeight === clientHeight` 恒成立，只读属性

- scrollTop：代表有滚动条时，滚动条向下滚动的距离，也就是子元素被遮挡的高度，在没有滚动条时 `scrollTop === 0` 恒成立，可读可设置

- offsetTop：当前元素距离最近父元素顶部的距离，和滚动条没有关系，只读属性

- clientTop：当前元素顶部边框的宽度，不包括 padding 和 margin，只读属性

知道了上面这些概念我们就可以来实现这个滚动加载，只要满足 `页面真实高度 - 页面可见高度 - 页面滚动高度 < 0` 说明该去加载新的数据了

```js
const htmlEl = document.documentElement;
// 在不满足滚动条件的时候，如果出现横向滚动条，那么 offsetHeight 是包括横向滚动条滚动条高度的，所以会大于 scrollHeight的高度，所以我们取最大值
const pageHeight = Math.max(htmlEl.scrollHeight, htmlEl.offsetHeight);
// 滚动的高度
const scrollHeight = htmlEl.scrollTop;
const viewHeight = window.innerHeight || htmlEl.clientHeight;
// 满足触发条件
pageHeight - scrollHeight - viewHeight < 0;
// 当前一般情况下会提前去加载数据，数据是一般是异步的，所以会有一个预留高度
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
        return {
          value: obj[idx],
          done: idx++ >= obj.length,
        }
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

## 菲波那切数列

- 今天新东方的面试还提到了菲波那切数列，其实这个东西蛮很有趣，简单介绍一下
- 1、1、2、3、5、8、13、21、34 ....
- 这道题有个规律，第一项加上第二项永远等于第三项：1 + 1 = 2；1 + 2 = 3；2 + 3 = 5；3 + 5 = 8 ....
- 要求是传入第几项，得到该值，根据这个规律来实现一下

### 简单写法

```js
function fibonacci(n) {
  // 第一项和第二项都返回1
  if (n === 1 || n === 2) return 1;
  // 我们只要返回 n - 1（n的前一项）与 n - 2（n的前两项）的和便是我们要的值
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

### 优化版本

上面的写法，求 20 次以内的总和运行会很快，50 次以上特别慢，100 次 以上可能就爆栈了，所以我们需要优化写法，缓存每次计算后的值

```js
function feibo(n, sum1 = 1, sum2 = 1) {
  if (n === 1 || n === 2) return sum2;
  return feibo(n - 1, sum2, sum1 + sum2);
}
```

这种写法缓存了，每次计算后的值，执行效率会很高，100 次以上也会秒返回结果，这个也叫作尾递归优化

## 观察者与发布订阅

> 一直以来，我以为发布订阅和观察者是一个思路，一次偶然的机会我发现他们是两种不同的设计思路

虽然他们都是`实现了对象的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖它的对象都将得倒通知，然后自动更新`。但是他们之间是有一定区别的。

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
s.add(o1).add(o2).add(o3).add(o4);
// 通知观察者
s.notify('你好');
```

### 发布订阅模式

发布订阅模式会有一个调度中心的概念。是面向调度中心编程的，对发布者与订阅者解耦

```js
class PubSub {
  constructor() {
    this.handlers = {};
  }
  subscribe(type, fn) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(fn);
  }
  publish(type, ...args) {
    if (!this.handlers[type]) return;
    this.handlers[type].forEach(fn => fn(...args));
  }
}

const ps = new PubSub();

ps.subscribe('a', console.log);
ps.subscribe('a', console.log);
ps.subscribe('a', console.log);
ps.subscribe('a', console.log);
ps.publish('a', 'hello world');
```

## 字符串转 txt 文件（blob）

有个要求：纯前端实现，不可以使用 `node`

实现原理也很简单，就像我们平时下载一个本地文件一样，可以动态的创建一个可以下载的 `a` 标签，给它设置 `download` 属性，然后把下载的内容转 `blob` 创建下载链接下载即可

具体实现如下：

```js
function exportTxt(text, filename) {
  const eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  // 将内容转为 blob
  const blob = new Blob([text]);
  eleLink.href = URL.createObjectURL(blob);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}
```

## 奇偶数判断

可能会遇到一个做奇偶数判断的方法吧，反正我遇到了，一句话搞定

```js
const isEven = num => num % 2 === 0;
```

## 格式化金钱

项目中我们经常会遇到金钱格式化需求，或者说数字格式化一下，方便阅读（数字比较大的情况下）

比如说 `999999999`，直接阅读很不直观，格式化后 `999,999,999`

通常我们会使用正则来处理

```js
function formatPrice(price) {
  return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

也可以不使用正则然后优雅的处理

```js
function formatPrice(price) {
  return String(price)
    .split('')
    .reverse()
    .reduce((prev, next, index) => {
      return (index % 3 ? next : next + ',') + prev;
    });
}
```

上面是两种提到的比较常用的方案，但是 js 还有个比较牛逼的 API 可以直接实现这个需求哦，它就是 `toLocaleString`，我们可以直接数字调用这个方法就可以实现，金额的格式化

```js
(999999999).toLocaleString(); // 999,999,999
// 当然还可以更秀一点
const options = {
  style: 'currency',
  currency: 'CNY',
};
(123456).toLocaleString('zh-CN', options); // ¥123,456.00
```

`toLocaleString` 可以接收两个可选参数：`locales` 和 `options`，而且这个 api 在各大浏览器通用不存在兼容问题并且这个 `api` 不止存在 Number 的原型上，Array、Object、Date 原型上都有这个 api，并且格式化出来的值可以根据我们传入的参数出现各种结果

[参数及用法可以参考 MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)

## 深度冻结对象

在 vue 项目开发中，有些不变的常量，我们不想 vue 为他做双向绑定，以减少一些性能上消耗，我们可以把使用 `Object.freeze` 将对象冻结，此时 vue 将不会对这个对象进行冻结，但是这个冻结只是冻结对象第一层，所以遇到对象层级比较深的话，我们可以写个深度冻结的 api，来对常量对象做一些冻结优化

```js
const deepFreeze = o => {
  const propNames = Object.getOwnPropertyNames(o);
  propNames.forEach(name => {
    const prop = o[name];
    if (typeof prop === 'object' && prop !== null) {
      deepFreeze(prop);
    }
  });
  return Object.freeze(o);
};
```

## 脱敏处理

在一些涉及到用户隐私情况下，可能会遇到对用户的手机号身份证号之类的信息脱敏，但是这个脱敏数据的规则是根据用户信息要脱敏字段动态的生成的，此时我们动态拼接正则来实现一个动态脱敏规则

```js
const encryptReg = (before = 3, after = 4) => {
  return new RegExp('(\\d{' + before + '})\\d*(\\d{' + after + '})');
};
// 使用：'13456789876'.replace(encryptReg(), '$1****$2') -> "134****9876"
```

## 树遍历

对于树结构的遍历一般有深度优先和广度优先

广度优先和深度优先的概念很简单，区别如下：

- 深度优先，访问完一颗子树再去访问后面的子树，而访问子树的时候，先访问根再访问根的子树，称为先序遍历；先访问子树再访问根，称为后序遍历。
- 广度优先，即访问树结构的第 n+1 层前必须先访问完第 n 层

1. 深度优先

先序遍历

```js
const treeForEach = (tree, func) => {
  tree.forEach(data => {
    func(data);
    data.children && treeForEach(data.children, func);
  });
};
```

后序遍历，只需要调换一下节点遍历和子树遍历的顺序即可

```js
const treeForEach = (tree, func) => {
  tree.forEach(data => {
    data.children && treeForEach(data.children, func);
    func(data);
  });
};
```

2. 广度优先

广度优先的思路是，维护一个队列，队列的初始值为树结构根节点组成的列表，重复执行以下步骤直到队列为空。取出队列中的第一个元素，进行访问相关操作，然后将其后代元素（如果有）全部追加到队列最后。

```js
const treeForEach = (tree, func) => {
  let node,
    list = [...tree];
  while ((node = list.shift())) {
    func(node);
    node.children && list.push(...node.children);
  }
};
```

## 数组分组

开发移动端的时候，遇到一个首页菜单改版的需求，首页菜单根据权限控制显隐，而菜单每页展示八个小菜单，超过八个做 swipe 滑动切换，当时项目用了 vant 做的 UI 框架，菜单那模块就选择了他的轮播插件，菜单做成了一个扁平化的 list 配置，首先根据权限过滤出所有有权限的菜单项，然后每八个一分组，处理成一个二维数据来遍历菜单

```js
const arrayGroupBySize = (arr, size = 2) => {
  const result = [];
  for (let i = 0, len = arr.length; i < len; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};
```

## 下划线与驼峰

做一些数据持久化的工作的时候经常会出现下划线命名和驼峰命名的转化，因为在前端处理中规范是驼峰命名，而像 mysql 之类的规范是下划线命名，所以在处理后返回给前端的数据需要转换为驼峰命名，而对数据库的读写需要下划线命名

```js
const toHump = name => {
  return name.replace(/\_(\w)/g, function(all, letter) {
    return letter.toUpperCase();
  });
};

const toLine = name => {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase();
};
```

## 校验时间格式

业务中遇到一个校验一下传入时间格式是否为一个时间格式，下面的方法可以完美校验

```js
const isDate = str => {
  return typeof str !== 'number' && str !== null && new Date(str) !== 'Invalid Date';
};
```

## 正则匹配空字符

在开发项目遇到一个校验如果输入内容则用正则校验输入值是否合法，不输入则不校验问题，Java 做法直接用注解的方式传入一个正则，然后导致前端这边不传或者传入 null 的时候校验能通过，但是传入一个空字符则校验失败，此时就需要一个既可以满足业务需求也可以为空的一个正则 `/^\s{0}$/`

```js
const emptyReg = /^\s{0}$/;
emptyReg.test(''); // true
```

## 值的映射

开发 echarts 的时候会遇到一个所有的 y 轴展示多条数据，类似于堆叠图，但是要保持每条线的高度保持统一，就是每条线的最大值和最小值在每个范围内都保持统一的比值，此时我们可以对坐标轴上的数据映射一边来保证展示出来的数据一致性（用户关注的是趋势）

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/mapRange.png')" height="260" />
</p>

```js
/**
 * 值映射
 * @param {*} from  原始值的范围 [min, max]
 * @param {*} to    映射后的范围 [min, max]
 * @param {*} arr   要映射的数据
 * @returns
 */
export function mapRange(from, to, arr) {
  const _mapRange = s => {
    return to[0] + ((s - from[0]) * (to[1] - to[0])) / (from[1] - from[0]);
  };
  return arr.map(_mapRange);
}

const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
mapRange([0, 10], [-1, 0], arr);
// [-1, -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.30000000000000004, -0.19999999999999996, -0.09999999999999998, 0]
```

## 根据时间间隔生成 X 轴的数据

在开发 echarts 过程中，需要快速模拟数据，我们可以快速根据时间间隔，开始时间结束时间来快速生成一组 x 轴线的数据，用到 dayjs 库

```js
export function generatorXAxisData(options) {
  options.interval = options.interval || 5 * 60 * 1000;
  options.template = options.template || 'YYYY-MM-DD HH:mm:ss';
  options.startTime =
    options.startTime ||
    dayjs()
      .startOf('d')
      .valueOf();
  options.endTime =
    options.endTime ||
    dayjs()
      .endOf('d')
      .valueOf();
  const { interval, template, startTime, endTime } = options;
  const result = [];
  const timeRange = endTime - startTime;
  const count = Math.floor(timeRange / interval); //时间间隔 （五分钟：5*60*1000）
  for (let i = 0; i <= count; i++) {
    const modTine = dayjs(startTime + interval * i).format(template);
    result.push(modTine);
  }
  if (startTime + count * interval !== endTime) {
    result.push(dayjs().format(template));
  }
  return result;
}
```

## 生成随机数据

同样开发 echarts 中需要快速生成一组数据

```js
/**
 * 随机数生成，图表模拟数据用
 * @param len
 * @param range
 * @returns {number[]}
 */
export function generatorRandomValue(len = 20, range = 50) {
  const arr = Array(len).fill(0);
  return arr.map(() => {
    return (Math.random() * range) >>> 0;
  });
}
```

## base64 转文件预览地址

base64 文件可以直接预览，但是有些三方库可能需要一个真实预览地址，我们可以把 base64 转成文件预览地址来使用

```js
/**
 * base64 转文件预览地址
 * @param base64
 * @param contentType 类型
 * @param includeHead 是否包含base64头
 * @returns {string}
 */
export function base64ToUrl(base64, contentType = 'image/png', includeHead = false) {
  if (includeHead) {
    // 如果包含 base64 头，要去掉
    base64 = base64.split(',')[1];
  }
  const bstr = window.atob(base64);
  let len = bstr.length;
  const uint8Arr = new Uint8Array(len);
  while (len--) {
    // 返回指定位置的字符的 Unicode 编码
    uint8Arr[len] = bstr.charCodeAt(len);
  }
  const blob = new Blob([uint8Arr], { type: contentType });
  return URL.createObjectURL(blob);
}
```

## 根据 url 下载文件

```js
/**
 * 可以下载的URL包括base64
 * @param url
 * @param downloadName 可以不加后缀名
 * @param cb 下载完之后的回调函数
 */
export const downloadByUrl = (url, downloadName = '', cb) => {
  const eleLink = document.createElement('a');
  eleLink.setAttribute('download', downloadName);
  eleLink.setAttribute('href', url);
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
  cb && cb();
};
```

## 打印 dom

工作中可能会遇到打印的需求，我们可以直接使用 `window.print` API，但是打印的是整个页面，并且不能是单页面应用程序，此时我们想打印某个 dom 的话，就需要利用这个 api，然后动态生成一个 iframe，在 iframe 中插入要打印的 dom 直接在内嵌的 iframe 中调用打印方法既可实现这个功能（一般用来打印图片，其他 dom 的话需要自己加上样式）

```js
/**
 * 打印dom
 * @param dom
 * @param isCenter
 */
export const printPageByDom = (dom = null, isCenter = true) => {
  if (!dom) return;
  const printFrameId = 'print-frame';
  let printFrame = document.getElementById(printFrameId);
  if (printFrame) {
    document.body.removeChild(printFrame);
  }
  printFrame = document.createElement('iframe');
  printFrame.name = printFrameId;
  printFrame.setAttribute('id', printFrameId);
  printFrame.setAttribute('width', '100%');
  printFrame.setAttribute('height', '100%');
  printFrame.setAttribute('style', 'position:absolute;width:0px;height:0px');
  if (isCenter) {
    const parentEl = document.createElement('div');
    parentEl.style.textAlign = 'center';
    // parentEl.style.height = "100vh";
    parentEl.style.display = 'flex';
    parentEl.style.alignItems = 'center';
    parentEl.style.justifyContent = 'center';
    parentEl.innerHTML = dom.outerHTML;
    printFrame.srcdoc = parentEl.outerHTML;
  } else {
    printFrame.srcdoc = dom.outerHTML;
  }
  document.body.appendChild(printFrame);
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();
};
```

持续记录中...
