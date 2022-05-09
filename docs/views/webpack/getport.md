---
title: 如何优雅的解决端口被占用
date: 2022-04-04
tags:
  - webpack node
---

## 一个问题

前段时间，公司项目改版登录，所有管理后台、大屏可视化或者说电脑 web 端的登录做成了一个模块统一授权登录，登录的域名是配置出来的，等他们联调完之后，我发现我本地项目跑起来后登录不了啦，找相关开发人员了解情况后才知道后端限制了 `localhost` 的访问(就离谱)

他们推荐前端开发人员本地安装 nginx，配置本机 hosts，用 nginx 做跳转，后端可访问域名白名单中添加有我们 hosts 中配置的域名

我是习惯了项目跑完后点击项目启动完成后的提示信息跳转页面进行开发(主要我不想本地配 nginx)，继续与他们交谈我了解到后端允许 127.0.0.1 进行接口访问，只需要在公共开发平台配置一下即可，于是我有了一个想法，[更改终端提示信息](#更改终端提示信息)

既然他们支持在开发平台里面配置一个访问接口域名，那把 `127.0.0.1:port` 配置上去，然后在项目跑完后终端的提示信息里面加上 127.0.0.1:port 不就可以了

## vue-cli 是怎么做的

翻了下 vue-cli 的源码，它是在跑完项目后用 console.log 打印出来最终的访问项目地址，代码在 `@vue/cli-service/lib/commands/serve.js` 第 261 行

<p align="center">
  <img :src="$withBase('/imgs/getport-cli-intro.png')"/>
</p>

但我们已经不能直接像 vue-cli 这样直接打印我们的要使用的，我们得换个方法

记得 vue-cli 终端错误提示信息用的好像是 `friendly-errors-webpack-plugin` 插件进行更改提示的，不自信的我又进入了 `@vue/cli-service` 里面看代码，终于在 `@vue/cli-service/lib/config/base.js` 中找到了，cli 定义了 `friendly-errors` 使用了 `@soda/friendly-errors-webpack-plugin` 插件，并传入 vue 自定义的格式化和转换器来解析错误信息

<p align="center">
  <img :src="$withBase('/imgs/getport-friendly-errors.png')"/>
</p>

## 更改终端提示信息

那就修改 `vue.config.js` 把 `127.0.0.1:port` 提示加上

```js
const port = 8080;
const publicPath = '/admin';
module.exports = {
  // 省略其他配置
  chainWebpack: config => {
    // 获取到 friendly-errors 的配置
    const friendErrorConf = config.plugin('friendly-errors').store.get('args')[0];
    const developRun = `http://127.0.0.1:${port}${publicPath}`;
    // 为编译成功信息添加一个 notes
    friendErrorConf.compilationSuccessInfo = {
      notes: [
        `Local development, click here: ${chalk.hex('#ee776d')(developRun)}`,
        // 把项目文件夹也贴上去吧，省得每次新开终端都要一层层进入打开项目
        `Project Directory: ${chalk.hex('#66d9ef')(process.cwd())}`,
      ],
    };
    // 最后在添加到这个配置上面就可以了
    config.plugin('friendly-errors').use(require('@soda/friendly-errors-webpack-plugin'), [friendErrorConf]);
  },
};
```

这下终于还可以保持之前的操作习惯，每次项目编译完成之后，直接点击提示信息进行项目的访问了，而且对新人也比较友好，新来的同学也不需要进行一大堆配置才可以访问本地跑起来的项目了

<p align="center">
  <img :src="$withBase('/imgs/getport-terminal-prompt1.png')"/>
</p>

这就完了嘛？不，还没正式开始呢！因为这根本没考虑到端口被占用情况，端口如果被占用了，cli 的提示端口会自增 1，而我们提示的还是项目配置的端口，这可不是我们想要的

## portfinder

接下来我们正式进入主题：如何优雅的解决端口被占用的问题。vue-cli 使用 [portfinder](https://github.com/http-party/node-portfinder) 做端口检测，若发现端口被占用则端口自增 1，webpack 默认也是支持的(不配置 devServer.port 的情况下)，貌似也是用了 portfinder

代码在 `@vue/cli-service/lib/commands/serve.js` 中第 107 行，这里使用了 portfinder 去查找了可用端口

<p align="center">
  <img :src="$withBase('/imgs/getport-cli-portfinder.png')"/>
</p>

于是我兴冲冲的把代码改了一下加上了一句 `await getPortPromise({ port })`，结果发现加的那个提示没出来，这下我才知道事情远远没有我想的那么简单

## 预执行插件

查了一下资料发现原来 `vue.config.js` 里面并不支持异步代码，或者说异步代码是不会生效的，但查找端口是一个异步操作，那怎样才能在 vue.config 的 chainWebpack 里面支持异步呢，最后在一个 [issues](https://github.com/vuejs/vue-cli/issues/3328) 里找到了相关问题，虽然作者没有直接解决，但是也给出了一个解决方法：那就是给 npm run serve 添加一层 wrap

思路：

1. 在外面拿到数据，外层 wrap 函数是我们自定义的，所以可以支持异步，所以我们就等异步回来之后在跑项目
2. 首先新建一个 `serve.prehandle.js` 用于 wrap，先异步的拿到可用的 port

```js
// serve.prehandle.js
const portfinder = require('portfinder');
const isDevEnv = process.env.NODE_ENV !== 'production';

