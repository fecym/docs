---
title: 记一次购买服务器
date: 2019-11-06
tags:
  - 大前端
  - Linux
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

- 我习惯在 `/usr/` 目录下新建一个 `download` 目录来保存自己下载的一些文件或者安装包之类的，所以我们新建这个文件夹，然后把下载的 `nginx` 放到这个目录下面，当然也有很多人喜欢放到 `/usr/src/` 目录下，这个看个人习惯
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
  ./configure --with-http_ssl_module     # 默认安装在 /usr/local/nginx 目录下，--with-http_ssl_module 是为了以后配置 ssl
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

<p align="center" class="p-images">
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

### 添加环境变量

> 因为我们使用源码编译安装了 `Nginx`，管理 `Nginx` 非常的不方便，比如启动 `Nginx` 的命令就很长，所有我们把 `Nginx` 添加到环境变量来直接全局使用 `nginx` 命令，配置了环境之后更新 `nginx.conf` 后就可以直接 `nginx -s reload` 重启服务了

- Linux 添加环境变量比较简单
- 编辑 profile 文件

- 添加核心代码

- 保存退出，然后重载 profile 文件即可

```sh
  # 编辑 profile 文件
  vim /etc/profile
  # 添加以下代码
  export NGINX_HOME=/usr/local/nginx
  export PATH=$PATH:$NGINX_HOME/sbin
  # 保存退出后，重载文件
  source /etc/profile
  # 验证是否成功
  nginx -v
```

## 把 http 转成 https

> 为什么要把网站做成 https，https 和 http 有什么区别，https 和 ssl 之间的关系，这里不做任何解释，本文只记录作为一个外行人，如果搭建自己服务器的过程。

### 申请 SSL 证书

> SSL 证书是一种加密协议。大部分企业级的 SSL 证书都是需要收费的，而且对于个人开发者来说都不便宜（土豪随意）。个人使用的 SSL 证书，有一些是免费的，比如 Let's Encrypt、阿里云、腾讯云、又拍云等，都有提供免费证书的申请接口。这里说的阿里云的

- 打开 "管理控制台" --> "安全（云盾）" --> "SSL 证书"
- 点击 "购买证书" --> 选择 "免费版（个人）DV" --> "购买"
- 回到 SSL 证书 页面，我们开始验证我们购买的 免费版的 SSL，验证方法上面写的很详细，按着上面的来就可以了
- 验证完毕，等待审核成功，我们下载审核完成的证书
- 点击下载时会提醒你，选择对应的服务类型（Tomcat、Apache、Nginx、IIS 和其他）
- 这里我选择了 `Nginx`，点击下载旁边的帮助查看帮助文档，里面很详细的讲了你需要把下载的证书放到服务器的那个位置，然后如何配置 `Nginx`

### 配置 https

简单配置如下

```sh
# 修改 nginx/conf/nginx.conf 文件
vim /usr/local/nginx/conf/nginx.conf
# 添加以下配置
# https nginx配置
server {
  listen       443;
  server_name  localhost;
  ssl on;
  # 证书的文件（绝对地址也可以）。
  ssl_certificate      xxx.pem;
  # 证书的密钥文件。
  ssl_certificate_key  xxx.key;
  ssl_session_cache    shared:SSL:1m;
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_session_timeout  5m;
  # ssl_ciphers  HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers  on;
  location / {
    # 根目录地址
    root   /root/project/blog;
    index  index.html index.htm;
  }
}
# 保存并退出
:wq
# 重启nginx服务
nginx -s reload
```

- 此时发现可能还不能访问，有可能就是防火墙的问题，去阿里云官网配置一个 `443` 端口的安全组规则即可
- 如果想要服务的 `http` 自动转入 `https`，只需要在每一个 server 中加如一句话即可

```sh
server {
  listen       80;
  server_name  localhost;
  # ...省略其他
  # 将所有 http 请求通过 rewrite 重定向到 https。
  rewrite ^(.*)$ https://$host$1 permanent;
  # ...省略其他
}
```

## 安装 node

> 为什么要安装 `node`，作为一个前端资深切图仔，我想不需要解释为什么了吧

### 安装 nvm

> `nvm` 作为 `node` 版本管理用具还是蛮好用的，我们可以先安装一个 `nvm` 再来下载不同的版本的 `node`

