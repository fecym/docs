---
title: 优雅的解决 vite + vue3 同名组件无法区分问题
date: 2025-09-21
permalink: /FE/vite-plugin-unique-page-chunks
tags:
  - 插件
  - Vite
categories:
 - 前端
---

## 问题背景

在某项目初上线优化代码的时候，打包后看到了类似的结果

```txt
dist/assets/index-CMe6Kk4E.js       0.63 kB │ gzip:   0.38 kB
dist/assets/index-DbyJIfZt.js     104.19 kB │ gzip:  40.96 kB
dist/assets/index-BN6vN86v.js     874.79 kB │ gzip: 282.58 kB
dist/assets/index-zD3tofSk.js   1,128.82 kB │ gzip: 375.52 kB
```

这些文件的名称几乎相同，只是 hash 不同，导致：

- **调试困难**：无法直观判断某个 chunk 对应哪个页面。
- **分析不便**：某些文件体积过大，无法快速定位到具体页面。
- **命名重复**：多个页面都会产出 `index-[hash].js`，不够直观。

Vite 打包后的代码会自动把名字和 hash 加上的，类似于在 webpack 项目中我们手动添加的 `webpackChunkName`，但为什么会出现这种情况，都是 `index-[hash]` 的格式呢

后来才意识到，代码结构是这样的

```txt
src/views/
├── PageA/
│   ├── index.vue
│   └── components/
│       ├── Header.vue
│       └── Footer.vue
├── PageB/
│   ├── index.vue
│   ├── composables/
│   │    └── useLog.js
│   └── components/
│       ├── Header.vue
│       └── Footer.vue
| ...
```

这种按页面的代码组织结构，会导致每个业务页面都有一个 `index.vue`，vite 打包后就会生成多个 `index-[hash].js` 文件，导致文件名重复，无法区分

接下来，我们将按照以下文章导览来解决这个问题

<p align="center">
  <img src="/imgs/vite-plugin-unique-page-chunks.svg" alt="文章导览" />
</p>

## 解决思路

<!-- 构建时，需要根据页面名称生成对应的 chunk 名称，并确保每个 chunk 只包含该页面的组件，如果同名的话，就拿它父级的名字拼接一
下 -->

面对这个问题，第一反应是："一定有办法让 Vite 给这些文件起不同的名字"。其实 Vite 提供了 `manualChunks` 配置，可以手动指定 chunk 的分组和命名。

让我们逐步尝试几种可能的解决方案。

### 手动配置

最直接的方法是手动指定每个页面的文件列表：

```js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "page-pagea": ["./src/views/PageA/index.vue", "./src/views/PageA/components/Footer.vue", "./src/views/PageA/components/Header.vue"],
          "page-pageb": ["./src/views/PageB/index.vue", "./src/views/PageB/components/Footer.vue", "./src/views/PageB/components/Header.vue", "./src/views/PageB/composables/useLog.js"],
          "page-pagec": ["./src/views/PageC/index.vue", "./src/views/PageC/components/Footer.vue", "./src/views/PageC/components/Header.vue"]
        }
      }
    }
  }
})
```

打包结果没问题，这种方法在组件较少时可行，但随着项目增长，手动维护变得极其繁琐，需要一个更智能的方案。

### 函数式配置

Vite 允许 `manualChunks` 是一个函数，这给了我们更多的灵活性。咱们可以编写一个函数，根据文件路径动态决定它应该属于哪个 chunk：

```js
manualChunks: (id) => {
  // 提取页面路径
  const pageMatch = id.match(/\/views\/([^/]+)\/components\/([^/]+)\.vue$/)
  if (pageMatch) {
    const [, pageName, componentName] = pageMatch
    return `page-${pageName.toLowerCase()}-${componentName.toLowerCase()}`
  }
}
```

这种方法在打包结果也没问题，使用正则表达式匹配页面路径，并生成对应的 chunk 名称，但是也有对应的局限性

- 需要精确的路径匹配规则
- 对多层目录和特殊结构不够友好。
- 与用户已有配置不易整合。

> **注意**：将组件名转为小写是为了避免不同操作系统间的大小写敏感性问题（Windows 不区分大小写，而 Linux/macOS 区分大小写）

