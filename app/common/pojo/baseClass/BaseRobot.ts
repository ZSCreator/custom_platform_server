// 所有机器人进入到游戏的基础操作
import { RobotNet } from "./RobotNet";
import * as gateBalance from "../../../services/serverController/gateBalance";
import * as commonUtil from '../../../utils/lottery/commonUtil';
import { RoleEnum } from "../../constant/player/RoleEnum";
import { PositionEnum } from "../../constant/player/PositionEnum";
import { ApiResult } from "../ApiResult";
import utils = require('../../../utils');
import { getLogger } from 'pinus-logger';
import { FrontendOrBackendSession, FrontendSession, pinus, Session } from "pinus";
import { MsgPkg } from "pinus-rpc";
import { globalEvent, globalArr } from "../../../common/event/redisEvent";
import { GameNidEnum } from "../../constant/game/GameNidEnum";
import * as robotGoldUtil from "../../../utils/robot/robotGoldUtil";
import { RobotMessage } from "../../constant/game/RobotMessage";
import { increaseAvailableRobot } from "../../../servers/robot/lib/robotServerController";
import * as ServerCurrentNumbersPlayersDao from "../../dao/redis/ServerCurrentNumbersPlayersDao";
const robotlogger = getLogger('robot_out', __filename);

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
    public position: PositionEnum = PositionEnum.HALL;
    delayTimeoutObjs: NodeJS.Timeout[] = [];
    /**白人类控制离开房间数据 */
    gold_min: number = 0;
    gold_max: number = 0;
    /**true 走io模式，否则走event模式 */
    Mode_IO: boolean;
    session: FrontendOrBackendSession = null;
    player: any;
    /**0为真实玩家 3 为测试玩家 2 为机器人 */
    isRobot: RoleEnum;
    constructor(opts: any) {
        super();
        this.Mode_IO = opts.Mode_IO || false;
        this.isRobot = this.Mode_IO == true ? RoleEnum.REAL_PLAYER : RoleEnum.ROBOT
        this.Emitter.on(RobotMessage.ROOM_CLOSE, () => this.selfDestructive());
    }

    /**调用指定接口 */
    public requestByRoute(route: string, requestParam): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.Mode_IO) {
                this.request(route, requestParam, (data) => {
                    if (data.code !== 200) {
                        robotlogger.info(`uid - ${this.uid} | nickname - ${this.nickname} | 机器人请求 ${route} 接口出错: ${JSON.stringify(data)}`);
                        return reject(data);
                    }
                    return resolve(data);
                });
            } else {
                this.update_time();
                pinus.app.components.__server__.handle({
                    id: 1,
                    route: route,
                    body: requestParam
                }, this.session, (err, resp) => {
                    let args = utils.clone(resp);
                    if (err) {
                        return reject(err);
                    }
                    if (args.code !== 200) {
                        return reject(args);
                    }
                    return resolve(args);
                })
            }

        });
    }

    /** 
     * 延迟调用某个接口
     * 
     */
    async delayRequest(route: string, param, delayTime: number): Promise<any> {
        if (!route || commonUtil.isNullOrUndefined(param)) {
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
                if (this.Mode_IO) {
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
                } else {
                    const s = new Session(1, ``, null, null);
                    this.session = new FrontendSession(s);
                    this.session.set("uid", this.uid);
                    this.session.set("roomId", roomId);
                    this.session.set("sceneId", sceneId);
                    this.session.set("isRobot", 2);
                    let msg: MsgPkg = {
                        args: [{
                            nid,
                            sceneId,
                            roomId,
                            player: this.player,
                            param: param,
                        }],
                        method: "entry",
                        namespace: "user",
                        service: "mainRemote",
                    }
                    let serverId = pinus.app.getServerType();
                    msg["serverType"] = serverId;
                    /** 机器人在线人数 +1 */
                    // ServerCurrentNumbersPlayersDao.increaseByServerId(`${serverId}-server-1`);

                    pinus.app.components.__remote__.remote.dispatcher.route(null, msg, (err: Error | null, ...args: any[]) => {
                        // console.warn(err, args);
                        const data = args[0];
                        if (data.code !== 200) {
                            robotlogger.info(`uid - ${this.uid} | nickname - ${this.nickname} | 机器人请求 entry 接口出错: ${JSON.stringify(data)}`);
                            return reject(data);
                        }
                        return resolve(data);
                    });
                }
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
    async enterHall(player: any, nid: any) {
        const guestid = player.guestid;
        this.player = player;
        this.guestid = guestid || "";
        this.uid = player.uid;
        try {
            const gateConParam = gateBalance.dispatchGate();
            if (!gateConParam) {
                return;
            }
            // 先和 gate 建立连接
            await this.requestGate(gateConParam);
            // 调用 gate.mainHandler.login
            // console.warn("机器人登陆");
            const dataFromGate = await this.requestByRoute("gate.mainHandler.login", { id: guestid });
            this.guestid = dataFromGate.id;
            this.uid = dataFromGate.uid;
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
            return;
        } catch (error) {
            this.disconnect();
            return Promise.reject(error)
        }
    }
    enterHallMode(player: any, nid: any) {
        const guestid = player.guestid;
        this.player = player;
        this.guestid = guestid || "";
        this.uid = player.uid;
        globalArr[this.uid] = { event: this.Emitter, updatetime: Math.round(new Date().getTime() / 1000) }; //秒};
    }
    /**
     * 房间销毁时直接调用
     */
    async selfDestructive() {
        if (this.leaveStauts) {
            return false;
        }
        delete globalArr[this.uid];
        this.leaveStauts = true;
        this.clear_delayRequest_time();

        // 断开连接
        await this.robotDisconnect();
        clearInterval(this.check_Interval);
        await increaseAvailableRobot(this.guestid);
        this.destroy();
    }



    /**机器人离开某个游戏，并断开连接 */
    async leaveGameAndReset(flags = true) {
        if (this.leaveStauts) {
            return false;
        }
        delete globalArr[this.uid];
        this.leaveStauts = true;
        this.clear_delayRequest_time();
        let serverId = pinus.app.getServerType();
        /** 机器人在线人数 -1 */
        // ServerCurrentNumbersPlayersDao.decreaseByServerId(`${serverId}-server-1`);
        try {
            // 离开游戏和房间
            if (flags) {
                if (this.Mode_IO) {
                    await this.requestByRoute("hall.mainHandler.leaveRoomAndGame", {});
                } else {
                    let msg: MsgPkg = {
                        args: [{
                            nid: this.nid,
                            sceneId: this.sceneId,
                            roomId: this.roomId,
                            player: { uid: this.uid, isRobot: 2 }
                        }],
                        method: "exit",
                        namespace: "user",
                        service: "mainRemote",
                    }
                    msg["serverType"] = serverId;
                    pinus.app.components.__remote__.remote.dispatcher.route(null, msg, (err: Error | null, ...args: any[]) => {
                        // console.warn(err, args);
                    });
                }
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
            increaseAvailableRobot(this.guestid);
            // logger.warn(`回收robot|${this.nid}|${this.uid}`, utils.cDate());
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

    /**机器人进入游戏之前，设置机器人的金币 */
    setRobotGoldBeforeEnter(nid: string, sceneId: number, intoGold?: number) {
        let gold = 0;
        do {
            if (intoGold) {
                gold = intoGold;
                break;
            }
            // 设置初始金币
            let randomInitGold = 0;
            switch (nid) {
                case GameNidEnum.Erba:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.qznn, sceneId);
                    break;
                case "20":
                case GameNidEnum.BlackGame:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                // case "9":
                // randomInitGold = robotGoldUtil.randomBRNNInitGold(nid, sceneId);;
                // break;
                // case "19":
                // case "42":
                // randomInitGold = robotGoldUtil.randomRedBlackInitGold(nid, sceneId);
                // break;
                case GameNidEnum.FiveCardStud:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case GameNidEnum.LuckyDice:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case GameNidEnum.dzpipei:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId) * 10;
                    break;
                case "2":
                case "46":
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.sangong, sceneId);
                    break;
                case GameNidEnum.TeenPatti:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case "15":
                case GameNidEnum.GoldenFlower:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.GoldenFlower, sceneId);
                    break;
                case GameNidEnum.DicePoker:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.DicePoker, sceneId);
                    break;
                case GameNidEnum.Rummy:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.Rummy, sceneId);
                    break;
                case "3":
                    randomInitGold = utils.random(5000, 2000000);
                    break;
                case "50":
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case "45":
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.ChinesePoker, sceneId);
                    break
                case GameNidEnum.qzpj:
                case GameNidEnum.qznn:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.qznn, sceneId);
                    break;
                case "51":
                case GameNidEnum.qznnpp:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum.qznn, sceneId);
                    break;
                case "81":
                case GameNidEnum.andarBahar:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                default:
                    console.error(nid, "Ai 未定义金币");
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
            }
            gold = randomInitGold;
            break;
        } while (true);
        this.player["gold"] = gold;

        return gold;
    };
}
