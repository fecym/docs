## https

参照[老左笔记](https://www.laozuo.org/7676.html)进行实践

## 准备东西

首先准备一台空的服务器

## 安装的东西

- 安装 git、nginx

```sh
yum install git
yum install nginx
```

## 快速获取 Let's Encrypt 免费 SSL 证书

执行以下脚本，域名换成自己的域名，邮箱换成自己的邮箱，然后一路同意

注意：执行脚本的时候一定要停掉 nginx，否则会出错

```sh
git clone https://github.com/letsencrypt/letsencrypt
cd letsencrypt
./letsencrypt-auto certonly --standalone --email diy_mnb@163.com -d https.cym.today
```

## 有效期是 90 天

每间隔 90 需要执行以下这个脚本

```sh
./letsencrypt-auto certonly --renew-by-default --email diy_mnb@163.com -d https.cym.today
```

如何配置参照老左笔记

## 配置 nginx

进入 `/etc/nginx`，修改 `nginx.conf`

```sh
cd /etc/nginx/
vi nginx.conf
```