### 插件化


手动和函数式配置都有各自的局限性，这让我意识到，一个"一劳永逸"的解决方案必须是自动化的、可配置的。于是，开发一个 Vite 插件的想法应运而生。目标很明确：插件需要能自动扫描目录，生成 `manualChunks` 配置，并能和用户现有的配置进行合并。

那么我们要做的就是

1.  **自动扫描**：遍历 `src/views` 下的目录。
2.  **智能分组**：将页面与其 `components`、`composables`、`utils` 文件聚合。
3.  **统一命名**：chunk 名称统一加 `page-` 前缀。
4. **合并配置**：将生成的 `manualChunks` 与用户已有的配置进行合并

## 实现过程

既然思路有了, 那我们就按照上面的思路来实现

### 扫描目录构建 chunks

首先，我们需要扫描项目目录，找出所有页面及其相关文件。目标是生成这样的配置：

```json
   {
  "page-pagea": [
    "./src/views/PageA/index.vue",
    "./src/views/PageA/components/Footer.vue",
    "./src/views/PageA/components/Header.vue"
  ],
  "page-pageb": [
    "./src/views/PageB/index.vue",
    "./src/views/PageB/components/Footer.vue",
    "./src/views/PageB/components/Header.vue",
    "./src/views/PageB/composables/useLog.js"
  ],
  "page-pagec": [
    "./src/views/PageC/index.vue",
    "./src/views/PageC/components/Footer.vue",
    "./src/views/PageC/components/Header.vue"
  ]
}
```

那我们要做的是扫描文件夹生成一个关系映射表

```js
function scanPageChunks(viewsDir) {
  // 添加的前缀
  const chunkPrefix = options.chunkPrefix || 'page-'
  const chunks = {}
  const viewsPath = resolve(process.cwd(), viewsDir)

  try {
    const dirs = readdirSync(viewsPath)
    dirs.forEach(dir => {
      const dirPath = resolve(viewsPath, dir)
      // 只处理目录
      if (!statSync(dirPath).isDirectory()) return
      // 查找目录中的页面文件
      const files = readdirSync(dirPath)
      if (files.length > 0) {
        const chunkName = `${chunkPrefix}${dir.toLowerCase()}`
        chunks[chunkName] = files.map(file =>
          `./${viewsDir}/${dir}/${file}`.replace(/\\/g, '/')
        )
        // 同时包含该页面目录下的所有组件和 composables
        const subDirs = ['components', 'composables', 'utils']
        subDirs.forEach(subDir => {
          const subDirPath = resolve(dirPath, subDir)
          try {
            if (statSync(subDirPath).isDirectory()) {
              const subFiles = getAllVueFiles(subDirPath)
              subFiles.forEach(subFile => {
                const relativePath = relative(process.cwd(), subFile).replace(/\\/g, '/')
                chunks[chunkName].push(`./${relativePath}`)
              })
            }
          } catch (e) {
            // 子目录不存在，跳过
          }
        })
      }
    })
  } catch (error) {
    console.warn(`⚠️ 无法扫描目录 ${viewsDir}:`, error.message)
  }
  console.log(`最后的 chunks: ${JSON.stringify(chunks)}`)
  return chunks
}

function getAllVueFiles(dir) {
  // 递归获取目录下所有Vue文件 ...
}

```

这个函数做了几件事：

1. 扫描指定目录（默认是 `src/views`）下的所有子目录
2. 为每个子目录创建一个 chunk，名称为 `page-{目录名}`
3. 收集该目录下的所有文件，以及 `components`、`composables`、`utils` 子目录下的文件
4. 处理路径，确保使用正斜杠（`/`），以兼容不同操作系统


### 合并生成的配置

拿到了 chunks 之后，我们需要将它们与现有的 `manualChunks` 进行合并，`manualChunks` 配置存在函数和对象两种写法，需要判断一下

#### 对象处理

如果是对象处理就很简单，直接合并即可

```js
// 拿到的 chunks
const chunks = scanPageChunks('src/views')
const existingChunks = config.build.rollupOptions.output.manualChunks || {}
// 合并
config.build.rollupOptions.output.manualChunks = {...existingChunks, ...chunks}
```

#### 函数处理

