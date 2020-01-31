---
title: 常见的 HTTP 认证方式
date: 2019-12-31
tags:
  - cookie
  - session
  - jwt
  - 基础
---

还有几分钟就要跨年了，2019 即将结束，跨年夜独自一人闲来无趣，整理一下 `cookie、token` 和 `jwt` 的，记得在学校的时候我就很奇怪 `cookie` 是什么，当时老师只对我们说他就是用来存储数据的，只能存储 `4kb`，超过 `4kb` 之后就会开始删除之前的 `cookie` 值，不同浏览器删除的行为是不一样的。然后就没了。直到后来参加工作了，刚入公司没多久一次接触到了 `cookie` 让我一脸懵逼（当时带我的大佬有事回家了），项目出了 bug 因为 `cookie` 传递的不对，后台解析不了，然后我折腾了一晚上（回想当初小白的时候是真的有趣）。

今天来记录下工作这么久我对 cookie、session 和 jwt 的理解。

## Cookie

http 是无状态协议（对于事务处理没有记忆能力，每次客户端和服务端会话完成时，服务端不会保存任何会话信息）：每个请求都是完全独立的，服务器呢无法确认当前访问者的身份信息，也不能分辨上一次请求与这一次请求是不是同一个人。

所以服务器与浏览器为了进行会话跟踪（知道谁在访问我），就需要去维护一个状态，这个状态用于告知服务器前后两个请求是不是同一个浏览器。而这个状态需要通过 `cookie` 或者 `session` 来实现的

cookie 保存在客户端：`cookie` 是服务器发送到浏览器并保存在本地的一块数据，他会在浏览器下次请求同一服务器的时候被携带到服务器上。

cookie 是不可跨域的：每个 `cookie` 都会绑定单一的域名，无法在其他域名下获取，一级二级域名之间可以共享，设置相同的 `domain` 即可

当我们第一次请求服务器的时候（服务器已设置 cookie），我们会看到响应头中有 `Set-Cookie` 字段。

第二请求的时候，我们会发现，请求头中携带了 `Cookie` 字段，第一次请求的时候是没有 `Cookie` 字段的。

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/basis-cookie.png')" alt="cookie">
</p>

### cookie 的重要属性

在上图中看到 `Set-Cookie` 字段是一个字符串，是一对对 `name=value; name=value; name=value; ...` 这样的组合，那么他们是什么意思呢？

| 属性       | 说明                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name=value | 键值对，设置 `Cookie` 的名称及相对应的值，都必须是字符串类型 <br> 如果值为 `Unicode` 字符，需要为字符编码。<br> 如果值为二进制数据，则需要使用 `base64` 编码。                                        |
| domain     | 指定 `cookie` 所属域名，默认是当前域名                                                                                                                                                                |
| path       | 指定 cookie 在哪个路径（路由）下生效，默认是 '/'。<br> 如果设置为 /cym，则只有 /cym 下的路由可以访问到该 `cookie`，如：http://localhost:3000/cym/abc                                                  |
| maxAge     | `cookie` 的失效时间，单位毫秒。如果为正数，则该 `cookie` 在 `maxAge` 秒后实效。如果是负数，该 `cookie` 为临时 `cookie`，关闭浏览器即失效。如果为 0，表示删除该 `cookie`。默认为 -1。比 `expires` 好用 |
| expires    | 过期时间，在设置的某个时间点后该 `cookie` 就会失效。一般浏览器的 `cookie` 都是默认储存的，当关闭浏览器结束这个会话的时候，这个 `cookie` 也就会被删除                                                  |
| secure     | 该 `cookie` 是否仅被使用在安全传输协议，默认为 `false`；当 `secure` 为 `true` 时，`cookie` 在 `http` 中是无效的，必须在 `https` 请求下才有效                                                          |
| httpOnly   | 该 `cookie` 是否可以被 `js` 脚本读取，如果设置为 `true` 则 `js` 将不能获取到 `cookie`，在一定程度上可以防止 `XSS` 攻击，不是绝对的安全                                                                |

### 代码实现

下面是使用 express 设置一条 cookie ，来浏览器端做访问

```js
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.cookie('test', 'cookie', {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    path: '/cym/abc',
    secure: true,
    // domain: 'baidu.com',
  })
  res.end('home')
})

app.listen(3000)
```

## Session

`cookie` 在客户端是可以被修改的，所以是不安全的，而且以明文保存

`session` 是另一种记录服务器和客户端会话状态的机制

`session` 是基于 `cookie` 实现的，`session` `存储在服务器端，sessionId` 会被存储到客户端的 `cookie` 中

`session` 是保存在服务器上的，客户端是无法获取到的

`session` 不是独立存在的，它依赖于 `cookie`

`session` 是一种特殊的 `cookie`，通常用作登录验证

### 认证流程

