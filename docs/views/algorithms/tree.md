---
title: 树在工作面试中的应用
date: 2022-03-12
tags:
  - 工作
  - 算法
---

## 前言

在工作中我们经常见到用树的场景，比如说写前端页面时，每个页面就有对应的 DOM 树、CSSOM 树、渲染树等，或者开发过程中的写的级联选择器、菜单树、权限树、人员树等

面试的时候会被问到算法相关的知识，而刷树相关的题，是特别培养算法思维的，回溯、动规、分治算法其实都是树的问题

本文将汇总一些工作中常用的一些树的操作以及面试可能会问到二叉树相关的问题

## 文章导览

<p align="center">
  <img :src="$withBase('/imgs/tree.svg')"/>
</p>

## 树（工作）

一个树结构包含一系列存在父子关系的节点。每个节点都有一个父节点（除了顶部的第一个节点）以及 0 个或多个子节点：

<p align="center">
  <img :src="$withBase('/imgs/tree.jpg')"/>
</p>

- 节点：树中的每个元素都叫作节点
- 根节点：位于树顶部的节点叫作根节点
- 内部节点/分支节点：至少有一个子节点的节点称为内部节点或
- 外部节点/叶节点：没有子元素的节点称为外部节点或叶节点
- 子女节点：B 和 C 为 A 的子女节点
- 父节点：D 为 H 和 I 的父节点
- 兄弟节点：同一个父节点的子女节点互称为兄弟；F 和 G 互为兄弟节点
- 祖先节点：从根节点到该节点所经过分支上的所有节点；如节点 H 的祖先节点为 D，B，A
- 子孙节点：以某一节点构成的子树，其下所有节点均为其子孙节点；如 H 和 I 为 D 的子孙节点
- 节点所在层次：根节点为 1 层，依次向下
- 树的深度：树中距离根节点最远的节点所处的层次就是树的深度；图中，树的深度是 4
- 节点的度：结点拥有子结点的数量
- 树的度：树中节点的度的最大值

