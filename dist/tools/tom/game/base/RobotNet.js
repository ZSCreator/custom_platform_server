'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotNet = exports.sslOpts = void 0;
const pinus_1 = require("pinus");
const WebSocket = require("ws");
const pinus_protocol_1 = require("pinus-protocol");
const pinus_protobuf_1 = require("pinus-protobuf");
const events = require("events");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const JS_WS_CLIENT_TYPE = 'js-websocket';
const JS_WS_CLIENT_VERSION = '0.0.1';
const RES_OLD_CLIENT = 501;
const RES_OK = 200;
const GAPTHRESHOLD = 100;
exports.sslOpts = {
    run: true
};
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
            if (exports.sslOpts.run) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3ROZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90b29scy90b20vZ2FtZS9iYXNlL1JvYm90TmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsaUNBQThCO0FBQzlCLGdDQUFnQztBQUNoQyxtREFBNEQ7QUFDNUQsbURBQTBDO0FBQzFDLGlDQUFrQztBQUdsQywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxNQUFNLGlCQUFpQixHQUFXLGNBQWMsQ0FBQztBQUNqRCxNQUFNLG9CQUFvQixHQUFXLE9BQU8sQ0FBQztBQUM3QyxNQUFNLGNBQWMsR0FBVyxHQUFHLENBQUM7QUFDbkMsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDO0FBQzNCLE1BQU0sWUFBWSxHQUFXLEdBQUcsQ0FBQztBQUNyQixRQUFBLE9BQU8sR0FBRztJQUNsQixHQUFHLEVBQUUsSUFBSTtDQUNaLENBQUE7QUFDRCxNQUFNLGVBQWUsR0FBRztJQUNwQixLQUFLLEVBQUU7UUFDSCxJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLE9BQU8sRUFBRSxvQkFBb0I7S0FDaEM7SUFDRCxNQUFNLEVBQUUsRUFBRTtDQUNiLENBQUM7QUFFRixNQUFzQixRQUFRO0lBOEMxQjtRQTNDTyxlQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUM7UUFHaEUsV0FBTSxHQUFjLElBQUksQ0FBQztRQUV6QixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBR2xCLGNBQVMsR0FBUSxFQUFFLENBQUM7UUFHcEIsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVkLGFBQVEsR0FBUSxFQUFFLENBQUM7UUFHbkIsdUJBQWtCLEdBQVcsSUFBSSxDQUFDO1FBR2xDLHNCQUFpQixHQUFXLENBQUMsQ0FBQztRQUU5Qix5QkFBb0IsR0FBVyxDQUFDLENBQUM7UUFFakMsZ0JBQVcsR0FBaUIsSUFBSSxDQUFDO1FBRWpDLHVCQUFrQixHQUFpQixJQUFJLENBQUM7UUFFeEMsc0JBQWlCLEdBQWEsSUFBSSxDQUFDO1FBRW5DLGlCQUFZLEdBQWEsSUFBSSxDQUFDO1FBSy9CLG1CQUFjLEdBQWlCLElBQUksQ0FBQztRQUluQyxxQkFBZ0IsR0FBYyxDQUFDLENBQUM7UUFJakMsUUFBRyxHQUFXLEVBQUUsQ0FBQztRQUVwQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU1RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNuRCxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTyxpQkFBaUIsQ0FBQyxRQUFnQjtRQUN0QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFHUyxnQkFBZ0I7UUFDdEIsSUFBSSxJQUFJLENBQUMsY0FBYztZQUFFLE9BQU87UUFFaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ25DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNmLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ25DLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDbEI7UUFDTCxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBSU8sSUFBSSxDQUFDLE1BQXNDLEVBQUUsRUFBWTtRQUM3RCxJQUFJO1lBR0EsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztZQUlmLElBQUksZUFBTyxDQUFDLEdBQUcsRUFBRTtnQkFDYixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLFVBQVUsRUFBRTtvQkFDcEMsR0FBRyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUM7aUJBQzNCO2FBQ0o7aUJBQU07Z0JBQ0gsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxTQUFTLEVBQUU7b0JBQ25DLEdBQUcsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDO2lCQUMxQjthQUNKO1lBQ0QsSUFBSSxJQUFJLEVBQUU7Z0JBQ04sR0FBRyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7YUFDckI7WUFLRCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUUvQjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM5QyxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN2QjtJQUNMLENBQUM7SUFFTyxhQUFhLENBQUMsR0FBVyxFQUFFLEVBQVk7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7UUFNdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMzQixJQUFJLEdBQUcsR0FBRyx3QkFBTyxDQUFDLE1BQU0sQ0FBQyx3QkFBTyxDQUFDLGNBQWMsRUFBRSx5QkFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQVcsQ0FBQyxDQUFDLENBQUM7WUFFdkQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2FBQ25FO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUM1QixXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFbEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFHTyxZQUFZLENBQUMsU0FBaUI7UUFDbEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzVCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxFQUFFO2dCQUMxQixPQUFPO2FBQ1Y7WUFDRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7U0FDOUM7SUFDTCxDQUFDO0lBRU0sVUFBVTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU07WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNsQixZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDekIsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7U0FDbEM7SUFDTCxDQUFDO0lBR00sT0FBTyxDQUFDLEtBQWEsRUFBRSxHQUFRLEVBQUUsRUFBWTtRQUNoRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSTtZQUNBLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ2hCLEtBQUssR0FBRyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNSLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUMzQztZQUNELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDckM7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDaEQsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQztJQUdPLFFBQVEsQ0FBQyxJQUFTO1FBQ3RCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3BCLE9BQU87U0FDVjtRQUVELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3pCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBRTdCLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNoQyxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUNuRDtTQUNKO1FBR0QsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHO2dCQUMxQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFO2dCQUMzQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFO2FBQzlCLENBQUM7WUFDRixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUkseUJBQVEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUNoRztTQUNKO0lBQ0wsQ0FBQztJQVNPLFdBQVcsQ0FBQyxLQUFhLEVBQUUsS0FBYSxFQUFFLEdBQVEsRUFBRSxFQUFZO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsd0JBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLHdCQUFPLENBQUMsV0FBVyxDQUFDO1FBR2hFLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakIsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBQ0gsR0FBRyxHQUFHLHlCQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUNELElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDL0QsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxhQUFhLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO1FBQ0QsR0FBRyxHQUFHLHdCQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3RCxJQUFJLE1BQU0sR0FBRyx3QkFBTyxDQUFDLE1BQU0sQ0FBQyx3QkFBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUdwRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsRUFBRTtZQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkQsUUFBUSxDQUFDO1lBR2IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVPLElBQUksQ0FBQyxNQUFXO1FBQ3BCLElBQUk7WUFDQSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUMzRTtTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsQ0FBQztTQUN4QztJQUNMLENBQUM7SUFHTyxTQUFTO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUUxQixPQUFPO1NBQ1Y7UUFDRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFFbEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDekIsWUFBWSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7U0FDbEM7UUFDRCxJQUFJLEdBQUcsR0FBRyx3QkFBTyxDQUFDLE1BQU0sQ0FBQyx3QkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2pELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQ2hFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNyRyxDQUFDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVPLGtCQUFrQjtRQUN0QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2pELElBQUksR0FBRyxHQUFHLFlBQVksRUFBRTtZQUNwQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakY7YUFBTTtZQUNILElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDckI7SUFDTCxDQUFDO0lBRU8sU0FBUyxDQUFDLE9BQVk7UUFDMUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx5QkFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ25ELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUU7WUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLDZCQUE2QixDQUFDLENBQUM7WUFDMUQsT0FBTyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUNoRjtRQUNELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUNuRTtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsSUFBSSxHQUFHLEdBQUcsd0JBQU8sQ0FBQyxNQUFNLENBQUMsd0JBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUVPLE1BQU0sQ0FBQyxJQUFTO1FBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixJQUFJLEdBQUcsR0FBRyx3QkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1lBQ1osR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO2dCQUNaLE9BQU87YUFDVjtTQUNKO1FBQ0QsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUdPLE1BQU0sQ0FBQyxJQUFJO1FBRWYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVPLGNBQWMsQ0FBQyxHQUFRO1FBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU8sY0FBYyxDQUFDLEdBQVE7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUU7WUFFakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsT0FBTztTQUNWO1FBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixJQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsRUFBRTtZQUMxQixPQUFPO1NBQ1Y7UUFLRCxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2IsT0FBTztJQUNYLENBQUM7SUFFTyxTQUFTLENBQUMsR0FBUTtRQUN0QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckYsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDdEIsSUFBSTtZQUNBLElBQUksR0FBRyxDQUFDLGFBQWEsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUM5QixPQUFPLEVBQUUsQ0FBQztpQkFDYjtnQkFDRCxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEM7WUFDRCxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNoRDtpQkFBTTtnQkFDSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDbkQ7U0FDSjtRQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3RDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFTO1FBQzNCLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRTtZQUNoQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3BELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1NBQ3hEO2FBQU07WUFDSCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7U0FDOUI7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLElBQUksT0FBTyxJQUFJLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO1lBQzlDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckM7SUFDTCxDQUFDO0lBR0QsV0FBVyxDQUFDLFNBQW1DO1FBRTNDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ2pDLElBQUksS0FBSyxFQUFFO29CQUNQLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQ2xELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4QjtnQkFDRCxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdELGdCQUFnQixDQUFDLGNBQWMsRUFBRSxTQUFTLEdBQUcsR0FBRztRQUM1QyxjQUFjLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3pDLElBQUksZUFBZSxHQUFHLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDeEMsSUFBSTtvQkFDQSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTt3QkFDdEMsSUFBSSxLQUFLLEVBQUU7NEJBQ1AsV0FBVyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsS0FBSyxFQUFFLENBQUMsQ0FBQzs0QkFDdkQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7eUJBQ3hCO3dCQUNELE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN2QixDQUFDLENBQUMsQ0FBQztpQkFDTjtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDWixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDeEI7d0JBQVM7b0JBQ04sWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUM5QixlQUFlLEdBQUcsSUFBSSxDQUFDO2lCQUMxQjtZQUNMLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJjRCw0QkFxY0MifQ==