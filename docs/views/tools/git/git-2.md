---
title: Git 进阶篇
date: 2025-07-01
tags:
  - git
  - 其他
---

## 前言

在[第一篇](./git-1)中，我们掌握了 Git 的基础操作和核心概念。现在让我们继续深入，探索 Git 的高级特性和实战技巧。

<p align="center">
  <img :src="$withBase('/imgs/git/git-2.svg')" alt="文章导览" />
</p>

## 源的管理

```shell
# 查看源仓库信息
git remote -v

# 修改源仓库信息
git remote set-url <origin_name> <url>

# 添加源仓库
git remote add <origin_name> <url>

# 删除源仓库
git remote rm <origin_name>

# 推送代码到指定的源仓库
git push <origin_name> <branch>
```

默认的源仓库名称是 origin，一套代码可能需要推送到多个 git 仓库，此时就会用到这个

## .git 文件夹

.git 文件夹是 Git 仓库的核心，是 Git 用来跟踪版本历史、管理分支、记录配置等所有信息的隐藏目录。
当你在一个项目中执行 `git init`，或者克隆一个仓库时，`.git` 文件夹就会自动生成。

<p align="center">
  <img :src="$withBase('/imgs/git/git-folder.png')" alt=".git 文件夹" />
</p>

1. `HEAD`: 指向当前分支的引用。 `ref: refs/heads/main`
2. `config`: Git 仓库的本地配置（例如远程地址、用户信息、自动换行等）。相当于项目级 .gitconfig。
3. `description`: 仓库的描述信息。
4. `hooks/`: 钩子脚本目录，可以设置在 Git 操作前后执行自定义命令（如自动检查代码、发邮件、部署等）。
5. `info/`: 存放额外信息，比如 .git/info/exclude 是用于忽略文件的（作用类似 .gitignore，但仅当前仓库有效）。
6. `objects/`: Git 的对象数据库，所有的提交、树（目录结构）、文件内容（blob）等都以哈希对象形式存储在这里。
7. `refs/`: 引用数据库，保存分支、标签、HEAD 等引用。
8. `logs/`: 存放提交日志，用于记录提交历史。可用于 git reflog 查看历史操作。
9. `index`: 暂存区，保存当前工作目录的修改，等待下一次提交。
10. `COMMIT_EDITMSG`: 保存最近一次提交时的提交信息临时文本（用于提交时编辑）。
11. `packed-refs`: 当引用（分支、标签）很多时，Git 会将它们打包存储到此文件中，优化性能。

🧠 小贴士

1. .git 文件夹不应该被修改，除非你非常了解 Git 内部结构。
2. .git 丢失后，该项目就不再是 Git 仓库了。
3. 在 Mac 和 Linux 中 .git 开头的文件属于隐藏文件。可使用 ls -a 查看。

## Git hooks

git hooks 是 .git 文件夹的一个特殊目录，用于存储 Git 仓库的钩子脚本。默认会有很多 .sample 结尾的文件，这些都是示例文件，当把 .sample 后缀去掉后，Git 就会自动执行该脚本 。

<p align="center">
  <img :src="$withBase('/imgs/git/githooks.png')" alt="githooks" />
</p>

### 让钩子生效

我们可以简单写两个钩子脚本，来尝试一下，基本步骤如下

1. 在项目的根目录下创建个对应的脚本，在提交的时候打印一些信息，在 commit 的时候校验提交内容是否符合 `conventional commit` 的规范

```txt
your-project/
├── scripts/
│   ├── pre-commit-message.sh
│   └── validate-commit-msg.sh
├── .git/
│   └── hooks/
│       ├── pre-commit
│       └── commit-msg
```

2. 脚本内容

`pre-commit-message.sh` 的内容

```shell
#!/bin/sh
echo "🚀 继续加油！每一次 commit 都是在构筑未来。"
echo "🔍 请确保你已经保存了所有改动，并且 commit message 清晰明确。"
```

3. 增加执行权限

```shell
chmod +x scripts/pre-commit-message.sh
```

4. 配置钩子脚本

- 复制 pre-commit.sample 文件到 .git/hooks 目录下，并重命名为 pre-commit
- 在中间插入以下脚本内容

```shell
# 先切换到 git 仓库根目录
cd "$(git rev-parse --show-toplevel)"
# 执行 pre-commit 消息脚本
sh scripts/pre-commit-message.sh
```

