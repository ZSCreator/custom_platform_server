// 所有机器人进入到游戏的基础操作
import { RobotNet } from "./RobotNet";
import { getLogger } from 'pinus-logger';
import { FrontendOrBackendSession, FrontendSession, pinus, Session } from "pinus";
import { MsgPkg } from "pinus-rpc";
import { ApiResult } from "../../../../app/common/pojo/ApiResult";
import ramda = require("ramda");
const robotlogger = getLogger('robot_out', __filename);

/**
 * 判断某个数据是否是 null 或者 undefined
 * @param data 
 */
export function isNullOrUndefined(data) {
    return data === undefined || data === null;
};


export abstract class BaseRobot extends RobotNet {
    /** @property 访客编号 */
    public guestid: string = '';

    /** @property 游戏编号 */
    public nid: string = '';

    /** @property 场编号 */
    public sceneId: number = 0;

    /** @property 房间编号 */
    public roomId: string = '';

    /** @property 昵称 */
    public nickname: string;

    /**父类赋值 防止重复调用 */
    private leaveStauts = false;

    /** @property 所处位置 */
    // public position: PositionEnum = PositionEnum.HALL;
    delayTimeoutObjs: NodeJS.Timeout[] = [];
    /**白人类控制离开房间数据 */
    gold_min: number = 0;
    gold_max: number = 0;
    /**true 走io模式，否则走event模式 */
    // Mode_IO: boolean;
    session: FrontendOrBackendSession = null;
    player: any;
    /**0为真实玩家 3 为测试玩家 2 为机器人 */
    // isRobot: RoleEnum;
    constructor(opts: any) {
        super();
        // this.Mode_IO = opts.Mode_IO || false;
    }

    /**调用指定接口 */
    public requestByRoute(route: string, requestParam): Promise<any> {
        return new Promise((resolve, reject) => {
            this.request(route, requestParam, (data) => {
                if (data.code !== 200) {
                    robotlogger.info(`uid - ${this.uid} | nickname - ${this.nickname} | 机器人请求 ${route} 接口出错: ${JSON.stringify(data)}`);
                    return reject(data);
                }
                return resolve(data);
            });
        });
    }

    /** 
     * 延迟调用某个接口
     * 
     */
    async delayRequest(route: string, param, delayTime: number): Promise<any> {
        if (!route || isNullOrUndefined(param)) {
            return Promise.reject(`robotEnterBase.delayRequest|参数错误|${route}|${param}`)
        }
        return new Promise((resolve, reject) => {
            let delayTimeoutObj = setTimeout(async () => {
                try {
                    const res = await this.requestByRoute(route, param);
                    return resolve(res);
                } catch (error) {
                    return reject(error);
                } finally {
                    clearTimeout(delayTimeoutObj);
                    this.delayTimeoutObjs = this.delayTimeoutObjs.filter(c => c['_idleTimeout'] != delayTimeoutObj['_idleTimeout']);
                }
            }, delayTime);
            this.delayTimeoutObjs.push(delayTimeoutObj);
        })
    };

