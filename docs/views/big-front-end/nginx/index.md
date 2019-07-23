# nginx

## 安装

- 安装就暂时略过了，记录一下配置

## 常用命令

- 做了软链接或者配置了nginx的环境变量可以用以下语法，没有话就需要指定到nginx所在的目录
- **nginx -s stop** 停止nginx
- **nginx -s quit** 退出nginx
- **nginx -s reload** 重新加载配置（修改配置文件后）
- **nginx -s reopen** 重启nginx
- **nginx -v** 查看版本
- **nginx -t** 查看配置文件目录，检测配置文件是否有语法错误，然后退出

## nginx.conf配置文件

::: tip
  Nginx配置文件主要分成四部分：main（全局设置）、server（主机设置）、upstream（上游服务器设置，主要为反向代理、负载均衡相关配置）和 location（URL匹配特定位置后的设置），每部分包含若干个指令。main部分设置的指令将影响其它所有部分的设置；server部分的指令主要用于指定虚拟主机域名、IP和端口；upstream的指令用于设置一系列的后端服务器，设置反向代理及后端服务器的负载均衡；location部分用于匹配网页位置（比如，根目录“/”,“/images”,等等）。他们之间的关系式：server继承main，location继承server；upstream既不会继承指令也不会被继承。它有自己的特殊指令，不需要在其他地方的应用。
:::

<!-- ## 简单配置

- nginx默认端口是80，表示http协议，https协议默认443端口
- 开启进程数
  - **worker_processes** 要小于自己的CPU数，所以我们可以设置为 auto
- error_log
  - 自定义错误日志保存位置，全局设置，默认*logs/error.log*
  - error_log 级别分为debug， info， notice， warn， error， crit， 默认为crit
  - crit记录的日志最少， 而debug记录的日志最多。 如果你的nginx遇到一些问题， 比如502比较频繁出现， 但是看默认的error_log并没有看到有意义的信息， 那么就可以调一下错误日志的级别， 当调成error级别时， 错误日志记录的内容会更加丰富。 
- pid
  - 进程ip，保存位置，默认为*logs/nginx.pid*
- http  -->

## main全局配置

> nginx在运行时与具体业务（比如http服务或者email服务代理）无关的参数，比如工作进程数、运行身份等

### woker_processes

- 在配置文件的顶级*main*部分，worker角色的工作进程的个数，master进程是接收并分配请求给worker处理。这个数据简单一点可以设置为CPU的核数 *grep ^processor /proc/cpuinfo | wc -l*，也是*auto*值。如果开启了ssl和gzip更应该设置成与逻辑CPU数量一样甚至为2倍，可以减少I/O操作，如果nginx服务器还有其他服务，可以适当减少。

### worker_cpu_affinity

- 也是写在main部分。在高并发情况下，通过设置cpu粘性来降低由于多CPU核切换造成的寄存器等现场重建带来的性能损耗。如*worker_cpu_affinity 0001 0010 0100 1000*; （四核）。

### worker_connections 2048

- 在 **events** 部分。每一个worker进程能并发处理（发起）的最大连接数（包括与客户端或后端被代理服务器间等所有的连接数）。
- nginx作为反向代理服务器，计算公式 *最大连接数 = worker_processes * worker_connections / 4*，所以这里客户端最大连接数是1024，这个可以增加到8192都没关系，但是不能超过后面的 *worker_rlimit_nofile*。
- 当nginx作为http服务器时，计算公式都除以2

### worker_rlimit_nofile 10240

- 写在main部分。默认是没有设置，可以限制为操作系统最大的限制65535。

### use epoll

- 写在events部分。在Linux操作系统下，nginx默认使用epoll事件模型，得益于此，nginx在Linux操作系统下效率相当高。同时Nginx在OpenBSD或FreeBSD操作系统上采用类似于epoll的高效事件模型kqueue。在操作系统不支持这些高效模型时才使用select。

## http服务器

> 与提供http服务相关的一些配置参数。例如：是否使用*keeplive*，是否使用*gzip*进行压缩等

### sendfile on

- 开启高效的文件传输模式，sendfile指令指定nginx是否调用sendfile函数来传输文件，减少用户空间到内核空间的上下文切换。
- 对于普通应用设为on，如果用来进行下载等应用磁盘IO重负载应用，可设置为off，以平衡磁盘与网络I/O处理速度，减低系统的负载

### keeplive_timeout 65

- 长连接超时时间，单位是秒。
- 这个参数很敏感，涉及浏览器的种类、后端服务器的超时设置、操作系统的设置，可以另外起一片文章了。长连接请求大量小文件的时候，可以减少重建连接的开销，但假如有大文件上传，65s内没上传完成会导致失败。如果设置时间过长，用户又多，长时间保持连接会占用大量资源。

### send_timeout

- 用于指定响应客户端的超时时间。这个超时仅限于两个连接活动之间的时间，如果超过这个时间，客户端没有任何活动，Nginx将会关闭连接。

### client_max_body_size 10m

