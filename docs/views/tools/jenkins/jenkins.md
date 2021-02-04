## 安装前准备

### [Jenkins 中文文档](https://www.jenkins.io/zh/)

### 安装依赖

安装 Jenkins 依赖于 Java 和 git，所以要先安装，否则会报错

```sh
yum install java
yum install git
```

```sh
# 未找到 Java 或者 git 可能会报错
Starting jenkins (via systemctl): Job for jenkins.service failed because the control process exited with error code. See “systemctl status jenkins.service” and “journalctl -xe” for details.
```

如果已经安装过，则修改一下 Jenkins 的配置 `/etc/init.d/jenkins` 文件即可

### 使用 yum 下载

- yum 的 repo 中默认没有 Jenkins，需要先将 Jenkins 存储库添加到 yum repos，执行下面的命令：

```sh
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
```

- 下载完成之后在执行以下命令

```sh
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
```

## 安装

此时安装就可以直接执行 `yum install jenkins` 下载了，中途如果出现询问是否下载时，输入 y，然后点击回车，等待下载完成

## 修改配置

jenkins 安装成功后，默认的用户是 jenkins，端口是 8080，为了防止冲突，并且给用户赋权限，我们修改用户名和端口。

输入命令，进入 jenkins 配置文件： `vi /etc/sysconfig/jenkins`

记得在安全组中打开配置的 Jenkins 端口

## 初始化

安装完成后执行命令 `service jenkins start`

此时在浏览器中打开 Jenkins 的地址，等待初始化完成

初始化完成之后，根据提示输入登录密码然后配置 Jenkins

根据提示，安装推荐插件，随后安装 Rebuilder SafeRestart 两个推荐插件

## 配置项目
