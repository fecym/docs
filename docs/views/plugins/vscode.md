---
title: vscode插件开发
date: 2021-03-20
tags:
	- vscode
  - plugin
---


## vscode 插件可以做什么

vscode 编辑器是可以高度自定义的，使用 vscode 插件几乎可以对 vscode 编辑器进行说有形式的自定义。

[vscode 插件开发文档](https://code.visualstudio.com/api)，[中文文档](https://liiked.github.io/VS-Code-Extension-Doc-ZH)

vscode 插件可以实现自定义指令、快捷键、自定义菜单项、自定义跳转、自动补全、悬浮提示、新增语言支持、语法检查、语法高亮、代码格式化等

## 如何创建插件

我们使用官方来生成 vscode 插件模板项目

```sh
# 安装 yo 和 generator-code
npm install -g yo generator-code
# 使用脚手架创建项目
yo code
```

### yo 介绍

Yeoman 是一个通用的脚手架系统允许创建任何的 app 。它可以迅速的搭建一个新项目，并且能够简化了现有项目的维护。他可以构建任何语言的项目

Yeoman 它自己不能做任何操作。 每个操作都是由 generators 基本插件在 Yeoman 环境所完成的。 这里有 很多公共的 generators 并且它很容易 创建一个 generator 去匹配任何工作流。

yo 是 Yeoman 命令行工具，它允许项目利用脚手架模板来创建。

yo 创建项目依赖于安装的 generators，比如 `generator-code`

安装完成之后就可以使用 `yo code` 快速生成一个项目

yo 也提供了一系列指令供我们使用

- `yo --help`：查看帮助文档
- `yo --generators`：列出所有安装的 generators
- `yo --version`：得到他的最新版本
- `yo doctor`：故障排查

也可以配合安装的 generators 来使用一些命令，比如 `yo code --help`

## 项目介绍

使用 `yo code` 生成一个项目后，核心文件就是 `package.json` 和 `extension.js` 两个文件。

package.json 是整个插件工程的配置文件，extension.js 则是工程的入口文件。

<!-- ![]('../../.vuepress/public/imgs/vscode-plugin-bootstrap.jpg') -->

<p align="center">
  <img :src="$withBase('/imgs/vscode-plugin-bootstrap.jpg)""/>
</p>

### package.json 介绍

```json
{
	"name": "fecym-plugin",             # 插件名称
	"displayName": "fecym-plugin",      # 显示在插件市场的名称
	"description": "",                  # 插件描述
	"version": "0.0.1",                 # 插件版本号
	"engines": { "vscode": "^1.54.0" },
	"categories": ["Other"],
	"activationEvents": [               # 插件激活数组（在什么情况下插件会被激活，需要与extension.js中的注册函数保持一致）
		"onCommand:fecym-plugin.helloWorld"
	],
	"main": "./extension.js",           # 插件入口文件
	"contributes": {                    # 插件贡献点（最重要的配置项）
		"commands": [                     # 命令，通过 command + shift + p 输入的
			{
				"command": "fecym-plugin.helloWorld",		# 需要与 activationEvents 的命令保持一致
				"title": "Hello World"									# 真正输入的命令，可以与其他不保持一致
			}
		]
	},
	...
}
```

### activationEvents

`activationEvents` 配置项配置插件的激活数组，即在什么情况下插件会被激活，目前支持以下几种配置：

- onLanguage：在打开对应语言文件时
- onCommand：在执行对应命令时
- onDebug：在 debug 会话开始前
- onDebugInitialConfigurations：在初始化 debug 设置前
- onDebugResolve：在 debug 设置处理完之前
- workspaceContains：打开一个文件夹后，如果文件夹内包含设置的文件名模式时
- onFileSystem：打开文件或文件夹，是来自设置的类型或协议时
- onView：侧边栏设置的 id 项目展开时
- onUri：在基于 vscode 或 vscode-inside 协议的 URL 打开时
- onWebviewPanel：在打开设置的 webview 时
- \*：在打开 vscode 的时候，如果不是一般不建议这么设置

### contributes

contributes 是整个插件的贡献点，contributes 字段可以设置的 key 也就显示了

- configuration：通过这个配置项我们可以设置一个属性，这个属性我们可以在 `vscode` 的 `setting.json` 中设置，然后在插件工程中可以读取用户设置的这个值，进行相应的逻辑
- commands：命令，通过 command + shift + p 进行输入来实现
- menus：设置右键菜单
- keybindings：设置快捷键
- languages：设置语言特点，包括语言的后缀
- grammars：可以在这个配置项里设置描述语言的语法文件的路径，vscode 可以根据这个来实现语法高亮
- snippets：设置语法片段相关的路径
  ...

### extension.js

extension.js 是插件工程的入口文件，当插件被激活（触发 activationEvents 时），extension.js 文件开始执行

在 extension.js 中对需要功能进行注册，主要使用 vscode.commands.register 相关的 api 来为 package.json 中的 contributes 配置项的事件绑定方法

相关的 api 主要有：

- vscode.languages.registerCompletionItemProvider()
- vscode.languages.registerCodeActionsProvider()
- vscode.languages.registerCodeLensProvider()
- vscode.languages.registerHoverProvider()
- vscode.commands.registerCommand()
  ...

下面是 `yo code` 生成的 extension.js 中的代码

```js
const vscode = require('vscode');

function activate(context) {
  // 当扩展被激活时，这行代码只会被执行一次
  console.log('Congratulations, your extension "fecym-plugin" is now active!');
  // commandId参数必须与package.json中的command字段匹配
  // 为命令绑定事件，输入命令时执行该函数
  let disposable = vscode.commands.registerCommand('fecym-plugin.helloWorld', function() {
    // 控制台输入 hello Word 执行这里的函数
    // 向用户展示一个消息框
    vscode.window.showInformationMessage('Hello World from first-plugin!');
  });
  // 事件入栈
  context.subscriptions.push(disposable);
}

// 插件释放时执行
function deactivate() {
  console.log('插件释放');
}

module.exports = { activate, deactivate };
```

## 运行插件

在项目中按下 `F5` 便可以运行插件，第一次可能需要在 extension.js 文件下按下 `F5`，此时会打开一个新的 vscode 窗口，此时按下 `F1` 火折子 command + shift + p 可以打开命令框，输入 `hello world` 命令，便可以看到在 vscode 的界面的右下角弹出一个弹框 `Hello World from first-plugin!`，这就是在 extension.js 中为 `helloWorld` 注册的事件

## Command 配置

### 命令

配置一个命令只需要以下几步：

- 在 `package.json` 中

1. 在 `activationEvents` 中添加一项要注册的命令事件名称
2. 在 `contributes.commands` 中添加一项，`command` 和 `title`，`command` 的值要与 `activationEvents` 中的事件名称保持一致，`title` 的值是注册成功后真正要执行的命令

- 在 `extension.js` 文件里面的 `activate` 方法中使用 `registerCommand` 注册命令（需要与`activationEvents` 中新增的事件名称保持一致），最后事件入栈（所有注册类的 API 执行后都要将将结果放到 context.subscriptions 中去）

- 配置好后，按照 `运行插件` 的步骤就可以输入我们新注册的命令来看到效果了

### 右键菜单

我们可以为我们的命令配置右键菜单，直接使用右键菜单执行我们的命令，只需要在 `package.json` 中的 `contributes` 配置 `menus` 即可

```json
{
  "menus": {
    "editor/context": [
      {
        "when": "editorFocus",
        "command": "fecym-plugin.fecym",
        "alt": "",
        "group": "navigation"
      }
    ]
  }
}
```

- `editor/context`：定义菜单出现在哪里。这里是定义出现在编辑标题菜单栏
- `when`：菜单出现的时机
- `command`：点击菜单后执行的命令
- `alt`：按住 `alt` 在选择菜单时执行的命令
- `group`：定义菜单分组

菜单配置详细请查看[这里](https://liiked.github.io/VS-Code-Extension-Doc-ZH/#/extensibility-reference/contribution-points?id=contributesmenus)

### 快捷键

同样也可以设置快捷键来执行我们的命令，同样是在 `contributes` 中配置 `keybindings`

```json
{
  "keybindings": [
    {
      "command": "fecym-plugin.fecym",
      "key": "ctrl+5",
      "mac": "cmd+5",
      "when": "editorTextFocus"
    }
  ]
}
```

- `command`：快捷键要执行的指令
- `key`：window 电脑对应的快捷键
- `mac`：Mac 电脑对应的快捷键
- `when`：快捷键出现的时机，这里是当编辑器焦点在某个文本中

更多请查看[这里](https://code.visualstudio.com/docs/getstarted/keybindings)

## 插件生命周期

## 发布

## 插件默认配置

## 常见编辑器 api
