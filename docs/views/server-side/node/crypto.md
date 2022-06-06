---
title: 加密解密
date: 2020-02-23
tags:
  - 加密
keys:
  - 'crypto-cym'
---

## crypto

crypto 是 node 中实现加密解密的模块，使用 OpenSSL 类库作为内部实现加密解密的手段

## 散列(哈希)算法

散列算法也叫哈希算法，用来把任意长度的输入换成固定长度的输出，常见的有 md5、sha1、sha256 等

散列算法好很多中，在 node 中可以使用 `crypto.getHashes()` 获取到 node 所支持的所有 hash 类型

### 特点

- 相同的输入会产生相同的输出
- 不同的输出会产生不同的输出
- 任意的输入长度输出长度都是相同的
- 不能从输出推算输出的值（不能反解）

### 用途

- 用来校验要下载的文件是否被改的
- 用来对数据库中保存的密码进行加密（不泄露密码）

### 语法说明

```js
const crypto = require('crypto');
// crypto.createHash 接受一个散列算法的类型，比如 md5、sha1 等
const md5 = crypto.createHash('md5');
// update 方法用来指定要加密的值，可以多次添加
md5.update('hello');
md5.update('world');
// 输出 md5 的值，可以执行类型
md5.digest('hex');
// fc5e038d38a57032085441e7fe7010b0，md5是32位的
// fc5e038d38a57032085441e7fe7010b0，sha1是40位的
```

## HMAC 算法

HMAC 算法将散列算法与一个密钥结合在一起（加盐），以阻止对签名完整性的破坏

HMAC 加密需要生成一个密钥，然后与散列算法组合，生成的密钥是随机的，就相当于一个随机字符串与你要加密的内容组合在一起在进行加密，这个被称为加盐

### 语法

hmac 用法和 hash 加密差不多

```js
const hmac = crypto.createHmac(algorithm, key);
hamc.update(data);
```

- algorithm 是一个可用的摘要算法，比如 sha1、md5、sha256 等
- key 是一个字符串，用于指定一个 pem 格式的密钥，也可以写一个随机字符串，但是一般我们会生成一个密钥，不会去写一个字符串

```js
const hmac = crypto.createHmac('sha1', 'abc');
hmac.update('123');
hmac.digest('hex');
```

### 生成私钥

```sh
  # 生成密钥命令
  openssl genrsa -out rsa_private.key 1024
```

### 示例

```js
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const key = fs.readFileSync(path.join(__dirname, './rsa_private.key'));
// createHmac 方法接受两个参数 algorithm 和 密钥
const hmac = crypto.createHmac('sha1', key);
hmac.update('123');
const result = hmac.digest('hex');
console.log(result);
```

## 对称加密

上面所提到叫做摘要算法，摘要只能进行校验对不对，但是不可以反向解密，加密是可以解密的

blowfish 算法是一种对称加密算法，对称呢就是加密和解密使用同一个密钥

### 用法示例

对称加密可解密，加密解密对应不同的 api

- 加密：`crypto.createCipher('blowfish', key)`
- 解密：`crypto.createDecipher('blowfish', key)`
- 加密值： `cipher.update(str, 'utf8')`
- 输出值：`cipher.final('hex')`

示例：

```js
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const key = fs.readFileSync(path.join(__dirname, './rsa_private.key'));
const str = 'cym';

// 加密
const cipher = crypto.createCipher('blowfish', key);
cipher.update(str, 'utf8');
// 输出加密后的结果
const encry = cipher.final('hex');
console.log(encry);

// 解密
const decipher = crypto.createDecipher('blowfish', key);
decipher.update(encry, 'hex');
const deEncry = decipher.final('utf8');
console.log(deEncry);
```

## 非对称加密

## 签名
