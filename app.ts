import { pinus } from 'pinus';
import { preload, sslOpts } from './preload';
import * as JsonMgr from './config/data/JsonMgr';
import * as databaseService from './app/services/databaseService';
import * as hallBalance from './app/services/serverController/hallBalance';
import { redPacketRouteDispatch } from './app/services/serverController/RedPacketBalance';
import { getLogger } from 'pinus-logger';
import { HybridSocket } from 'pinus/lib/connectors/hybridsocket';
import { RouterFixComponent } from "./app/component/fix";
import SlotRouterFilter from "./app/servers/slots777/lib/routeFilter";
import Slots77Filter from "./app/servers/slots77/lib/routeFilter";
import FruitMachineFilter from "./app/servers/FruitMachine/lib/routeFilter";
import XYJFilter from "./app/servers/xiyouji/lib/routeFilter";
import LWFilter from "./app/servers/luckyWheel/lib/routeFilter";
import PharaohFilter from "./app/servers/pharaoh/lib/routeFilter";
import PirateFilter from "./app/servers/pirate/lib/routeFilter";
import ColorPlateFilter from "./app/servers/colorPlate/lib/routeFilter";
import AndarBaharFilter from "./app/servers/andarBahar/lib/routeFilter";
import FanTanFilter from "./app/servers/fanTan/lib/routeFilter";
import ScratchCardFilter from "./app/servers/Scratch/lib/routeFilter";
import AttFilter from "./app/servers/att/lib/routeFilter";
import hl6xcFilter from "./app/servers/hl6xc/lib/routeFilter";
import CrashFilter from "./app/servers/Crash/lib/routeFilter";
import HalloweenFilter from "./app/servers/halloween/lib/routeFilter";
import IceBallFilter from "./app/servers/iceBall/lib/routeFilter";
import DeadBookFilter from "./app/servers/DeadBook/lib/routeFilter";
import RotateFilter from "./app/servers/RotateParty/lib/routeFilter";
import SambaFilter from "./app/servers/Samba/lib/routeFilter";
import FortuneRoosterFilter from "./app/servers/FortuneRooster/lib/routeFilter";
import { RDSClient } from './app/common/dao/mysql/lib/RDSClient';
import BlackIpInRedisDao from "./app/common/dao/redis/BlackIp.redis.dao";
import { preDecode, preEncode } from "./coder";
import HttpComponents from "./app/servers/gateHttp/lib/httpComponents";

const globalErrorLogger = getLogger('server_out', __filename);




/**
 * Init app for client.
 */
let app = pinus.createApp();

app.set('name', 'cpp');
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload(app);

app.set('serverConfig', {
    // 支持handler目录热更
    reloadHandlers: false
});

// 配置 bufferMsg
app.set('remoteConfig', {
    bufferMsg: false,
    interval: 30,
    // 支持remote目录热更
    reloadRemotes: false
});

// 配置 回调函数清除 超时时间为 20s
app.set('proxyConfig', {
    timeout: 1000 * 20
});

// 网关服务器
app.configure('production|development', 'gate', function () {
    const opts = {
        connector: pinus.connectors.hybridconnector,
        heartbeat: 10,
        // useDict: true,
        // useProtobuf: true
        useHostFilter: true,
        // decode: preDecode,
        // encode: preEncode,
        blacklistFun: async function (cb) {
            // 查找黑名单ip
            const list = await BlackIpInRedisDao.findListForIp();
            cb(null, list)
        }
    }
    if (sslOpts.isdecode) {
        // 这里只是采用加密 并没有使用protobuf
        opts['useProtobuf'] = true;
        opts['decode'] = preDecode;
        opts['encode'] = preEncode;
        opts['useDict'] = true;
    }

    if (sslOpts.run) {
        opts['ssl'] = sslOpts.ssl
    }
    app.set('connectorConfig', opts);
    // app.load(RouterFixComponent);
});

app.configure('production|development', 'connector', function () {
    // 大厅服务器路由策略
    app.route('hall', hallBalance.routeHall);
    // 游戏多服务 路由策略
    app.route('redPacket', redPacketRouteDispatch);
    const opts = {
        connector: pinus.connectors.hybridconnector,
        heartbeat: 180,
        timeout: 240,
        // useDict: true,
        handshake: function (msg: any, cb, hybridSocket: HybridSocket) {
            cb(null, {});
        },
        useHostFilter: true,
        // useCrypto: true,
        blacklistFun: async function (cb) {
            // 查找黑名单ip
            const list = await BlackIpInRedisDao.findListForIp();
            cb(null, list)
        }
    }
    if (sslOpts.run) {
        opts['ssl'] = sslOpts.ssl
    }
    if (sslOpts.isdecode) {
        // 这里只是采用加密 并没有使用protobuf
        opts['useProtobuf'] = true;
        opts['decode'] = preDecode;
        opts['encode'] = preEncode;
        opts['useDict'] = true;
    }
    app.set('connectorConfig', opts);
    app.load(RouterFixComponent);
});