<p align="center">
  <img :src="$withBase('/imgs/git/pre-commit.png')" alt="" />
</p>

此时执行 git commit 命令时，就会先执行 pre-commit 脚本，打印出我们所编写内容

<p align="center">
  <img :src="$withBase('/imgs/git/pre-commit-res.png')" alt="" />
</p>

### 更优雅的方式

我们应该遵循 `.git 文件夹不应该被修改`的原则，直接在 .git 文件夹下创建脚本，在中间修改了对应代码，还是有点不合适的，我们可以修改 git hooks 的路径，让他执行我们自己的自定的脚本

```shell
# 新建个 .githooks 文件夹
mkdir .githooks

# 指定新的hooks 路径
git config core.hooksPath .githooks

# 创建 pre-commit 文件
touch .githooks/pre-commit

# 赋予可执行权限
chmod +x .githooks/pre-commit

# 要恢复默认的 hooks 路径，可以执行 git config --unset core.hooksPath
```

`.githooks/pre-commit` 的内容

```shell
#!/bin/sh

# 切换到项目根目录
cd "$(git rev-parse --show-toplevel)"

# 执行 pre-commit 消息脚本
sh scripts/pre-commit-message.sh 
```

此时效果跟刚才一样直接修改 `.git/hooks/pre-commit` 文件效果一样

### commit-msg

`commit-msg` 的作用是检查提交信息是否符合规范的钩子，比如是否符合 `conventional commit` 的规范。

他的写法需要获取到提交的内容，然后验证是否符合规范，需要先获取到提交内容的地方，上面我们有提到 `.git/COMMIT_EDITMSG`
里面保存最近一次提交时的提交信息临时文本，我们可以从这里拿到

但是考虑到不同版本的 git(企业版或者定制版) 以及防范未来的变化，并且 git 提供了对应的参数接口，我们还是按照推荐的写法来编写

并且 git 提供的没有直接获取提交临时路径的变量，所有我们可以在执行脚本的时候传递过来

脚本内容如下:

scripts/validate-commit-msg.sh 脚本如下:

```shell
#!/bin/sh
commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# 支持的提交前缀
valid_prefixes="feat|fix|docs|style|refactor|test|chore"

if echo "$commit_msg" | grep -qE "^($valid_prefixes)(\(.+\))?: .+"; then
  echo "✅ 提交信息格式通过校验"
  exit 0
else
  echo "❌ 提交信息格式不规范！请使用以下格式之一："
  echo "   feat: xxx"
  echo "   fix: xxx"
  echo "   docs: xxx"
  echo "   chore(scope): xxx"
  echo "👉 当前提交信息为：$commit_msg"
  exit 1
fi
```

.githooks/commit-msg` 的内容如下:

```shell
#!/bin/sh

# 切换到项目根目录
cd "$(git rev-parse --show-toplevel)"

