"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const fs = require("fs");
const JsonMgr = require("./config/data/JsonMgr");
const databaseService = require("./app/services/databaseService");
const hallBalance = require("./app/services/serverController/hallBalance");
const HttpListenerService = require("./app/services/http/httpListenerService");
const pinus_logger_1 = require("pinus-logger");
const globalErrorLogger = pinus_logger_1.getLogger('global_error_log', __filename);
let app = pinus_1.pinus.createApp();
app.set('name', 'cpp');
preload_1.preload(app);
app.set('serverConfig', {
    reloadHandlers: true
});
app.set('remoteConfig', {
    bufferMsg: true,
    interval: 30,
    reloadRemotes: true
});
app.set('proxyConfig', {
    timeout: 1000 * 20
});
app.configure('production|development', 'gate', function () {
    app.set('connectorConfig', {
        connector: pinus_1.pinus.connectors.hybridconnector,
        useDict: true,
        useProtobuf: true,
        ssl: {
            type: 'wss',
            key: fs.readFileSync('/etc/pki/tls/private/game-server.key'),
            cert: fs.readFileSync('/etc/pki/tls/certs/game-server.pem')
        }
    });
});
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig', {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 60 * 3,
        useDict: true,
        useProtobuf: true,
        handshake: function (msg, cb, hybridSocket) {
            cb(null, {});
        },
        ssl: {
            type: 'wss',
            key: fs.readFileSync('/etc/pki/tls/private/game-server.key'),
            cert: fs.readFileSync('/etc/pki/tls/certs/game-server.pem')
        }
    });
});
app.configure('production|development', 'http', function () {
    HttpListenerService.startListen();
});
app.configure('production|development', async () => {
    try {
        app.route('hall', hallBalance.routeHall);
        await JsonMgr.init();
        await JsonMgr.watcher();
        app.loadConfig('mongoConfig', app.getBase() + '/config/db/mongo.json');
        if (fs.existsSync(app.getBase() + '/config/db/mongoSlave.json')) {
            app.loadConfig('mongoSlaveConfig', app.getBase() + '/config/db/mongoSlave.json');
        }
        else {
            app.loadConfig('mongoSlaveConfig', app.getBase() + '/config/db/mongo.json');
        }
        await databaseService.initDBConnection(app.get('mongoConfig'));
        app.start();
    }
    catch (error) {
        globalErrorLogger.error('startError', (error.stack || error.message || error));
    }
});
app.configure('development', async () => {
    app.enable('systemMonitor');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwSEouanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHBISi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUM5Qix1Q0FBb0M7QUFDcEMseUJBQXlCO0FBQ3pCLGlEQUFpRDtBQUNqRCxrRUFBa0U7QUFDbEUsMkVBQTJFO0FBQzNFLCtFQUErRTtBQUMvRSwrQ0FBeUM7QUFFekMsTUFBTSxpQkFBaUIsR0FBRyx3QkFBUyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSXBFLElBQUksR0FBRyxHQUFHLGFBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM1QixHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztBQU12QixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRWIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUU7SUFFcEIsY0FBYyxFQUFFLElBQUk7Q0FDdkIsQ0FBQyxDQUFDO0FBR0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUU7SUFDcEIsU0FBUyxFQUFFLElBQUk7SUFDZixRQUFRLEVBQUcsRUFBRTtJQUViLGFBQWEsRUFBRSxJQUFJO0NBQ3RCLENBQUMsQ0FBQztBQUdILEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFO0lBQ25CLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBRTtDQUNyQixDQUFDLENBQUM7QUFHSCxHQUFHLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLE1BQU0sRUFBRTtJQUM1QyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO1FBQ3ZCLFNBQVMsRUFBRSxhQUFLLENBQUMsVUFBVSxDQUFDLGVBQWU7UUFFM0MsT0FBTyxFQUFNLElBQUk7UUFDakIsV0FBVyxFQUFFLElBQUk7UUFDakIsR0FBRyxFQUFVO1lBQ1QsSUFBSSxFQUFFLEtBQUs7WUFDWCxHQUFHLEVBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxzQ0FB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