---
title: 数组常用 api 实现
date: 2021-05-21
tags:
  - api
---

我们一直在用数组的 api，因为使用很方便

## 任意位置插入单个成员

数组任意位置插入单个成员，这个 api 几乎可以作为数组插入的一个最基本的方法来处理，实现如下

按照数组 api 的规则，我们为数组增加了成员，那么要返回数组的长度

```js
function insert(arr, idx, item) {
  // 循环为什么要倒着写？看下面解释
  for (let i = arr.length - 1; i > idx - 1; i--) {
    arr[i + 1] = arr[i];
  }
  arr[idx] = item;
  return arr.length;
}
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/basis-api-array-insert.jpg')" title="循环为什么要倒着写？看下面解释" />
</p>

## 任意位置移除单个成员

移除元素跟插入元素应该是一组对应的 api，同理要返回删除的元素

删除的核心思想就是：从删除项开始，数组所有成员左移一位，最后长度减一即可

```js
function remove(arr, idx) {
  const r = arr[idx];
  for (let i = idx; i < arr.length; i++) {
    arr[i] = arr[i + 1];
  }
  arr.length--;
  return r;
}
```

## 转字符串 join

转字符其实就是做一个字符串拼接

```js
function join(arr, symbol = '') {
  // 核心思想是拼接字符串
  let r = arr[0];
  for (let i = 1, len = arr.length; i < len; i++) {
    r += symbol + arr[i];
  }
  return r;
}
```

## 数组截取 slice

`slice` 截取数组，不改变原数组，返回一个新的数组，是一个浅复制，要创建一个新的数组，所以就可以用到前面写的 `insert` 了

```js
function slice(arr, start = 0, end = arr.length) {
  end = end > arr.length ? arr.length : end;
  const r = [];
  for (let i = start; i < end; i++) {
    insert(r, r.length, arr[i]);
  }
  return r;
}
```

## 栈、队列操作

JavaScript 中的数组可以很好的模拟栈和队列的数据操作

### push

`push` api 可以添加多个成员，返回 push 后的数组长度

```js
function push(arr, ...item) {
  const len = arr.length;
  // const args = [].slice.call(arguments, 1)
  for (let i = 0; i < item.length; i++) {
    arr[len + i] = item[i];
  }
  return arr.length;
}
```

### pop

`pop` 弹出数组最后一项，返回弹出的成员

```js
function pop(arr) {
  const len = arr.length;
  if (!len) return void 0;
  const r = arr[len - 1];
  arr.length--;
  return r;
}
```

### unshift

`unshift` 从头部添加一个成员，返回数组的长度

```js
function unshift(arr, item) {
  for (let i = arr.length; i > 0; i--) {
    arr[i] = arr[i - 1];
  }
  arr[0] = item;
  return arr.length;
}
```

`unshift` 可以像 `push` 那样传递多个参数，所以要考虑这个情况，要保证数据插入的正确性，具体实现如下

```js
function unshift(arr) {
  const args = [].slice.call(arguments, 1);
  const argsLen = args.length;
  const len = arr.length + argsLen;
  for (let i = len - 1; i > argsLen - 1; i--) {
    arr[i] = arr[i - argsLen];
  }
  for (let i = 0; i < args.length; i++) {
    arr[i] = args[i];
  }
  return arr.length;
}
```

### shift

`shift` 从头部删除一个成员

```js
function shift(arr) {
  const r = arr[0];
  for (let i = 1; i < arr.length; i++) {
    arr[i - 1] = arr[i];
  }
  arr.length--;
  return r;
}
```

## 数组反转

数组反转 reverse 也是一个会让原数组发生改变的 api，返回改变后的数组

```js
function reverse(arr) {
  const len = arr.length;
  const lenHalf = len / 2;
  for (let i = 0; i < lenHalf; i++) {
    const temp = arr[i];
    arr[i] = arr[len - 1 - i];
    arr[len - i - 1] = temp;
  }
  return arr;
}
```

## 遍历数组

数组遍历是很常用的 api，有直接遍历数组的，有对数组进行处理返回对应结果的，有筛选数据的，不会改变原数组（对引用类型的数组成员进行修改还是会改变的），属于纯函数常用的 `forEach、map、filter、find、some、every、reduce` 等

### forEach

纯遍历操作，不返回任何值

```js
function forEach(arr, cb, ctx = null) {
  for (let i = 0; i < arr.length; i++) {
    cb.call(ctx, arr[i], i, arr);
  }
}
```

在 `forEach` 中用 `return` 是不会返回任何结果的，函数还会继续执行

中断方法：

- 使用 `try` 监视代码，在需要中断的地方抛出已成
- 官方推荐方法：用 `every` 和 `some` 替换 `forEach`
  - `every` 在碰到 `return false` 的时候，中止循环
  - `some` 在碰到 `return true` 的时候，中止循环
- 接下来我们看看 `some` 和 `every` 的实现

### some

`some` 函数是一个很好用的函数，判断数组成员有任意一项满足条件则返回 true

```js
function some(arr, cb, ctx = null) {
  for (let i = 0; i < arr.length; i++) {
    if (cb.call(ctx, arr[i], i, arr)) {
      return true;
    }
  }
  return false;
}
```

### every

`every` 与 `some` 正好相反，数组成员都满足条件返回 true，否则返回 false

```js
function every(arr, cb, ctx = null) {
  for (let i = 0; i < arr.length; i++) {
    if (!cb.call(ctx, arr[i], i, arr)) {
      return false;
    }
  }
  return true;
}
```

### map

`map` 会对数组成员进行处理，返回一个与原数组长度一致的新数组，如果使用中没有返回结果则与 forEach 的效果一致

```js
function map(arr, cb, ctx = null) {
  const r = [];
  for (let i = 0; i < arr.length; i++) {
    r.push(cb.call(ctx, arr[i], i, arr));
  }
  return r;
}
```

### filter

`filter` 会对返回一组满足条件的数组成员，所以接受的函数中需要返回一个布尔值

```js
function filter(arr, cb, ctx = null) {
  const r = [];
  for (let i = 0; i < arr.length; i++) {
    const ret = cb.call(ctx, arr[i], i, arr);
    if (ret) {
      r.push(arr[i]);
    }
  }
  return r;
}
```

### find

`find` 查找数组中满足条件的第一个成员

```js
function find(arr, cb, ctx = null) {
  for (let i = 0; i < arr.length; i++) {
    if (cb.call(ctx, arr[i], i, arr)) {
      return arr[i];
    }
  }
  return void 0;
}
```

`findIndex` 很 `find` 一样，只不过返回结果一个是返回数组成员，一个是数组下标

```js
function findIndex(arr, cb, ctx = null) {
  for (let i = 0; i < arr.length; i++) {
    if (cb.call(ctx, arr[i], i, arr)) {
      return i;
    }
  }
  return -1;
}
```

### reduce

`reduce` 有个初始值的概念，初始值定了，返回结果就是在初始值上进行处理，返回每次对数组成员计算后的结果

```js
function reduce(arr, cb, init, ctx = null) {
  let r = init;
  for (let i = 0; i < arr.length; i++) {
    r = cb.call(ctx, r, arr[i], i, arr);
  }
  return r;
}
```

## 合并数组 concat

`concat` 合并一个数组，返回一个新的数组，也不会对原数发生改变，需要注意的是，参数可以是多个，可以是数组也可以是单个成员

```js
function concat(arr, ...target) {
  // const target = [].slice.call(arguments, 1)
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    insert(result, result.length, arr[i]);
  }
  for (let i = 0; i < target.length; i++) {
    const item = target[i];
    if (Array.isArray(item)) {
      for (let j = 0; j < item.length; j++) {
        insert(result, result.length, item[j]);
      }
    } else {
      insert(result, result.length, item);
    }
  }
  return result;
}
```

## 扁平化数组 flat

如下：一个多维数组，要求把数组扁平化成一个一维数组

```js
const arr = [1, 2, [21, 45, 88], 3, 4, [5, 6, [7, 8, [9, 11]]]];
// 结果：[ 1, 2, 21, 45, 88, 3, 4, 5, 6, 7, 8, 9, 11 ]
```

- 扁平化有多种思路，我们可以直接暴力一点，直接用正则匹配所有的中括号然后替换为空

```js
function flatUseRegExp(arr) {
  const str = JSON.stringify(arr).replace(/\[|\]/g, '');
  return str.split(',').map(i => +i);
}
```

- 也可以更直接一点，利用数组 toString 之后会去掉所有括号直接处理

```js
function flatUseToString(arr) {
  return arr
    .toString()
    .split(',')
    .map(i => +i);
}
```

- 当然我们也可以规规矩矩的写递归，来解决这个问题

```js
function flat(arr) {
  let r = [];
  arr.forEach(item => {
    if (Array.isArray(item)) {
      r = r.concat(flat(item));
    } else {
      r.push(item);
    }
  });
  return r;
}
```

- 当然循环要比递归性能更好

```js
function flat(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
}
```

## 增维面试思考

之前面试遇到一道题，有一个一维数组，我想要写个方法，方法接收两个参数，该数组和一个数字，然后得到一个根据这个数字而拆分成的多维数组，比如说我传递一个 3，那就数组中的成员就每三个成员组成一个新的数组

```js
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
// 结果：[ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 0 ] ]

