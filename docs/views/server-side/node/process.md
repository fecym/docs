## process

## 进程对象属性

| 属性     | 说明                                               |
| -------- | -------------------------------------------------- |
| execPath | 可执行文件的绝对路径，如 `/usr/local/bin/node`     |
| version  | 版本号                                             |
| versions | 依赖库的版本号                                     |
| platform | 运行平台 darwin(Mac)、freebsd、linux、sunos、win32 |
| stdin    | 标准输入流可读流，默认暂停状态                     |
| stdout   | 标准输出流可写流，同步操作                         |
| stderr   | 错误输出可写流，同步操作                           |
| argv     | 命令行参数，属性为数组                             |
| env      | 操作系统的环境信息                                 |
| pid      | 应用程序的进程 id                                  |
| title    | 窗口标题                                           |
| arch     | 处理器架构 arm ia32 x64                            |

## 方法

### memoryUsage

查看内存的使用情况，会返回一个对象，node v8 引擎内存使用量是有上限的，32 位最多是 0.7G；64 位最多使用 1.7G

- rss（resident set size）：所有内存占用，包括指令区和堆栈
- heapTotal：堆占用的内存，包括用到的和未用到的
- heapUsed：用到堆的部分
- external：v8 引擎内部的 C++ 占用的内存（buffer 是单独分配的，属于 external 内存）

### nextTick

用于将一个函数推迟到代码所书写的下一个同步方法执行完毕或者异步方法的回调函数开始执行前调用

### chdir

chdir 用于修改 node 应用程序中使用的当前工作目录，使用方法： `process.chdir(directory)`

### cwd

返回当前目录

### exit

退出 node 应用程序的进程

### kill

用于向进程发送一个信号

- SIGINT 程序终止（interrupt）信号，在用户输入 INTR 字符（Ctrl + c）时发出，用户通知前台进程组终止进程
- SIGTERM 程序结束（terminate）信号，该信号可以被阻塞和处理，通常用来要求程序自己正常退出，shell 命令 kill 缺省产生这个信号

用法： `process.kill(pid, [signal])`

- pid 是进程 id，整数类型
- signal 发送的信号，默认是 SIGTERM

### uptime

返回当前程序的运行时间

### hrtime

测试一个代码段的运行时间，返回两个时间，第一个单位是秒，第二个是纳秒，类似于 `console.timeEnd`

```js
const time = process.hrtime();
let num = 0;
while (num <= 10000000000) {
  num++;
}
const diff = process.hrtime(time);

console.log(`该程序执行耗时 %d 秒`, diff[0]);
```

### exit 事件

当 node 程序退出时会触发进程对象的 exit 事件，可以通过指定事件回调来指定进程退出时所执行的处理

```js
process.on('exit', () => console.log('node 程序退出了'));
process.exit();
```

### uncaughtException 事件

当应用程序抛出一个未被捕获的异常时触发进程对象的 `uncaughtException` 事件，一般不用

## 子进程

> 在 node 中，只有一个线程执行所有操作，如果某个操作需要大量消耗 CPU 资源的情况下，后续操作都要等待 <br>
> 所以在 node 中提供了一个 `child_process` 模块，通过他可以开启多个子进程，在多个子进程之间可以共享内存空间，可以通过子进程的互相通信来实现信息的交换

### spawn

#### 语法

```sh
child_process.spawn(command, [args], [options])
```

- command：必须指定的参数，指定需要执行的命令
- args：数组，存放了所有运行该命令需要的参数
- options：对象，用于指定开启子进程时使用的选项

### fork 开启子进程
