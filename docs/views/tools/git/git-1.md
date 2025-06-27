---
title: Git 基础篇
date: 2025-06-25
tags:
  - git
  - 其他
---

## 前言

Git 是目前广泛使用的分布式版本控制系统，在日常开发中经常会用到。
这篇文章记录了一些 Git 的基础知识和常用操作，希望能对大家有所帮助

## 文章导览

<p align="center">
  <img :src="$withBase('/imgs/git/git-1.svg')" alt="文章导览" />
</p>

## Git 简介

Git 是一个 **分布式版本控制系统**，最初由 Linux 之父 Linus Torvalds 编写。它可以帮助我们跟踪代码的修改历史、多人协作开发，并在出问题时迅速回滚。

> ✅ **Git vs SVN**：Git 是分布式的，每个开发者都有完整历史记录；SVN 是集中式的，依赖服务器。
> git 与区块链一样都是去中心化的思想，理论上操作不可逆。每个人都有自己的操作节点

## Git 基础概念

- **工作区（Working Directory）**：电脑上看到的文件夹。
- **暂存区（Staging Area）**：准备提交的文件列表。
- **本地仓库（Local Repository）**：本机的 `.git` 目录。
- **远程仓库（Remote Repository）**：比如 GitHub、GitLab 上托管的项目。

```
工作区 → 暂存区 → 本地仓库 → 远程仓库
```

- **HEAD**：当前指向的提交或分支。
- **origin**：默认远程仓库别名。

## Git 安装与配置

### 安装方式

