---
title: 实现一个 Promise
date: 2020-03-22
author: chengyuming
tags:
  - Promise
  - api
  - 基础
---

> 曾面试自己心仪的公司，要求手写一个 `Promise`，当时未能解出，很是遗憾，如今整理一下这个异步的解决方案。

`promise` 的出现改变了以前 js 的回调风格。`promise` 核心是三种状态，`pending、resolve、reject`，状态一旦从 `pending` 变成其他状态则不可逆，其他用法细节将在实现 `promise` 的过程中一步步记录

## 简单版 promise

- 首先我们实现函数异步函数执行的问题

```js
// 首先是三种状态
const PENDING = 'pending';
const RESOLVED = 'resolve';
const REJECTED = 'reject';

function Promise(execute) {
  this.status = PENDING;
  // 存放成功时传递的值和失败传递的原因
  this.value = null;
  this.reason = null;
  // 回调队列
  this.onResolvedCallbacks = [];
  this.onRejectedCallbacks = [];
  const resolve = value => {
    // 状态不可逆，只有在 pending 的时候才可以改变自身的状态
    if (this.status === PENDING) {
      this.status = RESOLVED;
      this.value = value;
      // 状态发生改变的时候查看异步队列里面是否有函数，如果有就执行
      this.onResolvedCallbacks.forEach(fn => fn());
    }
  };
  const reject = reason => {
    if ((this.status = PENDING)) {
      this.status = REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach(fn => fn());
    }
  };
  // Promise 内部的默认执行函数
  execute(resolve, reject);
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  const selt = this;
  if (selt.status === RESOLVED) {
    onFulfilled(selt.value);
  }
  if (selt.status === REJECTED) {
    onRejected(selt.reason);
  }
  if (selt.status === PENDING) {
    this.onResolvedCallbacks.push(function() {
      onFulfilled(selt.value);
    });
    this.onRejectedCallbacks.push(function() {
      onRejected(selt.reason);
    });
  }
};
// 返回 Promise 便于测试
module.exports = Promise;
```

测试基本版的 `promise`

```js
// 测试基础版本的 promise
const Promise = require('./promise');
const p = new Promise((resolve, reject) => {
  // 测试异步
  setTimeout(() => {
    reject(1000);
  }, 2000);
  // 测试同步
  // reject('异常')
  // resolve('正常')
});
p.then(
  data => console.log(data),
  err => {
    console.log(err, '出错了');
  }
);
// 测试第二次 then
p.then(
  data => console.log(data),
  err => {
    console.log(err, '出错了');
  }
);
```

## then 方法补充

- promise 中的 then 方法必须返回一个 promise，Promise A+ 规范上 2.2.7 中有提到
- 所以再次调用 then 后需要返回一个全新的 promise
- 所以我们需要拿到 then 方法成功或者失败后的返回值
- 修改基础代码，把 then 方法补充完整