// 为幸运777添加过滤器
app.configure('production|development', 'slots777', function () {
    app.filter(SlotRouterFilter(app));
});

// 为77(3x3)添加过滤器
app.configure('production|development', 'slots77', function () {
    app.filter(Slots77Filter(app));
});

// 为水果机添加过滤器
app.configure('production|development', 'FruitMachine', function () {
    app.filter(FruitMachineFilter(app));
});

// 为西游记添加过滤器
app.configure('production|development', 'xiyouji', function () {
    app.filter(XYJFilter(app));
});

// 为幸运转盘添加过滤器
app.configure('production|development', 'luckyWheel', function () {
    app.filter(LWFilter(app));
});

// 为万圣夜添加过滤器
app.configure('production|development', 'halloween', function () {
    app.filter(HalloweenFilter(app));
});

// 为埃及夺宝添加过滤器
app.configure('production|development', 'pharaoh', function () {
    app.filter(PharaohFilter(app));
});

// 为寻宝奇航添加过滤器
app.configure('production|development', 'pirate', function () {
    app.filter(PirateFilter(app));
});

// 为色碟添加过滤器
app.configure('production|development', 'colorPlate', function () {
    app.filter(ColorPlateFilter(app));
});

// 为猜AB添加过滤器
app.configure('production|development', 'andarBahar', function () {
    app.filter(AndarBaharFilter(app));
});

// 为Crash添加过滤器
app.configure('production|development', 'Crash', function () {
    app.filter(CrashFilter(app));
});

// 为番摊添加过滤器
app.configure('production|development', 'fanTan', function () {
    app.filter(FanTanFilter(app));
});

// 为猜AB添加过滤器
app.configure('production|development', 'Scratch', function () {
    app.filter(ScratchCardFilter(app));
});

// 为皇家连环炮添加过滤器
app.configure('production|development', 'att', function () {
    app.filter(AttFilter(app));
});

app.configure('production|development', 'hl6xc', function () {
    app.filter(hl6xcFilter(app));
});

app.configure('production|development', 'iceBall', function () {
    app.filter(IceBallFilter(app));
});

app.configure('production|development', 'DeadBook', function () {
    app.filter(DeadBookFilter(app));
});

app.configure('production|development', 'RotateParty', function () {
    app.filter(RotateFilter(app));
});

app.configure('production|development', 'Samba', function () {
    app.filter(SambaFilter(app));
});

app.configure('production|development', 'FortuneRooster', function () {
    app.filter(FortuneRoosterFilter(app));
});

app.configure('production|development', 'DragonTiger', function () {
    // app.filter(DragonTigerFilter(app));
});


// app.configure('production|development', 'master', function() {
//     app.load(ClearComponent);
// });
// start app

app.configure('production|development', 'gateHttp', function () {
    app.load(HttpComponents, {
        host: '0.0.0.0',
        port: 35000,
    });
});


app.configure('production|development', async () => {
    try {
        /* app.registerAdmin(SystemInfoModule.moduleId, new SystemInfoModule({
            interval: 5
        })); */
        // 配置文件加载到内存
        await JsonMgr.init();
        // 配置文件重载
        await JsonMgr.watcher();
        // mongo 配置
        // app.loadConfig('mongoConfig', app.getBase() + '/config/db/mongo.json');
        // // mongo 从库
        // if (fs.existsSync(app.getBase() + '/config/db/mongoSlave.json')) {
        //     app.loadConfig('mongoSlaveConfig', app.getBase() + '/config/db/mongoSlave.json');
        // } else {
        //     app.loadConfig('mongoSlaveConfig', app.getBase() + '/config/db/mongo.json');
        // }
        // 初始化每个服务器的数据库连接
        await databaseService.initDBConnection(app.get('mongoConfig'));

        await RDSClient.init(pinus.app.getServerId());

        app.start();

    } catch (error) {
        globalErrorLogger.error('startError', (error.stack || error.message || error));
    }
});


app.configure('development', async () => {
    // 禁用系统监控，避免需要 sysstat 包（iostat、pidstat 命令）
    // app.enable('systemMonitor');
});


