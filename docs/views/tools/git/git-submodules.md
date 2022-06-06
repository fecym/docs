---
title: 我与git子模块的相爱相杀
date: 2022-05-11
tags:
  - git
---

## 项目背景

因公司项目要拆成多个模块，部分模块给分公司的小伙伴开发权限一起开发，所以最终决定使用 git 子模块来拆分项目，今天来复盘下项目拆分中爬过的一些坑。有兴趣的同学可以参考源码一起阅读，附[源码](https://github.com/fecym/git-submodules.git)。

## 文章导览

<p align="center">
  <img :src="$withBase('/imgs/git-submodules.svg')"/>
</p>

## 子模块

首先来科普一下 git 子模块

子模块允许你将一个 git 仓库作为另一个 git 仓库的子目录。 它能让你将另一个仓库克隆到自己的项目中，同时还保持提交的独立。

官方中举了一个例子：某个工作中的项目需要包含并使用另一个项目。 也许是第三方库，或者你独立开发的，用于多个父项目的库。 现在问题来了：你想要把它们当做两个独立的项目，同时又想在一个项目中使用另一个。git 通过子模块来解决这个问题

我们当时遇到的场景也是类似，而且涉及到代码权限问题，所以使用子模块是一个不错的解决方案

可以通过 `git submodules add` 向主模块添加一个子模块，子模块可以理解为和主模块相互独立的两个 git，只是通过使用 git submodules add 为主模块关联了另一个 git

### 常用命令

- 添加子模块

格式：git submodule add `仓库地址` `本地文件夹地址`

```sh
# 示例：把 submodules-1 添加为子模块文件为 src/modules/submodules-1
git submodule add git@github.com:fecym/submodules-1.git src/modules/submodules-1
```

- 查看子模块

```sh
git submodule
```

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/git-submodules.png')" style="border-radius: 8px;">
</p>

- 更新子模块

```sh
# 更新项目内子模块到最新版本
git submodule update

# 更新子模块为远端的最新版本
git submodule update --remote
```

- 递归拉取子模块代码

```sh
git pull --recurse-submodules
```

- 批量更新子模块

因项目中存在多个子模块，开发过程中我们可能会遇到要把所有子模块都切换到某个分支去处理一些问题，此时一个个到指定文件夹下去切换分支或者执行其他操作。git 提供了批量操作可以解决这个问题

命令格式：git submodule foreach `子模块要执行的命令`

```sh
# 比如，子模块都切换到 develop 分支
git submodule foreach git checkout develop
```

### 克隆项目

克隆包含子模块的项目有二种方法：一种是先克隆父项目，再更新子模块；另一种是直接递归克隆整个项目。

1. 克隆父项目，再更新子模块

```sh
# download 项目
git git@github.com:fecym/git-submodules.git
# 查看子模块
git submodule
# -7413b6cd1656398e36077d67bbafaa9652c45171 src/modules/DeviceManagement
# 子模块前面有一个-，说明子模块文件还未检入（空文件夹）
# 初始化子模块
git submodule init
# 更新子模块
git submodule update
# 或者 git submodule update --init --recursive 也可以
```

2. 递归克隆整个项目

```sh
也可以直接递归克隆整个项目
git clone git@github.com:fecym/git-submodules.git --recursive
```

## 项目改造

### 子模块关联改造

子模块关联改造时，有以下步骤：

1. 先把要做成子模块的代码先做成 git，上传到对应的 git 仓库中
2. 然后在项目中删除到要做成子模块的文件夹
3. 使用 git submodule add 把子模块添加到项目中，文件夹地址换成之前的地址

- 如果遇到 `'src/modules/submodules-2' already exists in the index` 这种报错的情况，说明该文件夹还存在，删除掉并且保证 git 工作状态是干净的就可以了

4. 此时我们使用 `git submodules` 就可以看到添加成功的子模块了

然后我们就能看到主模块中多了一个 `.gitmodules` 文件，里面 path 就是我们项目中作为子模块的文件夹，url 是子模块 git 的地址。

也可以给子模块指定分支 `branch = master`

```yml
[submodule "src/modules/submodules-1"]
	path = src/modules/submodules-1
	url = git@github.com:fecym/submodules-1.git
  branch = master
[submodule "src/modules/submodules-2"]
	path = src/modules/submodules-2
	url = git@github.com:fecym/submodules-2.git
  branch = master
```

这之后每次更新子模块，在主模块使用 `git status` 会发现终端由以下提示子模块的变动（hash 发生了改变）会有两种状态：`modified content` 和 `new commits`，两种情况发生在 `代码有修改但未提交` 和 `代码修改并提交`

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/git-status.png')" style="border-radius: 8px;">
</p>

提交代码前，可以在主模块看一下状态(git status)，确保确保是自己的修改，并且状态是对的

如果发现还有子模块的信息未提交，查看一下是否为自己的修改：

若都为自己的修改，且是本次需求，直接提交

若不是要同步远端最新代码包括子模块，直接站在主模块下敲如下命令

```sh
# 递归拉取代码
git pull --recurse-submodules
# 让所有子模块切换到 develop（提交环境）分支
git submodule foreach git checkout develop
# 让所有子模块拉取远端最新代码
git submodule foreach git pull
```

同步完远端最新代码后，正常情况下，你会发现只剩下自己的提交了；若还发现有别人代码的修改，那应该是上个开发人员未做一步，你可以帮他一起提了

**科普一下**：子模块与主模块关联之后，子模块根目录下的 .git 文件夹将会变成 `.git 文件`，里面内容指定了 git 的地址

```sh
# 子模块的 .git 文件
gitdir: ../../../.git/modules/src/modules/submodules-1
```

然后主模块的 .git 文件夹下会增加 modules 文件夹，里面是对应子模块的配置

### 忽略子模块的更新

当然每次更新子模块主模块都会收到提示有时候也会很烦躁，多人开发的时候还有可能出现那种子模块 hash 的冲突，这个 git 也是有解决方案的

可以直接在 `.gitmodules` 文件里面加上 `ignore = all` 可以忽略掉所有的主模块与子模块的关联

```yml
[submodule "src/modules/submodules-1"]
	path = src/modules/submodules-1
	url = git@github.com:fecym/submodules-1.git
  branch = master
  ignore = all
[submodule "src/modules/submodules-2"]
	path = src/modules/submodules-2
	url = git@github.com:fecym/submodules-2.git
  branch = master
  ignore = all
```

ignore 有三个值：

- dirty：使用 dirty 会忽略对子模块工作树的所有更改，只显示对存储在超级项目中的提交的更改
- untracked：当使用 untracked 时，子模块仅包含未跟踪的内容时不被认为是脏的（但仍会扫描它们以查找修改的内容）
- all：使用 all 隐藏对子模块的所有更改（并在设置配置选项 status.submodulesummary 时抑制子模块摘要的输出）

### router 改造

因为使用了子模块，每次新增了子模块，不能每次都在主模块里面更新路由，这样每次子模块增加菜单都要更新主模块，肯定是不合适的，所以要做成路由自动注册，我们需要定一个规则

最终决定把路由定义在所建模块文件夹下面，命名 xxxxRouter.js ，导出一个数组。最终会在主项目路由统一引入注册。

自动注册路由就是用 webpack 中的的 `require.context` api 来注册，还不了解 `require.context` 的话可以看一下我的另一篇文章[webpack 拓展](https://chengyuming.cn/views/webpack/webpack-3.html)

```js
const webpackContext = require.context('../modules/', true, /\w+(Router\.js)$/);
const requireAll = ctx => ctx.keys().map(ctx);
const moduleRoutes = requireAll(webpackContext).map(r => r.default);
const routes = [];
moduleRoutes.forEach(moduleRoute => {
  // 考虑路由定义为对象的情况
  const moduleRoutes = Array.isArray(moduleRoute) ? moduleRoute : [moduleRoute];
  routes.push(...moduleRoutes);
});

export default routes;
```

最终把引入的路由添加到路由主文件中

```js
// router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import modules from './requireModules';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [...modules],
});

export default router;
```

### vuex 改造

vuex 做了统一引入注册，写法同路由，定义在我们所建模块文件夹下面，命名以 xxxxxStore.js ，但有两点强制要求：

1. 必须以 Store.js 结尾
2. 模块名称不能与之前出现过的文件夹名称重复

统一注册的规则是最终生成一个对象，key 为那个文件夹文件，value 为 `模块名称 + Store.js` 的文件内容 所以用法就是 `模块名称.xxx` 即可

```js
const modulesFiles = require.context('../modules', true, /\w+(Store\.js)$/);
const replacer = (m, p) => p.slice(0, -5);

const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/.+\/(\w+Store)\.js/, replacer);
  const value = modulesFiles(modulePath);
  modules[moduleName] = value.default;
  return modules;
}, {});

export default modules;
```

## 平时开发

经过上面的改造，基本上就已经完成项目拆分，然后在 git 仓库中给对应得开发人员相应的子模块代码权限，就可以做相应的代码开发了

子模块之间互不关联，与主模块的联系也是依赖主模块的一些东西，我们也改造成了自动去注册，所以也没有其他问题

平时开发，我们只需要在子模块开发，主模块一般不需要动，但是项目默认打开都在主模块下，git 提交都是主模块的信息

这里有点坑需要把目录切到相应子模块的根目录下。切到对应的开发分支，对子模块进行代码修改提交后，提 MR 到对应的分支。 主项目有修改，提 MR 后周知关联开发人员。

Jenkins 构建的时候，需要添加几条命令，以确保代码都是最新的

```sh
# 递归拉去代码
git pull origin master --recurse-submodules
# 把子模块所有的分支都切换到要构建的分支
git submodule foreach git checkout master
# 拉去所有子模块的最新的代码
git submodule foreach git pull origin master
```

平时开发的时候如果我们需要保证最新代码的话也可以先执行这三个命令，但是每次都敲这个三个命令会很麻烦，我们可以添加一个别名 prf 来替我们来取

```sh
git config --global alias.prf '!f() { git pull origin master --recurse-submodules && git submodule foreach git checkout master && git submodule foreach git pull origin master; }; f'
```

当然我们也可以把分支当做参数传过去配置一个别名

```sh
git config --global alias.prf '!f() { git pull origin $1 --recurse-submodules && git submodule foreach git checkout $1 && git submodule foreach git pull origin $1; }; f'
```

使用的时候只需要输入 `git prf master`，便可以递归拉取代码 master 的代码

自此我们已经完全改造完成了，然后按照规定正常开发即可

## 子模块 lint 失效

 code review 时，发现小伙伴儿的代码风格都不一样，理论上代码提交时有 githooks 来控制执行 lint，自动按照配置来格式化代码。

很明显 eslint + prettier 失效了，思来想去想到子模块也是一个 git，而 githooks 执行时是查找 package.json 里面的配置

```json
"gitHooks": {
  "pre-commit": "lint-staged"
},
"lint-staged": {
  "*.{js,vue}": [
    "vue-cli-service lint",
    "git add"
  ]
}
```

当然这还是有前提条件的，需要为 git 注册 hooks，那我们还需要接着为子模块注册 hooks

## @vue/cli-service lint 命令

@vue/cli-service 默认是没有 lint 命令，只有 `serve`、`inspect` 和 `build` 三个默认命令，都是使用 registerCommand 来注册的

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/vue-cli-commands.png')" style="border-radius: 8px;">
</p>

子模块要想 lint 代码并且与主模块保持一致，我们还得使用 @vue/cli-service lint，但是主模块有，我当时也很纳闷，于是看了一下源码发现是必须有 eslint 的时候他会自己去注册 lint 命令，于是我们在 package.json 中加入 eslint 就可以了

最终子模块 package.json 代码如下

```json
{
  "name": "submodules-1",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "scripts": {
    "lint": "npx vue-cli-service lint **/*.js **/*.vue"
  },
  "devDependencies": {
    "@vue/cli-plugin-eslint": "~5.0.0"
  },
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,vue}": ["yarn lint", "git add"]
  }
}
```

然后我们在改造主模块为子模块注册 git hooks

## githooks

git hooks 的实现其实非常简单，就是 .git/hooks 文件下，保存了一些 shell 脚本，然后在对应的钩子中执行这些脚本就行了。比如下图中，这是一个还没有配置 git hooks 的仓库，默认会有很多 .sample 结尾的文件，这些都是示例文件

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/githooks.png')" style="border-radius: 8px;">
</p>

我们项目已经注册了 githooks，不带 .sample 就是已经注册好的，打开 pre-commit.sample 文件看一下其中的内容，大致意思是说这是一个示例，做了一些格式方面的检测，这个脚本默认是不生效的，如果要生效，把文件名改为 pre-commit 也就是去掉 `.sample` 即可

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/pre-commit.png')" style="border-radius: 8px;">
</p>

`pre-commit` 这个钩子是在 git commit 命令执行之前触发

| Git hooks          | 调用时机                                 | 说明                                             |
| ------------------ | ---------------------------------------- | ------------------------------------------------ |
| pre-applypatch     | git am 执行前                            |                                                  |
| applypatch-msg     | git am 执行前                            |                                                  |
| post-applypatch    | git am 执行后                            | 不影响 git am 的结果                             |
| pre-commit         | git commit 执行前                        | 可以用 git commit --no-verify 绕过               |
| commit-msg         | git commit 执行前                        | 可以用 git commit --no-verify 绕过               |
| post-commit        | git commit 执行后                        | 不影响 git commit 的结果                         |
| pre-merge-commit   | git merge 执行前                         | 可以用 git merge --no-verify 绕过                |
| prepare-commit-msg | git commit 执行后，编辑器打开之前        |                                                  |
| pre-rebase         | git rebase 执行前                        |                                                  |
| post-checkout      | git checkout 或 git switch 执行后        | 不使用--no-checkout，则在 git clone 之后也会执行 |
| post-merge         | git commit 执行后                        | 在执行 git pull 时也会被调用                     |
| pre-push           | git push 执行前                          |                                                  |
| pre-receive        | git-receive-pack 执行前                  |                                                  |
| update             |                                          |                                                  |
| post-receive       | git-receive-pack 执行后                  | 不影响 git-receive-pack 的结果                   |
| post-rewrite       | 执行 git commit --amend 或 git rebase 时 |                                                  |

PS：完整钩子说明，请参考[官网链接](https://git-scm.com/docs/githooks)

### husky

githooks 保存在 .git 文件夹中。git 是一个多人协作工具，那按理说 git 仓库中的所有文件都应该被跟踪并且上传至远程仓库的。但是有个例外，.git 文件夹不会，这就导致一个问题，我们在本地配置好 githooks 后，怎么分享给其他小伙伴儿呢？copy 吗？那未免太 low 了，都用 git 了还 copy，也太不优雅了。这时候我们可以用 [husky](https://github.com/typicode/husky)

husky 是一个让配置 git 钩子变得更简单的工具。husky 的原理是让我们在项目根目录中写一个配置文件，然后在安装 husky 的时候把配置文件和 githooks 关联起来，这样我们就能在团队中使用 githooks 了。也可以直接执行 `husky install` 来生成 githooks，husky 不是很了解的同学可以看我另外一篇文章 [eslint 工作流](https://chengyuming.cn/views/FE/lint/)

### yorkie

但是我们项目是 vue-cli 搭建的，Vue 使用的 `yorkie`，`yorkie` fork 自 `husky`，然后做了一些改动：

1. 先考虑位于.git 目录旁边的 package.json，而不是硬编码的向上搜索。避免了在 lerna 仓库中的根包和子包都依赖于 husky 的问题，它会混淆并用错误的路径，双重更新根 git 钩子。
2. 更改在 package.json 中 hooks 的位置

那我们最终的做法就是让 yorkie 给子模块增加 package.json，然后安装 hooks 就可以了

但是每次都没成功，于是翻看了源码，里面查找的路径是基于当前 node_modules 然后向上查找到 package.json，内部执行的是包内的 `runner.js`，是相对于 install.js 目录

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/githooks-install.png')" style="border-radius: 8px;">
</p>

如果我们想直接用的话，就需要在每一个子模块中都安装 yorkie，但是能在主模块中处理一次，肯定不能在子模块中多次处理，最终还是决定把 yorkie 源码拿过来修改一下，在初始化的时候执行一次即可

## 改造 yorkie

最终我们按照 yorkie 的思路做了一个注册子模块 githooks 的脚本，然后只需在初始化的时候执行一次即可

```js
const fs = require('fs');
const path = require('path');
const findHooksDir = require('yorkie/src/utils/find-hooks-dir');
const getHookScript = require('yorkie/src/utils/get-hook-script');
const is = require('yorkie/src/utils/is');
const hooks = require('yorkie/src/hooks.json');

const SKIP = 'SKIP';
const UPDATE = 'UPDATE';
const MIGRATE_GHOOKS = 'MIGRATE_GHOOKS';
const MIGRATE_PRE_COMMIT = 'MIGRATE_PRE_COMMIT';
const CREATE = 'CREATE';

// 把这里改成绝对地址
const runnerPath = path.resolve('./node_modules/yorkie/src/runner.js');

function write(filename, data) {
  fs.writeFileSync(filename, data);
  fs.chmodSync(filename, parseInt('0755', 8));
}

function createHook(hooksDir, hookName) {
  const filename = path.join(hooksDir, hookName);

  const hookScript = getHookScript(hookName, '.', runnerPath);

  // Create hooks directory if needed
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir);

  if (!fs.existsSync(filename)) {
    write(filename, hookScript);
    return CREATE;
  }

  if (is.ghooks(filename)) {
    write(filename, hookScript);
    return MIGRATE_GHOOKS;
  }

  if (is.preCommit(filename)) {
    write(filename, hookScript);
    return MIGRATE_PRE_COMMIT;
  }

  if (is.huskyOrYorkie(filename)) {
    write(filename, hookScript);
    return UPDATE;
  }

  return SKIP;
}

function installFrom(projectDir) {
  try {
    const hooksDir = findHooksDir(projectDir);
    if (hooksDir) {
      const createAction = name => createHook(hooksDir, name);
      hooks.map(hookName => ({ hookName, action: createAction(hookName) }));
      const submodule = path.relative(__dirname, projectDir);
      console.log(`submodule：${submodule} installation completed\n`);
    } else {
      console.log("can't find .git directory, skipping Git hooks installation");
    }
  } catch (e) {
    console.error(e);
  }
}

function getSubmoduleDirs() {
  const parentDir = 'src/modules';
  // 子模块文件地址
  const dirs = ['submodules-1', 'submodules-2'];
  return dirs.map(dir => path.resolve(parentDir, dir));
}

const dirs = getSubmoduleDirs();

dirs.forEach(installFrom);
```

编写完脚本之后，执行一次，就会为子模块生成相应的 githooks，可以在根目录下 `.git/modules/src/modules/submodules-1/hooks` 就可以看到生成的 githooks 了（主模块添加子模块后，子模块的 .git 文件夹会变成 .git 文件然后指向了主模块中，所以添加的 hooks 也是在主模块中）

如果添加完后发现子模块 lint 有报错：`Either disable config file checking with requireConfigFile: false, or configure Babel so that it can find the config files` 这个可能 babel 版本问题，只需要在子模块中增加一个 babel 配置，然后继承主模块的配置就可以了

```js
module.exports = {
  extends: '../../../babel.config.js',
};
```

## 参考文献

1. [Config Files](https://babeljs.io/docs/en/config-files)
2. [Vue CLI git hook](https://cli.vuejs.org/zh/guide/cli-service.html#git-hook)
3. [一文带你彻底学会 Git Hooks 配置](https://segmentfault.com/a/1190000022970270)