如果是函数，则需要处理一下

```js
// 拿到的 chunks
const chunks = scanPageChunks('src/views')
const originalFn = config.build.rollupOptions.output.manualChunks
 // 合并
config.build.rollupOptions.output.manualChunks = (id) => {
  // 转为相对路径匹配
  const relativePath = `./${relative(process.cwd(), id).replace(/\\/g, '/')}`;
  // 遍历chunks对象，检查文件是否在某个chunk的文件列表中
  for (const [chunkName, files] of Object.entries(chunks)) {
    if (files.includes(relativePath)) {
      return chunkName;
    }
  }
  // 不是页面组件，使用用户函数
  return originalFn(id);
}
```

#### 优先级处理

如果用户配置和我们生成的配置有同名的 chunk，谁的优先级更高？

在上面的代码中，我们的配置会覆盖用户的配置。这可能不是所有用户期望的行为。更灵活的做法是提供一个选项，让用户决定优先级：

```js
  // 用户传入的选项，默认插件优先
  const pluginPriority = options.pluginPriority || true;
  const existingChunks = config.build.rollupOptions.output.manualChunks || {}
  if (typeof existingChunks === 'function') {
    // 提取检查文件是否匹配页面组件的函数
    const getPageChunkName = (id) => {
      // 获取相对于项目根目录的路径
      const relativePath = `./${relative(process.cwd(), id).replace(/\\/g, '/')}`;
      // 遍历chunks对象，检查文件是否在某个chunk的文件列表中
      for (const [chunkName, files] of Object.entries(chunks)) {
        if (files.includes(relativePath)) {
          return chunkName;
        }
      }
      return null;
    };
    config.build.rollupOptions.output.manualChunks = (id) => {
      if (pluginPriority) {
        // 先检查是否匹配页面组件
        return getPageChunkName(id) || existingChunks(id);
      } else {
        // 先让用户函数处理
        return existingChunks(id) || getPageChunkName(id);
      }
    }
  } else {
    // 如果现有配置是对象，则直接合并
    config.build.rollupOptions.output.manualChunks = pluginPriority
      ? {...existingChunks, ...chunks}  // 插件优先
      : {...chunks, ...existingChunks};
  }
```

### 封装插件

核心代码都有了，我们只需要把核心代码封装成插件就行了

Vite 插件的开发非常简单，只需要返回一个对象，对象中包含 name 和各种钩子函数

