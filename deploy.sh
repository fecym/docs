#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件，命令放在外面方便传递不同的参数
# npm run build
npm run deploy

# 进入生成的文件夹
cd ./love

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:fecym/docs.git master:gh-pages

cd -