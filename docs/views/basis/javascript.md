# JavaScript 基础

## 防抖和节流

### 防抖

- 防抖：触发高频事件后 n 秒内只会执行一次，如果 n 秒内高频事件再次被触发，则重新计算时间。
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

- 高频事件触发，但在 n 秒内只会执行一次，所以节流会稀释函数的执行频率
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
*Reflect*对象与*Proxy*对象一样，都是 Es6 为了操作对象而提供的新 API。*Reflect*对象的设计目的有这样几个

- 将*Object*对象的一些明显属于语言内部的方法（比如*Object.defineProperty*），放到*Reflect*对象上。现阶段，某些方法同时在*Object*和*Reflect*对象上部署，未来新的方法将只部署在*Reflect*对象上。也就是说，从*Reflect*对象上可以拿到语言内部的方法。
- 修改某些*Object*方法的返回结果，让其变得更合情合理。比如，*Object.defineProperty(obj, name, desc)*在无法定义属性时会抛出一个错误，而*Reflect.definProperty(obj, name, desc)*则会返回*false*
- 让*Object*操作都变成函数行为。某些*Object*操作都是命令式，比如*name in obj*和*delete obj[name]*，而*Reflect.has(obj, name)*和*Reflect.deleteProperty(obj, name)*让他它们变成了函数行为
- *Reflect*对象的方法与*Proxy*对象的方法一一对应，只要是*Proxy*对象的方法，就能在*Reflect*对象上找到对应的方法。这就让*Proxy*对象可以方便地调用对应的*Reflect*方法，完成默认行为，作为修改行为的基础。也就是说，**不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为**。
:::

## 继承

- new运算符的缺点
  - 用构造函数生成的实例对象，有一个缺点，那就是无法共享属性和方法
  - 在DOG对象的构造函数中，设置一个实例对象的共有属性 *type*
  ```js
    function DOG(name) {
      this.name = name;
      this.type = '犬科';
    }
    var dogA = new DOG('大毛');
    var dogB = new DOG('二毛');
    // 修改其中一个
    dogB.type = '猫科'
    console.log(dogA, dogB)
  ```
  <p align="center">
    <img :src="$withBase('/imgs/basis-javascript-inherit.png')" height="">
  </p>
  - 这两个*type*属性是独立的，修改其中一个不会影响到另外一个
  - 每一个实例对象，都有自己的属性和方法的副本。这不仅无法做到数据的共享，也是极大的资源浪费

- 因此，有了 *prototype* 属性
  - 所有实例对象要共享的属性和方法，都放到这个 _prototype_ 对象里面
  - 那些不需要的共享的属性和方法就放在构造函数里面
  - 实例对象一旦被创建，将自动引用 _prototype_ 对象的属性和方法。也就是说，实例对象的属性和方法，分为两种，一种是本地的，一种是引用的
  - 其实就是两个对象共同引用同一个对象，作为自己的共有属性和方法
  ```js
    function DOG(name) {
      this.name = name;
    }
    DOG.prototype = { type: '犬科' }
    var dogA = new DOG('大毛');
    var dogB = new DOG('二毛');
    DOG.prototype.type = '犬科'
    console.log(dogA.type, dogB.type)
  ```

### 原型链继承

- 让子类的原型(_proptype对象_)指向父类的实例，就实现了原型链继承
```js {10}
  function Parent() {
    this.name = '小明'
    this.colors = ['red', 'blue']
  }
  function Child() {}
  Child.prototype = new Parent()

  var c1 = new Child()
  c1.colors.push('green')
  c1.name = '小白'

  var c2 = new Child()
  c2.colors = ['a', 'b', 'c', 'd']
  console.log(c2, c1)
```
<p align="center">
  <img :src="$withBase('/imgs/basis-javascript-prototype-inherit.png')" height="">
</p>

- 原型链继承会共享父类的属性，所有的子类都会共享一个属性
- 就是说如果你只是拿来使用那么就是共用父类的属性，有一处修改都会发生改变，但是直接修改值类型不会发生改变，因为那就变成自身属性
- 比如说第10行修改*name*属性后，其实就是在子类中添加该属性了
- 但是对于对象来说，如果自身拥有那么就会对原型屏蔽，如果自身没有则去查找原型链
- 如果你直接修改父类的属性值，而子类本身没有的话，那么子类所继承的属性都会发生改变


### 借用构造函数（类式继承）

- 使用 *call* 或 *apply* 方法，将父对象的构造函数绑定到子对象上，就是父对象在子对象内部执行，**this** 指向子对象
- 那不就是子对象上有父对象上的属性和方法了，因为父对象执行的时候，this执行了子对象
```js {7}
    function Parent(name, age) {
      this.name = name
      this.age = age
      this.colors = ['red', 'blue']
    }

    function Child(name, age) {
      Parent.apply(this, arguments)
    }

    var c1 = new Child('小明', 24)
    var c2 = new Child('小白', 25)
    c2.colors.push('green')
    console.log(c1, c2)
```
<p align="center">
  <img :src="$withBase('/imgs/basis-javascript-constructor-inherit.png')" height="">
</p>

- 如上代码，其实父类执行了一次就是生成了两个属性，父类直接执行的话就是给 *window* 生成了几个属性
- 让父类在子类创建中执行，并且改变其 **this** 为子类this，那么不就是相当于把父类的拿两句话又写了一遍吗，不就是给子类添加了几个属性嘛
- 这种方法，每次实例化一个对象都是一个独立的对象，他们不会公用属性
- 他是解决了共享问题解决了，每一个属性都是独立的
- 但是我们是基于原型链的，但是我们并没有真正的去利用原型链的共享功能，完全抛弃了它，并且导致每次 *new* 实例的时候，都会去调用父类的构造方法去加到子类的实例上，是完全的copy paste过程，这等于舍弃了js原型链的精髓部分，这样的代码自然是没有灵魂的~

<!-- https://juejin.im/post/5d38788051882541175c1075 -->



