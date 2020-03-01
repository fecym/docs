# 交接文档说明书

> 交接人：程禹铭 &emsp; 文档时间：2020-02-28 &emsp; 交接时间：2020-02-28

## 概述

> 因私人原因，下个月就要离职了，做一下交接文档

## 项目

> 共 8 个项目，地图总览、工业园报表、取派远距报表、车辆异常轨迹。其他四个项目已在数据组交接完成

### 通用部分

> 四个项目都在同一个 git 上

- git 地址：[http://gitlab.ky-tech.com.cn/erp-frontend/kyemap](http://gitlab.ky-tech.com.cn/erp-frontend/kyemap)

- 分支：
  - 地图总览：权限部分暂时未发布生产，分支名：`feature/map-view-permission-0211`
  - 车辆异常轨迹：因其他原因，产品暂时未让项目发布生产，分支名：`feature/car-error-track-0213`
  - 工业园报表：所有功能都已做完，如有新需求请从生产分支直接拉取新的代码，分支名：`prod`
  - 取派远距报表：功能都已做完，如有新需求请从生产分支直接拉取新的代码，分支名：`prod`

### 地图总览

> 地图总览项目修改了模块权限相关的功能，其他模块未动

#### 改动目录结构以及文件及内容

```sh
├── map-views
│   ├── components      未改动
│   ├── dataHandle      未改动
│   ├── layer           未改动
│   ├── layerHelper     未改动
│   ├── map             未改动
│   ├── mixins          未改动
│   ├── conlist.js      改动
│   ├── defaultCon.js   未改动
│   └── index.vue       改动
└── ...
```

- conlist.js 文件

  - 新增 `filterAuthCode` 方法，根据用户信息中获取到的所有模块权限过滤传入的模块权限自身是否拥有
  - 新增常量 `authCode` 值为 `map.overview.`，用来拼接权限码

- index.vue 文件
  - 修改涉及模块权限相关的地方

### 工业园报表

- 工业园报表模块已发布生产，暂无遗留 bug 和新需求

### 取派远距报表

- 取派远距报表模块已发布生产，暂无遗留 bug 和新需求

### 车辆异常轨迹

> 车辆异常轨迹报表模块，该模块基本功能都已开发完毕，等待发布生产，下次迭代可能要做轨迹回放功能

#### 目录结构

```sh
├── car-track-error
│   ├── components                    所有组件
│   │   ├── exception-audit           异常审核组件
│   │   ├── instrument-panel          主查询统计面板
│   │   ├── kye-select-org            组织树组件
│   │   ├── map-dialog                异常轨迹核心地图组件
│   │   ├── statistical-table         主查询统计表格组件
│   │   ├── styles                    地图 popup 用到的样式
│   │   ├── track-exception-table     轨迹异常表格组件
│   │   ├── track-header              车辆异常轨迹头部组件
│   │   └── track-query-form          form 表单组件
│   ├── map
│   │   ├── layer
│   │   │   ├── constant.js           地图中 layer 用到的常量文件
│   │   │   └── 所有地图的 layer       地图中用到的 layer 文件
│   │   └── index.js                  地图 layer 类入口文件
│   ├── utils
│   │   ├── components.js             组件加载主入口文件
│   │   └── index.js                  项目中用到的一些工具方法
│   └── index.vue                     项目主入口文件
└── ...
```

#### 遗留问题

> 在项目快速迭代中，去年的迭代中还遗留有 `偏航点` 逻辑目前为止后端没有给到数据，无法测试，然后今年又快速迭代，产品和后端一致没有提到偏航点问题，可能已经砍去该需求，代码中存在那部分的添加的地方，到时候他们想起之后直接修改对应逻辑即可
