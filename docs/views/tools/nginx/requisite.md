---
title: 反向代理与负载均衡
date: 2019-08-16
tags:
  - 其他
---

# 反向代理与负载均衡

> **nginx**是一个高性能的 HTTP 和反向代理服务器，也是一个通用的 TCP/UDP 代理服务器，最初由俄罗斯人**Igor Sysoev**编写。**nginx**在应用程序中的作用有：
>
> - 解决跨域
> - 请求过滤
> - 配置 gzip
> - 负载均衡
> - 静态资源服务器

## 代理

> &emsp;`代理` 是在服务器和客户端之间架设的一层服务器，代理将接受客户端的请求将它转发给服务器，然后将服务端的响应转发给客户端。不管正向代理还是反向代理，都是实现此功能。<br/> > &emsp;说到代理，首先我们要明确一个概念，所谓代理就是一个代表、一个渠道；此时就涉及到两个角色，一个是被代理角色，一个是目标角色。<br/> > &emsp;举个例子：比如说生活中的专卖店，客人到 adidas 专卖店买了一双鞋，这个专卖店就是代理，被代理角色就是 adidas 厂家，目标角色就是用户

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/nginx-proxy.jpg')"/>
</p>

### 正向代理

> 正向代理是一个位于 **客户端** 和 **原始服务器** 之间的服务器，为了从原始服务器取得内容，客户端向代理发送一个请求并指定目标(原始服务器)，然后代理向原始服务器转交请求并将获得的内容返回给客户端

- 正向代理是为我们服务的，也就是为客户端服务的。客户端可以根据正向代理访问到它本身无法访问到的服务器资源。
- 正向代理对我们是透明的，对服务端是不透明的，服务端不知道自己收到的是来自代理的访问还是真是的客户端的访问。

- 举个例子：我们经常说的翻墙就是正向代理，在如今的网络环境下，我们如果由于技术需要要去访问国外的某些网站，此时你会发现位于国外的某网站我们通过浏览器是没有办法访问的。此时大家可能都会用一个操作 翻墙 进行访问，翻墙 的方式主要是找到一个可以访问国外网站的代理服务器，我们将请求发送给代理服务器，代理服务器去访问国外的网站，然后将访问到的数据传递给我们

- 特点

  1. 正向代理最大的特点是客户端非常明确要访问的服务器地址
  2. 服务器只清楚请求来自哪个代理服务器，而不清楚来自哪个具体的客户端
  3. 正向代理模式屏蔽或者隐藏了真实客户端信息

- 用途
  1. 访问原来无法访问的资源，如 Google
  2. 可以做缓存，加速访问资源
  3. 对客户端访问授权，上网进行认证
  4. 代理可以记录用户访问记录（上网行为管理），对外隐藏用户信息

### 反向代理

> 正向代理隐藏了客户端的信息，那么反向代理正好相反，隐藏了服务端的信息，客户端反问一个台代理服务器，然后由代理服务器把请求转发到相应的服务器上

- 反向代理经常被用来隐藏服务器安全，为了安全我们的服务一般都不会对外开放，此时我们需要一台对外开放的服务器，来做各种请求的转发，接受一条来自外界的请求，代理服务器负责转发到相应的内网服务器进行处理
- 反向代理，`它代理的是服务端`，主要用于服务器集群分布式部署的情况下，反向代理隐藏了服务器的信息。
- 举个栗子：在我们拨打 10086 客服电话，可能一个地区的 10086 客服有几个或者几十个，你永远都不需要关心在电话那头的是哪一个，你只需要拨通了 10086 的总机号码，电话那头总会有人会回答你。那么这里的 10086 总机号码就是我们说的 **反向代理**，客户不知道真正提供服务人的是谁。

- 用途

  1. 保证内网的安全，通常将方向代理作为公网访问地址，web 服务是内网
  2. 负载均衡，通过反向代理服务器来优化网站的负载。

- 假如现在访问我的网站就是访问 www.baidu.com，配置入戏

```sh
  server {
    # 监听端口
    listen  80;
    server_name localhost;
    location /  {
      proxy_pass  http://www.baidu.com;
    }
  }
```

## 集群与负载均衡简单了解

- 集群：一组松散或紧密连接在一起工作的计算机。 由于这些计算机协同工作，在许多方面它们可以被视为单个系统。 与网格计算机不同，计算机集群将每个节点设置为执行相同的任务，由软件控制和调度。（摘自百度百科）
- 简单理解集群就是：多个服务器一起为某个服务工作；
- 负载均衡：高可用网络基础架构的关键组件，通常用于将工作负载分布到多个服务器来提高网站、应用、数据库或其他服务的性能和可靠性。（摘自知乎）
- 简单理解负载均衡就是：
  - 我们有一堆服务器处理相同的服务，这是集群，
  - 他们可以 ip 一样端口不一样，也可以不同的服务器端口一样的，
  - 比如说有两台服务器处理相同的服务，一台端口为 8888，一台端口为 7777，
  - 这两台服务器就是一个集群，这时候会有 多种算法 使我们访问这个服务的时候到底去请求那个端口的服务，
  - 这个算法可以是一个请求发给 8888，一个发给 7777；
  - 假如 8888 性能好点十核的服务，7777 是一核的，也可以十个请求给 8888 一个请求给 7777，有不同的算法来不同的处理。那我们怎么配置呢
