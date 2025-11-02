"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRobot = void 0;
const RobotNet_1 = require("./RobotNet");
const gateBalance = require("../../../services/serverController/gateBalance");
const commonUtil = require("../../../utils/lottery/commonUtil");
const RoleEnum_1 = require("../../constant/player/RoleEnum");
const PositionEnum_1 = require("../../constant/player/PositionEnum");
const ApiResult_1 = require("../ApiResult");
const utils = require("../../../utils");
const pinus_logger_1 = require("pinus-logger");
const pinus_1 = require("pinus");
const redisEvent_1 = require("../../../common/event/redisEvent");
const GameNidEnum_1 = require("../../constant/game/GameNidEnum");
const robotGoldUtil = require("../../../utils/robot/robotGoldUtil");
const RobotMessage_1 = require("../../constant/game/RobotMessage");
const robotServerController_1 = require("../../../servers/robot/lib/robotServerController");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
class BaseRobot extends RobotNet_1.RobotNet {
    constructor(opts) {
        super();
        this.guestid = '';
        this.nid = '';
        this.sceneId = 0;
        this.roomId = '';
        this.leaveStauts = false;
        this.position = PositionEnum_1.PositionEnum.HALL;
        this.delayTimeoutObjs = [];
        this.gold_min = 0;
        this.gold_max = 0;
        this.session = null;
        this.Mode_IO = opts.Mode_IO || false;
        this.isRobot = this.Mode_IO == true ? RoleEnum_1.RoleEnum.REAL_PLAYER : RoleEnum_1.RoleEnum.ROBOT;
        this.Emitter.on(RobotMessage_1.RobotMessage.ROOM_CLOSE, () => this.selfDestructive());
    }
    requestByRoute(route, requestParam) {
        return new Promise((resolve, reject) => {
            if (this.Mode_IO) {
                this.request(route, requestParam, (data) => {
                    if (data.code !== 200) {
                        robotlogger.info(`uid - ${this.uid} | nickname - ${this.nickname} | 机器人请求 ${route} 接口出错: ${JSON.stringify(data)}`);
                        return reject(data);
                    }
                    return resolve(data);
                });
            }
            else {
                this.update_time();
                pinus_1.pinus.app.components.__server__.handle({
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
                });
            }
        });
    }
    async delayRequest(route, param, delayTime) {
        if (!route || commonUtil.isNullOrUndefined(param)) {
            return Promise.reject(`robotEnterBase.delayRequest|参数错误|${route}|${param}`);
        }
        return new Promise((resolve, reject) => {
            let delayTimeoutObj = setTimeout(async () => {
                try {
                    const res = await this.requestByRoute(route, param);
                    return resolve(res);
                }
                catch (error) {
                    return reject(error);
                }
                finally {
                    clearTimeout(delayTimeoutObj);
                    this.delayTimeoutObjs = this.delayTimeoutObjs.filter(c => c['_idleTimeout'] != delayTimeoutObj['_idleTimeout']);
                }
            }, delayTime);
            this.delayTimeoutObjs.push(delayTimeoutObj);
        });
    }
    ;
    async enterGameOrSelectionList(nid, sceneId, roomId, param = {}) {
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
                }
                else {
                    const s = new pinus_1.Session(1, ``, null, null);
                    this.session = new pinus_1.FrontendSession(s);
                    this.session.set("uid", this.uid);
                    this.session.set("roomId", roomId);
                    this.session.set("sceneId", sceneId);
                    this.session.set("isRobot", 2);
                    let msg = {
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
                    };
                    let serverId = pinus_1.pinus.app.getServerType();
                    msg["serverType"] = serverId;
                    pinus_1.pinus.app.components.__remote__.remote.dispatcher.route(null, msg, (err, ...args) => {
                        const data = args[0];
                        if (data.code !== 200) {
                            robotlogger.info(`uid - ${this.uid} | nickname - ${this.nickname} | 机器人请求 entry 接口出错: ${JSON.stringify(data)}`);
                            return reject(data);
                        }
                        return resolve(data);
                    });
                }
            }
            catch (error) {
                if (!(error instanceof Error) && typeof error === 'object') {
                    const { code, msg } = error;
                    if (code === 500) {
                        return reject(`uid:${this.uid}|nid:${this.nid}|sceneId:${this.sceneId}|roomId:${roomId}| ${JSON.stringify(error)}`);
                    }
                }
                return reject(`enterGameOrSelectionList|uid:${this.uid}|nid:${this.nid}|sceneId:${this.sceneId}|roomId:${roomId}|error:${error.stack || typeof error === 'string' ? error : JSON.stringify(error, null, 2)}`);
            }
            finally {
                this.check_robot_exit();
            }
        });
    }
    async enterHall(player, nid) {
        const guestid = player.guestid;
        this.player = player;
        this.guestid = guestid || "";
        this.uid = player.uid;
        try {
            const gateConParam = gateBalance.dispatchGate();
            if (!gateConParam) {
                return;
            }
            await this.requestGate(gateConParam);
            const dataFromGate = await this.requestByRoute("gate.mainHandler.login", { id: guestid });
            this.guestid = dataFromGate.id;
            this.uid = dataFromGate.uid;
            await this.requestConnector(dataFromGate.server);
            const response = await this.requestByRoute("connector.entryHandler.entryHall", {
                uid: dataFromGate.uid,
                token: dataFromGate.token,
            });
            this.nickname = response.data.nickname;
            return;
        }
        catch (error) {
            this.disconnect();
            return Promise.reject(error);
        }
    }
    enterHallMode(player, nid) {
        const guestid = player.guestid;
        this.player = player;
        this.guestid = guestid || "";
        this.uid = player.uid;
        redisEvent_1.globalArr[this.uid] = { event: this.Emitter, updatetime: Math.round(new Date().getTime() / 1000) };
    }
    async selfDestructive() {
        if (this.leaveStauts) {
            return false;
        }
        delete redisEvent_1.globalArr[this.uid];
        this.leaveStauts = true;
        this.clear_delayRequest_time();
        await this.robotDisconnect();
        clearInterval(this.check_Interval);
        await (0, robotServerController_1.increaseAvailableRobot)(this.guestid);
        this.destroy();
    }
    async leaveGameAndReset(flags = true) {
        if (this.leaveStauts) {
            return false;
        }
        delete redisEvent_1.globalArr[this.uid];
        this.leaveStauts = true;
        this.clear_delayRequest_time();
        let serverId = pinus_1.pinus.app.getServerType();
        try {
            if (flags) {
                if (this.Mode_IO) {
                    await this.requestByRoute("hall.mainHandler.leaveRoomAndGame", {});
                }
                else {
                    let msg = {
                        args: [{
                                nid: this.nid,
                                sceneId: this.sceneId,
                                roomId: this.roomId,
                                player: { uid: this.uid, isRobot: 2 }
                            }],
                        method: "exit",
                        namespace: "user",
                        service: "mainRemote",
                    };
                    msg["serverType"] = serverId;
                    pinus_1.pinus.app.components.__remote__.remote.dispatcher.route(null, msg, (err, ...args) => {
                    });
                }
            }
            return true;
        }
        catch (error) {
            if (error instanceof ApiResult_1.ApiResult) {
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
        }
        finally {
            this.robotDisconnect();
            clearInterval(this.check_Interval);
            (0, robotServerController_1.increaseAvailableRobot)(this.guestid);
        }
    }
    ;
    robotDisconnect() {
        this.disconnect();
        this.Emitter.removeAllListeners();
    }
    clear_delayRequest_time() {
        for (const delayTimeoutObj of this.delayTimeoutObjs) {
            clearTimeout(delayTimeoutObj);
        }
        this.delayTimeoutObjs = [];
    }
    setRobotGoldBeforeEnter(nid, sceneId, intoGold) {
        let gold = 0;
        do {
            if (intoGold) {
                gold = intoGold;
                break;
            }
            let randomInitGold = 0;
            switch (nid) {
                case GameNidEnum_1.GameNidEnum.Erba:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.qznn, sceneId);
                    break;
                case "20":
                case GameNidEnum_1.GameNidEnum.BlackGame:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.FiveCardStud:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.LuckyDice:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.dzpipei:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId) * 10;
                    break;
                case "2":
                case "46":
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.sangong, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.TeenPatti:
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case "15":
                case GameNidEnum_1.GameNidEnum.GoldenFlower:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.GoldenFlower, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.DicePoker:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.DicePoker, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.Rummy:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.Rummy, sceneId);
                    break;
                case "3":
                    randomInitGold = utils.random(5000, 2000000);
                    break;
                case "50":
                    randomInitGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
                    break;
                case "45":
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.ChinesePoker, sceneId);
                    break;
                case GameNidEnum_1.GameNidEnum.qzpj:
                case GameNidEnum_1.GameNidEnum.qznn:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.qznn, sceneId);
                    break;
                case "51":
                case GameNidEnum_1.GameNidEnum.qznnpp:
                    randomInitGold = robotGoldUtil.getRanomByWeight(GameNidEnum_1.GameNidEnum.qznn, sceneId);
                    break;
                case "81":
                case GameNidEnum_1.GameNidEnum.andarBahar:
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
    }
    ;
}
exports.BaseRobot = BaseRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9wb2pvL2Jhc2VDbGFzcy9CYXNlUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EseUNBQXNDO0FBQ3RDLDhFQUE4RTtBQUM5RSxnRUFBZ0U7QUFDaEUsNkRBQTBEO0FBQzFELHFFQUFrRTtBQUNsRSw0Q0FBeUM7QUFDekMsd0NBQXlDO0FBQ3pDLCtDQUF5QztBQUN6QyxpQ0FBa0Y7QUFFbEYsaUVBQTBFO0FBQzFFLGlFQUE4RDtBQUM5RCxvRUFBb0U7QUFDcEUsbUVBQWdFO0FBQ2hFLDRGQUEwRjtBQUUxRixNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRXZELE1BQXNCLFNBQVUsU0FBUSxtQkFBUTtJQStCNUMsWUFBWSxJQUFTO1FBQ2pCLEtBQUssRUFBRSxDQUFDO1FBOUJMLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFHckIsUUFBRyxHQUFXLEVBQUUsQ0FBQztRQUdqQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBR3BCLFdBQU0sR0FBVyxFQUFFLENBQUM7UUFNbkIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFHckIsYUFBUSxHQUFpQiwyQkFBWSxDQUFDLElBQUksQ0FBQztRQUNsRCxxQkFBZ0IsR0FBcUIsRUFBRSxDQUFDO1FBRXhDLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdyQixZQUFPLEdBQTZCLElBQUksQ0FBQztRQU1yQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtQkFBUSxDQUFDLEtBQUss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