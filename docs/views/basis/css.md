# css基础

## css加载会造成阻塞吗
> js加载会造成 *DOM* 树的解析和渲染

### css加载会造成DOM树的阻塞嘛？
- 首先，*css* 加载会阻塞 *DOM* 树渲染，但是 *css* 并不会阻塞 *DOM* 树的解析
- 也就是说，你可以在 *css* 加载完之前可以在 *js* 中获取到 *DOM* 元素，但是 *DOM* 却是没有渲染到页面上，需要等到 *css* 加载完毕才渲染
- 为什么会这样？
  - 在你加载 *css* 的时候，可能会修改 *DOM* 节点的样式，如果 *css* 加载不阻塞 *DOM* 树渲染的话，那么当 *css* 加载完之后， *DOM* 树可有又得重绘或者回流了
  - 所以干脆先把 *DOM* 树的结构先解析完成，把可以做的工作做完，然后等你 *css* 加载完之后，再根据最终样式来渲染 *DOM* 树，这种做法性能方面确实会比较好一点。（猜测）

### css加载会阻塞js运行嘛？
- css加载会阻塞**后面的js语句**的执行

### 总结
  1. css加载不会阻塞 *DOM* 树的解析；
  2. css加载会阻塞 *DOM* 树的渲染；
  3. css加载会阻塞后面js语句的执行

### 浏览器渲染流程
- 浏览器渲染的流程如下：
  1. *html* 解析文件，生成 *DOM* 树，解析 *css* 文件生成 *CSSOM* 树
  2. 将 *DOM* 树和 *CSSOM* 树结合，生成 *Render Tree*
  3. 根据 *Render Tree* 渲染机制，将像素渲染到屏幕上
- 从浏览器渲染流程可以看出
  1. *DOM* 解析和 *CSS* 解析是两个并行的进程，所以这也解释了为什么 *css* 加载不会阻塞 *DOM* 的解析
  2. 然而，由于 *Render Tree* 是依赖与 *DOM Tree* 和 *CSSOM Tree*，所以它必须等到 *CSSOM Tree* 构建完成，也就是 *css* 资源加载完成(或者加载失败)后，才开始渲染，因此，css加载是会阻塞 *DOM* 的渲染的
  3. 由于 *js* 可能会操作之前的 *dom* 节点和 *css* 样式，因此浏览器会维持 *html* 中 *css* 和 *js* 的顺序。因此，样式表会在后面的 *js* 执行前先加载执行完毕。所以 *css* 会阻塞后面 *js* 的执行 

### DOMContentLoaded
- 对于浏览器来说，页面加载主要有两个事件，一个是 *DOMContentLoaded*，另一个是 *onLoad*
- *onload* 就是等待页面所有资源都在加载完成才会触发，这些资源包括css、js、图片视频等
- *DOMContentLoaded* 顾明思议就是当页面的**内容解析完成后**，则触发该事件
  - 如果页面中同时存在css和js，并且**js在css后面**，则 *DOMContentLoaded* 事件会在css加载完后才执行
  - 其他情况下，*DOMContentLoaded* 都不会等待css加载，并且 *DOMContentLoaded* 事件也不会等待图片、视频等其他资源加载

## css自定义属性
> 17年3月份，微软宣布 *Edge* 浏览器支持 *css* 变量，那就说明所有浏览器都支持了

### 变量的声明

- 变量声明的时候，变量名前面要加两个横线 **--** 
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
- 它们与color、font-size等正式属性没有什么不同，只是没有默认含义。所以 *CSS* 变量（*CSS variable*）又叫做"*CSS* 自定义属性"（*CSS custom properties*）。因为变量与自定义的 *CSS* 属性其实是一回事。
- 因为 *$color* 被 *Sass* 用掉了，*@color* 被 *Less* 用掉了。为了不产生冲突，官方的 *CSS* 变量就改用两根连词线了。
- 变量名大小写敏感，--header-color和--Header-Color是两个不同变量。

### 变量的使用

- *var()* 函数用于读取变量
- *var()* 函数还可以使用第二个参数，表示变量的默认值。如果变量不存在，就会使用默认值。
```css {3}
  p {
    /* color: var(--theme-color); */
    color: var(--color, #7F583F);
    border: 1px solid #000;
    border-radius: var(--border-radios-num);
  }
```
- 变量值只能用作属性值，不能用作属性名。