- 允许客户端请求的最大单文件字节数。如果有上传较大文件，请设置它的限制值

### client_body_buffer_size 128k

- 缓冲区代理缓冲用户端请求的最大字节数

### 模块http_proxy

> 这个模块实现的是nginx作为反向代理服务器的功能，包括缓存功能（[传送门](http://seanlook.com/2015/06/02/nginx-cache-check/)）

- proxy_connect_timeout 60
  - nginx跟后端服务器连接超时时间(代理连接超时)

- proxy_read_timeout 60
  - 连接成功后，与后端服务器两个成功的响应操作之间超时时间(代理接收超时)

- proxy_buffer_size 4k
  - 设置代理服务器（nginx）从后端realserver读取并保存用户头信息的缓冲区大小，默认与proxy_buffers大小相同，其实可以将这个指令值设的小一点

- proxy_buffers 4 32k
  - proxy_buffers缓冲区，nginx针对单个连接缓存来自后端realserver的响应，网页平均在32k以下的话，这样设置

- proxy_busy_buffers_size 64k
  - 高负荷下缓冲大小（proxy_buffers*2）

- proxy_max_temp_file_size
  - 当 proxy_buffers 放不下后端服务器的响应内容时，会将一部分保存到硬盘的临时文件中，这个值用来设置最大临时文件大小，默认1024M，它与 proxy_cache 没有关系。大于这个值，将从upstream服务器传回。设置为0禁用。

- proxy_temp_file_write_size 64k
  - 当缓存被代理的服务器响应到临时文件时，这个选项限制每次写临时文件的大小。proxy_temp_path（可以在编译的时候）指定写到哪那个目录。

- proxy_pass，proxy_redirect见 location 部分。

### 模块http_gzip

- gzip on：开启gzip压缩输出，减少网络传输。
  - **gzip_min_length 1k**：设置允许压缩的页面最小字节数，页面字节数从header头得content-length中进行获取。默认值是20。建议设置成大于1k的字节数，小于1k可能会越压越大。
  - **gzip_buffers 4 16k**：设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。4 16k代表以16k为单位，安装原始数据大小以16k为单位的4倍申请内存。
  - **gzip_http_version 1.0**：用于识别 http 协议的版本，早期的浏览器不支持 Gzip 压缩，用户就会看到乱码，所以为了支持前期版本加上了这个选项，如果你用了 Nginx 的反向代理并期望也启用 Gzip 压缩的话，由于末端通信是 http/1.0，故请设置为 1.0。
  - **gzip_comp_level 6**：gzip压缩比，1压缩比最小处理速度最快，9压缩比最大但处理速度最慢(传输快但比较消耗cpu)
  - **gzip_types** ：匹配mime类型进行压缩，无论是否指定,”text/html”类型总是会被压缩的。
  - **gzip_proxied any**：Nginx作为反向代理的时候启用，决定开启或者关闭后端服务器返回的结果是否压缩，匹配的前提是后端服务器必须要返回包含”Via”的 header头。
  - **gzip_vary on**：和http头有关系，会在响应头加个 Vary: Accept-Encoding ，可以让前端的缓存服务器缓存经过gzip压缩的页面，例如，用Squid缓存经过Nginx压缩的数据。

## server虚拟主机

::: tip
  http服务上支持若干个虚拟主机。每个虚拟主机一个对应的server配置项，配置项里面包含该虚拟主机相关的配置。在提供mail服务代理时，也可以建立多个server。每个server通过监听地址或端口来区分
:::

### listen
- 监听端口，默认80，小于1024的要以root启动。可以为 listen *:80、listen 127.0.0.1:80形式。

### server_name
- 服务器名，如localhost、www.example.com，可以通过正则匹配

### 模块http_stream
- 这个模块通过一个简单的调度算法来实现客户端IP到后端服务器的负载均衡，upstream后接负载均衡器的名字，后端realserver以 host:port options; 方式组织在 {} 中。如果后端被代理的只有一台，也可以直接写在 proxy_pass 。

## location

> http服务中，某些特定的URL对应的一系列配置项。

### root  /root/project/main;

- 定义服务器的默认网站根目录位置。如果 **location** URL 配置的是子目录或文件，root没什么作用，一般放在*server*指令里面或者 / 下
- 也可以写成**alias**，来匹配，alias   /root/cym/project/daily-admin/，但是 location / 不可以写成alias，否则会是403
<p align="center">
  <img :src="$withBase('/imgs/nginx-location-conf.png')" height="">
</p>

### index  index.html index.htm;
- 定义路径下默认访问的文件名

### proxy_pass http://127.0.0.1:3000/api/;
- 请求转向 *http://127.0.0.1:3000/api/*，即反向代理，对应*upstream*负载均衡器

- 关于location匹配规则的写法，可以说尤为关键且基础的，参考文章 [nginx配置location总结及rewrite规则写法](http://seanlook.com/2015/05/17/nginx-location-rewrite/);

- [本文章参考](http://seanlook.com/2015/05/17/nginx-install-and-config/)