const addAxis = (arr, offset) => {
  const len = arr.length;
  // 偏移量计算如果正好能被整除那么就取传入的偏移量，否则就向下取整后加1
  const offsetNum = len % offset === 0 ? offset : ~~(len / offset + 1);
  const result = [];
  for (let i = 0; i < offsetNum; i++) {
    result.push(arr.slice(i * offset, i * offset + offset));
  }
  return result;
};
```

## 数组原型上的实现

根据上面的思路，这里直接给数组原型实现一波常用 api，代码较长，比较完整，细细评阅

```js
function insert(arr, index, item) {
  for (let i = arr.length - 1; i > index - 1; i--) {
    arr[i + 1] = arr[i];
  }
  arr[index] = item;
  return arr.length;
}

Array.prototype.insert = function(index, item) {
  return insert(this, index, item);
};

Array.prototype.remove = function(index) {
  const removeItem = this[index];
  for (let i = index; i < this.length; i++) {
    this[i] = this[i + 1];
  }
  this.length--;
  return removeItem;
};

Array.prototype.join2 = function(symbol = ',') {
  let str = this[0] || '';
  for (let i = 1; i < this.length; i++) {
    str += symbol + this[i];
  }
  return str;
};

Array.prototype.slice2 = function(start = 0, end = this.length) {
  end = end > this.length ? end : this.length;
  let r = [];
  for (let i = start; i < end; i++) {
    insert(r, r.length, this[i]);
  }
  return r;
};

