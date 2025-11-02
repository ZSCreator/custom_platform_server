'use strict';
import { pinus } from 'pinus';
import * as WebSocket from 'ws';
import { Protocol, Message, Package } from 'pinus-protocol';
import { Protobuf } from 'pinus-protobuf';
import events = require('events');


import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);

const JS_WS_CLIENT_TYPE: string = 'js-websocket';
const JS_WS_CLIENT_VERSION: string = '0.0.1';
const RES_OLD_CLIENT: number = 501;
const RES_OK: number = 200;
const GAPTHRESHOLD: number = 100;
export let  sslOpts = {
    run: true
}
const handshakeBuffer = {
    'sys': {
        type: JS_WS_CLIENT_TYPE,
        version: JS_WS_CLIENT_VERSION
    },
    'user': {}
};

export abstract class RobotNet {
    public Emitter: events.EventEmitter;

    public pinus_data = { data: { protos: null, abbrs: null, dict: null } };

    /** @property WebSocket */
    private socket: WebSocket = null;

    private reqId: number = 0;

    /**请求回调 */
    private callbacks: any = {};

    /*Map from request id to route */
    private routeMap = {};

    private handlers: any = {};

    /**heartbeat interval */
    private heartbeat_Interval: number = 5000;

    /**max heartbeat timeout */
    private heartbeat_Timeout: number = 0;

    private nextHeartbeatTimeout: number = 0;

    private heartbeatId: NodeJS.Timer = null;

    private heartbeatTimeoutId: NodeJS.Timer = null;

    private handshakeCallback: Function = null;

    private initCallback: Function = null;

    private timestamp: number;

    /**检查机器人超时定时器 */
    public check_Interval: NodeJS.Timer = null;

    // private connectTemp: boolean = false;
    /**0 连接着 1 异常断开 2 正常断开 */
    private disconnectStatus: 0 | 1 | 2 = 0;

    private protobuf: Protobuf;

    public uid: string = '';
    constructor() {
        this.Emitter = Object.create(events.EventEmitter.prototype); // object extend from object

        this.heartbeat_Timeout = this.heartbeat_Interval * 2;
        this.timestamp = Math.round(new Date().getTime() / 1000); //秒
        this.handlers[Package.TYPE_HANDSHAKE] = this.handshake; //握手回调
        this.handlers[Package.TYPE_HEARTBEAT] = this.heartbeat; //心跳回调
        this.handlers[Package.TYPE_DATA] = this.onData; //请求服务器数据回调
        this.handlers[Package.TYPE_KICK] = this.onKick; //被服务器断开连接回调
    }

    public update_time() {//更新最后一次操作 网络通信的时间戳
        this.timestamp = Math.round(new Date().getTime() / 1000);
    }

    private check_update_time(difftime: number) {//检查是否超时 超时返回true 传入参数单位是秒
        let diff = Math.round(new Date().getTime() / 1000 - this.timestamp);
        let flag = diff > difftime ? true : false;
        return flag
    }

    /**检查机器人是否存活 */
    protected check_robot_exit() {
        if (this.check_Interval) return;

        this.check_Interval = setInterval(() => {
            let flag = this.check_update_time(60 * 2);
            if (flag === true) {
                clearInterval(this.check_Interval);
                robotlogger.info(pinus.app.getServerId(), "机器人定时销毁" + this.uid);
                this.destroy();
            }
        }, 1000 * 60 * 2);
    }

    abstract destroy();

    private init(params: { host: string, port: number }, cb: Function) {
        try {
            // this.pinus.params = params;
            // params.debug = true;
            this.initCallback = cb;
            let host = params.host;
            let port = params.port;
            let url = host;

            // let url = 'http://' + host;
            // let url = host;
            if (sslOpts.run) {
                if (host.substring(0, 8) != 'https://') {
                    url = 'https://' + host;
                }
            } else {
                if (host.substring(0, 7) != 'http://') {
                    url = 'http://' + host;
                }
            }
            if (port) {
                url += ':' + port;
            }

            // if (!params.type) {
            // handshakeBuffer.user = params.user;
            // this.handshakeCallback = params.handshakeCallback;
            this.initWebSocket(url, cb);
            // }
        } catch (error) {
            robotlogger.warn(`robotNet|初始化连接失败|${error}`);
            return cb('初始化连接失败')
        }
    }