- 在 `nvm` 的 github 上面有讲解怎么下载，[传送门](https://github.com/nvm-sh/nvm)

```sh
  # 下载方法
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
```

- 下载完成之后，我们输入 `nvm list` 告诉你 nvm 命令不存在

<p align="left">
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
- 我们安装一个当前稳定版本 12.13.1 的 node 吧

```sh
  nvm install 12.13.1
```

## 安装 redis

> [`redis`](http://www.redis.cn/) 是一个数据库，读写特别快，我们经常把它用来做缓存，同时它支持多种数据结构，目前稳定版本是 5.0.5

### 安装

老规矩，下载解压然后安装

```sh
  # 下载 5.0.5 版本到 /usr/download 目录
  wget -P /usr/download http://download.redis.io/releases/redis-5.0.5.tar.gz
  # 解压
  cd /usr/download
  tar -zxvf redis-5.0.5.tar.gz
  # 编译
  cd redis-5.0.5
  make
  # 安装
  make install PREFIX=/usr/local/redis  # PREFIX后面是安装目录
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-service-redis-make.jpg')" height="" title="redis安装成功" />
</p>

### 连接 redis

此时进入 `/usr/local/redis` 目录下有个 `bin` 目录，执行 `./redis-server` 命令，看到如下图所示，说明安装成功

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-service-redis-make-success.jpg')" height="" title="redis启动成功" />
</p>

退出：`Ctrl + c` 退出

### 后台启动

- 把 `redis` 安装包目录下的 `redis.conf` 复制到 `/usr/local/redis/bin/` 目录下
- 然后修改 `redis.conf` 文件，把 `daemonize` 改成 yes

```sh
cp /usr/download/redis-5.0.5/redis.conf /usr/local/redis/bin/
vim /usr/local/redis/bin/redis.conf
# 把 daemonize 改成 yes，然后保存并退出
:wq
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-service-redis-vim-conf.jpg')" height="" title="redis 后台启动" />
</p>

- 然后执行 `./redis-server redis.conf`，这样就后台启动了
- 执行 `ps aux | grep redis` 查看进程，`redis` 默认端口号是 `6379`

### 演示

- `redis` 分客户端（redis-cli）和服务端（redis-server）
- 启动 `redis` 服务端然后在启动客户端，就可以在客户端输入 `redis` 命令进行数据的存储了
- 启动客户端命令：`./redis-cli`；退出客户端命令：`quit`
- 整个启动命令如下：

```sh
  # 查看 redis 服务是否启动
  ps aux | grep redis
  # 返回进程 id 和端口号说明启动成功
  # 启动客户端
  ./redis-cli
  # 默认得到的是本机的ip:127.0.0.1:6379>
  ping
  # 返回 PONG
  # 退出进程
  quit
```

## 安装 MySQL

> `MySQL` 已经出到 8 版本了，并且 `8.0.18` 也在今年 `10-14` 号正式发布，那我们就安装这个版本的吧，之前我是用的 `5.7.20`，传说`8.0` 版本的 `MySQL` 比 `5.7` 版本的 `MySQL` 快 2 倍以上哦，那我们来爬下坑

### 安装前准备

老规矩，先把 `MySQL` 下载到 `/usr/download`，解压安装，开始安装前的准备工作

```sh
  # 8.0 的下载地址
  wget -P /usr/download https://cdn.mysql.com//Downloads/MySQL-8.0/mysql-8.0.18-linux-glibc2.12-x86_64.tar.xz
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-service-init-mysql-install.png')" height="" title="这网速..." />
</p>

- 服务器网速不好，400 多兆的东西需要下载 16h，换个方式下载吧，本地下载完传到服务器上吧
- 那样的话需要本地上传服务器，我们先安装个上传下载工具包 `rz` 及 `sz`，此时我们就可以 `rz` 进行上传文件了

```sh
  # 安装上传下载工具包
  yum install -y lrzsz
```

- 输入 rz 之后会有一个弹框提示你选择要添加的文件，只需要添加上你要上传的文件就可以了

- 我把 MySQL 的安装上传到了 `/usr/download` 文件夹下，此时我们解压到 `/usr/local` 目录下，然后重命名文件夹
- 解压过程中，发现报错了，原来我们下载了一个 `xz` 的压缩包，所以解压方式要换一下了
- 需要先把 `.xz` 结尾的文件先解压一次为 `.tar` 的打包格式，然后在用 `tar` 命令进行解压
- 好像也可以直接使用 `tar xvJf ***.tar.xz` 来解压

```sh
  # 在 /usr/download 目录下
  xz -d mysql-8.0.18-linux-glibc2.12-x86_64.tar.xz  # 运行该命令后会把源文件删除
  # 解压到 /usr/local/ 目录下
  tar -xvf mysql-8.0.18-linux-glibc2.12-x86_64.tar.xz -C /usr/local/
  # 重命名
  mv /usr/local/mysql-8.0.18-linux-glibc2.12-x86_64 /usr/local/mysql
  # 在 MySQL 根目录下新建一个文件夹 data，用于存放数据
  cd /usr/local/mysql && mkdir data
  # 创建 MySQL 用户组和 MySQL 用户
  groupadd mysql
  useradd -g mysql mysql
  # 改变 MySQL 目录权限
  chown -R mysql.mysql /usr/local/mysql/
  # 或者这么做
  # chown -R mysql .
  # chgrp -R mysql .
```

### 初始化

创建 `mysql_install_db` 安装文件，然后初始化

```sh
  # 创建 mysql_install_db 安装文件
  mkdir mysql_install_db
  chmod 777 ./mysql_install_db
  # 初始化数据库
  ./bin/mysqld --initialize --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
  # 报错了？报错了看下边
```

### 遇到的问题

- 初始化的时候报了一个错误 `./bin/mysqld: error while loading shared libraries: libaio.so.1: cannot open shared object file: No such file or directory`
- 这个问题是缺少安装包 `libaio` 和 `libaio-devel`，安装即可

```sh
  # 自动安装这两个包
  yum install libaio*
  # 然后在执行 初始化数据库命令
  ./bin/mysqld --initialize --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
```

- 此时看到下面这句话，说明初始化成功了
- 并且为你生成了临时的 `MySQL` 登录密码，一定要记下来，我们需要登录进 `MySQL`，然后修改密码

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-service-init-mysql-install-init-success.png')" height="" title="安装成功" />
</p>

### 配置 my.cnf

```sh
  # 接下来按照我的做
  cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
  # 修改my.cnf文件
  vim  /etc/my.cnf
  # 修改为下图所示
```

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/big-front-service-init-mysql-config-my.conf.png')" height="" title="修改配置文件" />
</p>

### 建立 MySQL 服务

```sh
  # 注意这里是 mysql 不是 mysqld 哦
  cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysql
  # 赋予可执行权限
  chmod +x /etc/init.d/mysql
  # 添加到系统服务
  chkconfig --add mysql
  # 再来 mysqld 的
  cp -a /usr/local/mysql/support-files/mysql.server /etc/init.d/mysqld
  chmod +x /etc/rc.d/init.d/mysqld
  chkconfig --add mysqld
  # 检查是否生效
  chkconfig  --list mysqld
```

### 配置环境变量

老规矩，编辑 `/etc/profile` 文件，添加两句话

```sh
  vim /etc/profile
  # 最底部添加以下两句话
  export PATH=$PATH:/usr/local/mysql/bin:/usr/local/mysql/lib
  export PATH
  # 保存并退出
  :wq
  # 重启环境变量让其立即生效
  source /etc/profile
  # 启动MySQL服务
  service mysql start
```

### 修改密码

```sh
  mysql -uroot -p
  # 提示你输入密码或者报错
```

- 报了一个错：`log-error set to '/var/log/mariadb/mariadb.log', however file don't exists. Create writable for user 'mysql'.`
- 这个是权限问题，应该是没有 `/var/log/mariadb/mariadb.log` 这个路径
- 那我们就创建, 并给 `mysql` 用户授权即可

```sh
  mkdir /var/log/mariadb
  touch /var/log/mariadb/mariadb.log
  chown -R mysql:mysql  /var/log/mariadb/
  # 然后查看 mysql 命令
  mysql --version     # 返回以下命令说明可以了
  # mysql  Ver 8.0.18 for linux-glibc2.12 on x86_64 (MySQL Community Server - GPL)
  # 此时我们再次登录
  mysql -uroot -p
  # 第一次输入临时密码，进去后修改登录密码
  # 修改登录密码，MySQL 语法都要在尾部加上 ; 哦
  set password="你的密码";
  flush privileges;
  # 返回 OK, 0 rows affected (0.00 sec) 说明语句更新成功了
```

### node 连接 MySQL8 报错

> 把 MySQL 安装完毕，把之前的数据导过来，node 项目跑起来，发现 node 连接 MySQL 的时候报错了 `Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client`

#### 出错原因：

&emsp;导致这个错误的原因是，目前，最新的 `mysql模块` 并未完全支持 `MySQL 8` 的 `caching_sha2_password` 加密方式，而 `caching_sha2_password` 在 `MySQL 8` 中是默认的加密方式。因此，下面的方式命令是默认已经使用了 `caching_sha2_password` 加密方式，该账号、密码无法在 `mysql模块` 中使用。

#### 解决方法：

&emsp;解决方法是从新修改用户 root 的密码，并指定 `mysql模块` 能够支持的加密方式：

```sql
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你要改的密码'
```

&emsp;上述语句，显示指定了使用 `mysql_native_password` 的加密方式。这种方式是在 `mysql模块` 能够支持。