- 当用户第一次请求服务器的时候，服务器会根据用户提交的信息，创建对应的 `session`
- 请求返回时将此 `session` 的唯一标识信息 `sessionID` 返回给浏览器
- 浏览器接受到服务器返回的 `sessionID` 信息后，会将此信息保存到 `cookie` 中，同时 `cookie` 会记录此 `sessionID` 属于哪个域名。

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/basis-session.jpg')" alt="session">
</p>

- 当用户第二次访问服务器的时候，请求会自动会自动判断此域名下是否存在此 `cookie` 信息，如果存在则自动将此信息发送给服务器，服务器会从 `cookie` 中获取 `sessionID`，再根据 `sessionID` 查找对应的 `session` 信息后，如果没有找到说明用户没有登录或者 `session` 实效，如果找到说明用户已经登录继续执行以后操作

`sessionID` 是连接 `cookie` 和 `session` 的一道桥梁，大部分系统也是根据此来验证用户是否登录过的

### 代码实现

接下来我们用 `koa` 来实现一个 `session`，需求如下当用户登录之后，点击用户中心则可以跳转用户中心，然后返回到其他页面之后在再次点击用户中心也可以进去用户中心，没有登陆过则不可以跳转到用户中心，让他跳转登录页，退出后清空 `session`，使其不能进入用户中心页面。完整代码已上传 `github` [传送门](https://github.com/cym-git/sesssion.git)

<p align="left" class="p-images">
  <img :src="$withBase('/imgs/basis-session-demo.jpg')" alt="登录校验" title="登录校验">
</p>

```js
// koa 实现如下
const Koa = require('koa')
const Router = require('koa-router')
const session = require('koa-session')
const static = require('koa-static')
const body = require('koa-parser')
const app = new Koa()

// 使用 session 需要一个秘钥，就是一些随机字符串
app.keys = ['5e04d20d-33b72', '5e04d20d-1181c', '5e04d20d-1ac51']

// 处理post
app.use(body())

// 使用中间件设置session
app.use(
  session(
    {
      maxAge: 20 * 60 * 1000,
      renew: true,
    },
    app
  )
)

const router = new Router()

router.post('/login', async ctx => {
  const {username, password} = ctx.request.body
  if (username === 'admin' && password === '123123') {
    console.log('登录成功')
    // 设置 session
    ctx.session.user = username
  } else {
    console.log('登录失败')
  }
  // 没有这个前台会报404，必须返回点什么
  ctx.body = {code: 200}
})

// 用户中心
router.get('/profile', async ctx => {
  if (!ctx.session.user) {
    ctx.body = `<a href="/">请返回登录</a>`
  } else {
    ctx.body = '用户中心'
  }
})

// 清空 session
router.get('/logout', async ctx => {
  ctx.session.user = null
  ctx.body = '退出成功'
})

app.use(router.routes())

app.use(static('./www'))

app.listen(3001)
```

## Cookie 和 Session 的区别

- 安全性：`session` 比 `cookie` 安全，`session` 是存在服务端的，`cookie` 是存储在客户端的
- 存储类型不同：`cookie` 只支持存储字符串，要设置其他类型的需要转为字符串，但是 `session` 可以储存任意类型数据
- 有效期不同：`cookie` 可以保存在硬盘也可以保存在内存，可以长时间保存；`session` 不行，`session` 一般失效时间都比较短
- 储存大小不同：单个 `cookie` 保存的数据不能超过 `4kb`，`session` 可储存数据远高于 `cookie`

## JWT

jwt 全称 **JSON Web Token**，是目前最流行的跨域认证解决方案。具体可查看阮一峰大大的 [`JSON Web Token 入门教程`](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

### 认证流程

- 第一次请求服务器，客户端发送账号和密码
- 后台校验通过，生成一个有时效性的 `token`，将这个 `token` 发送给客户端
- 客户端获得 `token` 后，将此 `token` 存储在本地，一般储存在 `localstore` 或 `cookie`
- 随后每次请求都会将这个 `token` 携带到请求头里，所有的需要校验身份的接口都会被 `token` 校验，若 `token` 解析后的数据包含用户身份信息，则身份验证通过。

### 为什么要使用 jwt

- 在基于 `token` 的认证，`token` 通过请求头传输，而不是把认证信息存储在 `session` 或者 `cookie` 中。这意味着无状态。你可以从任意一种可以发送 HTTP 请求的终端向服务器发送请求。
- `session` 不利于拓展
- `session` 是存在服务器中的
- 假如服务器中使用了负载均衡，那么每次的请求不一定都会分发到同一台服务器上（ip_hash 除外），此时就需要改变策略或者使用 `redis` 来共享 `session` 的，但是使用 jwt 就可以完全避免这个问题，因为每次请求都是携带 `token` 的，所以服务端不需要保存会话信息

### jwt 格式

一个标准 `jwt` 有三部分组成：**header**（头部）、**payload**（数据）、**signature**（签名）

中间用点分隔开，并且都会使用 `Base64` 编码

服务端生成的一个 `jwt` 格式如下，以 `.` 分隔，token 可被解密，所以千万不要存 **敏感信息**

```conf
# （头部）是 base64 加的密，可以使用 base64 进行解密
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.
# （载荷 --> 保存的数据）
eyJkYXRhIjp7InVpZCI6MiwidXNlcm5hbWUiOiJjeW0ifSwiZXhwIjoxNTc3NjMzMjQwLCJpYXQiOjE1Nzc2Mjk2NDB9.
# （签名）
Y6F6_pOyDw2FMW6s9pND4n_IJTUmDQalEIZg823-Pqli-PSrKdoO0wfZTeXJawePNcceqt-wc5s37V5ZJRt8_vcSe8D3NAE-HUou2Jf9cGBnCj5Y84PfcrM8Y4txdbivm8TKFDx7TfafIFXscaNMdYGUEzA5pejUlEuda_lNkPAooxF6KjdUW3mW3ZeJSbP2VmblS6ycg6TyTxJJx8EopV_aLfkpA-3Yqg-A3d4kfK9GcksaX-vLxUi2y0L24Z4BoA_qdc0bTf1qMmh9BFlKCy5SX7unY_PaXXdWrEhLimmQwNu-N_byOMsgncEX1mYgNPnNxXvwYYHBPwZsqSkzRA
```

### jwt 基本使用

在 `node` 中使用 `jwt` 我选择了 `jsonwebtoken` 模块，这里来介绍下基本用法

#### 1. 签发 jwt

在 `jsonwebtoken` 模块中有个 `sign` 方法，用来签发 `token`，该方法接收三个参数：`payload`（载荷）、`secret`（秘钥）、其他的配置，简单写起来可能如下代码：

**载荷：除去协议首部之外实际传输的数据**

```js
const jwt = require('jsonwebtoken')

const payload = {name: 'cym'}

// 秘钥
const secret = 'CHENGYUMING'

// 签发 token
const token = jwt.sign(payload, secret, {expiresIn: '1day'})
```

#### 2. 校验 jwt

在 `jsonwebtoken` 模块中有个 `verify` 方法，用来校验 `jwt`，接收三个参数：token、secret 和 校验之后的回调函数

```js
jwt.verify(token, secret, (err, data) => {
  if (err) {
    return void console.log(err.message)
  }
  console.log(data)
})
```

#### 3. RS256 算法

默认签发还有校验 `token` 的时候用的是 `HS256` 算法，这种算法需要一个密钥（密码）。

我们还可以使用 `RS256` 算法签发与校验 `jwt`。

这种方法可以让我们分离开签发与验证，签发时需要用一个密钥，验证时使用公钥，也就是有 **公钥的地方只能做验证**，但不能签发 `jwt`。

此时我们就需要先生成一个私钥和一个公钥：

在项目目录下新建一个文件夹用来存储生成的私钥和公钥

```sh
mkdir rsa_key && cd rsa_key
# 先生成一个私钥
openssl genrsa -out rsa_private_key.pem 2048
# 在根据这个私钥生成一个公钥
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem
```

用 `RS256` 算法签发 `jwt` 的时候需要，从读取我们创建的秘钥文件，使用的方法还是跟之前一样的，不过需要在最后一个参数里面配置一下算法的格式 `{ algorithm: 'RS256' }`，那么整个流程如下

```js
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')

const privateKey = fs.readFileSync(
  path.resolve(__dirname, './rsa_key/rsa_private_key.pem')
)

// 签发 token，这里使用 RS256算法
const payload = {name: 'cym'}
const tokenRS256 = jwt.sign(payload, privateKey, {
  // 这里修改算法为 RS256
  algorithm: 'RS256',
  // 使用秒或表示时间跨度 zeit / ms 的字符串表示。
  expiresIn: '1d',
})

console.log('RS256 算法：', tokenRS256)

// 校验
const publicKey = fs.readFileSync(
  path.resolve(__dirname, './rsa_key/rsa_public_key.pem')
)

// 接受两个个参数：要校验的 token，公钥。校验 token 会得到一个对象，其中 iat 是 token 创建时间，exp 是 token 到期时间
jwt.verify(tokenRS256, publicKey, (err, data) => {
  if (err) {
    return void console.log(err.message)
  }
  console.log(data)
})
```

### 前后端交互代码实现

想了想呢，还是把代码放到 `github` 上吧，虽然是一个简单的前后端使用 `jwt` 进行交互，但是代码还是有点多，涉及到两端交互使用 `Authorization` 进行前后端校验，[代码地址](https://github.com/cym-git/jwt-flow.git)