module.exports = (api, options) => {
  api.registerCommand('serve:prehandle', async args => {
    if (isDevEnv) {
      portfinder.basePort = process.env.PORT || 8080;
      // 把获取到的可用端口存到 process 对象上
      process.finderPort = await portfinder.getPortPromise();
    }
    await api.service.run('serve', args);
  });
};

module.exports.defaultModes = {
  'serve:prehandle': 'development',
};
```

3. 修改 `package.json`

- `scripts.serve` 修改为 `vue-cli-service serve:prehandle`
- 增加 `vuePlugins`，对应上面的 `serve:prehandle` 命令，为这条命令指定处理文件

```json
// package.json 更改
{
  "scripts": {
    "serve": "vue-cli-service serve:prehandle"
  },
  "vuePlugins": {
    "service": ["serve.prehandle.js"]
  }
}
```

4. 修改 `vue.config.js` 接收数据，上面我们存在了 process 对象里面 `process.finderPort`，最后执行 `npm run serve` 即可生效

```js
module.exports = {
  // 省略其他配置
  chainWebpack: config => {
    const friendErrorConf = config.plugin('friendly-errors').store.get('args')[0];
    // 把之前写死的 port 换成 process.finderPort
    const developRun = `http://127.0.0.1:${process.finderPort}${publicPath}`;
    friendErrorConf.compilationSuccessInfo = {
      notes: [
        `Local development, click here: ${chalk.hex('#ee776d')(developRun)}`,
        // 把项目文件夹也贴上去吧，省得每次新开终端都需要一层层进入打开项目
        `Project Directory: ${chalk.hex('#66d9ef')(process.cwd())}`,
      ],
    };
    config.plugin('friendly-errors').use(require('@soda/friendly-errors-webpack-plugin'), [friendErrorConf]);
  },
};
```

此时我们就成功的解决了这个问题，每次运行完成项目，上下两个端口是保持一致的，即使端口被占用了也是一样

## portfinder 源码分析

做完了上面这些工作后，我突然就对 [portfinder](https://github.com/http-party/node-portfinder) 很感兴趣，打算去研究一下他是怎么做到 port 被占用后自增 1 的，于是就看了一下源码，他的源码还是比较容易阅读和理解的，总共不到 500 行代码

### 核心代码

1. 利用 net 模块创建一个 server
2. 用这个 server 去监听 error 和 listening 事件
3. 如果监听成功 listening，则返回 port；触发 error 事件则判断 errorCode 是被占用或者没权限时则让端口自增 1 后重复上述操作

```js
const net = require('net');
const server = net.createServer();

const highestPort = 65535;

const nextPort = port => port + 1;

function testPort(port, callback) {
  port = +port;
  function onListen() {
    callback(null, port);
    server.removeListener('error', onError);
    server.close();
  }

  function onError(err) {
    server.removeListener('listening', onListen);
    // 如果端口不是被占用或者没权限则抛出异常等待后续程序处理，1024 以下的端口普通用户是没有权限的
    if (!(err.code == 'EADDRINUSE' || err.code == 'EACCES')) {
      return callback(err);
    }
    const _nextPort = nextPort(port);
    if (_nextPort > highestPort) {
      return callback(new Error('No open ports available'));
    }
    testPort(_nextPort);
  }
  server.once('error', onError);
  server.once('listening', onListen);
  server.listen(port);
}
```

科普一下：

1.  `EADDRINUSE`怎么就知道端口被占用了呢，拆开来翻译 `E ADDR IN USE`，完整的单词就是 `error address in use`
2.  `EACCES` 也一样就是没有访问权限呗

### 获取所有主机

当然上面的代码不能确定某个端口就被占用了，因为没传递 host 呀，没传递 host 的话服务器将监听来自于任何客户端的连接。所以我们需要保证 host+port 都没有被占用才算找到一个合适端口

所以我们需要先利用 `os` 模块去获取本机所有 host 存到一个队列里，然后循环这个队列利用上面的 testPort 把 host+port 一起带过去检测端口是否被占用，如果都没有被占用，才算找到一个合适的端口

```js
// 获取所有主机
const defaultHosts = (function() {
  const interfaces = os.networkInterfaces();
  const interfaceNames = Object.keys(interfaces);
  const results = ['0.0.0.0'];
  for (let i = 0; i < interfaceNames.length; i++) {
    const _interface = interfaces[interfaceNames[i]];
    for (let j = 0; j < _interface.length; j++) {
      const cur = _interface[j];
      results.push(cur.address);
    }
  }
  results.push(null);
  return results;
})();
```

### 遍历主机拼上端口去查询

源码里面使用了 [async](https://github.com/caolan/async) 模块遍历获取到的 host，然后去调用 testPort 方法，传入 host 和 port，判断 testPort 返回结果

1. 如果正常，换下一个 host 重复调用，并把当前的 `port` 存到一个`新的队列里`

<p align="center">
  <img :src="$withBase('/imgs/getport-normal.png')"/>
</p>

2. 如果中途代码异常了：

- 判断错误码是不是 `EADDRNOTAVAIL` 或者 `EINVAL`，地址无效或者不合法的时候就需要在 host 队列里面删掉这个 host，然后继续执行
- 否则就是真的出错了，结束程序抛出异常（在 testPort 里面已经判断过地址被占用了）

<p align="center">
  <img :src="$withBase('/imgs/getport-error.png')"/>
</p>

3. 重复执行上面的操作，直到遍历完所有合法的 host

4. 遍历完所有 host 后，对成功的 port 队列进行一次排序，然后判断第一个和最后一个端口是否一样

- 如果一样则说明随便一个端口都是可用的返回其中一个端口即可
- 如果不一样则拿出最后一个端口再次执行该方法

<p align="center">
  <img :src="$withBase('/imgs/getport-sort.png')"/>
</p>

科普一下：Async 是一个很实用的模块，它为异步 JavaScript 提供了简单而强大的功能。虽然最初设计是为了与 Node.js 一起使用，但它也可以直接在浏览器中使用。

## 实现一个 portfinder

已经知道 portfinder 的大体思路了，我们来实现一下 portfinder 的 getPort 和 getPortPromise 两个方法

```js
const net = require('net');
const os = require('os');
const highestPort = 65535;