```js
const PENDING = 'pending';
const RESOLVED = 'resolve';
const REJECTED = 'reject';

function Promise(execute) {
  this.status = PENDING;
  // 存放成功时传递的值和失败传递的原因
  this.value = null;
  this.reason = null;
  // 回调队列
  this.onResolvedCallbacks = [];
  this.onRejectedCallbacks = [];
  const resolve = value => {
    // 状态不可逆，只有在 pending 的时候才可以改变自身的状态
    if (this.status === PENDING) {
      // 如果 resolve 里面值还是一个 promise 的话，那就递归处理一下
      if (value instanceof Promise) {
        return value.then(resolve, reject);
      }
      this.status = RESOLVED;
      this.value = value;
      // 状态发生改变的时候查看异步队列里面是否有函数，如果有就执行
      this.onResolvedCallbacks.forEach(fn => fn());
    }
  };
  const reject = reason => {
    if ((this.status = PENDING)) {
      this.status = REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach(fn => fn());
    }
  };
  execute(resolve, reject);
}

/**
 * 判断 x 和 promise 的关系，如果 x 和 promise 是一样的，那么抛出异常，不可以让自己等待自己完成，规范 2.3.1 提到
 * 如果 x 是普通值的话，直接调 resolve 即可
 * 如果 x 是一个引用类型的话，要考虑是不是 promise 函数
 * 如果不是函数的话，直接当做普通值 resolve 即可
 * 如果是函数的话那么就认为他是一个 promise 函数
 * 那么此时就让这个 函数的 then 的执行并且绑定这个 x，传入两个函数，不同的函数中执行不同的结果
 * @param {*} promise2
 * @param {*} x
 * @param {*} resolve
 * @param {*} reject
 */
function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) return reject(new TypeError('循环引用了'));
  // 判断是不是引用类型或者普通值，普通直接返回
  // 引用类型在做处理
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      const then = x.then;
      // 如果 x 中有 then，那么就认为这个 then 是一个 promise，规范 2.3.3.3
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            // 此时 y 还可能是一个 promise，所以需要递归处理一下
            resolvePromise(promise2, y, resolve, reject);
          },
          r => reject(r)
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      reject(e);
    }
  } else {
    resolve(x);
  }
}

Promise.prototype.then = function(onFulfilled, onRejected) {
  // 参数的可选性
  // 如果没有传递成功的值，那么我们给自动传递过去，这个叫做值得穿透，保证可以在后面捕获到异常
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
  // 如果错误没有传递，那我们手动传递过去
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : err => {
          throw err;
        };
  const selt = this;
  // then方法必须返回一个新的 promise
  const _promise = new Promise((resolve, reject) => {
    if (selt.status === RESOLVED) {
      setTimeout(() => {
        try {
          // then 方法中可能直接出现异常，所以 trycatch 下
          const x = onFulfilled(selt.value);
          // 需要一个方法处理 promise 中 then 方法
          // 我们要在自身中使用自身，自身还没有创建完毕了，所以我们需要异常处理一下才可以取到 _promise
          // 在 Notes 3.1 中提到，这种情况我们可以使用 setTimeout 来实现
          resolvePromise(_promise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }
    if (selt.status === REJECTED) {
      setTimeout(() => {
        try {
          const x = onRejected(selt.reason);
          resolvePromise(_promise, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });
    }
    if (selt.status === PENDING) {
      this.onResolvedCallbacks.push(function() {
        setTimeout(() => {
          try {
            const x = onFulfilled(selt.value);
            resolvePromise(_promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
      this.onRejectedCallbacks.push(function() {
        setTimeout(() => {
          try {
            const x = onRejected(selt.reason);
            resolvePromise(_promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      });
    }
  });
  return _promise;
};

module.exports = Promise;
```

测试 `promise`

```js
// 测试代码
const Promise = require('./promise');

const p = new Promise((resolve, reject) => {
  // setTimeout(() => {
  //   // resolve('情人节到了')
  //   // resolve(1000)
  //   reject(1000)
  // }, 2000)
  // reject('情人节到了')
  resolve('情人节到了');
});
p.then(
  data => console.log(data),
  err => {
    console.log(err, '出错了');
  }
);
// p.then(data => console.log(data))

// let p2 = p.then(data => {
//   // return data
//   // throw data
//   // 如果自己返回自己，自己等待着自己完成，那么当前就应该走向失败
//   // return p2
//   return new Promise((resolve, reject) => {
//     setTimeout(function() {
//       // reject(1000)
//       resolve(10000)
//     }, 2000)
//   })
// })

const p2 = p.then(data => {
  // 可能有人会这么做
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve(
        new Promise((resolve, reject) => {
          setTimeout(function() {
            resolve(
              new Promise((resolve, reject) => {
                resolve(3000);
              })
            );
          }, 1000);
        })
      );
    }, 1000);
  });
});

p2.then(
  data => {
    console.log(data, '???');
  },
  err => {
    console.log(err, '失败？？？');
  }
);
```

## catch 方法

其实 `catch` 方法就是 是一个 `p.then(null, err => console.log(err)` 的语法糖，所以 `catch` 的实现也很简单

```js
Promise.prototype.catch = function(errCallback) {
  return this.then(null, errCallback);
};
```

## 静态方法

在 `Promise` 的构造函数中提供了几个静态函数，可以直接来处理值，实现如下

### resolve

```js
Promise.resolve = function(value) {
  return new Promise((resolve, reject) => {
    resolve(value);
  });
};
```

### reject

```js
Promise.reject = function(reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};
```

### all

Promise.all 方法的可处理并发问题，而且返回值会保证代码的传入值的顺序，所以要处理好这个问题

```js
Promise.all = function(prs) {
  return new Promise((resolve, reject) => {
    const result = [];
    let count = 0;
    const processData = (idx, val) => {
      result[idx] = val;
      if (++count === prs.length) resolve(result);
    };
    prs.forEach((p, i) => {
      const then = p.then;
      if (then && typeof then === 'function') {
        then.call(p, y => processData(i, y), reject);
      } else {
        processData(i, p);
      }
    });
  });
};
```

### race

`race` 是一个赛跑方法，在 `promise` 中被称为竞态，谁先有结果要谁，不管成功还是失败只要第一个有结果的

传入值如果是一个空数组的话，`promise` 永远不会有结果，而不是立刻就有结果