Array.prototype.push2 = function(...args) {
  const len = this.length;
  for (let i = 0; i < args.length; i++) {
    insert(this, len + i, args[i]);
  }
  return this.length;
};

Array.prototype.pop2 = function() {
  const len = this.length;
  if (!len) return void 0;
  const popValue = this[len - 1];
  this.length--;
  return popValue;
};

Array.prototype.unshift2 = function() {
  const argsLen = arguments.length;
  const len = this.length + argsLen;
  for (let i = len - 1; i > argsLen - 1; i--) {
    this[i] = this[i - argsLen];
  }
  for (let i = 0; i < argsLen; i++) {
    this[i] = arguments[i];
  }
  return this.length;
};

Array.prototype.shift2 = function() {
  const r = this[0];
  for (let i = 1; i < this.length; i++) {
    this[i - 1] = this[i];
  }
  this.length--;
  return r;
};

Array.prototype.reverse2 = function() {
  const len = this.length;
  for (let i = 0; i < len / 2; i++) {
    const temp = this[i];
    this[i] = this[len - i - 1];
    this[len - i - 1] = temp;
  }
  return this;
};

Array.prototype.forEach2 = function(callback, ctx = null) {
  for (let i = 0; i < this.length; i++) {
    callback.call(ctx, this[i], i, this);
  }
};

