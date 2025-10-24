#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件，命令放在外面方便传递不同的参数
# npm run build
BUILD_TYPE=git npx vitepress build docs
echo '开始部署...'

# 进入生成的文件夹
cd ./love

echo '进入打包后文件夹，初始化 git'

git init
git add -A
git commit -m 'deploy'

echo '初始化 git 完成，准备推送'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# https://fecym.github.io/docs/
# git push -f git@github.com:fecym/docs.git master:gh-pages
git push -f git@github.com:fecym/docs.git main:gh-pages

cd -