    private initWebSocket(url: string, cb: Function) {
        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        // this.Emitter.on(serverControlConst.KICK_PLAYER_NOTICE_ROUTE, () => {
        //     robotlogger.warn(`${this.uid}|被顶号`);
        // });

        this.socket.onopen = (event) => {
            let obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
            this.send(obj);
            // this.connectTemp = true;
            this.disconnectStatus = 0;
        };

        this.socket.onmessage = (event) => {
            this.processPackage(Package.decode(event.data as any));
            // new package arrived, update the heartbeat timeout
            if (this.heartbeat_Timeout) {
                this.nextHeartbeatTimeout = Date.now() + this.heartbeat_Timeout;
            }
        };

        this.socket.onerror = (error) => {
            robotlogger.warn(`robotNet|onerror|${url}|${error.message || JSON.stringify(error)}`);
            this.Emitter.emit('onIOError', error);
            // this.connectTemp = false;
            this.disconnectStatus = 1;
            this.disConnectCb('from onError');
            this.initCallback && this.initCallback(error.message);
        };

        this.socket.onclose = (event) => {
            this.Emitter.emit('close', event);
            // this.connectTemp = false;
            this.disconnectStatus = 2;
            this.disConnectCb('from_onClose');
        };
    }

    //连接关闭时回调请求
    private disConnectCb(fromWhere: string) {
        for (let msg in this.callbacks) {
            let cb = this.callbacks[msg];
            delete this.callbacks[msg];
            if (typeof cb !== 'function') {
                return;
            }
            return cb({ code: 500, error: fromWhere });
        }
    }

    public disconnect() {
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

    /**请求服务器接口 */
    public request(route: string, msg: any, cb: Function) {
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
        } catch (error) {
            robotlogger.warn(`robotNet|请求服务器接口出错|${error}`);
            return cb({ code: 500, error: '请求服务器接口出错' });
        }
    }

    /**初始化protobuf */
    private initData(data: any) {
        if (!data || !data.sys) {
            return;
        }
        // this._pinus.data = this._pinus.data || {};
        let dict = data.sys.dict;
        let protos = data.sys.protos;
        //Init compress dict
        if (!!dict) {
            this.pinus_data.data.dict = dict;
            this.pinus_data.data.abbrs = {};
            for (let route in dict) {
                this.pinus_data.data.abbrs[dict[route]] = route;
            }
        }

        //Init protobuf protos
        if (!!protos) {
            this.pinus_data.data.protos = {
                server: protos.server || {},
                client: protos.client || {}
            };
            if (!!this.protobuf) {
                this.protobuf = new Protobuf({ encoderProtos: protos.client, decoderProtos: protos.server });
            }
        }
    }

    /**
     * 发送消息
     * @param reqId 
     * @param route 路由
     * @param msg   消息体
     * @param cb    回调函数
     */
    private sendMessage(reqId: number, route: string, msg: any, cb: Function) {
        const type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;

        //compress message by protobuf
        let protos = !!this.pinus_data.data.protos ? this.pinus_data.data.protos.client : {};
        if (!!protos[route]) {
            msg = this.protobuf.encode(route, msg);
        } else {
            msg = Protocol.strencode(JSON.stringify(msg));
        }
        let compressRoute = false;
        if (this.pinus_data.data.dict && this.pinus_data.data.dict[route]) {
            route = this.pinus_data.data.dict[route];
            compressRoute = true;
        }
        msg = Message.encode(reqId, type, compressRoute, route, msg);
        let packet = Package.encode(Package.TYPE_DATA, msg);

        //发送消息之前验证连接是否已经断开了
        if (!this.socket || this.socket.readyState === 3 || this.disconnectStatus != 0) {
            const status = this.disconnectStatus === 1 ? '连接异常断开' :
                `连接正常关闭`;
            // `连接正常关闭 连接状态: ${this.disconnectStatus} socket: ${!!this.socket} socket状态 ${!!this.socket ? this.socket.readyState : 3}`;
            // robotlogger.warn(`robotNet|请求路由 ${route} 出错|${status}|${this.uid}`, 'info');
            cb && cb({ code: 500, error: status });
            this.disconnect();
            return;
        }
        this.send(packet);
    }

