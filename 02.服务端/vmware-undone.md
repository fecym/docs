---
url: /docs/02.服务端/vmware-undone.md
---

## 系统启动

计算机通电后，第一件事情就是读取输入 ROM 芯片的开机程序，这个程序叫做基本输入输出系统 `BIOS`（Basic Input/Output System）

`BIOS` 程序首先检查计算机硬件是否满足运行的基本条件，这个叫做硬件自检（Power-On Self-Test）

如果硬件出现问题，主板会发出不同含义的蜂鸣，启动中止，如果没有问题，屏幕会显示出 CPU、内存、硬盘等信息

硬件自检完成后，BIOS 会把控制权交给下一阶段的启动程序；这时候 BIOS 要知道下一阶段的启动程序具体存放在哪一个设备，BIOS 需要有一个外部存储设备的排序，排在前面的设备就是优先转交控制权的设备，这种排序叫做启动顺序（Boot Sequence）BIOS 按照启动顺序，把控制权交给排在第一位的存储设备

记得当时还是 xp 的系统的时候装系统的时候流行这么一句话，开机就按 delete，然后再找小 boot，进去之后把第一启动设备改成 CDROM 或者 USB，使用光盘或者 u 盘来装系统

## 镜像下载

[centos7](http://mirrors.aliyun.com/centos/7/isos/x86_64/)