```js
Promise.race = function(prs) {
  return new Promise((resolve, reject) => {
    prs.forEach(pr => {
      const then = pr.then;
      if (then && typeof then === 'function') {
        then.call(pr, y => resolve(y), reject);
      } else {
        resolve(pr);
      }
    });
  });
};
```

## deferred

有个测试 `promise` 的库 `promises-aplus-tests`，需要我们提供这么一个方法，然后用来测试 `promise` 是否符合规范

```js
Promise.deferred = function() {
  const dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
```

这个方法有什么用？其实这个方法可以用来做延迟函数

```js
// deferred 的使用
function read(url) {
  const defer = Promise.deferred();
  fs.readFile(url, 'utf8', (err, data) => {
    if (err) return defer.reject(err);
    defer.resolve(data);
  });
  return defer.promise;
}

const url = path.resolve(__dirname, './name.txt');
read(url).then(
  data => {
    console.log(data);
  },
  err => {
    console.log(err);
  }
);
```

## promise 拓展方法

虽然 `Promise` 中提供了 `all` 和 `race` 两个模式，但是很可以拓展其他的变体

### first

只要第一个 `Promise` 完成，它就会忽略后续的任何拒绝和完成

```js
// first 的实现
if (!Promise.first) {
  Promise.first = function(prs) {
    return new Promise((resolve, reject) => {
      prs.forEach(pr => {
        Promise.resolve(pr)
          // first 只取第一次执行成功的方法
          .then(resolve);
      });
    });
  };
}
```

### last

`last` 类似于 `first`，但是是取最后一个完成的结果

```js
// last 的实现
if (!Promise.last) {
  Promise.last = function(prs) {
    return new Promise((resolve, reject) => {
      const len = prs.length;
      let num = 0;
      prs.forEach(pr => {
        Promise.resolve(pr).then(res => {
          num++;
          if (num === len) {
            // 如果是最后一项，则执行最后一下的结果
            resolve(res);
          }
        });
      });
    });
  };
}
```

```js
// 测试
Promise.first([Promise.reject(1), Promise.resolve(2)]).then(res => {
  console.log(res, 'first');
});
Promise.last([1, Promise.resolve(2)]).then(res => {
  console.log(res, 'last');
});
// 测试结果：
// 2 'first'
// 2 'last'
```

### map

有时候需要在一列 `Promise` 中迭代，并对所有的 `Promise` 都执行某个任务，非常类似于数组可以做的那样（比如 forEach、map 等），如果这些任务是同步的那这些任务就可以做，但是从根本上上来说 `Promise` 任务是异步的，所以我们需要一个类似的工具方法

```js
// Promise.map 的实现
if (!Promise.map) {
  Promise.map = function(vals, cb) {
    return Promise.all(
      vals.map(val => {
        return new Promise((resolve, reject) => {
          cb(val, resolve, reject);
        });
      })
    );
  };
}

// 测试
const p1 = Promise.resolve(21);
const p2 = 42;
// const p3 = Promise.reject('failed')
Promise.map([p1, p2], function(val, done, failed) {
  // 保证 val 是 Promise，统一格式
  Promise.resolve(val).then(res => {
    done(res * 2);
    //  捕获失败的情况
  }, failed);
})
  .then(result => {
    console.log(result, 'result');
  })
  .catch(e => {
    console.log(e, 'e');
  });

// 最终输出结果是，如果加上一个失败的 promise 该函数也是可以捕获的哦
// [42, 84]
```

## promisify

在 `node` 中，所有方法都是错误优先，所以在核心模块 `util` 中有个 `promisify` 方法，来把 `node` 中的异步方法处理成 `promise`

比如有以下场景：我不可能每次写一个方法都这么封装一次 `promise`，太麻烦了，所以出现了一个把函数 `promise` 化

```js
function read(url) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, 'utf8', (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}
```

模拟以下实现过程：

1. 首先 `promisify` 是把一个函数 `promise` 化，那么肯定接受一个函数为参数
2. 然后 `promise` 化之后应该首先返回一个函数，然后可以调 `then` 方法
3. 也就是说应该先返回一个函数，然后函数中返回一个 `promise`

```js
function promisify(fn) {
  return function() {
    return new Promise((resolve, reject) => {
      fn(...arguments, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  };
}
```

## promisifyAll

如上的 promisify 我们可以把一个对象里面的所有方法转换成 promise，所以可以写一个 promisifyAll 方法来处理

```js
// 不常用
function promisifyAll(obj) {
  if (typeof obj[key] === 'function') {
    obj[key + 'Async'] = promisify(obj[key]);
  }
}

// 使用
promisifyAll(fs);
fs.readFileAsync(url, 'utf8').then(res => {
  console.log(res, 'promisifyAll');
});
```

## 参考文献

- 珠峰培训架构课程
- 《你不知道的 JavaScript》中卷
