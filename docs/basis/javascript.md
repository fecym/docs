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