- Windows：访问 [https://git-scm.com](https://git-scm.com) 下载并安装
- macOS：使用 Homebrew 安装：`brew install git`

### 初始化配置

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --global init.defaultBranch main
```

`--global` 参数表示全局配置，不添加 `--global` 表示当前目录配置(存在 .git 的目录)

### 配置进阶

Git 的配置远不止用户名和邮箱，以下是一些实用的配置：

```bash
# 配置编辑器（推荐使用 VS Code）
git config --global core.editor "code --wait"

# 配置换行符处理（重要！避免跨平台问题）
git config --global core.autocrlf true    # Windows 系统
git config --global core.autocrlf input   # Mac/Linux 系统

# 配置推送策略
git config --global push.default simple

# 配置颜色输出
git config --global color.ui auto

# 查看所有配置
git config --list
``` 

## Git 常用命令

在介绍命令之前，有个注意事项要提前声明下: `使用 Git 一定要有去中心化的思想，一旦 push 到远程仓库后，想要撤销修改就需要考虑到其他用户，不可轻易使用 git push -f，使用该命令前一定要与其他同事确认，并有对应的，否则会丢代码!`

### 仓库操作

```bash
git init               # 初始化本地仓库
git clone <url>        # 克隆远程仓库
```

### 代码提交

```bash
git add .              # 添加所有更改
git commit -m "说明"   # 提交更改
git status             # 查看状态
git diff               # 查看改动
```


#### add

- `git add` 添加要提交的文件，一般常用 `git add .`

```shell
# 添加单个文件
git add <filename>

# 添加多个文件
git add <file1> <file2> <file3>

# 添加所有文件（包括新增和修改）如果文件已经在 .gitignore 文件中了，则不会被添加
git add .
# 或者
git add --all
# 或者
git add -A

# 添加某个目录下的内容
git add <directory_name/>

# 添加被忽略的文件 (.gitignore 中的文件)
git add -f <filename>

# 查看哪些文件会被添加 (模拟执行 git add .，不会真正添加任何文件)
git add -n .
```

- 已经 add 的文件，可以使用 `git restore --staged <file>` 命令取消添加，该命令可以取消对文件的添加，但是不会删除文件，也不会删除文件修改的内容。
- 如果本地某个修改不想要了，要恢复到修改之前，可以使用 `git checkout <file>`，都不要可以使用 `git checkout .` (这个操作不会恢复已经 add 的文件哦)
- `.` 和 `-A` 的区别在于: `-A` 会添加所有变化 `.` 只会添加添加当前目录及其子目录的所有变化，如果是上级目录的修改是不会被添加的

#### commit

- 提交信息规范，建议使用 `git commit -m "feat: 新功能"` 或 `git commit -m "fix: 修复 bug"`，具体有以下几种:

```txt
{
  "feat":     "特性:     ✨  新增功能",
  "fix":      "修复:     🐛  修复缺陷",
  "docs":     "文档:     📝  文档变更(更新README文件，或者注释)",
  "style":    "格式:     🌈  代码格式（空格、格式化、缺失的分号等）",
  "refactor": "重构:     🔄  代码重构（不修复错误也不添加特性的代码更改）",
  "perf":     "性能:     🚀  性能优化",
  "test":     "测试:     🧪  添加疏漏测试或已有测试改动",
  "build":    "构建:     📦️  构建流程、外部依赖变更（如升级 npm 包、修改 vite 配置等）",
  "ci":       "集成:     ⚙️   修改 CI 配置、脚本",
  "revert":   "回退:     ↩️   回滚 commit",
  "chore":    "其他:     🛠️   对构建过程或辅助工具和库的更改（不影响源文件、测试用例）",
  "wip":      "开发中:   🚧  开发阶段临时提交"
}
```

平时开发中常用的有: `feat`、`fix`、`style`、`revert`、`wip`

- 修改提交信息：

代码提交后，想要修改下提交信息，可以使用 `git commit --amend`，会弹出一个 vi 编辑器，将修改后的提交信息保存并提交。
如果已经 push 到远程仓库，想要修改的话，也是一样，但是需要 `git push --force` 强制推送到远程仓库(⚠️ 慎用)。

#### status

git status 可以查看当前仓库状态，会显示当前分支、未暂存的文件、暂存的文件、当前分支的提交记录。当我们不知所措的时候使用该命令也会给我们相应的提示

#### diff

git diff 可以查看当前仓库的改动，会显示当前分支的提交记录和暂存区的改动。如果已经 add 过则需要 `git diff <hash>` 来显示改动。

### 临时暂存

- 在开发新的需求的过程中，会经常遇到已经提测的需求有 bug 要优先处理，但是本地开发一半的代码，又不想提交到远程仓库，此时就会用到 `git stash` 命令
- 这个命令会将当前暂存区的改动暂存到 stash 栈中，然后本地暂存区干净了，就可以切换到对应的分支去修改 bug，修复完之后，再回到原来的分支使用
  stash 恢复刚才暂存的文件
- 使用方式如下:

```shell
# 把工作区和暂存区的改动放到 stash 栈中
git stash push -m "说明"
# 或者（已弃用，不推荐使用）
git stash save "说明"

# 恢复 stash 的栈顶的最近一次 stash
git stash pop

# 查看 stash 栈，会返回类似于 stash@{0}: On main: 说明 的一个列表
git stash list

# 指定恢复对应的 stash，比如恢复 stash@{0} 的改动
git stash apply stash@{0}
```

### 择优挑选

`git cherry-pick` 是 Git 中一个非常实用的命令，用于将某个分支上的特定提交（commit）复制到当前所在的分支上。它允许你有选择性地将某些提交引入到不同的分支中，而不需要合并整个分支的所有改动。

语法: `git cherry-pick <commit_id>`，也可以拣选多个提交: `git cherry-pick <commit_id1> <commit_id2>`

📌 使用场景:

- 在稳定版本中加入某个功能或修复 bug ：例如，你想在 v2.0 稳定版本分支中加入 v3.0 开发分支中的某次 bug 修复提交，就可以使用 cherry-pick 来提取这个 commit 。
- 避免合并整个分支 ：当你只想合入其他分支的某些改动，而不是全部历史时，非常适合使用此命令 。
- 多分支开发中同步特定提交 ：比如你在 feature 分支做了一些修改，想将其中一部分提交同步到 main 分支 。
- 有一点要注意: cherry-pick 会生成新的提交对象，虽然内容相同，但提交哈希值不同，当我们把对应分支合并进来的时候，就会有两个提交信息是一样的，虽然他们的哈希值不同

⚠️ 冲突处理

如果在 cherry-pick 过程中发生冲突，Git 会暂停操作并提示你解决冲突。

```txt
1. 修改冲突文件，手动解决冲突
2. 运行 git add <file> 添加修改后的文件
3. 继续 cherry-pick: git cherry-pick --continue
4. 如果你不想继续，可以中止：`git cherry-pick --abort`
```

### 分支管理

```bash
git branch             # 查看本地分支
git branch dev         # 创建 dev 分支
git checkout -b dev    # 创建并切换到 dev 分支（传统方式）
git switch -c dev      # 创建并切换到 dev 分支（Git 2.23+ 推荐方式，更安全）
git branch -d dev      # 删除 dev 分支
git branch -D dev      # 强制删除 dev 分支
git merge dev          # 合并 dev 分支到当前分支
git push origin --delete dev # 删除远程分支
```

#### 合并策略

Git 提供了多种合并策略，不同场景下选择合适的策略很重要：

```bash
# 快进合并（默认）- 如果可能，直接移动指针
git merge feature-branch

# 非快进合并（保留分支历史）- 始终创建合并提交
git merge --no-ff feature-branch

# 压缩合并 - 将多个提交压缩为一个
git merge --squash feature-branch
```

**使用建议**：
- `--no-ff`：适合功能分支合并，保留完整的分支历史
- `--squash`：适合将实验性的多个提交整理为一个干净的提交

#### 冲突解决

合并分支时经常遇到冲突，以下是完整的解决流程：

```bash
# 合并时出现冲突
git merge feature-branch
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt
# Automatic merge failed; fix conflicts and then commit the result.

# 查看冲突状态
git status
```

**冲突标记格式**：
```bash
<<<<<<< HEAD
当前分支的内容
=======
要合并分支的内容
>>>>>>> feature-branch
```

**解决步骤**：
1. 手动编辑冲突文件，删除冲突标记，保留需要的内容
2. 添加解决后的文件：`git add <文件名>`
3. 提交合并：`git commit`（会自动生成合并提交信息）

```bash
# 解决冲突的完整流程
git add .                 # 标记冲突已解决
git commit               # 完成合并提交

# 如果不想继续合并，可以中止
git merge --abort
```

### 远程操作

```bash
git remote add origin <url>  # 添加远程仓库
git push -u origin main      # 推送到远程并设置默认分支
git pull origin main         # 拉取远程更新
git fetch origin             # 获取远程更新但不合并
```

### 标签管理

每次上线、发布、打包，都需要知道："这次发布的是哪一版？"，`git tag v1.0.0 -m "正式发布 1.0.0 版本"`，也可以方便回滚，一般是上线是使用的

标签跟分支的操作基本上是一样的

```shell
# 查看所有标签
git  tag

# 查看标签信息
git show <tagname>

# 查看符合条件的标签（例如以 v1. 开头）
git tag -l "v1.*"

# 创建标签

# 轻量标签，给某个提交打个书签，没有额外信息
git tag <tagname>

# 默认是个当前HEAD 打标签，也可以指定提交：
git tag v1.0.0 <commit-hash>

# 注释标签，带作者、日期、说明信息
git tag -a <tagname> -m "Release version 1.0.0"

# 也可以指定提交
git tag -a v1.0.0 <commit-hash> -m "Release note"

# 删除标签
git tag -d <tagname>

# 删除远程标签
git push origin --delete <tagname>
```

### .gitignore 规则详解

`.gitignore` 文件用于告诉 Git 哪些文件或目录应该被忽略，不纳入版本控制。

#### 语法规则

```bash
# 基本规则
*.log          # 忽略所有 .log 文件
!debug.log     # 但不忽略 debug.log（感叹号表示例外）
/build         # 只忽略根目录的 build 文件夹
build/         # 忽略任意位置的 build 文件夹
doc/*.txt      # 忽略 doc 目录下的 .txt 文件（不递归）
doc/**/*.pdf   # 忽略 doc 及其子目录下的 .pdf 文件（递归）

# 常用示例
node_modules/  # Node.js 依赖
dist/          # 构建输出目录
.env           # 环境变量文件
.env.local     # 本地环境变量
*.log          # 日志文件
*.pyc          # Python 编译文件
__pycache__/   # Python 缓存目录
.DS_Store      # macOS 系统文件
Thumbs.db      # Windows 系统文件
.vscode/       # VS Code 配置（可选）
.idea/         # JetBrains IDE 配置（可选）
```

#### 实用技巧

```bash
# 查看某个文件是否被忽略，以及被哪条规则忽略
git check-ignore -v <filename>

# 查看所有被忽略的文件
git ls-files --others --ignored --exclude-standard

# 强制添加被忽略的文件
git add -f <filename>
```

**⚠️ 注意**：`.gitignore` 只对未被跟踪的文件有效。如果文件已经被提交过，需要先从跟踪中移除：

```bash
# 从跟踪中移除但保留本地文件
git rm --cached <filename>
# 提交这个移除操作
git commit -m "untrack file"
```


## 回退提交

### revert

revert 是用于撤销某次提交（commit）的命令。它通过创建一个`新的提交`来反向应用 指定提交的更改，从而实现撤销效果，而不是直接删除或修改历史提交。

语法: `git revert <commit_id>`，`<commit_id>` 你想撤销的提交的哈希值（可以是 HEAD、HEAD~1 等简写方式）。

git revert 会基于你要撤销的提交生成一个新的提交 ，这个新提交的内容正好抵消原提交所做的更改。

```shell
# 撤销最近的一次提交
git revert HEAD

# 撤销指定提交的提交
git revert <commit_id>
```

revert 有几个选项:

1. `--no-commit / -n`: 只应用 revert 改动到暂存区，不自动创建提交（适合手动编辑后再提交）
2. `-m`: 用于合并提交，需指定父编号，如 `-m 1` 表示选择第一个父提交
3. `-e`: 打开编辑器修改提交信息

注意: revert 之后，在次 merge 这个提交可能会失效或者冲突

这是因为:

- 当你使用 git revert 撤销一个提交后，Git 并不会删除原始提交，而是创建了一个新的提交 来抵消原始更改。
- -当你后续尝试将原始提交再次合并进来时（比如从另一个分支合并），Git 会认为这个提交已经被处理过了（因为它的更改已经被 revert
  提交抵消），于是可能会跳过该提交的更改或者提示冲突：already reverted
- Git 会认为这些更改不需要重复应用。
- 可以使用 cherry-pick 或者`再 revert 那个 revert 提交`来恢复原来的更改
- 或者删除掉原来的 revert 提交(rebase -i)

### reset

reset 是 Git 中一个非常强大且常用的命令，用于撤销本地的提交、暂存区或工作区更改，但是也是一个特别危险的命令。

使用场景:

- 撤销本地的提交: 在本地有很多临时提交，想要撤销
- 本地修改完全不想要了，要跟远端同步
- 重置分支

语法: `git reset [--soft | --mixed | --hard] <commit_id>`

| 参数    | 效果       | 使用场景               |
|---------|----------|--------------------|
| --soft  | 只移动HEAD | 想重新编辑提交信息     |
| --mixed | 重置暂存区 | 想重新选择要提交的文件 |
| --hard  | 重置所有   | 完全放弃本地修改       |

--soft 和 --mixed 的区别：
- `--soft`：暂存区保持不变，再次提交不需要 add
- `--mixed`：暂存区被清空，再次提交需要重新 add

--hard 是很危险的参数，一旦 hard reset 很难恢复

### reflog（操作历史记录）

Git reflog 是一个强大的数据恢复工具，记录了本地仓库中 HEAD 和分支引用的变化历史。即使提交被删除了，通过 reflog 也能找回。

希望大家这辈子都不需要用到这个命令。

```shell
# 查看所有操作历史
git reflog

# 查看指定分支的操作历史
git reflog show <branch-name>

# 恢复到指定的历史状态
git reset --hard HEAD@{2}

# 恢复被误删的分支
git checkout -b recovered-branch HEAD@{3}

# 查看某个时间点的状态
git reflog --since="1 hour ago"
```

**使用场景**：
- 误删提交后的恢复：`git reset --hard HEAD@{1}`
- 误删分支后的恢复：先用 reflog 找到分支最后的提交，再重建分支
- rebase 出错后的恢复：回到 rebase 之前的状态

**注意**：reflog 只记录本地操作，不会同步到远程仓库。默认保留 90 天。

### rebase

rebase 是 Git 提供的一种交互式变基方式，让你可以对一系列提交进行修改、重排、合并、删除、编辑等操作。

通常用于： 清理历史（整理提交）、 合并多个提交为一个、修改历史提交信息、删除错误提交、重排提交顺序

#### 介绍

下面是 `rebase -i` 的介绍:

执行 `git rebase -i ae6c55b5`，commitId 是你希望从哪个提交之后开始变基（不包括该提交本身）。

此时会打开以下的界面，是 vi 编辑器，修改内容使用 vi 的语法既可

```shell
# pick ae6c55b5 登录页面开发    这个是不包含的
pick 123abcd 修复登录按钮
pick 456efgh 添加样式优化
pick 789ijkl 调整接口请求方式

# Commands:
# p，pick <commit> = use commit  使用该提交
# r，reword <commit> = use commit，but edit the commit message  使用该提交，但修改提交信息
# e，edit <commit> = use commit，but stop for amending  使用该提交，但会暂停以便进行修改
# s，squash <commit> = use commit，squashing into prior commit  使用该提交，将其压缩进前一个提交
# f，fixup <commit> = like "squash"，but discard this commit's message  类似 "squash"，但会丢弃该提交的信息
# x，exec <command> = run command (the rest of the line) using shell  使用 shell 执行该行后面的命令
# d，drop <commit> = remove commit  删除该提交
# l，label <label> = label current HEAD at <label>  给当前 HEAD 打上 <label> 标签
# t，reset <label> = reset HEAD to <label>  将 HEAD 重置为 <label>
# m，merge [-C <commit>] <label> = create a merge commit  创建一个合并提交
```

每一行表示一个提交。

可以把每行开头的 pick 替换成其他命令，如：

- reword：修改提交信息
- edit：暂停以修改代码或提交
- squash：把当前提交合并到上一个
- fixup：像 squash，但会丢掉当前提交的信息
- drop：删除这个提交

#### 示例

1. 把后两个提交合并到第一个：

```shell
pick 123abcd 修复登录按钮
squash 456efgh 添加样式优化
squash 789ijkl 调整接口请求方式
```

保存后，Git 会让你编辑新的提交信息，可以保留其中某些内容或全部合并为一句话

2. 修改某个提交信息

```shell
pick 123abcd 修复登录按钮
reword 456efgh 添加样式优化
pick 789ijkl 调整接口请求方式
```

保存后 Git 会打开编辑器，允许你修改第二条提交的信息。

3. 删除某个提交

```shell
pick 123abcd 修复登录按钮
drop 456efgh 添加样式优化
pick 789ijkl 调整接口请求方式
```

456efgh 提交将被删除

- rebase 会重写历史，只建议对本地分支使用，不要对已推送到共享仓库的提交做 rebase。
- 操作过程中可能会出现冲突，Git 会提示你解决冲突并继续变基。
- 解决冲突后执行：

```shell
git add .
git rebase --continue
```

| 命令   | 作用                        |
|--------|---------------------------|
| pick   | 使用该提交                  |
| reword | 修改提交信息                |
| edit   | 修改提交内容（中断）          |
| squash | 合并为一个提交，保留所有信息 |
| fixup  | 合并为一个提交，丢弃当前信息 |
| drop   | 删除该提交                  |



## 总结

恭喜你！🎉 完成了第一篇的学习，现在你已经掌握了 Git 的核心技能：

**基础概念**：理解了工作区、暂存区、本地仓库、远程仓库的关系  
**日常操作**：熟练使用 add、commit、push、pull 等常用命令  
**分支管理**：掌握分支创建、切换、合并和冲突解决  
**版本控制**：学会使用 revert、reset、rebase 进行版本回退  
**团队协作**：了解不同的分支策略和工作流程

这些知识已经足够你在大部分项目中愉快地使用 Git 了！💪

## 下期预告

第二篇我们将深入探讨 Git 的高级特性和实战技巧：

🔥 **进阶内容预览**：
- **Git 内部原理**：深入了解 .git 文件夹的秘密
- **协作最佳实践**：分支命名规范、提交信息模板、Code Review 指南
- **协作进阶**：大型团队的 Git 工作流和最佳实践
- **性能优化与维护**：仓库体检、垃圾回收、GPG 签名等企业级维护  
- **统计分析**：贡献统计、项目分析、开发效率评估
- **故障排查与恢复**：问题诊断技巧、紧急恢复场景、数据找回方法

---

**💡 学以致用**：建议你现在就创建一个练习项目，把第一篇学到的命令都实际操作一遍。实践是最好的老师！

**🚀 继续关注**：第二篇即将发布，我们将一起探索 Git 的更多奥秘，让你从 Git 用户进阶为 Git 专家！

*"路虽远行则将至，事虽难做则必成"* —— 加油，Git 高手之路等着你！⭐