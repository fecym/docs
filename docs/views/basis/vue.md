---
title: Vue 2.x 版本源码分析
date: 2020-06-14
author: chengyuming
keys:
  - 'vue-cym'
tags:
  - vue
---

## 数据劫持

### 对象的劫持

2.x 版本的数据劫持是根据 Object.defineProperty 来实现的

```js
function observe(data) {
  // 不是对象直接返回
  if (!(typeof data === 'object' && data !== null)) return;
  return observer(data);
}
function observer(data) {
  if (Array.isArray(data)) {
    observeArray(data);
  } else {
    observeObject(data);
  }
}
function observeObject(data) {
  const keys = Object.keys(data);
  keys.forEach(key => {
    const value = data[key];
    defineReactive(data, key, value);
  });
}
// 数组劫持下面继续
function observeArray(data) {
  data.forEach(item => observe(item));
}
function defineReactive(data, key, value) {
  // 如果value是对象的话递归处理，外层已经判断过是不是对象了，所以可以直接直接执行
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newVal) {
      // 如果设置的新值没有变化，则不处理
      if (newVal === value) return;
      observe(newVal);
      value = newVal;
    },
  });
}
```

### 数组的劫持

- 如果是对数组进行监测的话还要按照上面的套路处理就会对数据的索引进行检测，但是对数组的索引进行监测意义不大，还会导致性能问题
- 而且我们在开发中也很少去操作索引，一般是使用数组的 api 来操作数组的，而操作这些 api 也会导致数组的成员的变更，所以需要重写这些 api
- 常见的数组 7 个 api：`push、shift、unshift、pop、reverse、sort、splice` 会导致数组发生改变，那我们就重写这几个就可以
- 写法用到装饰器模式，对数组 api 进行一层包装
- 我们可以把上面的 observe 改写为类的写法，对每一个进行监听过的属性设置一个标识
- 如下代码及注释，然后在 Observe 类中引入新的数组方法，便可以实现对数组的监听

```js
// 重写数组 api
const oldArrayMethods = Array.prototype;
// 利用原型链的查找逻辑，先查找重写的，如果没有找到则向上查找
// arrayMethods.__proto__ = oldArrayMethods
const arrayMethods = Object.create(oldArrayMethods);
const methods = ['push', 'shift', 'unshift', 'pop', 'sort', 'splice', 'reverse'];

methods.forEach(method => {
  arrayMethods[method] = function(...args) {
    // 执行原始的数组中的方法 --> AOP 思想
    const result = oldArrayMethods[method].apply(this, args);
    // push 和 unshift 可能会添加一个对象，还需要继续监听
    let inserted;
    // 在 Observe 类中存入的，为了得到类的方法，也为了说明这个对象被监听过了
    const ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      // splice 也可能新增一个值或者替换一个值  arr.splice(0, 1, { name: 2 })
      // 那么传入的第三个参数往后就是要替换的或者追加的值
      case 'splice':
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    if (inserted) {
      // 将新增属性继续观测
      ob.observeArray(inserted);
    }
    return result;
  };
});
```

### 改良后完整写法

```js {12}
class Observe {
  constructor(data) {
    // 给每一个监控的对象，都增加一个 __ob__ 属性，表示这个对象已经被监控了
    // 防止监听自身死循环
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      configurable: false,
      value: this,
    });
    if (Array.isArray(data)) {
      // 重写原型方法
      data.__proto__ = arrayMethods;
      this.observeArray(data);
    } else {
      this.observeObject(data);
    }
  }
  observeArray(value) {
    for (let i = 0; i < value.length; i++) {
      observe(value[i]);
    }
  }
  observeObject(data) {
    const keys = Object.keys(data);
    keys.forEach(key => {
      const value = data[key];
      defineReactive(data, key, value);
    });
  }
}

function observe(data) {
  // 不是对象直接返回
  if (!(typeof data === 'object' && data !== null)) return;
  return new Observe(data);
}
function defineReactive(data, key, value) {
  // 如果value是对象的话递归处理，外层已经判断过是不是对象了，所以可以直接直接执行
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newVal) {
      // 如果设置的新值没有变化，则不处理
      if (newVal === value) return;
      observe(newVal);
      value = newVal;
    },
  });
}
```

### 测试用例

```js
var o = {
  age: 11,
  name: 'cym',
  address: {
    number: 0,
    name: 'xxxx',
  },
  names: [
    {
      a: 1,
    },
    {
      b: 2,
    },
  ],
};

observe(o);
console.log(o);
o.names.push({ c: 3 });
console.log(o);
```