本节将会拿着 `elementUI` 级联选择器里面的[原始数据](https://chengyuming.cn/file/tree.json)，一步步的为这棵树增加 id、level 和 parentId，以及各种查找这棵树，彻底搞懂工作中用到树的各种套路

### 遍历树

1. 树的遍历分为 `广度优先` 遍历和 `深度优先` 遍历两种。

2. 深度优先是用 `递归` 来实现的，广度优先是 `循环` 来实现。

3. 深度优先是利用 `栈` 结构来处理的，广度优先是 `队列` 结构

4. 深度优先遍历又分为先序遍历、后序遍历，二叉树还有中序遍历，实现方法可以是递归，也可以是循环。

5. 深度优先：访问完一棵子树再去访问后面的子树，而访问子树的时候，先访问根再访问根的子树，称为先序遍历；先访问子树再访问根，称为后序遍历。

6. 广度优先：访问树结构的第 n+1 层前必须先访问完第 n 层

7. 树的操作基本上都是 O(n) 的，我们只访问一次节点即可，不管是递归还是循环，有人说递归的性能低于循环，其实他们的时间复杂度是一样的，唯一的差距我感觉是递归的时候调用栈会占用一些性能

8. 遍历的时候我们就偷偷的把 id 给他加上了，最外层开始从 1 自增

#### 广度优先

广度优先遍历的思路是维护一个队列，队列初始值是这棵树的根节点， `取出队列第一个元素，进行访问操作，然后将孩子节点追加到队列最后` ，重复执行该操作

```js
let id = 1;
// 接受一个回调函数，来进行访问操作
function bfs(tree, cb) {
  if (!tree) return;
  const queue = [...tree];
  while (queue.length) {
    const node = queue.shift();
    // 遍历的时候给树增加个 id，方便后面的使用
    node.id = id++;
    cb && cb(node);
    node.children && queue.push(...node.children);
  }
}
```

#### 深度优先

深度优先遍历又分为先序遍历和后序遍历

- 先序遍历

```js
function dfs(tree, cb) {
  if (!tree) return;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    cb && cb(node);
    node.children && dfs(node.children, cb);
  }
}
```

- 后序遍历

后序遍历只需要调换一下节点遍历和子树遍历的顺序即可

```js
function dfs(tree, cb) {
  if (!tree) return;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    node.children && dfs(node.children, cb);
    cb && cb(node);
  }
}
```

### 过滤树

过滤树就跟深度优先遍历树差不多，只要不停地满足过滤函数即可过滤出我们想要的节点

```js
function filterTree(tree, cb) {
  if (!tree) return [];
  return tree.filter(node => {
    node.children = filterTree(node.children, cb);
    return cb(node) || (node.children && node.children.length);
  });
}
```

### 树的查找

树的查找其实就是也是一个遍历的过程，遍历到满足条件的节点则返回该节点，遍历完成未找到则返回 null

#### 根据 id 查找节点

```js
function getNodeById(tree, id) {
  if (!tree || !tree.length) return null;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (+node.id === +id) return node;
    return node.children && getNodeById(node.children, id);
  }
  return null;
}
```

#### 根据回调查找节点

思路基本一致

```js
function treeFind(tree, cb) {
  if (!tree || !tree.length) return null;
  if (!cb || typeof cb !== 'function') return null;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (cb(node)) return node;
    return node.children && treeFind(node.children, cb);
  }
  return null;
}
```

#### 查找节点路径

思路是一致的，但是这个要额外记录一下访问过的节点，最终返回所有访问过的节点

```js
function treeFindPath(tree, cb, path = []) {
  if (!tree || !tree.length) return null;
  if (!cb || typeof cb !== 'function') return null;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    path.push(node.id);
    if (cb(node)) return path;
    if (node.children) {
      return treeFindPath(node.children, cb, path);
    } else {
      path.pop();
    }
  }
  return [];
}
```

#### 查找多条节点路径

```js
function treeFindPath2(tree, cb, path = [], res = []) {
  if (!tree || !tree.length) return null;
  if (!cb || typeof cb !== 'function') return null;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    path.push(node.id);
    cb(node) && res.push([...path]);
    node.children && treeFindPath2(node.children, cb, path, res);
    path.pop();
  }
  return res;
}
```

### 给树增加 level

遍历树是很基础的操作，树操作大部分都是基于遍历来实现的，前几个是用深度优先来实现的，给树增加层级更适合用广度优先来实现

```js
function treeAddLevel(tree) {
  const queue = [...tree];
  let level = 1;
  while (queue.length) {
    const len = queue.length;
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      node.level = level;
      if (node.children) {
        queue.push(...node.children);
      }
    }
    level++;
  }
}
```

处理完之后的[数据看这里](https://chengyuming.cn/file/treeLevel.json)，数据太长就不截图放到文章里了

### 给树增加 parentId

给树增加父级 id 又得用到深度优先。给一棵没有父级 id 的树增加 parentId，也是为了方便下面的[`树转数组`](#树转数组)的使用

```js
function addParentId(tree) {
  if (!tree || !tree.length) return;
  const root = tree[0];
  root.parentId = -1;
  add(tree[0].children, root.id);
  function add(tree, parentId) {
    if (!tree || !tree.length) return;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      node.parentId = parentId;
      node.children && add(node.children, node.id);
    }
  }
  return tree;
}
```

处理完之后的[数据地址](https://chengyuming.cn/file/treeParentId.json)，到此这棵树就处理的差不多了，下面我们进行转成数组，然后在数组转成树的操作实践一下，这个操作工作面试的时候都容易出现

### 树转数组

树转数组就比较简单了，直接一个遍历即可，深度优先广度优先都行

```js
function tree2List(tree) {
  if (!tree || !tree.length) return [];
  const res = [];
  const queue = [...tree];
  while (queue.length) {
    for (let i = 0; i < queue.length; i++) {
      const node = queue.shift();
      const children = node.children;
      delete node.children;
      res.push(node);
      children && queue.push(...children);
    }
  }
  return res;
}
```

处理完之后的[数据地址](https://chengyuming.cn/file/treeArray.json)，下面我们要用这个数据在转成树

### 数组转树

工作中可能有这种数组转成树的需求，其实也比简单，遍历两次树，第一次把所有的 id 存到一个 map 中，第二次遍历处理这个数组

```js
function array2Tree(array) {
  const map = {};
  const root = [];
  array.forEach(x => (map[x.id] = x));
  array.forEach(node => {
    const parent = map[node.parentId];
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      root.push(node); // 根据 parentId 找不到的节点就是根节点
    }
  });
  return root;
}
```

## 二叉树（面试）

二叉树（binary tree）是指树中节点的度不大于 2 的有序树，它是一种最简单且最重要的树。二叉树的递归定义为：二叉树是一棵空树，或者是一棵由一个根节点和两棵互不相交的，分别称作根的左子树和右子树组成的非空树；左子树和右子树又同样都是二叉树（摘自百度百科）

说白了就是：二叉树是每个节点最多有两个子树的树结构，通常子树被称作 左子树 和 右子树。

<p align="center">
  <img :src="$withBase('/imgs/bst.png')"/>
</p>

二叉树在前端业务开发中不常见，但理解二叉树，对于学习算法是一个很重要的开始。有位大佬讲过所有回溯、动规、分治算法其实都是树的问题，而树的问题就永远逃不开树的递归遍历那几行代码

```js
function traverse(root) {
  // 前序遍历
  traverse(root.left);
  // 中序遍历
  traverse(root.right);
  // 后序遍历
}
```

### 二叉树遍历

遍历是对树的一种最基本的运算，所谓遍历二叉树，就是按一定的规则和顺序走遍二叉树的所有节点，使每一个节点都被访问一次，而且只被访问一次。由于二叉树是非线性结构，因此，树的遍历实质上是将二叉树的各个节点转换成为一个线性序列来表示

二叉树遍历有前序遍历、中序遍历、后序遍历

1. 前序(pre-order)： 根-左-右
2. 中序(in-order)： 左-根-右
3. 后序(post-order)： 左-右-根

三种遍历对应代码如下：

```js
// 前序遍历
function preOrder(root) {
  const result = [];
  helper(root, result);
  function helper(root, result) {
    if (!root) return;
    result.push(root.val);
    helper(root.left, result);
    helper(root.right, result);
  }
  return result;
}
// 中序遍历
function inOrder(root) {
  const result = [];
  helper(root, result);
  function helper(root, result) {
    if (!root) return;
    helper(root.left, result);
    result.push(root.val);
    helper(root.right, result);
  }
  return result;
}
// 后序遍历
function postOrder(root) {
  const result = [];
  helper(root, result);
  function helper(root, result) {
    if (!root) return;
    helper(root.left, result);
    helper(root.right, result);
    result.push(root.val);
  }
  return result;
}
```

其实就是套用上面说到的遍历模板

### 二叉树按层遍历

二叉树遍历还有深度优先和广度优先遍历，有道经典面试题，就是按层遍历一棵二叉树，我们对下面这棵二叉树做遍历

```js
const root = {
  val: 'A',
  left: {
    val: 'B',
    left: {
      val: 'D',
      left: {
        val: 'G',
      },
      right: {
        val: 'H',
      },
    },
    right: {
      val: 'E',
    },
  },
  right: {
    val: 'C',
    left: {
      val: 'F',
      left: {
        val: 'I',
      },
    },
  },
};
// [ [ 'A' ], [ 'B', 'C' ], [ 'D', 'E', 'F' ], [ 'G', 'H', 'I' ] ]
```

1. 广度优先

按层遍历二叉树，首先想到广度优先容易实现

```js
function levelOrder(root) {
  if (!root) return [];
  const res = [];
  const queue = [root];
  while (queue.length) {
    const len = queue.length;
    const curLevel = [];
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      curLevel.push(node.val);
      node.left && queue.push(node.left);
      node.right && queue.push(node.right);
    }
    res.push(curLevel);
  }
  return res;
}
```

2. 深度优先

深度优先其实也是可以实现的，记录当前递归处理的层，开辟好空间即可

```js
function levelOrder(root) {
  if (!root) return;
  const res = [];
  dfs(root, 0);
  function dfs(node, level) {
    if (!node) return;
    if (res.length < level + 1) res[level] = [];
    res[level].push(node.val);
    dfs(node.left, level + 1);
    dfs(node.right, level + 1);
  }
  return res;
}
```

### 二叉树之字遍历

二叉树按照之字遍历，跟上面的二叉树按层遍历类似，按层遍历是每一层都是按照从左到右的顺序进行遍历

之字遍历是第一层按从左到右的顺序遍历，第二层反过来按照从右到左的顺序遍历，第三次正着，第四层反着...，以此类推

其实就是偶数层从左到右，奇数层从右到左(从 0 开始数数哦)，所以只需要维护一个自增变量即可

```js
function levelOrder(root) {
  if (!root) return [];
  const res = [];
  const queue = [root];
  let index = 0;
  while (queue.length) {
    const len = queue.length;
    const curLevel = [];
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      if (index % 2 === 0) {
        curLevel.push(node.val);
      } else {
        curLevel.unshift(node.val);
      }
      node.left && queue.push(node.left);
      node.right && queue.push(node.right);
    }
    res.push(curLevel);
    index++;
  }
  return res;
}
// [ [ 'A' ], [ 'C', 'B' ], [ 'D', 'E', 'F' ], [ 'I', 'H', 'G' ] ]
```

### 二叉树搜索树

二叉搜索树也叫有序二叉树、排序二叉树，是指一棵空树或者具有下列性质的二叉树：

1. 左子树上所有节点值均小于它的根节点的值
2. 右子树上所有节点值均大于他的根节点的值
3. 递归的左、右子树也分别为二叉查找树

上图便是一个二叉搜索树

### 二叉搜索树转有序数组

根据二叉搜索树的定义，可以知道我们只需要中序遍历一次，便可以实现这个功能

```js
function BST2Array(root) {
  if (!root) return [];
  return BST2Array(root.left).concat(root.val, BST2Array(root.right));
}
```

### 有序数组转二叉搜索树

用到二叉树就要有个生成二叉树的方法，二叉搜索树是可以与有序数组互转的，那就从它开始吧

思路：拿有序数组中间值创建当前节点，它的左子树取数组 0 到 mid 的地方，右子树取 mid + 1 到数组长度的地方，递归创建子树即可

```js
function TreeNode(val = 0, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
}
function array2BST(array) {
  const len = arr.length;
  if (!len) return null;
  const mid = parseInt(len / 2);
  const root = new TreeNode(arr[mid]);
  root.left = array2BST(arr.slice(0, mid));
  root.right = array2BST(arr.slice(mid + 1, len));
  return root;
}
```

### 验证二叉搜索树

1. 验证二叉搜索树首先想到中序遍历，中序遍历是按照 左->中->右 的顺序遍历树，如果结果是一个有序数组，那么说明这是一个二叉搜索树，可以参考上面的`中序遍历`或者`二叉搜索树转有序数组`，最终得到结果在跟预想的结果比较一次，需要对数组进行排序(O(logn))，所以时间复杂度会相对高一点

2. 第二种方法是我们记录上一次访问的节点，去和这次访问的节点进行比较，如果是一个递增的关系则说明是一个二叉搜索树

```js
function isValid(root) {
  if (!root) return true;
  let prev = null;
  function helper(root) {
    if (!root) return true;
    if (!helper(root.left)) return false;
    if (prev && prev.val >= root.val) return false;
    prev = root;
    return helper(root.right);
  }
  return helper(root);
}
```

3. 另一种方法是记录最大值和最小值，然后与当前值进行比较，只要在 min 和 max 之间就是合法的，否则就不是一个二叉搜索树

```js
function isValid(root, min, max) {
  if (!root) return true;
  if (min != null && root.val <= min) return false;
  if (max != null && root.val >= max) return false;
  return isValid(root.left, min, root.val) && isValid(root.right, root.val, max);
}
```

### 最大深度最小深度

最大深度直接用 Math.max 取左子树和右子树两者深度的最大值即可

```js
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

最小深度需要考虑没有左右子树的情况，所以不能直接用 Math.min 取值

```js
function minDepth(root) {
  if (!root) return 0;
  // 考虑没有左子树或者右子树的情况
  if (!root.left) return 1 + minDepth(root.right);
  if (!root.right) return 1 + minDepth(root.left);
  const left = minDepth(root.left);
  const right = minDepth(root.right);
  return 1 + Math.min(left, right);
}
```

或者也可以更简洁一点

```js
function minDepth(root) {
  if (!root) return 0;
  const left = minDepth(root.left);
  const right = minDepth(root.right);
  return left === 0 || right === 0 ? left + right + 1 : Math.min(left, right) + 1;
}
```

### 最近公共祖先

这道题只要当前访问的节点值是 p 或者 q 的话就可以返回当前节点

然后递归的访问左子树和右子树，如果左子树返回为空那么就不用在继续查下去了直接查右子树就可以了，如果右子树返回为空也是如此，递归的重复这个步骤，当发现左子树和右子树都可以查得到的时候就找到公共祖先了，如果最后都没找到那么根节点就是公共祖先

```js
function lowestCommonAncestor(root, p, q) {
  if (!root) return null;
  if (root.val === p || root.val === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (!left) return right;
  if (!right) return left;
  return root;
}
```

如果是一棵二叉搜索树的话就比较简单了，只需要判断当前的值和 p、q 的大小即可

如果同时小于 p 和 q，说明公共祖先在右子树里面那就去右子树里面找，如果同时大于 p 和 q，就去左子树里面找

```js
function lowestCommonAncestor(root, p, q) {
  if (!root) return null;
  if (root.val > p && root.val > q) {
    return lowestCommonAncestor(root.left, p, q);
  }
  if (root.val < p && root.val < q) {
    return lowestCommonAncestor(root.right, p, q);
  }
  return root;
}
```

### 左右子树互换

这道题只需要直接交换左右子树即可

```js
function invertTree(root) {
  if (!root) return [];
  const temp = root.left;
  root.left = root.right;
  root.right = temp;
  invertTree(root.left);
  invertTree(root.right);
  return root;
}
```

当然也可以使用循环来解决这个问题

```js
function invertTree(root) {
  if (!root) return [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    // 这里用个 js 的新语法，交换值，比上面那个交换值更方便
    [node.left, node.right] = [node.right, node.left];
    node.left && stack.push(node.left);
    node.right && stack.push(node.right);
  }
  return root;
}
```

### 镜像二叉树

或者说叫对称二叉树，检查这棵二叉树是否是镜像对称的。

解题思路：

1. 左子树和右子树同时存在
2. 左子树和右子树的根节点相同
3. 左子树的左节点和右子树的右节点镜像相同
4. 左子树的右结点和右子树的左结点镜像相同

```js
function isSymmetric(root) {
  if (!root) return true;
  function isMirror(left, right) {
    if (!left && !right) return true;
    if (left && right && left.val === right.val && isMirror(left.left, right.right) && isMirror(left.right, right.left)) {
      return true;
    }
    return false;
  }
  return isMirror(root.left, root.right);
}
```

## 参考链接

1. 极客时间覃超老师的算法课
2. [JS 树结构操作:查找、遍历、筛选、树结构和列表结构相互转换](https://juejin.cn/post/6899267681959018510)
