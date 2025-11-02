"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const JsonMgr = require("./config/data/JsonMgr");
const databaseService = require("./app/services/databaseService");
const hallBalance = require("./app/services/serverController/hallBalance");
const RedPacketBalance_1 = require("./app/services/serverController/RedPacketBalance");
const pinus_logger_1 = require("pinus-logger");
const fix_1 = require("./app/component/fix");
const routeFilter_1 = require("./app/servers/slots777/lib/routeFilter");
const routeFilter_2 = require("./app/servers/slots77/lib/routeFilter");
const routeFilter_3 = require("./app/servers/FruitMachine/lib/routeFilter");
const routeFilter_4 = require("./app/servers/xiyouji/lib/routeFilter");
const routeFilter_5 = require("./app/servers/luckyWheel/lib/routeFilter");
const routeFilter_6 = require("./app/servers/pharaoh/lib/routeFilter");
const routeFilter_7 = require("./app/servers/pirate/lib/routeFilter");
const routeFilter_8 = require("./app/servers/colorPlate/lib/routeFilter");
const routeFilter_9 = require("./app/servers/andarBahar/lib/routeFilter");
const routeFilter_10 = require("./app/servers/fanTan/lib/routeFilter");
const routeFilter_11 = require("./app/servers/Scratch/lib/routeFilter");
const routeFilter_12 = require("./app/servers/att/lib/routeFilter");
const routeFilter_13 = require("./app/servers/hl6xc/lib/routeFilter");
const routeFilter_14 = require("./app/servers/Crash/lib/routeFilter");
const routeFilter_15 = require("./app/servers/halloween/lib/routeFilter");
const routeFilter_16 = require("./app/servers/iceBall/lib/routeFilter");
const routeFilter_17 = require("./app/servers/DeadBook/lib/routeFilter");
const routeFilter_18 = require("./app/servers/RotateParty/lib/routeFilter");
const routeFilter_19 = require("./app/servers/Samba/lib/routeFilter");
const routeFilter_20 = require("./app/servers/FortuneRooster/lib/routeFilter");
const RDSClient_1 = require("./app/common/dao/mysql/lib/RDSClient");
const BlackIp_redis_dao_1 = require("./app/common/dao/redis/BlackIp.redis.dao");
const coder_1 = require("./coder");
const httpComponents_1 = require("./app/servers/gateHttp/lib/httpComponents");
const globalErrorLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
let app = pinus_1.pinus.createApp();
app.set('name', 'cpp');
(0, preload_1.preload)(app);
app.set('serverConfig', {
    reloadHandlers: false
});
app.set('remoteConfig', {
    bufferMsg: false,
    interval: 30,
    reloadRemotes: false
});
app.set('proxyConfig', {
    timeout: 1000 * 20
});
app.configure('production|development', 'gate', function () {
    const opts = {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 10,
        useHostFilter: true,
        blacklistFun: async function (cb) {
            const list = await BlackIp_redis_dao_1.default.findListForIp();
            cb(null, list);
        }
    };
    if (preload_1.sslOpts.isdecode) {
        opts['useProtobuf'] = true;
        opts['decode'] = coder_1.preDecode;
        opts['encode'] = coder_1.preEncode;
        opts['useDict'] = true;
    }
    if (preload_1.sslOpts.run) {
        opts['ssl'] = preload_1.sslOpts.ssl;
    }
    app.set('connectorConfig', opts);
});
app.configure('production|development', 'connector', function () {
    app.route('hall', hallBalance.routeHall);
    app.route('redPacket', RedPacketBalance_1.redPacketRouteDispatch);
    const opts = {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 180,
        timeout: 240,
        handshake: function (msg, cb, hybridSocket) {
            cb(null, {});
        },
        useHostFilter: true,
        blacklistFun: async function (cb) {
            const list = await BlackIp_redis_dao_1.default.findListForIp();
            cb(null, list);
        }
    };
    if (preload_1.sslOpts.run) {
        opts['ssl'] = preload_1.sslOpts.ssl;
    }
    if (preload_1.sslOpts.isdecode) {
        opts['useProtobuf'] = true;
        opts['decode'] = coder_1.preDecode;
        opts['encode'] = coder_1.preEncode;
        opts['useDict'] = true;
    }
    app.set('connectorConfig', opts);
    app.load(fix_1.RouterFixComponent);
});
app.configure('production|development', 'slots777', function () {
    app.filter((0, routeFilter_1.default)(app));
});
app.configure('production|development', 'slots77', function () {
    app.filter((0, routeFilter_2.default)(app));
});
app.configure('production|development', 'FruitMachine', function () {
    app.filter((0, routeFilter_3.default)(app));
});
app.configure('production|development', 'xiyouji', function () {
    app.filter((0, routeFilter_4.default)(app));
});
app.configure('production|development', 'luckyWheel', function () {
    app.filter((0, routeFilter_5.default)(app));
});
app.configure('production|development', 'halloween', function () {
    app.filter((0, routeFilter_15.default)(app));
});
app.configure('production|development', 'pharaoh', function () {
    app.filter((0, routeFilter_6.default)(app));
});
app.configure('production|development', 'pirate', function () {
    app.filter((0, routeFilter_7.default)(app));
});
app.configure('production|development', 'colorPlate', function () {
    app.filter((0, routeFilter_8.default)(app));
});
app.configure('production|development', 'andarBahar', function () {
    app.filter((0, routeFilter_9.default)(app));
});
app.configure('production|development', 'Crash', function () {
    app.filter((0, routeFilter_14.default)(app));
});
app.configure('production|development', 'fanTan', function () {
    app.filter((0, routeFilter_10.default)(app));
});
app.configure('production|development', 'Scratch', function () {
    app.filter((0, routeFilter_11.default)(app));
});
app.configure('production|development', 'att', function () {
    app.filter((0, routeFilter_12.default)(app));
});
app.configure('production|development', 'hl6xc', function () {
    app.filter((0, routeFilter_13.default)(app));
});
app.configure('production|development', 'iceBall', function () {
    app.filter((0, routeFilter_16.default)(app));
});
app.configure('production|development', 'DeadBook', function () {
    app.filter((0, routeFilter_17.default)(app));
});
app.configure('production|development', 'RotateParty', function () {
    app.filter((0, routeFilter_18.default)(app));
});
app.configure('production|development', 'Samba', function () {
    app.filter((0, routeFilter_19.default)(app));
});
app.configure('production|development', 'FortuneRooster', function () {
    app.filter((0, routeFilter_20.default)(app));
});
app.configure('production|development', 'DragonTiger', function () {
});
app.configure('production|development', 'gateHttp', function () {
    app.load(httpComponents_1.default, {
        host: '0.0.0.0',
        port: 35000,
    });
});
app.configure('production|development', async () => {
    try {
        await JsonMgr.init();
        await JsonMgr.watcher();
        await databaseService.initDBConnection(app.get('mongoConfig'));
        await RDSClient_1.RDSClient.init(pinus_1.pinus.app.getServerId());
        app.start();
    }
    catch (error) {
        globalErrorLogger.error('startError', (error.stack || error.message || error));
    }
});
app.configure('development', async () => {
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQThCO0FBQzlCLHVDQUE2QztBQUM3QyxpREFBaUQ7QUFDakQsa0VBQWtFO0FBQ2xFLDJFQUEyRTtBQUMzRSx1RkFBMEY7QUFDMUYsK0NBQXlDO0FBRXpDLDZDQUF5RDtBQUN6RCx3RUFBc0U7QUFDdEUsdUVBQWtFO0FBQ2xFLDRFQUE0RTtBQUM1RSx1RUFBOEQ7QUFDOUQsMEVBQWdFO0FBQ2hFLHVFQUFrRTtBQUNsRSxzRUFBZ0U7QUFDaEUsMEVBQXdFO0FBQ3hFLDBFQUF3RTtBQUN4RSx1RUFBZ0U7QUFDaEUsd0VBQXNFO0FBQ3RFLG9FQUEwRDtBQUMxRCxzRUFBOEQ7QUFDOUQsc0VBQThEO0FBQzlELDBFQUFzRTtBQUN0RSx3RUFBa0U7QUFDbEUseUVBQW9FO0FBQ3BFLDRFQUFxRTtBQUNyRSxzRUFBOEQ7QUFDOUQsK0VBQWdGO0FBQ2hGLG9FQUFpRTtBQUNqRSxnRkFBeUU7QUFDekUsbUNBQStDO0FBQy9DLDhFQUF1RTtBQUV2RSxNQUFNLGlCQUFpQixHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFROUQsSUFBSSxHQUFHLEdBQUcsYUFBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBRTVCLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBTXZCLElBQUEsaUJBQU8sRUFBQyxHQUFHLENBQUMsQ0FBQztBQUViLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFO0lBRXBCLGNBQWMsRUFBRSxLQUFLO0NBQ3hCLENBQUMsQ0FBQztBQUdILEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFO0lBQ3BCLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFFBQVEsRUFBRSxFQUFFO0lBRVosYUFBYSxFQUFFLEtBQUs7Q0FDdkIsQ0FBQyxDQUFDO0FBR0gsR0FB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