    private send(packet: any) {
        try {
            if (!!this.socket) {
                this.socket.send(packet.buffer || packet, { binary: true, mask: true });
            }
        } catch (error) {
            console.info("robot error:" + error);
        }
    }

    /**收到心跳包 */
    private heartbeat() {
        if (!this.heartbeat_Interval) {
            // no heartbeat
            return;
        }
        if (this.heartbeatId) {
            // already in a heartbeat interval
            return;
        }
        if (this.heartbeatTimeoutId) {
            clearTimeout(this.heartbeatTimeoutId);
            this.heartbeatTimeoutId = null;
        }
        let obj = Package.encode(Package.TYPE_HEARTBEAT);
        let self = this;
        this.heartbeatId = setTimeout(() => {
            self.heartbeatId = null;
            self.send(obj);
            self.nextHeartbeatTimeout = Date.now() + self.heartbeat_Timeout;
            self.heartbeatTimeoutId = setTimeout(self.heartbeatTimeoutCb.bind(self), self.heartbeat_Timeout);
        }, this.heartbeat_Interval);
    }
    /**心跳超时 */
    private heartbeatTimeoutCb() {
        let gap = this.nextHeartbeatTimeout - Date.now();
        if (gap > GAPTHRESHOLD) {
            this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb.bind(this), gap);
        } else {
            this.Emitter && this.Emitter.emit('heartbeat timeout');
            this.disconnect();
        }
    }

    private handshake(resData: any) {
        let Data = JSON.parse(Protocol.strdecode(resData));
        if (Data.code === RES_OLD_CLIENT) {
            this.Emitter.emit('error', 'client version not fullfill');
            return this.initCallback && this.initCallback('client version not fullfill');
        }
        if (Data.code !== RES_OK) {
            this.Emitter.emit('error', 'handshake fail');
            return this.initCallback && this.initCallback('handshake fail');
        }
        this.handshakeInit(Data);
        let obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
        this.send(obj);
        if (this.initCallback) {
            this.initCallback(null, this.socket);
            this.initCallback = null;
        }
    }

    private onData(data: any) {
        this.update_time();
        //probuff decode
        let msg = Message.decode(data);
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

    //机器人被服务器断开连接
    private onKick(data) {
        // console.log('机器人被服务器断开连接', this.userInfo.uid);
        this.Emitter.emit('onKick');
    }

    private processPackage(msg: any) {
        this.handlers[msg.type].apply(this, [msg.body]);
    }

    private processMessage(msg: any) {
        if (!msg || !msg.id) {
            // server push message
            this.Emitter.emit(msg.route, msg.body);
            return;
        }
        //if have a id then find the callback function with the request
        let cb = this.callbacks[msg.id];
        delete this.callbacks[msg.id];
        if (typeof cb !== 'function') {
            return;
        }
        // if (msg.body && msg.body.code === 500) {
        //     let obj: any = { 'code': 500, 'desc': '服务器内部错误', 'key': 'INTERNAL_ERROR' };
        //     msg.body.error = obj;
        // }
        cb(msg.body);
        return;
    }

    private deCompose(msg: any) {
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
            } else {
                return JSON.parse(Protocol.strdecode(msg.body));
            }
        } catch (ex) {
            console.error('route, body = ' + route + ", " + msg.body);
        }
        return msg;
    }

    private handshakeInit(data: any) {
        if (data.sys && data.sys.heartbeat) {
            this.heartbeat_Interval = data.sys.heartbeat * 1000;   // heartbeat interval
            this.heartbeat_Timeout = this.heartbeat_Interval * 2;        // max heartbeat timeout
        } else {
            this.heartbeat_Interval = 0;
            this.heartbeat_Timeout = 0;
        }
        this.initData(data);
        if (typeof this.handshakeCallback === 'function') {
            this.handshakeCallback(data.user);
        }
    }

    /**连接gate服务器 */
    requestGate(gateParam: { host: any, port: any }) {
        // gateParam.log = true;
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

    /**连接connector服务器 */
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
                } catch (error) {
                    return reject(error);
                } finally {
                    clearTimeout(delayTimeoutObj);
                    delayTimeoutObj = null;
                }
            }, delayTime);
        });
    }
}