### 变量的作用域

- 同一个 *CSS* 变量，可以在多个选择器内声明。读取的时候，优先级最高的声明生效。这与 *CSS* 的"层叠"（cascade）规则是一致的。
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
      color: var(--color)
    }
  </style>
  <body>
    <p>蓝色</p>
    <div>绿色</div>
    <div id="alert">红色</div>
  </body>
```
- 上面代码中，三个选择器都声明了 *--color* 变量。不同元素读取这个变量的时候，会采用优先级最高的规则，因此三段文字的颜色是不一样的。
- 也就是说，变量的作用域就是它所在的选择器的有效范围。
- 所以全局的变量通常放在根元素 *:root* 里面，确保任何选择器都可以读取它们。
- [参考链接](https://www.ruanyifeng.com/blog/2017/05/css-variables.html)

## *margin*

- 关于 *margin*，有几点需要注意下
- *margin* 的 *top和bottom* 对非替换内联元素无效（可以暂时理解为行内元素）
- 不过对于 *display: inline-block;* 的元素设置是有效的
- 但是 *margin: auto* 对于 *display: inline-block;* 的元素设置是无效的
- 对于 *display: inline-block;* 的元素设置居中需要用到 *text-align: center;*
- *margin* 塌陷暂时不提

## 居中

### 利用 *absolute* + *负margin* 实现
- 要求：已知宽高
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
- 科普一下，我以为认为这种方法是不可以实现居中，曾面试别人的时候，我还理直气壮的跟别人说，你这个根本实现不了
- 今天，我才感觉自己当时是多么的无知，当然核心原理是**已知要居中元素的宽高**
- 如果要居中元素的宽高**未知**，那么这么设置会让子元素的*宽高变得和父亲的宽高一样*，同时 *margin: auto* 也是无效的
- 这可能也是我当时理解错的地方，所以跟人家说这个根本实现不了
- 要求：已知宽高

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
### 利用 *position* + *calc函数* 实现
- 他的原理跟第一种基本一样
- 要求已知宽高
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
- 这个方法经常用在移动端或者那些不确定宽高的情况下
- 不需要知道子盒子的宽度和高度，也是我经常用的一种

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

- 这种方法，可以使元素不脱标，在标准流下实现居中
- 但是，要求**子盒子**不能是*块级元素*（也可以转成行内或者行内块元素）
- 此时只需要给父盒子设置样式即可，*lineheight必须设置为父盒子的高度*

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
  - 因为 *writing-mode* 是曾经是IE私有的，后来被各大浏览器所支持，所以他有两套不同的语法
  - css3规范的语法
    - *writing-mode: horizontal-tb;* -> *tb（top-bottom）*，元素是从上到下堆叠的 
    - *writing-mode: vertical-rl;*  ->  *rl（right-left）*，表示文字是垂直方向(*vertical*)展示，然后阅读顺序是从右往左
    - *writing-mode: vertical-lr;*  ->  *lr（left-right）*，表示文字是垂直方向(*vertical*)展示，然后阅读顺序是从左往右
    - *writing-mode: inherit;*
    - *writing-mode: initial;*
    - *writing-mode: unset;*
  - *writing-mode* 使得默认的水平流改成了垂直流。具体介绍请看[张鑫旭](https://www.zhangxinxu.com/wordpress/2016/04/css-writing-mode/)大大的博客
:::

- 其实原理也是跟 *text-align* + *lineheight* 实现差不多，只不过水平流变成了垂直垂直流

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
- 注意高亮的弟23行，为什么又设置了一次 *line-height*，因为子元素被定义成了 *inline-block*，*inline-block* 是有一些问题的，需要特殊处理

### 利用 *table* 表格布局实现

- 表格布局，现在布局基本不用这种方式了，所以暂时不做介绍了

### 利用 *table-cell* 来实现

- 原理就是将div转换为table布局

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

- *flex* 布局作为css最强大布局方式，不多做介绍
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

- *grid* 作为css新宠，也是很强大的，只是兼容性不好，但是写法也很简单

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

## 层叠上下文和层叠顺序

### 层叠上下文
- 在css2.1规范中，每个盒模型的位置是三维的，分别是平面画布上的 x轴，y轴以及表示层叠的<code style="color: #ff502c">z轴</code>
- <code style="color: #ff502c">z轴</code>：表示的是用户与屏幕的这条看不见的垂直线

<p align="center">
  <img :src="$withBase('/imgs/basis-css-z-index-0.jpg')""/>
</p>

- 一般情况下，元素在页面上沿x轴y轴平铺，我们察觉不到它们在z轴上的层叠关系。而一旦元素发生堆叠，这时就能发现某个元素可能覆盖了另一个元素或者被另一个元素覆盖。它们的层叠关系我们可称为<code>层叠上下文</code>。
- 元素的层叠等级（谁在谁上边）是由其所在的层叠上下文决定的
- 层叠等级的比较只有在当前层叠上下文元素中才有意义。不同层叠上下文中比较层叠等级是没有意义的。
- 如何生成层叠上下文？
  1. HTML中根元素本身就具有层叠上下文，称为根层叠上下文
  2. 普通元素设置 *position* 属性为非 *static* 值并设置 *z-index* 属性为具体数值，产生层叠上下文
  3. css3中的新属性也可以产生层叠上下文
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
<p align="center">
  <img :src="$withBase('/imgs/basis-css-z-index-1.jpg')""/>
</p>

- 还有一种情况就是，当父盒子也设置为层叠上下文，那么就会根据父盒子的 *z-index* 来处理，子盒子设置再高也不行，上代码和图
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
<p align="center">
  <img :src="$withBase('/imgs/basis-css-z-index-2.jpg')""/>
</p>

- 为什么出现这种情况？举个例子：处于层叠上下文中的元素，就像是元素当了官，等级自然比普通元素高。再想象一下，假设一个官员A是个省级领导，他下属有一个秘书a-1，家里有一个保姆a-2。另一个官员B是一个县级领导，他下属有一个秘书b-1，家里有一个保姆b-2。a-1和b-1虽然都是秘书，但是你想一个省级领导的秘书和一个县级领导的秘书之间有可比性么？甚至保姆a-2都要比秘书b-1的等级高得多。谁大谁小，谁高谁低一目了然，所以根本没有比较的意义。只有在A下属的a-1、a-2以及B下属的b-1、b-2中相互比较大小高低才有意义。

### 层叠顺序

<p align="center">
  <img :src="$withBase('/imgs/basis-css-z-index-3.png')""/>
</p>

- 层叠顺序表示元素发生层叠时按照特定的顺序规则在*Z轴*上垂直显示
  1. 左上角"层叠上下文background/border"指的是层叠上下文元素的背景和边框。
  2. **inline/inline-block**元素的层叠顺序要高于**block(块级)/float(浮动)元素**。
  3. 单纯考虑层叠顺序，z-index: auto和z-index: 0在同一层级，但这两个属性值本身是有根本区别的。
- 为什么**inline/inline-block**元素的层叠顺序要高于**block(块级)/float(浮动)元素**？
  - 网页设计之初最重要的就是文字内容，所以在发生层叠时会优先显示文字内容，保证其不背覆盖
- 如何在遇到元素层叠时，能很清晰地判断出谁在上水在下？
  1. 首先比较两个元素是否处于同一个层叠上下文中
  2. 如果处于同一个层叠上下文中，谁的层级等级大谁在上面（根据图）
  3. 如果两个元素不在统一层叠上下文中，请先比较他们所处的层叠上下文的层叠等级
  4. 当两个元素层叠等级相同、层叠顺序相同时，在**DOM结构中后面的元素**层叠等级在前面元素之上
- *z-index: auto*的情况下，不产生层叠上下文

### css3影响层叠上下文的属性

- 父元素的 *display* 属性值为 *flex|inline-flex*，子元素的 *z-index* 属性值不为 *auto* 的时候，子元素为层叠上下文元素
- 元素的 *opacity* 属性值不是 1
- 元素的 *transform* 属性值不是 *node*
- 元素的 *mix-blend-mode* 属性值不是 *normal*
- 元素的 *filter* 属性值不是 *node*
- 元素的 *isolation* 属性值是 *isolate*
- *will-change* 指定的属性值为上面的任意一个
- 元素的 *-webkit-overflow-scrolling* 属性值为 *touch*
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
<p align="center">
  <img :src="$withBase('/imgs/basis-css-z-index-4.jpg')""/>
</p>

- 参考链接，[张鑫旭大大博客](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)、[MagicEyeslv的彻底搞懂CSS层叠上下文...](https://juejin.im/post/5b876f86518825431079ddd6)
