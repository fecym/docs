---
title: HTTP 日记
date: 2020-02-18
tags:
  - http
keys:
  - 'http-cym'
---

## 头部

### 通用头

| 首部字段名        | 说明                       |
| ----------------- | -------------------------- |
| Cache-Control     | 控制缓存行为               |
| Connection        | 链接的管理                 |
| Date              | 报文日期                   |
| Pragma            | 报文指令                   |
| Trailer           | 报文尾部的首部             |
| Transfer-Encoding | 指定报文主体的传输编码方式 |
| Upgrade           | 升级为其他协议             |
| Via               | 代理服务器信息             |
| Warning           | 错误通知                   |

### 请求头

| 首部字段名          | 说明                                            |
| ------------------- | ----------------------------------------------- |
| Accept              | 用户代理可处理的媒体类型                        |
| Accept-Charset      | 优先的字符集                                    |
| Accept-Encoding     | 优先的编码                                      |
| Accept-Language     | 优先的语言                                      |
| Authorization       | 认证信息                                        |
| Expect              | 期待服务器的特定行为                            |
| From                | 用户的电子邮件地址                              |
| Host                | 请求资源所在的服务器                            |
| If-Match            | 比较实体标记                                    |
| If-Modified-Since   | 比较资源的更新时间                              |
| If-None-Match       | 比较实体标记                                    |
| If-Range            | 资源未更新时发送实体 Byte 的范围请求            |
| If-Unmodified-Since | 比较资源的更新时间（和 If-Modified-Since 相反） |
| Max-Forwards        | 最大传输跳数                                    |
| Proxy-Authorization | 代理服务器需要客户端认证                        |
| Range               | 实体字节范围请求                                |
| Referer             | 请求中的 URL 的原始获取方法                     |
| TE                  | 传输编码的优先级                                |
| User-Agent          | HTTP 客户端程序信息                             |

### 响应头

| 首部字段名          | 说明                         |
| ------------------- | ---------------------------- |
| Accept-Ranges       | 是否接受字节范围             |
| Age                 | 资源的创建时间               |
| Etag                | 资源的匹配信息               |
| Location            | 客户端重定向至指定的 URL     |
| Proxy-Authorization | 代理服务器对客户端的认证信息 |
| Retry-After         | 再次发送请求的时机           |
| Server              | 服务器信息                   |
| Vary                | 代理服务器缓存的管理信息     |
| WWW-Authorization   | 服务器对客户端的认证         |

### 实体头

| 首部字段名       | 说明                         |
| ---------------- | ---------------------------- |
| Allow            | 资源可支持的 HTTP 方法       |
| Content-Encoding | 实体的编码方式               |
| Content-Language | 实体的自然语言               |
| Content-Length   | 实体的内容大小（单位：字节） |
| Content-Location | 替代对应资源的 URI           |
| Content-MD5      | 实体的报文摘要               |
| Content-Range    | 实体的位置范围               |
| Content-Type     | 实体主机的媒体类型           |
| Expires          | 实体的过期时间               |
