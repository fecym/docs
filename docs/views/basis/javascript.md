# JavaScript基础

## 防抖和节流

### 防抖
- 防抖：触发高频事件后n秒内只会执行一次，如果n秒内高频事件再次被触发，则重新计算时间。
- 思路：每次触发事件时都取消之前的延时调用
```js
  function debounce(fn, step) {
    let timer = null
    return function() {
      clearTimeout(timer)
      // 每次调用前先清除
      timer = setTimeout(() => {
        fn.apply(this, arguments)
      }, step)
    }
  }
```
### 节流
- 高频事件触发，但在n秒内只会执行一次，所以节流会稀释函数的执行频率
- 思路：每次触发事件时都判断当前是否有等待执行的延时函数
```js
  function throttle(fn, step) {
    ley canRun = true
    return function() {
      if (!canRun) return
      canRun = false
      setTimeout(() => {
        fn.apply(this, arguments);
        canRun = true
      }, step)
    }
  }
```
## Reflect

::: tip 
  *Reflect*对象与*Proxy*对象一样，都是Es6为了操作对象而提供的新API。*Reflect*对象的设计目的有这样几个
  - 将*Object*对象的一些明显属于语言内部的方法（比如*Object.defineProperty*），放到*Reflect*对象上。现阶段，某些方法同时在*Object*和*Reflect*对象上部署，未来新的方法将只部署在*Reflect*对象上。也就是说，从*Reflect*对象上可以拿到语言内部的方法。
  - 修改某些*Object*方法的返回结果，让其变得更合情合理。比如，*Object.defineProperty(obj, name, desc)*在无法定义属性时会抛出一个错误，而*Reflect.definProperty(obj, name, desc)*则会返回*false*
  - 让*Object*操作都变成函数行为。某些*Object*操作都是命令式，比如*name in obj*和*delete obj[name]*，而*Reflect.has(obj, name)*和*Reflect.deleteProperty(obj, name)*让他它们变成了函数行为
  - *Reflect*对象的方法与*Proxy*对象的方法一一对应，只要是*Proxy*对象的方法，就能在*Reflect*对象上找到对应的方法。这就让*Proxy*对象可以方便地调用对应的*Reflect*方法，完成默认行为，作为修改行为的基础。也就是说，**不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为**。
:::