- 首先，简单配置如下

```sh
  # 配置都在http模块里面
  http {
    # ...省略其他配置
    # 配置集群，webserver是我们给集群起的名字
    upstream webserver {
      server localhost:8888;
      server localhost:7777;
    }
    # 配置负载均衡
    server {
      listen  80;
      server_name localhost;
      location  / {
        # 这里传入集群的名字
        proxy_pass  http://webserver;
      }
    }
  }
```

## 负载均衡调度算法

> 接下来，我们写四台简单的服务器，来进行测试，四个服务器的端口分别是 `3333、4444、5555、6666`，他们都返回自身的端口号，然后我们在进行 `nginx` 调度配置，先把四台服务器跑起来

<p align="center" class="p-images">
  <img :src="$withBase('/imgs/nginx-proxy-cluster.jpg')"/>
</p>

### 轮询（默认）

- 每个请求按照时间顺序逐一分配到不同的服务器，如果服务器宕机，则自动剔除
- 简单配置一个，访问网站 `/testserver` 每次都返回不同的内容

```sh
  # 默认配置就是轮询
  http {
    # .... 省略其余配置
    # 测试集群策略
    upstream test_server {
      server localhost:3333;
      server localhost:4444;
      server localhost:5555;
      server localhost:6666;
    }

    server {
      listen  80;
      server_name localhost;
      location / {
        # 省略....
      }
      # 集群配置
      location /testserver {
        proxy_pass http://test_server;
      }
    }
  }

```

### 权重 weight

- 使用 `weight` 指定轮询几率，`weight` 和访问比率成正比，用于后端服务器性能不均的情况。
- 权重数据越大，被分配到请求的几率越大；该权重值，主要是针对实际工作环境中不同的后端服务器硬件配置进行调整的。
- 配置一个实现，访问网站 10 次，四个端口按照 1:2:3:4 的比例进行访问

```sh
  # 只需要在定义的集群服务器后面写上权重值就可以了
  upstream test_server {
    server localhost:3333 weight=1;
    server localhost:4444 weight=2;
    server localhost:5555 weight=3;
    server localhost:6666 weight=4;
  }
```

### ip_hash 策略

- 使用 `ip_hash` 定义服务器的调度
- 每个请求按照发起客户端的 `ip` 的 `hash` 结果进行匹配，这样的算法下一个固定 `ip` 地址的客户端总会访问到同一个后端服务器，这也在一定程度上解决了集群部署环境下 `Session` 共享的问题
- 配置也很简单，只需要在定义集群服务上面加上 `ip_hash` 即可

```sh
  # ip_hash 策略
  upstream test_server {
    # 这样做，谁访问的那个服务器，为了避免 session 不共享的问题，这个人基本上会被一直代理到他所访问到的服务器上
    ip_hash;
    server localhost:3333;
    server localhost:4444;
    server localhost:5555;
    server localhost:6666;
  }
```

### 其他策略

- 除了以上三种调度策略外，还有其他的调度算法，但是那些需要依赖第三方插件，简单介绍下
- `fair` 策略：按后端服务器的响应时间来分配请求，响应时间短的优先分配。
- `url_hash` 策略：按访问 url 的 hash 结果来分配请求，使每个 url 定向到同一个后端服务器，后端服务器为缓存时比较有效。

```sh
  # fair 策略（第三方）
  upstream test_server {
    server localhost:3333;
    server localhost:4444;
    server localhost:5555;
    server localhost:6666;
    fair;
  }

  # url_hash（第三方）
  upstream test_server {
    server localhost:3333;
    server localhost:4444;
    server localhost:5555;
    server localhost:6666;
    hash $request_uri;
    hash_method crc32;
  }
```

### 定义负载均衡设备的 Ip 及设备状态

- `nginx` 支持同时设置多组的负载均衡，用来给不用的 `server` 来使用
- 配置如下：

```sh
  upstream test_server {
    ip_hash;
    server localhost:3333 down;
    server localhost:4444 weight=2;
    server localhost:5555;
    server localhost:6666 backup;
  }
```

- 设备的状态值：
  1. `down`：表示当前设备暂时不参与负载
  2. `weight`：默认为 1。`weight` 越大，负载的权重就越大
  3. `max_fails`：允许请求失败的次数默认为 1。当超过最大次数时，返回 `proxy_next_upstream` 模块定义的错误
  4. `fail_timeout:max_fails`：次失败后，暂停的时间
  5. `backup`：其它所有的非 `backup` 机器 `down` 或者忙的时候，请求 `backup` 机器。所以这台机器压力会最轻

本文章参考链接如下:

- [Nginx upstream 的几种分配方式](https://blog.51cto.com/wangwei007/1103727)
- [Nginx 相关介绍(Nginx 是什么?能干嘛?)](https://www.cnblogs.com/wcwnina/p/8728391.html)
- [nginx 反向代理和负载均衡策略实战案例](https://mp.weixin.qq.com/s?__biz=MzIyMDkwODczNw==&mid=2247485444&idx=1&sn=f142dc529b3bd4ad2813cbfd5e021e07&chksm=97c595aaa0b21cbc72b9b15d42f24a435f24b1bb10acdecb84587390f58369f4a6c7e5873eda&mpshare=1&scene=24&srcid=&sharer_sharetime=1573177641385&sharer_shareid=173a9b33fbb44b987bd7c4d69f782a28#rd)
