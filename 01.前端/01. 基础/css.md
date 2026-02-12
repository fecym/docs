---
url: /docs/01.前端/01. 基础/css.md
---

## css 加载会造成阻塞吗

> js 加载会造成 *DOM* 树的解析和渲染

### css 加载会造成 DOM 树的阻塞嘛？

* 首先，*css* 加载会阻塞 *DOM* 树渲染，但是 *css* 并不会阻塞 *DOM* 树的解析
* 也就是说，你可以在 *css* 加载完之前可以在 *js* 中获取到 *DOM* 元素，但是 *DOM* 却是没有渲染到页面上，需要等到 *css* 加载完毕才渲染
* 为什么会这样？
  * 在你加载 *css* 的时候，可能会修改 *DOM* 节点的样式，如果 *css* 加载不阻塞 *DOM* 树渲染的话，那么当 *css* 加载完之后， *DOM* 树可有又得重绘或者回流了
  * 所以干脆先把 *DOM* 树的结构先解析完成，把可以做的工作做完，然后等你 *css* 加载完之后，再根据最终样式来渲染 *DOM* 树，这种做法性能方面确实会比较好一点。（猜测）

### css 加载会阻塞 js 运行嘛？

* css 加载会阻塞**后面的 js 语句**的执行

### 总结

1. css 加载不会阻塞 *DOM* 树的解析；
2. css 加载会阻塞 *DOM* 树的渲染；
3. css 加载会阻塞后面 js 语句的执行

### 浏览器渲染流程

* 浏览器渲染的流程如下：
  1. *html* 解析文件，生成 *DOM* 树，解析 *css* 文件生成 *CSSOM* 树
  2. 将 *DOM* 树和 *CSSOM* 树结合，生成 *Render Tree*
  3. 根据 *Render Tree* 渲染机制，将像素渲染到屏幕上
* 从浏览器渲染流程可以看出
  1. *DOM* 解析和 *CSS* 解析是两个并行的进程，所以这也解释了为什么 *css* 加载不会阻塞 *DOM* 的解析
  2. 然而，由于 *Render Tree* 是依赖与 *DOM Tree* 和 *CSSOM Tree*，所以它必须等到 *CSSOM Tree* 构建完成，也就是 *css* 资源加载完成(或者加载失败)后，才开始渲染，因此，css 加载是会阻塞 *DOM* 的渲染的
  3. 由于 *js* 可能会操作之前的 *dom* 节点和 *css* 样式，因此浏览器会维持 *html* 中 *css* 和 *js* 的顺序。因此，样式表会在后面的 *js* 执行前先加载执行完毕。所以 *css* 会阻塞后面 *js* 的执行

### DOMContentLoaded

* 对于浏览器来说，页面加载主要有两个事件，一个是 *DOMContentLoaded*，另一个是 *onLoad*
* *onload* 就是等待页面所有资源都在加载完成才会触发，这些资源包括 css、js、图片视频等
* *DOMContentLoaded* 顾明思议就是当页面的**内容解析完成后**，则触发该事件
  * 如果页面中同时存在 css 和 js，并且**js 在 css 后面**，则 *DOMContentLoaded* 事件会在 css 加载完后才执行
  * 其他情况下，*DOMContentLoaded* 都不会等待 css 加载，并且 *DOMContentLoaded* 事件也不会等待图片、视频等其他资源加载

## css 自定义属性

> 17 年 3 月份，微软宣布 *Edge* 浏览器支持 *css* 变量，那就说明所有浏览器都支持了

### 变量的声明

* 变量声明的时候，变量名前面要加两个横线 **--**

```css {2}
:root {
  --color: green;
  --base-size: 4px;
}
.foo {
  --theme-color: red;
  --border-radios-num: 4px;
}
```

* 它们与 color、font-size 等正式属性没有什么不同，只是没有默认含义。所以 *CSS* 变量（*CSS variable*）又叫做"*CSS* 自定义属性"（*CSS custom properties*）。因为变量与自定义的 *CSS* 属性其实是一回事。
* 因为 *$color* 被 *Sass* 用掉了，*@color* 被 *Less* 用掉了。为了不产生冲突，官方的 *CSS* 变量就改用两根连词线了。
* 变量名大小写敏感，--header-color 和--Header-Color 是两个不同变量。

### 变量的使用

* *var()* 函数用于读取变量
* *var()* 函数还可以使用第二个参数，表示变量的默认值。如果变量不存在，就会使用默认值。