[Vite 官网](https://cn.vite.dev/guide/api-plugin.html)有钩子说明，咱们用到的是 `config` 钩子

> **config 钩子**：在解析 Vite 配置前调用。钩子接收原始用户配置（命令行选项指定的会与配置文件合并）和一个描述配置环境的变量，包含正在使用的 mode 和 command。它可以返回一个将被深度合并到现有配置中的部分配置对象，或者直接改变配置（如果默认的合并不能达到预期的结果）。

```js
export function uniquePageChunks(options = {}) {
  const { viewsDir = 'src/views' } = options
  return {
    name: 'vite-plugin-unique-page-chunks',
    config(config, {command}) {
      if (command !== 'build') return
      // 扫描views目录，自动生成manualChunks配置
      const chunks = scanPageChunks(viewsDir, chunkPrefix, include, exclude)

      // 考虑用户没有配置manualChunks，则创建一个空对象
      if (!config.build) config.build = {}
      if (!config.build.rollupOptions) config.build.rollupOptions = {}
      if (!config.build.rollupOptions.output) config.build.rollupOptions.output = {}

      // 合并现有的manualChunks配置
      const existingChunks = config.build.rollupOptions.output.manualChunks || {}
      // ... 刚才扫描合并的代码
    }
  }
}

export default uniquePageChunks
```

### 使用

该插件已经发布为 [npm 包](https://www.npmjs.com/package/vite-plugin-unique-page-chunks)，使用非常简单：

```bash
# 安装插件
npm install vite-plugin-unique-page-chunks -D
# 或使用 yarn
yarn add vite-plugin-unique-page-chunks -D
# 或使用 pnpm
pnpm add vite-plugin-unique-page-chunks -D
```

```js
// vite.config.js
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {uniquePageChunks} from 'docs/views/01.前端/vite-plugin-unique-page-chunks'

export default defineConfig({
  plugins: [
    vue(),
    uniquePageChunks({
      // 自定义配置（可选）
      viewsDir: 'src/views',  // 页面目录
      userConfigPriority: false,  // 用户配置是否优先
      chunkPrefix: 'page-',  // chunk 名称前缀
      // ... 其他配置
    })
  ]
})
```

就这么简单！插件会自动扫描你的页面目录，为每个页面生成唯一的 chunk 名称。

### 效果对比

让我们看看使用插件前后的打包结果对比：

- **未使用插件**:

```txt
dist/index.html                      0.61 kB │ gzip:  0.34 kB
dist/assets/index-DKGUJypo.css       1.33 kB │ gzip:  0.65 kB
dist/assets/index-CrgKdBOY.js        0.59 kB │ gzip:  0.34 kB
dist/assets/index-C0yr_JV0.js        0.60 kB │ gzip:  0.34 kB
dist/assets/index-B6ERQaqp.js        0.69 kB │ gzip:  0.41 kB
dist/assets/index-BVuMxtNe.js        3.17 kB │ gzip:  1.53 kB
dist/assets/vue-router-CjvkPhmh.js  23.40 kB │ gzip:  9.56 kB
dist/assets/vue-ChRYQ9yf.js         59.00 kB │ gzip: 23.59 kB
8 chunks of 85.53 KB (gzip: 36.76 KB | map: 723.96 KB)
```

- **使用插件后**:

```txt
dist/index.html                               0.71 kB │ gzip:  0.36 kB
dist/assets/index-DKGUJypo.css                1.33 kB │ gzip:  0.65 kB
dist/assets/js/pages/page-pagec-CtzcrMEm.js   0.57 kB │ gzip:  0.33 kB
dist/assets/js/pages/page-pageb-DfrsPmWZ.js   0.67 kB │ gzip:  0.40 kB
dist/assets/js/pages/page-pagea-BU739MsJ.js   0.70 kB │ gzip:  0.41 kB
dist/assets/index-4smknmsE.js                 3.21 kB │ gzip:  1.51 kB
dist/assets/js/vue-router-fXkg86Ng.js        23.40 kB │ gzip:  9.56 kB
dist/assets/js/vue-7AMx9e1m.js               59.00 kB │ gzip: 23.59 kB
8 chunks of 85.76 KB (gzip: 36.86 KB | map: 724.07 KB)
```

✅ 结果：文件名更加直观，能快速定位到对应页面。

> 使用插件后打包结果略微增大了一点（85.76 KB vs 85.53 KB，增加了约 0.23 KB）。这种情况应该是文件路径变长导致的：使用插件后，文件路径变成了 assets/js/pages/page-xxx-xxx.js 而不是简单的 assets/index-xxx.js ，路径字符串本身就占用了更多空间

不过增加的体积非常小（只有 0.23 KB），对于实际应用几乎没有影响。而且而带来的调试便利性远超这点体积增加。


## 发布 npm 包

npm 包结构也是一个前端项目，会多一个 `.npmignore`  文件，里面配置发布包时需要忽略的文件，其他的跟包发布相关的内容都在 package.json 中

### npm 包结构

```txt
vite-plugin-unique-page-chunks/
├── .gitignore           # Git忽略文件配置
├── .npmignore           # npm发布忽略文件配置
├── CHANGELOG.md         # 版本更新日志
├── LICENSE              # 许可证文件
├── README.md            # 项目说明文档
├── dist/                # 构建输出目录
│   ├── index.cjs        # CommonJS格式的构建产物
│   └── index.js         # ES Module格式的构建产物
├── index.d.ts           # TypeScript类型声明文件
├── package.json         # 项目配置和依赖管理
├── pnpm-lock.yaml       # pnpm锁定文件
├── rollup.config.js     # Rollup打包配置
├── src/                 # 源代码目录
│   └── index.js         # 插件主入口文件
├── test/                # 测试目录
│   ├── fixtures/        # 测试用例资源
│   │   └── mock-vite-project/ # 模拟的Vite项目
│   └── plugin.test.js   # 插件测试文件
└── vitest.config.js     # Vitest测试配置
```

### 打包

插件会使用 rollup 打包，生成对应的 cjs 和 esm 格式文件，然后在 package.json 中配置入口文件

rollup 不熟悉的同学可以去瞄一眼官网，配置代码如下:

```js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default [
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/index.cjs', format: 'cjs', exports: 'named' },
      { file: 'dist/index.js', format: 'es' }
    ],
    external: ['path', 'fs'],
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: [['@babel/preset-env', { targets: { node: '14' } }]]
      }),
    ]
  }
];
```

**package.json 中配置的入口文件**

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "types": "./index.d.ts"
}
```

### 本地测试

npm 包调整完成后，需要测试一下 npm 包是否可用，直接发到 npm 上测试有问题的话，还得修改在发布，比较麻烦

测试有几种常用方案，推荐使用 `yalc` 来测试

#### 使用 yalc（推荐）

[yalc](https://github.com/wclr/yalc) 是一个专为本地包开发设计的工具，比 npm/pnpm link 更稳定可靠。而且用法也很简单

```bash
# 全局安装
pnpm add -g yalc

# 在包目录中构建并发布到本地 yalc 仓库
pnpm build
yalc publish

# 在测试项目中添加包
yalc add vite-plugin-unique-page-chunks
pnpm build  # 测试构建

# 更新包后重新发布
yalc publish  # 在包目录
yalc update   # 在测试项目中

# 移除本地包
yalc remove vite-plugin-unique-page-chunks
# 或移除所有包
yalc remove --all
```


#### 使用 npm/pnpm link

npm/pnpm link 是 npm 内置的本地包链接功能，适用于简单测试。

```bash
# 在包目录中
pnpm build
pnpm link --global

# 在测试项目中
pnpm link --global vite-plugin-unique-page-chunks

# 解除链接
pnpm unlink vite-plugin-unique-page-chunks  # 测试项目中
pnpm unlink --global  # 包目录中
```

#### 使用 npm pack

npm pack 创建一个本地 tarball 包，最接近实际发布的体验。

```bash
# 在包目录中
pnpm build
npm pack  # 生成 .tgz 文件
# 会创建一个 `.tgz` 文件，如 `vite-plugin-unique-page-chunks-1.0.0.tgz`。

# 在测试项目中
pnpm add /path/to/vite-plugin-unique-page-chunks-1.0.0.tgz
```



### 发包

当我们测试通过后，就可以发布 npm 包了

npm 发布包更简单，只需执行以下命令

```bash
# 查看当前登录的npm用户，如果已经登录了且是我们要发包的账号，就不需要登录了
npm whoami

# 查看当前源地址
npm config get registry
# 确保发布的是正确的源
npm config set registry https://registry.npmjs.org

# 登录 npm，根据提示输入账号、密码和邮箱即可登录
npm login

# 发布包
npm publish

# 更新包，会生成一个 版本号的 commit
npm version patch
npm publish
```

#### npm version

`npm version` 后面的参数：

- **patch**：小变动，比如 bug 修复等，版本号变动 v1.0.0 -> v1.0.1
- **minor**：增加新功能，不影响现有功能，版本号变动 v1.0.0 -> v1.1.0
- **major**：模块大改动，可能不向后兼容，版本号变动 v1.0.0 -> v2.0.0


## 总结

通过开发 `vite-plugin-unique-page-chunks` 插件，我们优雅地解决了 Vite + Vue3 项目中同名组件打包后无法区分的问题。该插件自动扫描页面目录，为每个页面生成唯一的 chunk 名称，使构建产物更加清晰，便于调试和性能分析。

- 插件已发布到 NPM，可通过 [vite-plugin-unique-page-chunks](https://www.npmjs.com/package/vite-plugin-unique-page-chunks) 安装使用。
- 插件源码地址：[https://github.com/fecym/vite-plugin-unique-page-chunks](https://github.com/fecym/vite-plugin-unique-page-chunks)
- demo 地址：[https://github.com/fecym/unique-page-chunks-demo](https://github.com/fecym/unique-page-chunks-demo)
- 原文地址：[https://chengyuming.cn/views/plugins/vite-plugin-unique-page-chunks.html](https://chengyuming.cn/views/plugins/vite-plugin-unique-page-chunks.html)