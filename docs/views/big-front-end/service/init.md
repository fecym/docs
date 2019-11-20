---
title: 记一次购买服务器
date: 2019-11-06
tags:
  - 大前端
  - Linux
  - nginx
---

# 记一次购买服务器

> 一年度的双十一到了，人人疯狂准备购买东西，对于我们来说心动的恐怕就是服务器了吧，这不，阿里云搞活动我顶不住了，200 多块钱 3 年，虽然我有一台还没有到期，但是我还是忍不住又购买了一台，把配置的整个过程整理下，以便下次用，毕竟记性不咋好，之前都配置过，这次配置还是遇到了各种问题...

## 安装 nginx

> 买了服务器，肯定先到控制台把服务器激活，然后重置登录密码，启动服务，然后怎么访问呢，那就先装个服务器呗，我选了 `nginx`，`nginx` 做内网转发还是挺不错的，现在也特别火，毕竟是轻量级的服务器。`nginx` 有什么好处我就不多说了，可以看看[这篇文章](https://www.cnblogs.com/wcwnina/p/8728391.html)讲解的很不错了

### 安装前检查

- 安装 `nginx` 有两种方法，一种是源码包安装一种是 `yum` 安装，`yum` 安装可能不是最新版本的，这里我们选择了`源码包`安装
- 首先由于 `nginx` 的一些模块依赖一些 `lib` 库，所以在安装 `nginx` 之前，必须先安装这些 `lib` 库，这些依赖库主要有 `g++`、`gcc`、`openssl-devel`、`pcre-devel` 和 `zlib-devel` 所以执行如下命令安装

```sh
  yum install gcc-c++
  yum install pcre pcre-devel
  yum install zlib zlib-devel
  yum install openssl openssl--devel
```

- 安装前，最好检查下是否有安装过 `nginx`，如果已经安装过先卸载

```sh
  # 检查是否安装过 nginx
  find -name nginx
  # 如果有，那么卸载掉
  yum remove nginx
```

### 下载并安装

- 我习惯在 `/usr/` 目录下新建一个 `download` 目录来保存自己下载的一些文件或者安装包之类的，所以我们新建这个文件夹，然后把下载的 `nginx` 放到这个目录下面
- 去官网下载最新的 `nginx`

```sh
  # 新建download目录
  mkdir /usr/download
  # 下载 nginx 到 download 目录，wget -P 是把文件下载到指定目录下
  wget -P /usr/download http://nginx.org/download/nginx-1.9.9.tar.gz
```

- 然后我们到 `download` 目录下解压 `nginx`

```sh
  tar -zxvf nginx-1.9.9.tar.gz
```

- 接下来我们开始安装，使用 `--prefix` 指定 `nginx` 的安装目录，`make` `make install` 安装
- `--prefix` 详细参数可参考[`这篇文章`](https://segmentfault.com/a/1190000007116797#articleHeader9)，我们就用默认的就好

```sh
  ./configure     # 默认安装在 /usr/local/nginx 目录下
  make
  make install
```

- 如果没有报错，顺利完成后，看一下 `nginx` 的安装目录

```sh
  whereis nginx
```

- 此时我们就简单的安装完成了，然后我们把服务器跑起来，然后在浏览器中输入 `服务器的外网ip` 访问看是否成功了

```sh
  # 源码安装 nginx 的启动命令在下面的目录下
  cd /usr/local/nginx/sbin
  # 执行 nginx
  ./nginx
```

### 遇到的问题

- 在这一步我遇到了一个问题，`nginx` 报了一个错误，意思是说端口被占用了，我天，我刚买的服务器，`80` 端口就被占用了，于是我们查看下到底是谁占了我的 `80` 端口

<p align="center">
  <img :src="$withBase('/imgs/nginx-setup-address-already.jpg')" height="" title="端口被占用" />
</p>

```sh
  # 查看80端口被谁占用了
  netstat -anp | grep 80
```

- 执行以上命令后发现，`80` 端口被阿里云盾占用了，我也是第一次用阿里云的服务器，不知道会出现这种情况，杀死阿里云盾进程他还是会重启，如果再次遇到这个问题，可以看[这篇文章来解决](https://zhuanlan.zhihu.com/p/52758924)

- 解决了这个问题，`nginx` 终于跑起来了，可是后来发生的事情又是让我大跌眼睛
- 打开浏览器，输入服务器的 `ip`，正常的话，会有页面，`welcome to nginx` 我这里是浏览器访问失败了。
- 打开 `cmd`， `ping` 自己的 `ip`，可以 `ping` 通
- 使用 `curl` 却没有返回我们想要的东西，而是报 `Timed out`，很明显了，服务不通，却是想不到问题出在哪了，又重新捋了一遍，还是没有想到哪错了
- 后来想到会不会阿里云没有开放 `80` 端口，于是回到阿里控制台，才发现原来阿里云服务器，默认情况下是没有开发 `80`，我们需要手动开放这个端口，原来阿里云这里还给你防住了，于是我们开放 `80` 端口后可以访问了
- 需要在 云服务器 ECS -> 网络安全 -> 安全组 -> 配置规则 -> 添加安全组规则 -> 添加一条规则，开放我们想要开放的端口即可

## 安装 node

### 安装 nvm

> `nvm` 作为 `node` 版本管理用具还是蛮好用的，我们可以先安装一个 `nvm` 再来下载不同的版本的 `node`

- 在 `nvm` 的 github 上面有讲解怎么下载，[传送门](https://github.com/nvm-sh/nvm)

```sh
  # 下载方法
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
```

- 下载完成之后，我们输入 `nvm list` 告诉你 nvm 命令不存在

<p align="center">
  <img :src="$withBase('/imgs/node-nvm-error.png')" height="" title="" />
</p>

- 解决方法：`source ~/.bashrc`
- 此时再次输入 `nvm list` 就会有打印了

### nvm 常用命令

- `nvm list` 或者 `nvm ls` 查看 `node` 的安装版本
- `nvm install 8.9.0` 安装一个 8.9.0 版本的 node
- `nvm use 8.9.0` 切换到 8.9.0 版本的 node
- `nvm uninstall 8.9.0` 删除 8.9.0 版本的 node
- `nvm ls-remote` 查看远程的 node 版本
- `nvm current` 查看当前正在使用的 node 版本
- 我们安装一个 10.16.2 版本的 node 吧，`nvm install 10.16.2`


## 把 http 转成 https

