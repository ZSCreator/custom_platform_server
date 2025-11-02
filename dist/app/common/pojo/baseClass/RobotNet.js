'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotNet = void 0;
const pinus_1 = require("pinus");
const WebSocket = require("ws");
const pinus_protocol_1 = require("pinus-protocol");
const pinus_protobuf_1 = require("pinus-protobuf");
const events = require("events");
const preload_1 = require("../../../../preload");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const JS_WS_CLIENT_TYPE = 'js-websocket';
const JS_WS_CLIENT_VERSION = '0.0.1';
const RES_OLD_CLIENT = 501;
const RES_OK = 200;
const GAPTHRESHOLD = 100;
const handshakeBuffer = {
    'sys': {
        type: JS_WS_CLIENT_TYPE,
        version: JS_WS_CLIENT_VERSION
    },
    'user': {}
};
class RobotNet {
    constructor() {
        this.pinus_data = { data: { protos: null, abbrs: null, dict: null } };
        this.socket = null;
        this.reqId = 0;
        this.callbacks = {};
        this.routeMap = {};
        this.handlers = {};
        this.heartbeat_Interval = 5000;
        this.heartbeat_Timeout = 0;
        this.nextHeartbeatTimeout = 0;
        this.heartbeatId = null;
        this.heartbeatTimeoutId = null;
        this.handshakeCallback = null;
        this.initCallback = null;
        this.check_Interval = null;
        this.disconnectStatus = 0;
        this.uid = '';
        this.Emitter = Object.create(events.EventEmitter.prototype);
        this.heartbeat_Timeout = this.heartbeat_Interval * 2;
        this.timestamp = Math.round(new Date().getTime() / 1000);
        this.handlers[pinus_protocol_1.Package.TYPE_HANDSHAKE] = this.handshake;
        this.handlers[pinus_protocol_1.Package.TYPE_HEARTBEAT] = this.heartbeat;
        this.handlers[pinus_protocol_1.Package.TYPE_DATA] = this.onData;
        this.handlers[pinus_protocol_1.Package.TYPE_KICK] = this.onKick;
    }
    update_time() {
        this.timestamp = Math.round(new Date().getTime() / 1000);
    }
    check_update_time(difftime) {
        let diff = Math.round(new Date().getTime() / 1000 - this.timestamp);
        let flag = diff > difftime ? true : false;
        return flag;
    }
    check_robot_exit() {
        if (this.check_Interval)
            return;
        this.check_Interval = setInterval(() => {
            let flag = this.check_update_time(60 * 2);
            if (flag === true) {
                clearInterval(this.check_Interval);
                robotlogger.info(pinus_1.pinus.app.getServerId(), "机器人定时销毁" + this.uid);
                this.destroy();
            }
        }, 1000 * 60 * 2);
    }
    init(params, cb) {
        try {
            this.initCallback = cb;
            let host = params.host;
            let port = params.port;
            let url = host;
            if (preload_1.sslOpts.run) {
                if (host.substring(0, 8) != 'https://') {
                    url = 'https://' + host;
                }
            }
            else {
                if (host.substring(0, 7) != 'http://') {
                    url = 'http://' + host;
                }
            }
            if (port) {
                url += ':' + port;
            }
            this.initWebSocket(url, cb);
        }
        catch (error) {
            robotlogger.warn(`robotNet|初始化连接失败|${error}`);
            return cb('初始化连接失败');
        }
    }
    initWebSocket(url, cb) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = (event) => {
            let obj = pinus_protocol_1.Package.encode(pinus_protocol_1.Package.TYPE_HANDSHAKE, pinus_protocol_1.Protocol.strencode(JSON.stringify(handshakeBuffer)));
            this.send(obj);
            this.disconnectStatus = 0;
        };
        this.socket.onmessage = (event) => {
            this.processPackage(pinus_protocol_1.Package.decode(event.data));
            if (this.heartbeat_Timeout) {
                this.nextHeartbeatTimeout = Date.now() + this.heartbeat_Timeout;
            }
        };
        this.socket.onerror = (error) => {
            robotlogger.warn(`robotNet|onerror|${url}|${error.message || JSON.stringify(error)}`);
            this.Emitter.emit('onIOError', error);
            this.disconnectStatus = 1;
            this.disConnectCb('from onError');
            this.initCallback && this.initCallback(error.message);
        };
        this.socket.onclose = (event) => {
            this.Emitter.emit('close', event);
            this.disconnectStatus = 2;
            this.disConnectCb('from_onClose');
        };
    }
    disConnectCb(fromWhere) {
        for (let msg in this.callbacks) {
            let cb = this.callbacks[msg];
            delete this.callbacks[msg];
            if (typeof cb !== 'function') {
                return;
            }
            return cb({ code: 500, error: fromWhere });
        }
    }
    disconnect() {
        if (this.socket)
            this.socket.close();
        this.socket = null;
        if (this.heartbeatId) {
            clearTimeout(this.heartbeatId);
            this.heartbeatId = null;
        }
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
    }
    request(route, msg, cb) {
        this.update_time();
        try {
            msg = msg || {};
            route = route || msg.route;
            if (!route) {
                return cb({ code: 500, error: '路由错误' });
            }
            this.reqId++;
            this.sendMessage(this.reqId, route, msg, cb);
            this.callbacks[this.reqId] = cb;
            this.routeMap[this.reqId] = route;
        }
        catch (error) {
            robotlogger.warn(`robotNet|请求服务器接口出错|${error}`);
            return cb({ code: 500, error: '请求服务器接口出错' });
        }
    }
    initData(data) {
        if (!data || !data.sys) {
            return;
        }
        let dict = data.sys.dict;
        let protos = data.sys.protos;
        if (!!dict) {
            this.pinus_data.data.dict = dict;
            this.pinus_data.data.abbrs = {};
            for (let route in dict) {
                this.pinus_data.data.abbrs[dict[route]] = route;
            }
        }
        if (!!protos) {
            this.pinus_data.data.protos = {
                server: protos.server || {},
                client: protos.client || {}
            };
            if (!!this.protobuf) {
                this.protobuf = new pinus_protobuf_1.Protobuf({ encoderProtos: protos.client, decoderProtos: protos.server });
            }
        }
    }
    sendMessage(reqId, route, msg, cb) {
        const type = reqId ? pinus_protocol_1.Message.TYPE_REQUEST : pinus_protocol_1.Message.TYPE_NOTIFY;
        let protos = !!this.pinus_data.data.protos ? this.pinus_data.data.protos.client : {};
        if (!!protos[route]) {
            msg = this.protobuf.encode(route, msg);
        }
        else {
            msg = pinus_protocol_1.Protocol.strencode(JSON.stringify(msg));
        }
        let compressRoute = false;
        if (this.pinus_data.data.dict && this.pinus_data.data.dict[route]) {
            route = this.pinus_data.data.dict[route];
            compressRoute = true;
        }
        msg = pinus_protocol_1.Message.encode(reqId, type, compressRoute, route, msg);
        let packet = pinus_protocol_1.Package.encode(pinus_protocol_1.Package.TYPE_DATA, msg);
        if (!this.socket || this.socket.readyState === 3 || this.disconnectStatus != 0) {
            const status = this.disconnectStatus === 1 ? '连接异常断开' :
                `连接正常关闭`;
            cb && cb({ code: 500, error: status });
            this.disconnect();
            return;
        }
        this.send(packet);
    }
    send(packet) {
        try {
            if (!!this.socket) {
                this.socket.send(packet.buffer || packet, { binary: true, mask: true });
            }
        }
        catch (error) {
            console.info("robot error:" + error);
        }
    }
    heartbeat() {
        if (!this.heartbeat_Interval) {
            return;
        }
        if (this.heartbeatId) {
            return;
        }
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
        let obj = pinus_protocol_1.Package.encode(pinus_protocol_1.Package.TYPE_HEARTBEAT);
        let self = this;
        this.heartbeatId = setTimeout(() => {
            self.heartbeatId = null;
            self.send(obj);
            self.nextHeartbeatTimeout = Date.now() + self.heartbeat_Timeout;
            self.heartbeatTimeoutId = setTimeout(self.heartbeatTimeoutCb.bind(self), self.heartbeat_Timeout);
        }, this.heartbeat_Interval);
    }
    heartbeatTimeoutCb() {
        let gap = this.nextHeartbeatTimeout - Date.now();
        if (gap > GAPTHRESHOLD) {
            this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb.bind(this), gap);
        }
        else {
            this.Emitter && this.Emitter.emit('heartbeat timeout');
            this.disconnect();
        }
    }
    handshake(resData) {
        let Data = JSON.parse(pinus_protocol_1.Protocol.strdecode(resData));
        if (Data.code === RES_OLD_CLIENT) {
            this.Emitter.emit('error', 'client version not fullfill');
            return this.initCallback && this.initCallback('client version not fullfill');
        }
        if (Data.code !== RES_OK) {
            this.Emitter.emit('error', 'handshake fail');
            return this.initCallback && this.initCallback('handshake fail');
        }
        this.handshakeInit(Data);
        let obj = pinus_protocol_1.Package.encode(pinus_protocol_1.Package.TYPE_HANDSHAKE_ACK);
        this.send(obj);
        if (this.initCallback) {
            this.initCallback(null, this.socket);
            this.initCallback = null;
        }
    }
    onData(data) {
        this.update_time();
        let msg = pinus_protocol_1.Message.decode(data);
        if (msg.id > 0) {
            msg.route = this.routeMap[msg.id];
            delete this.routeMap[msg.id];
            if (!msg.route) {
                return;
            }
        }
        msg.body = this.deCompose(msg);
        this.processMessage(msg);
    }
    onKick(data) {
        this.Emitter.emit('onKick');
    }
    processPackage(msg) {
        this.handlers[msg.type].apply(this, [msg.body]);
    }
    processMessage(msg) {
        if (!msg || !msg.id) {
            this.Emitter.emit(msg.route, msg.body);
            return;
        }
        let cb = this.callbacks[msg.id];
        delete this.callbacks[msg.id];
        if (typeof cb !== 'function') {
            return;
        }
        cb(msg.body);
        return;
    }
    deCompose(msg) {
        let protos = !!this.pinus_data.data.protos ? this.pinus_data.data.protos.server : {};
        let abbrs = this.pinus_data.data.abbrs;
        let route = msg.route;
        try {
            if (msg.compressRoute) {
                if (!abbrs[route]) {
                    console.error('illegal msg!');
                    return {};
                }
                route = msg.route = abbrs[route];
            }
            if (!!protos[route]) {
                return this.protobuf.decode(route, msg.body);
            }
            else {
                return JSON.parse(pinus_protocol_1.Protocol.strdecode(msg.body));
            }
        }
        catch (ex) {
            console.error('route, body = ' + route + ", " + msg.body);
        }
        return msg;
    }
    handshakeInit(data) {
        if (data.sys && data.sys.heartbeat) {
            this.heartbeat_Interval = data.sys.heartbeat * 1000;
            this.heartbeat_Timeout = this.heartbeat_Interval * 2;
        }
        else {
            this.heartbeat_Interval = 0;
            this.heartbeat_Timeout = 0;
        }
        this.initData(data);
        if (typeof this.handshakeCallback === 'function') {
            this.handshakeCallback(data.user);
        }
    }
    requestGate(gateParam) {
        return new Promise((resolve, reject) => {
            this.init(gateParam, (error, data) => {
                if (error) {
                    robotlogger.warn(`robotNet|连接gate服务器失败|${error}`);
                    return reject(error);
                }
                return resolve({});
            });
        });
    }
    requestConnector(connectorParam, delayTime = 200) {
        connectorParam.log = true;
        this.disconnect();
        return new Promise(async (resolve, reject) => {
            let delayTimeoutObj = setTimeout(async () => {
                try {
                    this.init(connectorParam, (error, data) => {
                        if (error) {
                            robotlogger.warn(`robotNet|连接connector服务器失败|${error}`);
                            return reject(error);
                        }
                        return resolve({});
                    });
                }
                catch (error) {
                    return reject(error);
                }
                finally {
                    clearTimeout(delayTimeoutObj);
                    delayTimeoutObj = null;
                }
            }, delayTime);
        });
    }
}
exports.RobotNet = RobotNet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3ROZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL3Bvam8vYmFzZUNsYXNzL1JvYm90TmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsaUNBQThCO0FBQzlCLGdDQUFnQztBQUNoQyxtREFBNEQ7QUFDNUQsbURBQTBDO0FBQzFDLGlDQUFrQztBQUdsQyxpREFBOEM7QUFDOUMsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFJdkQsTUFBTSxpQkFBaUIsR0FBVyxjQUFjLENBQUM7QUFDakQsTUFBTSxvQkFBb0IsR0FBVyxPQUFPLENBQUM7QUFDN0MsTUFBTSxjQUFjLEdBQVcsR0FBRyxDQUFDO0FBQ25DLE1BQU0sTUFBTSxHQUFXLEdBQUcsQ0FBQztBQUMzQixNQUFNLFlBQVksR0FBVyxHQUFHLENBQUM7QUFFakMsTUFBTSxlQUFlLEdBQUc7SUFDcEIsS0FBSyxFQUFFO1FBQ0gsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixPQUFPLEVBQUUsb0JBQW9CO0tBQ2hDO0lBQ0QsTUFBTSxFQUFFLEVBQUU7Q0FDYixDQUFDO0FBRUYsTUFBc0IsUUFBUTtJQThDMUI7UUEzQ08sZUFBVSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBR2hFLFdBQU0sR0FBYyxJQUFJLENBQUM7UUFFekIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQUdsQixjQUFTLEdBQVEsRUFBRSxDQUFDO1FBR3BCLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFFZCxhQUFRLEdBQVEsRUFBRSxDQUFDO1FBR25CLHVCQUFrQixHQUFXLElBQUksQ0FBQztRQUdsQyxzQkFBaUIsR0FBVyxDQUFDLENBQUM7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