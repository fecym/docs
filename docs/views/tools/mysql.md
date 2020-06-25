---
title: mysql
date: 2019-07-23
tags:
  - mysql
---

## 数据库操作

> 进入数据库之后，我们要先看看我们都有哪些数据库，然后要使用哪个数据库，数据库有哪些表，要对哪些表做一些操作之类，这里记录下基本操作，数据库操作结尾一定要加分号，表示一句话的结束。

### 基本操作

```sql
  -- 创建数据库
  CREATE database_name;
  -- 查看数据库信息
  SHOW CREATE DATABASE database_name;
  -- 设置为 utf-8 格式的
  SET names utf8;
  -- 查看数据库
  SHOW DATABASES;
  -- 使用数据库，use 数据库名
  USE database_name;
  -- 创建表
  CREATE TABLE table_name (
    id    int(10),
    name  varchar(20),
    age   int(10)
  );
  -- 查看该数据库下所有的表
  SHOW TABLES;
  -- 查看表信息
  SHOW CREATE TABLE table_name;
  -- 修改表名
  ALTER TABLE table_name RENAME TO table_name_1;
  -- 不加 to 关键字也可以
  ALTER TABLE table_name_1 RENAME table_name;
  -- 查看字段信息
  DESC table_name;
  -- 添加字段，对字段操作需要加字段类型
  ALTER TABLE table_name ADD field_name INT;
  -- 修改字段名，以及字段类型
  ALTER TABLE table_name CHANGE field_name field_name_1 VARCHAR(255);
  -- 删除字段
  ALTER TABLE table_name DROP field_name_1;
  -- 删除表
  DROP TABLE table_name;
  -- 删除数据库
  DROP DATABASE database_name;
```

### 导出数据

导出数据不需要进去数据，直接在数据库外执行命令即可

```sh
  # 导出数据，mysqldump -uroot -p 数据库名 > 导出到的位置
  mysqldump -uroot -p database_name > database_name.sql
  # 敲回车会提示你输入密码
```

### 导入数据

导入数据需要进入数据库，然后创建对应的数据库，并且设置其 `name`

```sql
  -- 创建对应的数据库
  CREATE DATABASE database_name;
  -- 设置其 name 属性
  SET NAMES utf8;
  -- 使用数据库
  USE database_name;
  -- 导入数据，source 导入的SQL文件地址
  source /root/database_name.sql;
  -- 或者直接进入 SQL 文件，全部复制，然后数据库中直接粘贴也是可以的
  -- 再或者在 SQL 外面执行以下命令也可以 mysql -u用户名 -p密码 数据库名 < 数据库名.sql
  mysql -uroot -p database_name < database_name.sql
```

## 数据操作

### insert 语句

- 基本语法一：**INSERT INTO table_name VALUES (value1, value2, ....)**，这种语法需要与表中的字段一一对应上，按顺序插入的
- 基本语法二：**INSERT INTO table_name (column_name1, column_name2,...) VALUES (value1, value2, ....)**，这种语法只需要前后对应上就可以

```sql
  INSERT INTO `user` (username, sex) VALUES ('insert', 1)
```

### delete 语句

- 基本语法：**DELETE FROM table_name WHERE some_column=some_value**
- 一般我们不会真正删除数据库里的数据，我们会有一个假删的动作，就是给数据一个状态，然后删除就是改变它的状态，比如说加个**is_del**字段

```sql
  DELETE from `user` WHERE username='insert' AND sex='1'
```

### update 语句

- 基本语法：**UPDATE table_name SET column1=value1,column2=value2,... WHERE some_column=some_value;**

```sql
  -- 更新 head_pic 字段值为 没有图片，在条件为 username='cym' 和 sex='1'
  UPDATE `user` SET head_pic='没有图片' WHERE username='cym' AND sex='1'
```

### select 查询语句

- 基本语法：**SELECT column_name, column_name, ... FROM table_name [WHERE column_name=value AND column_name=value ...]**

```sql
-- 基本写法
  SELECT realname, username FROM `user`
  SELECT * FROM `user`
  SELECT * FROM `user` WHERE realname='小铭' AND username='cym'
```

- 查询总条数：**SELECT COUNT(expr) FROM table_name**
- SELECT COUNT()语句返回一个字段，默认是 COUNT(你传入的字段)，你可以加个 as 一个变量，让他把返回的值返回到你提供的变量里面
- 当然后面也可以传递条件跟基本语法一样

```sql
  -- 查询总条数
  SELECT COUNT(id) FROM `user`
  SELECT COUNT(id) AS total FROM `user`
  SELECT COUNT(*) AS total FROM `user`
```