Array.prototype.map2 = function(callback, ctx = null) {
  const r = [];
  for (let i = 0; i < this.length; i++) {
    r.push(callback.call(ctx, this[i], i, this));
  }
  return r;
};

Array.prototype.filter2 = function(callback, ctx = null) {
  const r = [];
  for (let i = 0; i < this.length; i++) {
    if (callback.call(ctx, this[i], i, this)) {
      r.push(this[i]);
    }
  }
  return r;
};

Array.prototype.some2 = function(callback, ctx = null) {
  for (let i = 0; i < this.length; i++) {
    if (callback.call(ctx, this[i], i, this)) {
      return true;
    }
  }
  return false;
};

Array.prototype.every2 = function(callback, ctx = null) {
  for (let i = 0; i < this.length; i++) {
    if (!callback.call(ctx, this[i], i, this)) {
      return false;
    }
  }
  return true;
};

Array.prototype.reduce2 = function(callback, init, ctx = null) {
  // 初始值的初始化??
  let r = init;
  for (let i = 0; i < this.length; i++) {
    r = callback.call(ctx, r, this[i], i, this);
  }
  return r;
};

Array.prototype.find2 = function(callback, ctx = null) {
  for (let i = 0; i < this.length; i++) {
    if (callback.call(ctx, this[i], i, this)) {
      return this[i];
    }
  }
};

Array.prototype.concat2 = function(...target) {
  // 不改变原数组
  const r = [];
  for (let i = 0; i < this.length; i++) {
    insert(r, r.length, this[i]);
  }
  for (let i = 0; i < target.length; i++) {
    const item = target[i];
    if (Array.isArray(item)) {
      for (let j = 0; j < item.length; j++) {
        insert(r, r.length, item[j]);
      }
    } else {
      insert(r, r.length, item);
    }
  }
  return r;
};

Array.prototype.flat2 = function() {
  // 不改变原数组
  let r = [];
  for (let i = 0; i < this.length; i++) {
    const item = this[i];
    if (Array.isArray(item)) {
      r = r.concat([].flat2.apply(item));
    } else {
      r.push(item);
    }
  }
  return r;
};

var arr = [1, 2, 3, 4, 5];

const len = arr.insert(3, '你好');
console.log(len, arr);

const removeItem = arr.remove(3);
console.log(removeItem, arr);

console.log(arr.join2());
console.log(arr.slice2(2, 4));
console.log(arr.push2('你好', '不好'), arr, 'push');
console.log(arr.pop2(), arr, 'pop');
console.log(arr.pop2(), arr, 'pop');
console.log(arr.unshift2('unshift1', 'unshift2'), arr, 'unshift');
console.log(arr.shift2(), arr, 'shift');
console.log(arr.shift2(), arr, 'shift');
// console.log(arr.pop2(), arr, 'pop');

console.log('???');
arr.forEach2(console.log);
console.log('???');

console.log(
  arr.map2(x => x * 2),
  'map'
);

console.log(
  arr.filter2(x => x > 3),
  'filter'
);

console.log(
  arr.some2(x => x === 2),
  'some'
);
console.log(
  arr.every2(x => x > 2),
  'every'
);

console.log(
  arr.reduce2((x, y) => x + y, 0),
  'reduce'
);
console.log(
  arr.find2(x => x === 1),
  'find'
);

console.log(arr.concat2(6, 7, 8, [9, 10]), 'concat');

var arr2 = [1, 2, [3, 4, [5, 6]]];

console.log(arr2.flat2(), 'flat');
```