    /**
     * 进入游戏
     * @param nid 
     * @param sceneId 
     * @param roomId 
     * @description 新进入游戏逻辑
     */
    async enterGameOrSelectionList(nid: string, sceneId: number, roomId: string, param = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                this.nid = nid;
                this.sceneId = sceneId;
                this.roomId = roomId;
                let { code, data } = await this.requestByRoute("hall.mainHandler.enterGameOrSelectionList", {
                    nid,
                    sceneId,
                    roomId,
                    whetherToShowScene: true,
                    whetherToShowRoom: false,
                    whetherToShowGamingInfo: false,
                    param
                });

                if (code !== 200) {
                    reject({ code, data });
                }

                if (Array.isArray(data.roomHistoryList) && data.roomHistoryList.length > 0) {
                    roomId = data.roomHistoryList[0].roomHistoryList;
                }

                data = await this.requestByRoute("hall.mainHandler.enterGameOrSelectionList", {
                    nid,
                    sceneId,
                    roomId,
                    whetherToShowScene: false,
                    whetherToShowRoom: false,
                    whetherToShowGamingInfo: false,
                    param
                });
                this.roomId = data['data']['roomId'];
                return resolve(data);

            } catch (error) {
                if (!(error instanceof Error) && typeof error === 'object') {
                    const { code, msg } = error;
                    if (code === 500) {
                        return reject(`uid:${this.uid}|nid:${this.nid}|sceneId:${this.sceneId}|roomId:${roomId}| ${JSON.stringify(error)}`);
                    }
                }
                return reject(`enterGameOrSelectionList|uid:${this.uid}|nid:${this.nid}|sceneId:${this.sceneId}|roomId:${roomId}|error:${error.stack || typeof error === 'string' ? error : JSON.stringify(error, null, 2)}`);
            } finally {
                this.check_robot_exit();
            }
        })
    }

    // 先和 gate 建立连接，然后再调用 gate.mainHandler.login
    // 再和 connector 建立连接，然后再调用 connector.entryHandler.entry
    async enterHall(player: any, dataFromGate: any) {
        const guestid = player.guestid;
        this.player = player;
        this.guestid = guestid || "";
        this.uid = player.uid;
        try {
            // const gateConParam = gateBalance.dispatchGate();
            // if (!gateConParam) {
            //     return;
            // }
            // 先和 gate 建立连接
            // await this.requestGate(gateConParam);
            // 调用 gate.mainHandler.login
            // console.warn("机器人登陆");
            // const dataFromGate = await this.requestByRoute("gate.mainHandler.login", { id: guestid });
            // this.guestid = dataFromGate.id;
            // this.uid = dataFromGate.uid;
            // 再和 connector 建立连接
            await this.requestConnector(dataFromGate.server);
            // 调用 connector 的接口
            // console.warn("机器人登陆到大厅");
            const response = await this.requestByRoute("connector.entryHandler.entryHall", {
                uid: dataFromGate.uid,
                token: dataFromGate.token,
                // isRobot: RoleEnum.ROBOT,
                // nid
            });
            // 赋值 

            this.nickname = response.data.nickname;
            return response;
        } catch (error) {
            this.disconnect();
            return Promise.reject(error)
        }
    }

    /**
     * 房间销毁时直接调用
     */
    async selfDestructive() {
        if (this.leaveStauts) {
            return false;
        }

        this.leaveStauts = true;
        this.clear_delayRequest_time();

        // 断开连接
        await this.robotDisconnect();
        clearInterval(this.check_Interval);
        this.destroy();
    }



    /**机器人离开某个游戏，并断开连接 */
    async leaveGameAndReset(flags = true) {
        if (this.leaveStauts) {
            return false;
        }

        this.leaveStauts = true;
        this.clear_delayRequest_time();

        /** 机器人在线人数 -1 */
        // ServerCurrentNumbersPlayersDao.decreaseByServerId(`${serverId}-server-1`);
        try {
            // 离开游戏和房间
            if (flags) {

                await this.requestByRoute("hall.mainHandler.leaveRoomAndGame", {});

            }
            // robotlogger.info(`leaveGameAndReset|${this.uid}|${this.nid}|${this.sceneId}|${this.roomId}|正常断线`);
            // 此处返回才补机器人
            return true;
        } catch (error) {
            if (error instanceof ApiResult) {
                const { code } = error;
                switch (code) {
                    case 17017:
                    case 34701:
                        return false;
                    default:
                        break;
                }
            }
            return false;
        } finally {
            // 断开连接
            this.robotDisconnect();
            clearInterval(this.check_Interval);
        }
    };

    /**断开连接的 promise */
    private robotDisconnect() {
        this.disconnect();
        // 移除所有监听
        this.Emitter.removeAllListeners();
    }
    /**清理延迟请求 */
    protected clear_delayRequest_time() {
        for (const delayTimeoutObj of this.delayTimeoutObjs) {
            clearTimeout(delayTimeoutObj);
        }
        this.delayTimeoutObjs = [];
    }

}
