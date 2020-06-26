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

今天 360 面试过程遇到一个很有趣的问题，是关于函数的 length 属性的，题简写如下

```js
(() => 1).length === 0; // 输出什么
```

我所理解的拥有 `length` 的对象一般都是数组或者类数组对象，或者定义了 `length` 属性的对象，所以我回答说这个应该是 `false` 吧，后来面试告诉我函数是有 `length` 属性的，函数的 `length` 属性就是函数参数的个数，瞬间我恍然大悟，函数的参数就是 `arguments`，而 `arguments` 也是一个类数组对象所以他是有 `length` 属性的

```js
// so
(() => 1).length ===
  0(
    // 输出 true
    a => a
  ).length; // 输出 1
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

持续记录中...