// 记录所有成功的端口
let openPorts = [];

const nextPort = port => port + 1;

const defaultHosts = (function() {
  const interfaces = os.networkInterfaces();
  const interfaceNames = Object.keys(interfaces);
  const results = ['0.0.0.0'];
  for (let i = 0; i < interfaceNames.length; i++) {
    const _interface = interfaces[interfaceNames[i]];
    for (let j = 0; j < _interface.length; j++) {
      const cur = _interface[j];
      results.push(cur.address);
    }
  }
  results.push(null);
  return results;
})();

function testPort({ port, host, server }, callback) {
  server = server || net.createServer();
  port = +port;
  function onListen() {
    server.removeListener('error', onError);
    server.close();
    callback(null, port);
  }

  function onError(err) {
    server.removeListener('listening', onListen);

    if (!(err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
      // 地址被占用（E ADDR IN USE）或者没有访问权限
      return callback(err);
    }
    const _nextPort = nextPort(port);
    if (_nextPort > highestPort) {
      return callback(new Error('No open ports available'));
    }
    testPort({ port: _nextPort, host, server }, callback);
  }
  server.once('error', onError);
  server.once('listening', onListen);
  if (host) {
    server.listen(port, host);
  } else {
    server.listen(port);
  }
}

function getPortCore(options, callback, execIndex) {
  const port = options.port;
  // 处理 host
  if (options.host) {
    let hasUserGivenHost;
    for (let i = 0; i < defaultHosts.length; i++) {
      if (defaultHosts[i] === options.host) {
        hasUserGivenHost = true;
        break;
      }
    }
    if (!hasUserGivenHost) {
      defaultHosts.push(options.host);
    }
  }
  exec();
  function exec(index) {
    index = index || execIndex || 0;
    if (index > defaultHosts.length) return callback(null, port);
    const host = defaultHosts[index];
    testPort({ port, host }, (err, data) => {
      if (!err) {
        openPorts.push(data);
        return exec(index + 1);
      }
      if (err.code === 'EADDRNOTAVAIL' || err.code === 'EINVAL') {
        // 如果得到EADDRNOTAVAIL，它意味着主机是不可绑定的，所以删除它，EINVAL也一样
        const idx = defaultHosts.indexOf(host);
        defaultHosts.splice(idx, 1);
        getPortCore({ port, host: defaultHosts[index] }, callback, index);
      } else {
        return callback(err);
      }
    });
  }
}

function getPort(options, callback) {
  getPortCore(options, err => {
    if (err) return callback(err);
    openPorts = openPorts.sort((a, b) => a - b);
    if (openPorts[0] === openPorts[openPorts.length - 1]) {
      // 说明都一样，返回随便返回一个都能用
      return callback(null, openPorts[0]);
    } else {
      // 拿着最大的端口再查询一次
      return getPortCore({ port: openPorts.pop(), host: options.host }, callback);
    }
  });
}

function getPortPromise(options) {
  return new Promise((resolve, reject) => {
    getPort(options, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}

module.exports = { getPort, getPortPromise };

// getPortPromise({ port: 8084 }).then(res => {
//   console.log(res, "final");
// });
```

## 参考链接

- [vue.config.js 中 chainWebpack 支持异步数据](https://segmentfault.com/a/1190000039661767)