- 根据一个范围查询：根据时间范围查询也是一个条件，所以也放在*WHERE*子句后面，多个查询条件*AND*分隔
- 语法：**BETWEEN a AND b，在范围 a 和 b 之间，查询，a 需要小于 b**

```sql
  -- 根据时间范围查询
  SELECT COUNT(*) AS total FROM `daily` WHERE create_time BETWEEN '2019-07-05 20:57:40' AND '2019-07-10 22:22:56'
  SELECT * FROM `daily` WHERE create_time BETWEEN '2019-07-05 20:57:40' AND '2019-07-13 22:28:56' AND username='guest'
```

- 查询限制，分页查询：**LIMIT from size**
- limit 之后紧跟两个值，从第几条开始，查询几条

```sql
  -- 从第5条开始查询2条数据
  SELECT * FROM `daily` LIMIT 5, 2
```

- 查询后排序：**ORDER BY column_name [desc]**
- 加上 **desc** 是倒序

```sql
  SELECT * FROM `daily` ORDER BY create_time DESC
  SELECT * FROM `daily` ORDER BY create_time LIMIT 5, 2
  -- 注意他们的顺序，limit永远在最后面，where永远在前面
  SELECT * FROM `daily` WHERE username='cym' ORDER BY create_time DESC LIMIT 5, 2
```

- 查询完整语法规则：**select [distinct] 字段 1 [as 别名], ..., 字段 n [as 别名] from [库名.]表名
  [
  where 约束条件
  group by 分组依据
  having 过滤条件
  order by 排序的字段
  limit 限制显示的条数
  ];**
  - 查表中所有字段用 _ 表示 _(select _ from ...)_
  - 条件的书写规则严格按照语法顺序书写，可以缺省，但不可以错序
  - 约束条件的流程：_from -> where -> group by -> having -> distinct -> order by -> limit_
  - 字段可以起别名
  - 字段可以直接做运算 _select age + 1 'new_age' from emp;_
  - 分组后的条件均可以使用聚合函数

### select 语句拓展

- 模糊查询语法：**like '%关键字%'**，like 后面跟着模糊查询条件，关键字写在 **%%** 中

```sql
  SELECT *  FROM `user` WHERE `user`.realname LIKE '%程%'
  SELECT *  FROM `user` WHERE username LIKE '%c%'
```

- 显示 null 值：**column_name is null**

```sql
  -- 只查看realname是null的
  SELECT * FROM `user` WHERE realname IS NULL
  -- realname根据输入的任意字符模糊查询，也可以是null
  SELECT * FROM `user` WHERE realname LIKE '%%' OR realname IS NULL
  -- 同一个级别的语句要括起来
  SELECT * FROM `user` WHERE `username` LIKE '%%' AND (`realname` LIKE '%%' OR `realname` IS NULL) ORDER BY create_time desc LIMIT 0, 10
```

- 查询当天、昨天、近一周、近 30 天、本月、上月数据
  - 在**mysql**中有<code>**TO_DAYS(date)**</code>函数，接受一个日期，返回一个天数，从公元 0 年到现在的天数
  - <code>NOW()</code>返回当前的时间
  - 根据这个我们可以拓展一下返回一个时间范围内的数据，看下面的例子

```sql
  -- @return { days: 737641 }，也就是从公元0年到今天（2019-08-05）过去的天数是 737641 天
  SELECT TO_DAYS(NOW()) AS days;
  -- @return { curTime: 2019-08-05 22:18:07 }
  SELECT NOW() AS curTime;
  -- @return { curYear: 2019.551 }
  SELECT TO_DAYS(NOW()) / 365.25 AS curYear;
  -- @return { tenDaysAgo: 737631 }，返回十天前的时间，比
  SELECT TO_DAYS(NOW()) - 10 AS tenDaysAgo;
  -- 接下来放到业务里面实践下
  -- 返回近一周的 list 集合
  SELECT * FROM `daily` WHERE TO_DAYS(create_time) >= (TO_DAYS(NOW()) - 7);
  -- 也可以这么写
  SELECT * FROM `daily` WHERE DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= DATE(create_time);
  -- 近30天
  SELECT * FROM `dayly` WHERE DATE_SUB(CURDATE(), INTERVAL 30 DAY) <= DATE(create_time);
  -- 近一个月，date_format() 接受两个参数，格式化的时间和格式
  SELECT * FROM `daily` WHERE DATE_FORMAT(create_time, '%Y%m') = DATE_FORMAT(CURDATE(), '%Y%m');
  -- 上个月，period_diff() 时间差异函数接受两个参数，要对比的时间
  SELECT * FROM `daily` WHERE PERIOD_DIFF(DATE_FORMAT(NOW(), '%Y%m'), DATE_FORMAT(create_time, '%Y%m')) = 1;
```
