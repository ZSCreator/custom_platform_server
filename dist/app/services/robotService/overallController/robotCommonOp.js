"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOnePl = exports.createUserAndPlayerForRobot = void 0;
const hallConst = require("../../../consts/hallConst");
const Robot_manager_1 = require("../../../common/dao/daoManager/Robot.manager");
const commonUtil = require("../../../utils/lottery/commonUtil");
const utils = require("../../../utils");
const JsonConfig = require("../../../pojo/JsonConfig");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const pinus_logger_1 = require("pinus-logger");
const Player_builder_1 = require("../../../common/dao/mysql/builder/Player.builder");
const SystemConfig_manager_1 = require("../../../common/dao/daoManager/SystemConfig.manager");
const Scene_manager_1 = require("../../../common/dao/daoManager/Scene.manager");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const utils_1 = require("../../../utils");
const general_1 = require("../../../utils/general");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const robotServerController_1 = require("../../../servers/robot/lib/robotServerController");
const bairen_gold_Config_1 = require("../../../../config/data/robot/bairen_gold_Config");
async function createUserAndPlayerForRobot() {
    try {
        const playerImpl = await new Player_builder_1.PlayerBuilder()
            .createPlayer()
            .setGuestId(null)
            .setPlayerRole(2)
            .getPlayerImpl();
        const cfg = await SystemConfig_manager_1.default.findOne({ id: 1 });
        playerImpl.gold = cfg.startGold || 0;
        const p = await Robot_manager_1.default.insertOne(playerImpl);
        return Promise.resolve(p);
    }
    catch (error) {
        robotlogger.warn(`robotCommonOp.createUserAndPlayerForRobot ==> 创建机器人账户失败: ${error.stack || error.message || error}`);
        return Promise.resolve(null);
    }
}
exports.createUserAndPlayerForRobot = createUserAndPlayerForRobot;
;
function GetOnePl() {
    const uid = (0, general_1.createPlayerUid)(7);
    const headurl = (0, utils_1.getHead)();
    const isRobot = RoleEnum_1.RoleEnum.ROBOT;
    return {
        uid,
        nickname: `P${uid}`,
        headurl,
        isRobot,
        sid: "robot",
        gold: 0
    };
}
exports.GetOnePl = GetOnePl;
;
class RobotManger {
    constructor() {
        this.nid = '';
        this.enterRobotFunc = null;
        this.getRoomList = null;
        this.setInterval = null;
        this.robotRoomnum = {};
        this.updateNum = 0;
        this.RefreshTime = 0;
    }
    registerAddRobotListener(nid, Mode_IO, enterRobotFunc, getRoomList) {
        this.nid = nid;
        this.Mode_IO = Mode_IO;
        this.getRoomList = getRoomList;
        this.enterRobotFunc = enterRobotFunc;
    }
    ;
    start() {
        this.allRobotConfig = JsonConfig.get_all_robotStatus();
        if (!this.allRobotConfig.length) {
            return;
        }
        let robotConfig = commonUtil.getArrayMember(this.allRobotConfig, 'nid', this.nid);
        if (!robotConfig || !robotConfig.nid) {
            return;
        }
        clearInterval(this.setInterval);
        if (this.Mode_IO == false) {
            this.setInterval = setInterval(() => {
                this.RobotNumMonitor();
                this.updateNum++;
                if (this.updateNum == 2000) {
                    const Now = Math.round(new Date().getTime() / 1000);
                    for (const key in this.robotRoomnum) {
                        if (Now - this.robotRoomnum[key].addTime > 10 * 60) {
                            delete this.robotRoomnum[key];
                        }
                    }
                    this.updateNum = 0;
                }
            }, 1000);
        }
        else {
            this.setInterval = setInterval(() => {
                this.simulationNumMonitor();
            }, 10 * 1000);
        }
    }
    stop() {
        clearInterval(this.setInterval);
        this.setInterval = null;
    }
    getRanomByCount(maxCount) {
        let weights = [0, 5, 10, 25, 30];
        while (maxCount > weights.length) {
            weights.push(30);
        }
        while (maxCount < weights.length) {
            weights.pop();
        }
        let sum = 0;
        for (const c of weights) {
            sum = sum + c;
        }
        let compareWeight = utils.random(1, sum);
        let weightIndex = 0;
        while (sum > 0) {
            sum = sum - weights[weightIndex];
            if (sum < compareWeight) {
                return weightIndex + 1;
            }
            weightIndex = weightIndex + 1;
        }
    }
    async RobotNumMonitor() {
        try {
            let robotConfig = commonUtil.getArrayMember(this.allRobotConfig, 'nid', this.nid);
            if (!robotConfig || !robotConfig.nid) {
                return;
            }
            if (hallConst.BAIREN_SCENE_ID.includes(this.nid)) {
                this.bairen_bu_robot();
            }
            else {
                let roomList = this.getRoomList();
                for (let Isystem_room of roomList) {
                    const real_pl_num = Isystem_room.players.filter(c => c && c.isRobot == 0).length;
                    const robot_pl_num = Isystem_room.players.filter(c => c && c.isRobot == 2).length;
                    if (!robotConfig.fenscene.includes(Isystem_room.sceneId)) {
                        continue;
                    }
                    if (real_pl_num == 0) {
                        continue;
                    }
                    if (Isystem_room["status"] != "INWAIT" && Isystem_room["status"] != "NONE") {
                        if (this.nid !== GameNidEnum_1.GameNidEnum.andarBahar)
                            continue;
                    }
                    let isAdd = false;
                    do {
                        if (!this.robotRoomnum[Isystem_room.roundId]) {
                            const maxCount = this.getRanomByCount(Isystem_room.maxCount);
                            const addTime = Math.round(new Date().getTime() / 1000);
                            this.robotRoomnum[Isystem_room.roundId] = { maxCount: maxCount, addTime: addTime };
                        }
                        const maxCount = this.robotRoomnum[Isystem_room.roundId].maxCount;
                        if ((robot_pl_num + real_pl_num) < maxCount) {
                            isAdd = true;
                        }
                        if (robot_pl_num == 0) {
                            isAdd = true;
                        }
                        if (this.nid == GameNidEnum_1.GameNidEnum.Erba ||
                            this.nid == GameNidEnum_1.GameNidEnum.qznnpp ||
                            this.nid == GameNidEnum_1.GameNidEnum.LuckyDice ||
                            this.nid == GameNidEnum_1.GameNidEnum.land ||
                            this.nid == GameNidEnum_1.GameNidEnum.DicePoker ||
                            this.nid == GameNidEnum_1.GameNidEnum.qzpj) {
                            isAdd = (robot_pl_num + real_pl_num) < Isystem_room.maxCount;
                        }
                    } while (0);
                    if (isAdd) {
                        const pl = GetOnePl();
                        this.enterRobotFunc(this.nid, Isystem_room.sceneId, Isystem_room.roomId, this.Mode_IO, pl);
                    }
                }
            }
        }
        catch (error) {
            robotlogger.warn(`robotNumMonitor|error|${this.nid}|${error.stack || error}`);
        }
    }
    async simulationNumMonitor() {
        try {
            if (hallConst.BAIREN_SCENE_ID.includes(this.nid)) {
                this.simulationbairen_bu_robot();
            }
            else {
                const sceneList = await Scene_manager_1.default.findList({ nid: this.nid });
                for (let sceneInfo of sceneList) {
                    let player = await (0, robotServerController_1.getOneAvailableRobot)();
                    if (!player) {
                        continue;
                    }
                    this.enterRobotFunc(this.nid, sceneInfo.sceneId, "", this.Mode_IO, player);
                }
            }
        }
        catch (error) {
            robotlogger.warn(`robotNumMonitor|error|${this.nid}|${error.stack || error}`);
        }
    }
    async bairen_bu_robot(allin = false) {
        let roomList = this.getRoomList();
        if (!roomList.length) {
            return;
        }
        for (let Isystem_room of roomList) {
            const pl_num = { REAL_PLAYER: [], ROBOT: [] };
            for (const pl of Isystem_room.players) {
                if (pl && pl.isRobot == 0) {
                    pl_num.REAL_PLAYER.push(pl.uid);
                }
                else if (pl && pl.isRobot == 2) {
                    pl_num.ROBOT.push(pl.uid);
                }
            }
            if ((pl_num.ROBOT.length + pl_num.REAL_PLAYER.length) >= 35) {
                continue;
            }
            const Now = Math.round(new Date().getTime() / 1000);
            if (Now - this.RefreshTime >= 10 * 60) {
                this.RefreshTime = Now;
                for (const intoGold of bairen_gold_Config_1.gold_config) {
                    for (const It of intoGold.intoGold) {
                        It.num = commonUtil.randomFromRange(It.limits[0], It.limits[1]);
                    }
                }
            }
            let intoGold = bairen_gold_Config_1.gold_config[0].intoGold;
            if (!bairen_gold_Config_1.gold_config[Isystem_room.sceneId]) {
                intoGold = bairen_gold_Config_1.gold_config[0].intoGold;
            }
            else {
                intoGold = bairen_gold_Config_1.gold_config[Isystem_room.sceneId]['intoGold'];
            }
            const fn1 = (users, gold_min, gold_max, isROBOT) => {
                let robot_num = 0;
                for (const user of users) {
                    if (isROBOT) {
                        const player = Isystem_room.players.find(c => c && c.uid == user && c.isRobot == 2);
                        if (player) {
                            let gold = player.gold;
                            if (gold < gold_max && gold > gold_min)
                                robot_num++;
                        }
                    }
                    else {
                        const player = Isystem_room.players.find(c => c && c.uid == user && c.isRobot == 0);
                        if (player) {
                            let gold = player.gold;
                            if (gold < gold_max && gold > gold_min)
                                robot_num++;
                        }
                    }
                }
                return robot_num;
            };
            for (const key in intoGold) {
                const value = intoGold[key];
                let temp_players_num_Real = fn1(pl_num.REAL_PLAYER, value.gold[0], value.gold[1], false);
                let temp_players_num_Robo = fn1(pl_num.ROBOT, value.gold[0], value.gold[1], true);
                if (temp_players_num_Real + temp_players_num_Robo < value.num) {
                    let num = value.num - (temp_players_num_Real + temp_players_num_Robo);
                    if (allin)
                        num = utils.random(1, 5);
                    for (let i = 0; i < num; i++) {
                        const pl = GetOnePl();
                        this.enterRobotFunc(this.nid, Isystem_room.sceneId, Isystem_room.roomId, this.Mode_IO, pl, value.gold);
                    }
                }
            }
        }
    }
    async simulationbairen_bu_robot() {
        const sceneList = await Scene_manager_1.default.findList({ nid: this.nid });
        for (let sceneInfo of sceneList) {
            let intoGold;
            if (!bairen_gold_Config_1.gold_config[sceneInfo.sceneId]) {
                intoGold = bairen_gold_Config_1.gold_config['0']['intoGold'];
            }
            else {
                intoGold = bairen_gold_Config_1.gold_config[sceneInfo.sceneId]['intoGold'];
            }
            const value = intoGold[0];
            let player = await (0, robotServerController_1.getOneAvailableRobot)();
            if (!player) {
                continue;
            }
            this.enterRobotFunc(this.nid, sceneInfo.sceneId, "roomId", this.Mode_IO, player, value.gold);
        }
    }
}
exports.default = RobotManger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RDb21tb25PcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9yb2JvdFNlcnZpY2Uvb3ZlcmFsbENvbnRyb2xsZXIvcm9ib3RDb21tb25PcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1REFBdUQ7QUFDdkQsZ0ZBQTJFO0FBRTNFLGdFQUFnRTtBQUNoRSx3Q0FBeUM7QUFDekMsdURBQXdEO0FBQ3hELDJFQUF3RTtBQUN4RSwrQ0FBeUM7QUFDekMscUZBQWlGO0FBQ2pGLDhGQUFzRjtBQUN0RixnRkFBMkU7QUFDM0UsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUl2RCwwQ0FBeUM7QUFDekMsb0RBQXlEO0FBQ3pELHVFQUFvRTtBQUNwRSw0RkFBd0Y7QUFDeEYseUZBQStFO0FBS3hFLEtBQUssVUFBVSwyQkFBMkI7SUFDN0MsSUFBSTtRQUVBLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSw4QkFBYSxFQUFFO2FBQ3ZDLFlBQVksRUFBRTthQUNkLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFDaEIsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUNoQixhQUFhLEVBQUUsQ0FBQztRQUVyQixNQUFNLEdBQUcsR0FBRyxNQUFNLDhCQUFtQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELFVBQVUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLEdBQUcsTUFBTSx1QkFBZSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsNERBQTRELEtBQUss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