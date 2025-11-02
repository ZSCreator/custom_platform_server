# 皇家娱乐web后台

## 项目描述

```text
该项目主要用于皇家娱乐网页版后端服务。
```

## 版本管理

- [lotteryMiddleServer](ssh://xxx@192.168.1.112:29418/pokGame/lotteryMiddleServer.git)
 
### 分支

```text
├── master                      主分支封装了数据库mongo&redis数据连接，配置读取，配置坏境，工具集 
│   
└── masters                     功能分支集合                  <分支路径>
    └── third                   皇家娱乐分支                  <分支路径>           
        ├── dev                 功能开发分支                  <实际分支>     
        ├── release             功能发布分支                  <实际分支>
        └── master              功能主分支                    <实际分支>
        
        
  注意事项，改分支可以将master的基本分支合并到对应的功能分支，但是对应业务功能分支只能由:
  masters/lottery/dev-> masters/lottery/release     release 带有坏境配置不能和master相互合并
  masters/lottery/dev-> masters/lottery/master      release 带有坏境配置不能和master相互合并 -- 遗弃
```

## 文件结构

``` text

├── config
│   ├── dev                 开发环境配置
│   │     └── third         web后台调用游戏服务接口配置
│   │ 
│   ├── prod                生产环境配置
│   ├── env.js              指定环境
│   └── index.js            配置初始化
│   
├── server  
│   ├── consts              常量文件目录
│   ├── controller          接口控制层
│   │     ├── offline       离线接口           《用户未登录或不需要登录调用的接口》       
│   │     └── online        在线接口           《用户必须登录后才能调用的接口》
│   ├── db                  数据库连接
│   ├── router              controller路由    《路由中会有权限判断》            
│   ├── services            服务层
│   ├── tickTask            定时器             *未使用*
│   └── util                工具
│     
├── hj1h-api.js             web接口启动器       生产坏境使用pm2启动集群的方式启动 <pm2 start hj1h-api.js -i 3 >
└── hj1h-task.js            *未使用*           《由于采用cookie+session+redis的权鉴方式,所以弃用改定时任务》
```

## 注意事项

### 配置[config/dev|prod/third/localConfig.json]

```text
{
  "limitApi":["ol/game/ar/gold","ol/user/add/gold"],    //限制请求的接口，配置的接口将无法调用
  "qrBasePath":"/HJweb/appload.html",                   //生成二维码的地址路径配置
  "pregameApi":{                                        //游戏配置接口配置
    "domainName": "pregame.hjyl28.com",
    "path": "/getPreGameSetting",
    "port": 80
  },
  "shortUrlApi":{                                       //短链接生成配置
    "firstGate":"http://gate1.epic222.com/cname/",
    "shortUrl": "http://api.t.sina.com.cn/short_url/shorten.json?source=1933927065&url_long="
  }
}
```

### 用户账户会话保持方式

```text
用户会话保持采用cookie+session+redis的权鉴方式，session存储在redis上，解决使用pm2集群启动时会话同步问题
```

### 跨域问题

```text
该项目是纯后台项目，仅提供接口，顾前后端分离。
在前端调用时若部署跨域，在ios 的原生浏览器会造成cookie丢失无法登陆《表现为验证码不通过》
所以部署时应采用nginx将后端和前端代理到同一域下面，或者修改权鉴方式为jwt
```

### 用户和其他数据

```text
该项目数据不依赖本地数据库数据，用户和其他所有数据依赖游戏服务的用户数据。
```

## 发布

```text
采用Jenkins发布服务
皇家娱乐->皇家一号web后台
发布分支masters/third/release
```