```css {3}
p {
  /* color: var(--theme-color); */
  color: var(--color, #7f583f);
  border: 1px solid #000;
  border-radius: var(--border-radios-num);
}
```

* 变量值只能用作属性值，不能用作属性名。

### 变量的作用域

* 同一个 *CSS* 变量，可以在多个选择器内声明。读取的时候，优先级最高的声明生效。这与 *CSS* 的"层叠"（cascade）规则是一致的。

```html
<style>
  :root {
    --color: blue;
  }
  div {
    --color: green;
  }
  #alert {
    --color: red;
  }
  * {
    /* 使用变量 */
    color: var(--color);
  }
</style>
<body>
  <p>蓝色</p>
  <div>绿色</div>
  <div id="alert">红色</div>
</body>
```

* 上面代码中，三个选择器都声明了 *--color* 变量。不同元素读取这个变量的时候，会采用优先级最高的规则，因此三段文字的颜色是不一样的。
* 也就是说，变量的作用域就是它所在的选择器的有效范围。
* 所以全局的变量通常放在根元素 *:root* 里面，确保任何选择器都可以读取它们。
* [参考链接](https://www.ruanyifeng.com/blog/2017/05/css-variables.html)

## *margin*

* 关于 *margin*，有几点需要注意下
* *margin* 的 *top 和 bottom* 对非替换内联元素无效（可以暂时理解为行内元素）
* 不过对于 *display: inline-block;* 的元素设置是有效的
* 但是 *margin: auto* 对于 *display: inline-block;* 的元素设置是无效的
* 对于 *display: inline-block;* 的元素设置居中需要用到 *text-align: center;*
* *margin* 塌陷暂时不提

## 居中

### 利用 *absolute* + *负 margin* 实现

* 要求：已知宽高

```html {23}
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心代码 */
  .parent {
    position: relative;
  }
  .child {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -50px;
    margin-top: -50px;
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

### 利用 *position* + *margin auto* 实现

* 科普一下，我以为认为这种方法是不可以实现居中，曾面试别人的时候，我还理直气壮的跟别人说，你这个根本实现不了
* 今天，我才感觉自己当时是多么的无知，当然核心原理是**已知要居中元素的宽高**
* 如果要居中元素的宽高**未知**，那么这么设置会让子元素的*宽高变得和父亲的宽高一样*，同时 *margin: auto* 也是无效的
* 这可能也是我当时理解错的地方，所以跟人家说这个根本实现不了
* 要求：已知宽高

```html {25}
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    position: relative;
  }
  .child {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

### 利用 *position* + *calc 函数* 实现

* 他的原理跟第一种基本一样
* 要求已知宽高

```html
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    position: relative;
  }
  .child {
    position: absolute;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

### 利用 *position* + *transform* 实现

* 这个方法经常用在移动端或者那些不确定宽高的情况下
* 不需要知道子盒子的宽度和高度，也是我经常用的一种

```html {31}
<style>
  :root {
    --width: 100px;
    --height: 100px;
    --bgc: green;
  }
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }

  .child {
    /* 宽高是动态的，未知的 */
    width: var(--width);
    height: var(--height);
    background: var(--bgc);
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    position: relative;
  }

  .child {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

### 利用 *text-align* + *lineheight* 实现

* 这种方法，可以使元素不脱标，在标准流下实现居中
* 但是，要求**子盒子**不能是*块级元素*（也可以转成行内或者行内块元素）
* 此时只需要给父盒子设置样式即可，*lineheight 必须设置为父盒子的高度*

```html
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    padding: 50px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    text-align: center;
    line-height: 300px;
  }
</style>
<body>
  <div class="parent">
    <!-- <div class="child">content</div> -->
    <span class="child">子</span>
  </div>
</body>
```

### 利用 *writing-mode* 来实现

::: tip
介绍下*writing-mode* 属性：顾名思义是书写方式，那就是文字写书方式，就是文字是横排还是竖排。

* 因为 *writing-mode* 是曾经是 IE 私有的，后来被各大浏览器所支持，所以他有两套不同的语法

* css3 规范的语法
  * *writing-mode: horizontal-tb;* -> *tb（top-bottom）*，元素是从上到下堆叠的
  * *writing-mode: vertical-rl;* -> *rl（right-left）*，表示文字是垂直方向(*vertical*)展示，然后阅读顺序是从右往左
  * *writing-mode: vertical-lr;* -> *lr（left-right）*，表示文字是垂直方向(*vertical*)展示，然后阅读顺序是从左往右
  * *writing-mode: inherit;*
  * *writing-mode: initial;*
  * *writing-mode: unset;*

* *writing-mode* 使得默认的水平流改成了垂直流。具体介绍请看[张鑫旭](https://www.zhangxinxu.com/wordpress/2016/04/css-writing-mode/)大大的博客
  :::

* 其实原理也是跟 *text-align* + *lineheight* 实现差不多，只不过水平流变成了垂直垂直流

```html {23}
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    writing-mode: vertical-rl;
    text-align: center;
    line-height: 300px;
  }
  .child {
    writing-mode: horizontal-tb;
    line-height: 100px;
    display: inline-block;
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

* 注意高亮的弟 23 行，为什么又设置了一次 *line-height*，因为子元素被定义成了 *inline-block*，*inline-block* 是有一些问题的，需要特殊处理

### 利用 *table* 表格布局实现

* 表格布局，现在布局基本不用这种方式了，所以暂时不做介绍了

### 利用 *table-cell* 来实现

* 原理就是将 div 转换为 table 布局

```html
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
  }
  .child {
    display: inline-block;
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

### 利用 *flex* 布局实现

* *flex* 布局作为 css 最强大布局方式，不多做介绍

```html {17}
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

### 利用 *grid* 网格布局实现

* *grid* 作为 css 新宠，也是很强大的，只是兼容性不好，但是写法也很简单

```html {17}
<style>
  /* 公共代码 */
  .parent {
    border: 1px solid red;
    width: 300px;
    height: 300px;
  }
  .child {
    width: 100px;
    height: 100px;
    background: green;
  }
  /* 公共代码 */

  /* 核心 */
  .parent {
    display: grid;
  }
  .child {
    align-self: center;
    justify-self: center;
  }
</style>
<body>
  <div class="parent">
    <div class="child">content</div>
  </div>
</body>
```

## 布局 - 左边固定右边自适应

### 经典方案 float

```html
<style>
  .container {
    overflow: hidden;
  }
  .left {
    float: left;
    width: 200px;
    height: 100vh;
    background-color: blue;
  }
  .right {
    margin-left: 200px;
    height: 100vh;
    background-color: green;
  }
</style>
<body>
  <div class="container">
    <div class="left"></div>
    <div class="right"></div>
  </div>
</body>
```

### 经典方案 定位

```html
<style>
  .container {
    position: relative;
  }
  .left {
    position: absolute;
    width: 200px;
    height: 100vh;
    background-color: blue;
  }
  .right {
    margin-left: 200px;
    height: 100vh;
    background-color: green;
  }
</style>
<body>
  <div class="container">
    <div class="left"></div>
    <div class="right"></div>
  </div>
</body>
```

### flex 布局

```html
<style>
  .container {
    display: flex;
  }
  .left {
    width: 200px;
    height: 100vh;
    background-color: blue;
  }
  .right {
    flex: 1;
    height: 100vh;
    background-color: green;
  }
</style>
<body>
  <div class="container">
    <div class="left"></div>
    <div class="right"></div>
  </div>
</body>
```

## 层叠上下文和层叠顺序

### 层叠上下文

* 在 css2.1 规范中，每个盒模型的位置是三维的，分别是平面画布上的 x 轴，y 轴以及表示层叠的z 轴
* z 轴：表示的是用户与屏幕的这条看不见的垂直线

- 一般情况下，元素在页面上沿 x 轴 y 轴平铺，我们察觉不到它们在 z 轴上的层叠关系。而一旦元素发生堆叠，这时就能发现某个元素可能覆盖了另一个元素或者被另一个元素覆盖。它们的层叠关系我们可称为层叠上下文。
- 元素的层叠等级（谁在谁上边）是由其所在的层叠上下文决定的
- 层叠等级的比较只有在当前层叠上下文元素中才有意义。不同层叠上下文中比较层叠等级是没有意义的。
- 如何生成层叠上下文？
  1. HTML 中根元素本身就具有层叠上下文，称为根层叠上下文
  2. 普通元素设置 *position* 属性为非 *static* 值并设置 *z-index* 属性为具体数值，产生层叠上下文
  3. css3 中的新属性也可以产生层叠上下文
- 说的多不如上代码，来的直接，上代码，和效果图

```html
<style>
  div {
    width: 300px;
    position: relative;
    color: white;
  }
  p {
    width: 300px;
    height: 300px;
    position: absolute;
  }
  .a {
    z-index: 1;
    background-color: red;
  }
  .b {
    z-index: 2;
    background-color: green;
    top: 20px;
    left: 20px;
  }
  .c {
    z-index: 3;
    background-color: blue;
    top: 40px;
    left: 40px;
  }
</style>
<div>
  <p class="a">我是a</p>
  <p class="b">我是b</p>
</div>
<div>
  <p class="c">我是c</p>
</div>
```

* 还有一种情况就是，当父盒子也设置为层叠上下文，那么就会根据父盒子的 *z-index* 来处理，子盒子设置再高也不行，上代码和图

```html {9}
<style>
  div {
    width: 300px;
    height: 300px;
    position: relative;
    color: white;
  }
  .box1 {
    z-index: 2;
  }
  .box2 {
    z-index: 1;
  }
  p {
    width: 300px;
    height: 300px;
    position: absolute;
  }
  .a {
    z-index: 10;
    background-color: red;
  }
  .b {
    z-index: 20;
    background-color: green;
    top: 20px;
    left: 20px;
  }
  .c {
    z-index: 99999;
    background-color: blue;
    top: -260px;
    left: 40px;
  }
</style>
<div class="box1">
  <p class="a">我是a</p>
  <p class="b">我是b</p>
</div>
<div class="box2">
  <p class="c">我是c</p>
</div>
```

* 为什么出现这种情况？举个例子：处于层叠上下文中的元素，就像是元素当了官，等级自然比普通元素高。再想象一下，假设一个官员 A 是个省级领导，他下属有一个秘书 a-1，家里有一个保姆 a-2。另一个官员 B 是一个县级领导，他下属有一个秘书 b-1，家里有一个保姆 b-2。a-1 和 b-1 虽然都是秘书，但是你想一个省级领导的秘书和一个县级领导的秘书之间有可比性么？甚至保姆 a-2 都要比秘书 b-1 的等级高得多。谁大谁小，谁高谁低一目了然，所以根本没有比较的意义。只有在 A 下属的 a-1、a-2 以及 B 下属的 b-1、b-2 中相互比较大小高低才有意义。

### 层叠顺序

* 层叠顺序表示元素发生层叠时按照特定的顺序规则在*Z 轴*上垂直显示
  1. 左上角"层叠上下文 background/border"指的是层叠上下文元素的背景和边框。
  2. **inline/inline-block**元素的层叠顺序要高于**block(块级)/float(浮动)元素**。
  3. 单纯考虑层叠顺序，z-index: auto 和 z-index: 0 在同一层级，但这两个属性值本身是有根本区别的。
* 为什么**inline/inline-block**元素的层叠顺序要高于**block(块级)/float(浮动)元素**？
  * 网页设计之初最重要的就是文字内容，所以在发生层叠时会优先显示文字内容，保证其不背覆盖
* 如何在遇到元素层叠时，能很清晰地判断出谁在上水在下？
  1. 首先比较两个元素是否处于同一个层叠上下文中
  2. 如果处于同一个层叠上下文中，谁的层级等级大谁在上面（根据图）
  3. 如果两个元素不在统一层叠上下文中，请先比较他们所处的层叠上下文的层叠等级
  4. 当两个元素层叠等级相同、层叠顺序相同时，在**DOM 结构中后面的元素**层叠等级在前面元素之上
* *z-index: auto*的情况下，不产生层叠上下文

### css3 影响层叠上下文的属性

* 父元素的 *display* 属性值为 *flex|inline-flex*，子元素的 *z-index* 属性值不为 *auto* 的时候，子元素为层叠上下文元素
* 元素的 *opacity* 属性值不是 1
* 元素的 *transform* 属性值不是 *node*
* 元素的 *mix-blend-mode* 属性值不是 *normal*
* 元素的 *filter* 属性值不是 *node*
* 元素的 *isolation* 属性值是 *isolate*
* *will-change* 指定的属性值为上面的任意一个
* 元素的 *-webkit-overflow-scrolling* 属性值为 *touch*

```html {3}
<style>
  .box {
    display: flex;
  }
  .parent {
    width: 200px;
    height: 100px;
    background-color: skyblue;
    z-index: 1;
  }
  .child {
    width: 100px;
    height: 200px;
    background: greenyellow;
    position: relative;
    z-index: -1;
  }
</style>
<div class="box">
  <div class="parent">
    parent
    <div class="child">child</div>
  </div>
</div>
```

* 参考链接，[张鑫旭大大博客](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)、[MagicEyeslv 的彻底搞懂 CSS 层叠上下文...](https://juejin.im/post/5b876f86518825431079ddd6)

## css 选择器

### 伪类和伪元素

* 以 **:** 开头的是伪类，比如：:last-child
* 以 **::** 开头的是伪元素，比如：::after

### + 和 ~

* **+** 选择器，被称为相邻选择符，可选择紧接在另一元素后的元素，且二者有相同父元素。如下代码，此时 *test-2* 将会变成红色
* **~** 选择器，被称为兄弟选择符，位置无须紧邻，只须同层级，A~B 选择 A 元素之后所有同层级 B 元素，如下，*And here is a span.* 将变成红色

```html
<!-- 相邻选择器 -->
<style>
  .test + li {
    color: red;
  }
</style>
<ul>
  <li class="test">test-1</li>
  <li>test-2</li>
  <li>test-3</li>
</ul>
```

```html
<!-- 兄弟选择器 -->
<style>
  p ~ span {
    color: red;
  }
</style>
<span>This is not red.</span>
<p>Here is a paragraph.</p>
<code>Here is some code.</code>
<span>And here is a span.</span>
```

### :not()

* **:not(X)** 被称为否定伪类，也叫 **排除选择器**。是一个简单的以选择器 *X* 为参数的功能性标记函数。它匹配不符合参数选择器 *X* 描述的元素。*X* 不能包含另外一个否定选择器
* **:not(X)** 伪类的优先级即为它参数选择器的优先级。**:not(X)** 伪类不像其它伪类，它不会增加选择器的优先级。
* 如下代码，该选择可以很好的用在，排除谁在外的其他元素设置样式，比如导航栏的最后一个不需要 *margin-right*，其他都有 *margin* 就可以这么玩

```html
<style>
  li:not(:last-child) {
    margin-right: 20px;
  }
</style>
<ul>
  <li>首页</li>
  <li>首页</li>
  <li>首页</li>
  <li>首页</li>
  <li>首页</li>
</ul>
```

### ::first-line

* **::first-line** 伪元素，顾名思义是设置一个元素内的第一行的样式。第一行的长度取决于很多因素，包括元素宽度，文档宽度和文字大小。
* **::first-line** 只能在块元素中，所以 **::first-line** 只能在一个 *display* 值为 *block*, *inline-block*, *table-cell* 或者 *table-caption* 中有用。在其他的类型中，**::first-line** 是不起作用的.
* 如下代码，只有第一行会被设置为红色，但是如果没有换行的话，就是全部红色了哦

```html
<style>
  p::first-line {
    color: red;
  }
</style>
<p>
  <span>::first-line-1</span>
  <br />
  <span>::first-line-2</span>
  <br />
  <span>::first-line-3</span>
  <br />
  <span>::first-line-4</span>
  <br />
  <span>::first-line-5</span>
</p>
```

### :nth-child(an+b)

* **:nth-child(an+b)** 首先找到所有当前元素的兄弟原色，然后按照位置的先后顺序从 1 开始排序，选择结果为 **(an+b)** 个元素的集合 **(n=0, 1, 2, 3..)**
* 0n+3或简单3匹配第三个元素
* 1n+0或简单n匹配每一个元素
* 2n+0或简单2n匹配位置为 2、4、6、8...的元素
* 2n+1匹配位置为 1、3、5、7...的元素
* 完整语法就是 an+b，我们基本使用之传入一个数字，来告诉选择器我们选择哪个元素，css 的排序规则是从1开始的，这点跟js不一样
* :nth-last-child(an+b) 语法跟 :nth-child(an+b) 基本一样，不一样的地方是，:nth-last-child(an+b) 是倒着数的

## 浏览器的滚动 scroll

### 设置滚动条的滚动高度

* 最常用的方法就是 window.scrollTo(0, 100)

```js
// 绝对滚动到距离上边100
window.scrollTo(0, 100);
// 或者传递一个对象
window.scrollTo({
  left: 0,
  top: 100,
});
```

* 也可以使用相对滚动设置 scrollBy

```js
// 每次滚动相对于当前位置，向下滚动100
window.scrollBy(0, 100);
// 或者
window.scrollBy({
  left: 0,
  top: 100,
});
```

* 再或者直接使用 scrollTop 设置

```js
document.scrollingElement.scrollTop = 100;
```

### 如何指定一个元素显示在指定的位置

* 最常用的方法就是：获取到元素距离文档顶部的距离，然后设置滚动条的高度过去

```js
const offsetTop = document.getElementById('scroll').offsetTop;
// 设置滚动条的高度
window.scrollTo(0, offsetTop);
```

* 也可以使用锚点

```html
<a href="#box">我要看这个盒子</a>
<div id="box">你要看的盒子</div>
```

* 或者直接使用 scrollIntoView API

```js
// 不传参数，默认跳到该元素的顶端
document.getElementById('scroll').scrollIntoView();
// 还可以指定元素出现在指定的位置
document.getElementById('scroll').scrollIntoView({
  // 不传参数默认为start
  block: 'start' | 'center' | 'end',
});
```

### 平滑的移动

* 如果使他们平滑的移动呢，可以传递一个参数 behavior 设置为 smooth

```js
window.scrollTo({
  // 将浏览器的行为设置为平滑的移动
  behavior: 'smooth',
});
window.scrollBy({
  behavior: 'smooth',
});
document.getElementById('scroll').scrollIntoView({
  behavior: 'smooth',
});
```

* 也可以使用 css 属性进行设置

```css
html {
  /* 使得全局的滚动都具有平滑的效果 */
  scroll-behavior: smooth;
}
/* 或者设置所有的滚动 */
* {
  scroll-behavior: smooth;
}
```

### 横向滚动

* 设置横向滚动其实很简单，以前我的做法是利用 js 做的，完全是因为基础不扎实的缘故
* 其实 css 完全可以实现横线滚动，而且不需要动态的计算父盒子的宽度然后进行设置
* 具体实现如下，我们只需要设置为超出不换行就可以了

```html {5}
<style>
  ul {
    overflow-x: auto;
    /* 超出不换行 */
    white-space: nowrap;
  }
  li {
    display: inline-block;
    border: 3px solid #000;
    border-radius: 4px;
  }
  li:not(:last-child) {
    margin-right: 20px;
  }
  img {
    display: block;
    width: 260px;
    height: 150px;
  }
</style>
<ul>
  <li><img src="./imgs/1.jpg" alt="" /></li>
  <li><img src="./imgs/2.jpg" alt="" /></li>
  <li><img src="./imgs/3.jpg" alt="" /></li>
  <li><img src="./imgs/4.jpg" alt="" /></li>
  <li><img src="./imgs/5.jpg" alt="" /></li>
  <li><img src="./imgs/6.jpg" alt="" /></li>
</ul>
```

### 滑动小技巧

* 之前看到别人的网站首页，滑动页面，滑动很少一部分的时候页面调回到原来的起点，滑动大于一半的时候页面跳到下个页面
* 相信你对这个也感兴趣吧，他们是怎么实现的呢其实很简单，用 css 完全可是实现，看下面的代码

```css
/* 还是接着上面的代码，这里只做一下补充 */
ul {
  scroll-snap-type: x mandatory;
}
li {
  scroll-snap-align: center;
}
```

## position

> **position** 常用到的属性值有：*relative*、*absolute*、*fixed*，*absolute* 相对于父元素来定位的，*fixed* 相对于浏览器窗口定位的。那么可以改变 *fixed* 让他相对于父元素定位嘛？

### fixed 可以相对于父元素进行定位吗？

* 首先，答案是可以的，而且很简单，只需要给他的父元素设置 transform: translate(0, 0); 即可
* 在 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/position) 中提到 当元素祖先的 transform 属性非 none 时，定位容器由视口改为该祖先。
* 其实有三种情况会发生这种情况：
  * transform 属性值不为 none 的元素
  * perspective 属性值不为 none 的元素
  * 在 will-change 中指定了任意 CSS 属性
* [参考文章](https://www.cnblogs.com/coco1s/p/7358830.html)

### 粘性布局 sticky

* 单词 sticky 的中文意思是"粘性的"，position: sticky 表现也符合这个粘性的表现。基本上，可以看出是 position: relative 和 position: fixed 的结合体——当元素在屏幕内，表现为 relative，就要滚出显示器屏幕的时候，表现为 fixed。例如，可以滚动下面这个框框感受下交互表现：

- 这个效果其实就是设置了 position: sticky 来实现的
- 给标题设置了这个属性，然后设置 top 值为 0，此时在标题将要滚动出在屏幕的时候自动会变成 fixed 的效果
- 参考 [张鑫旭的 position:sticky ](https://www.zhangxinxu.com/wordpress/2018/12/css-position-sticky/)