# 执行 commit-msg 验证脚本，传递 commit message 文件路径
sh scripts/validate-commit-msg.sh "$1"
```

别忘了给这两个文件添加执行权限哦

### husky

如果你是一个前端同学，我们这种写法好熟悉，好像在哪见过，对没错 就是 husky，新版的 husky 就是使用了这种方式来处理 钩子的，具体配置方法之前文章有讲过，可以参考我当时那篇关于 [eslint 工作流](https://chengyuming.cn/views/FE/lint.html#husky)

其他语言也有类似的工具，比如 Python 有 [pre-commit](https://pre-commit.com/)  ，Rust 有 [cargo-watch](https://github.com/rhysd/cargo-husky)，Java 有 Maven/Gradle 插件

当然还有个通用的: [Lefthook](https://github.com/evilmartians/lefthook) 支持任何项目

## 协作最佳实践

良好的 Git 协作习惯能大大提高团队开发效率，避免很多不必要的问题。

### Git Flow（经典流程）

Git Flow 适合中大型项目或需要严格发布控制的团队。

- **主分支**：`main` / `master`，只用于正式发布版本
- **集成分支**：`develop`，日常开发合并到这里
- **功能分支**：`feature/*`，从 develop 拉出
- **修复分支**：`hotfix/*`，紧急 Bug 修复分支
- **发布分支**：`release/*`，发布准备分支

示例流程:

1. 从 develop 创建 feature/login
2. 完成后合并回 develop，进行测试
3. 准备发布时从 develop 创建 release/v1.0
4. 发布完成后合并到 master 和 develop
5. 紧急修复 bug 使用 hotfix 分支

当然这是简单的一个流程，如果涉及到多需求多团队并行开发的情况下，需要考虑更多的流程和策略，以下是个示例

1. 从 master 创建 feature/login (保证代码与生产环境是最新的，可以随时上线)
2. 开发完成后合并回 develop，进行测试
3. 遇到 bug，在 feature/login 进行修改，修复完成后合并到 develop，进行测试
4. 准备发布时从 feature/login 创建 release/v1.0
5. 发布完成后合并到 master，也可以直接把 feature/login 合并到 master
6. 在 develop 分支随时同步 master 代码
7. 在生产遇到 bug ，基于 master 切 hotfix 分支进行修复

当然如果中间有 UAT 或者 pre 环境的话可以根据具体情况调整策略

### 其他常见分支策略

除了 Git Flow，还有其他适合不同团队的分支策略：

#### GitHub Flow（简化流程）

适合持续部署的团队，流程更简单：

1. 从 `main` 创建功能分支
2. 开发完成后发起 Pull Request
3. 代码审查通过后合并到 `main`
4. 自动部署到生产环境

**优点**：流程简单，适合小团队
**缺点**：缺乏发布控制，适合持续部署的项目

#### GitLab Flow（环境分支）

结合环境分支的流程：

- `main`：开发主分支
- `pre-production`：预生产环境分支
- `production`：生产环境分支

**流程**：开发 → 测试环境 → 预生产环境 → 生产环境

**优点**：环境隔离清晰，发布可控
**缺点**：分支较多，管理复杂

#### 选择建议

- **小团队、快速迭代**：GitHub Flow
- **中大型团队、版本发布**：Git Flow
- **多环境部署**：GitLab Flow
- **企业级项目**：根据具体需求定制化流程

### 分支命名规范

统一的分支命名规范让团队协作更顺畅：

推荐这套规范：
- **主分支**：`main` / `master`，只用于正式发布版本
- **集成分支**：`develop`，日常开发合并到这里
- **功能分支**：`feature/*`，从 develop 拉出
- **修复分支**：`hotfix/*`，紧急 Bug 修复分支
- **发布分支**：`release/*`，发布准备分支

### 提交信息模板

可以为项目设置提交信息模板：

```bash
# 创建提交模板文件
echo "
# <类型>: <简短描述>
# 
# <详细描述>
# 
# <相关问题编号>
#
# 类型说明:
# feat: 新功能
# fix: 修复bug
# docs: 文档更新
# style: 代码格式调整
# refactor: 代码重构
# test: 测试相关
# chore: 构建/工具链相关
" > .gitmessage

# 配置模板
git config commit.template .gitmessage
```

### Code Review 最佳实践

- **小而频繁的提交**：便于审查和理解
- **清晰的提交信息**：说明改动的原因和内容
- **自测后再提交**：确保代码能正常运行
- **及时响应反馈**：积极参与代码讨论

### 团队协作流程建议

1. **拉取最新代码**：开始工作前先 `git pull`
2. **创建功能分支**：从最新的主分支创建
3. **频繁提交**：完成一个小功能就提交一次
4. **推送和PR**：功能完成后推送并创建Pull Request
5. **代码审查**：等待团队成员审查
6. **合并主分支**：审查通过后合并

## 性能优化与维护

随着项目发展，Git 仓库可能会变得臃肿，定期维护很有必要。

### 性能优化命令

```bash
# 垃圾回收和仓库优化
git gc --aggressive

# 清理无用的对象
git prune

# 查看仓库大小统计
git count-objects -vH

# 清理远程分支引用
git remote prune origin

# 压缩仓库（更激进的优化）
git repack -ad
```

### 仓库体检

```bash
# 检查仓库完整性
git fsck --full

# 查看哪些文件占用空间最大
git rev-list --objects --all | \
git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
sed -n 's/^blob //p' | \
sort --numeric-sort --key=2 | \
tail -n 10

# 找出历史中的大文件
git filter-branch --tree-filter 'rm -rf path/to/large/files' HEAD
```

**⚠️ 注意**：`git filter-branch` 会重写历史，使用前请备份！

### GPG 签名

为了确保提交的安全性，可以使用 GPG 签名：

```bash
# 生成 GPG 密钥（如果没有的话）
gpg --gen-key

# 查看 GPG 密钥
gpg --list-keys

# 配置 Git 使用 GPG 签名
git config --global user.signingkey <key-id>
git config --global commit.gpgsign true

# 手动签名提交
git commit -S -m "signed commit"

# 验证签名
git log --show-signature
```

## 统计分析

Git 提供了丰富的统计功能，帮助了解项目开发情况。

### 贡献统计

```bash
# 查看贡献者统计
git shortlog -sn

# 查看某个作者的提交
git log --author="张三" --oneline

# 统计指定时间段的提交
git log --since="2023-01-01" --until="2023-12-31" --pretty=format:"%h %an %ad %s" --date=short

# 统计各个作者的代码行数变化
git log --pretty=format:"%an" --numstat | awk '
{
  if (NF == 1) {
    author = $1
  } else if (NF == 3) {
    add[author] += $1
    del[author] += $2
  }
}
END {
  for (a in add) {
    printf "%s: +%d -%d\n", a, add[a], del[a]
  }
}'

# 统计指定时间段内的代码行数变化
git log --since="2025-01-01" --until="2025-12-31" --pretty=format:"%an" --numstat | awk '
{
  if (NF == 1) {
    author = $1
  } else if (NF == 3) {
    add[author] += $1
    del[author] += $2
  }
}
END {
  for (a in add) {
    printf "%s: +%d -%d\n", a, add[a], del[a]
  }
}'
```

### 项目分析

```bash
# 查看文件修改频率
git log --name-only --pretty=format: | sort | uniq -c | sort -rg | head -10

# 查看最活跃的文件
git log --format=format: --name-only | grep -v '^$' | sort | uniq -c | sort -rg | head -10

# 统计不同类型文件的提交次数
git log --name-only --pretty=format: | grep -E '\.(js|py|java|go)$' | sort | uniq -c | sort -rg

# 查看项目的生命周期
git log --reverse --format="%ai %s" | head -1  # 第一次提交
git log --format="%ai %s" | head -1            # 最近提交
```

这些统计信息对项目管理、代码审查和团队协作都很有帮助。

## 故障排查与恢复

在使用 Git 的过程中，难免会遇到各种问题。掌握一些排查和恢复技巧很重要。

### 常见问题排查

```bash
# 检查仓库完整性
git fsck --full

# 检查远程仓库连接状态
git remote show origin

# 查看当前状态（脚本友好格式）
git status --porcelain

# 查看配置问题
git config --list --show-origin

# 检查忽略文件规则
git check-ignore -v <filename>
```

### 紧急恢复场景

**场景1：误删重要文件**
```bash
# 如果文件还没有被提交，可以从暂存区恢复
git checkout HEAD -- <filename>

# 如果已经提交但后来被删除，从历史恢复
git log --follow -- <filename>  # 找到文件的历史
git checkout <commit-hash> -- <filename>  # 恢复特定版本
```

**场景2：提交到错误分支**
```bash
# 查看最近的提交
git log --oneline -5

# 切换到正确的分支
git checkout correct-branch

# 将提交从错误分支复制过来
git cherry-pick <commit-hash>

# 回到错误分支删除那个提交
git checkout wrong-branch
git reset --hard HEAD~1
```

**场景3：合并出现问题**
```bash
# 如果合并过程中想要中止
git merge --abort

# 如果合并已完成但有问题
git reset --hard HEAD~1  # 回到合并前
# 或者
git revert -m 1 HEAD      # 创建反向提交
```

**场景4：rebase 搞砸了**
```bash
# 查看 rebase 前的状态
git reflog

# 回到 rebase 之前
git reset --hard HEAD@{n}  # n 是 reflog 中的序号
```

### 数据恢复技巧

```bash
# 找回"丢失"的提交
git reflog --all | grep <commit-partial-hash>

# 恢复已删除的分支
git reflog | grep <branch-name>
git checkout -b <branch-name> <commit-hash>

# 找回被误删的 stash
git fsck --unreachable | grep commit | cut -d' ' -f3 | xargs git log --merges --no-walk --grep=WIP
```


## 小技巧

记录一些，上面不曾提到过得小技巧

- 开发过程中， 可以使用图形界面工具（Sourcetree），来 diff 要提交的内容是否为自己要提交，以防止一些不想提交的东西提交进去。
- 刚初始化的项目，想要撤销第一次提交，推荐使用：`git reset --soft HEAD~1`
- 远端删除的掉分支，本地想要同步删除可以使用：`git fetch -p`，`-p` 是 `--prune` 的缩写，也可以手动清理：`git remote prune origin`
- 本地代码想要重置到远程分支的最新状态，可以使用 `git reset --hard origin/<branch_name>` 来重置到远程分支最新的代码
- 修改了一半的代码，想要撤销回去，可以使用：
  - `git checkout .` 来复位（旧方式，不会对已经 add 过的修改生效）
  - `git restore .` 来复位工作区（Git 2.23+ 推荐方式）
  - `git restore --staged .` 来取消暂存区的修改
- 以行的形式查看最近的提交：`git log --oneline`，可以直接看一屏的提交历史
- 查看当前分支名，适合脚本使用：`git rev-parse --abbrev-ref HEAD`
- 可视化所有分支结构：`git log --graph --oneline --all --decorate`
- git 是可以设置别名的，比如上一个命令太长不好记住，可以设置个别名：`git config --global alias.lg "log --oneline --graph --decorate --all"`
- 生成补丁文件：`git format-patch HEAD~3`，导出最近 3 次提交为 .patch 文件 
- 应用补丁文件：`git apply xxx.patch`，把补丁应用到当前代码
- 查看两个 commit 之间的 log，`git log <起点>..<终点>`，`git log HEAD~5..HEAD --oneline` 查看最近 5 个提交
- 已经提交过得文件，现在想要添加到 .gitignore 中，但它们依然会被 Git 追踪，为什么？
```shell
# .gitignore 只对未被 Git 跟踪（未提交）的文件有效。对于已经被提交并纳入版本控制的文件，它不起作用。
# 解决方法如下
# 1. 从 Git 暂存区中移除文件（不删除本地文件）：
git rm --cached <文件路径>

# 2. 提交一次"清除追踪"的变更：
git commit -m "xxx"

# 查看未追踪的被忽略文件	
git ls-files -i -o --exclude-standard

# 查看已追踪但被忽略的文件
git ls-files -i -c --exclude-standard

# 可以一键清理哦
git ls-files -z --cached --ignored --exclude-standard | xargs -0 git rm --cached
```
- git 是不会对空文件夹进行管理的，如果需要保留空文件夹，可以在其中添加 `.gitkeep` 文件
- 查看文件的修改历史：`git log -p -- <filename>`，可以看到文件每次修改的具体内容
- 查看谁修改了文件的某一行：`git blame <filename>`，可以看到每一行的最后修改者和时间
- 搜索提交信息：`git log --grep="关键词"`，搜索代码内容：`git log -S "代码片段"`
- 批量修改历史中的邮箱地址：`git filter-branch --env-filter 'if [ "$GIT_AUTHOR_EMAIL" = "old@email.com" ]; then export GIT_AUTHOR_EMAIL="new@email.com"; fi'`

## 总结

恭喜你完成了 Git 进阶之旅！🎉 

通过两篇文章的学习，你现在已经：

### 🎯 **掌握的技能**
- **基础扎实**：熟练掌握 Git 日常操作和核心概念
- **分支专家**：能够处理复杂的分支管理和冲突解决
- **团队协作**：了解各种工作流程和最佳实践
- **高级技巧**：掌握远程管理、性能优化、故障排查
- **深度理解**：了解 Git 内部原理，知其然知其所以然

### 💪 **你现在可以**
- 在任何规模的团队中高效协作
- 解决各种复杂的 Git 问题
- 优化和维护 Git 仓库
- 设计适合团队的 Git 工作流
- 成为团队中的 Git 专家

### 🚀 **继续进步**
- **实践为王**：在实际项目中应用所学知识
- **持续学习**：关注 Git 新特性和社区最佳实践
- **分享交流**：与团队分享你的 Git 经验
- **工具探索**：尝试各种 Git GUI 工具和集成

**📚 相关文章**：
- [Git 基本介绍 —— 入门到熟练](./git-1)

**🎯 记住**：Git 是一个工具，但更重要的是背后的版本控制思想。掌握了这些，你就掌握了现代软件开发的重要基石！

*"工欲善其事，必先利其器"* —— 现在你的 Git 这把利器已经磨得锋利无比！⭐


