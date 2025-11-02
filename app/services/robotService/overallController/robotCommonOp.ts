import * as hallConst from '../../../consts/hallConst';
import RobotManagerDao from "../../../common/dao/daoManager/Robot.manager";
import JsonMgr = require('../../../../config/data/JsonMgr');
import * as commonUtil from '../../../utils/lottery/commonUtil';
import utils = require('../../../utils');
import JsonConfig = require("../../../pojo/JsonConfig");
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import { getLogger } from 'pinus-logger';
import { PlayerBuilder } from "../../../common/dao/mysql/builder/Player.builder";
import SystemConfigManager from "../../../common/dao/daoManager/SystemConfig.manager";
import SceneManagerDao from "../../../common/dao/daoManager/Scene.manager";
const robotlogger = getLogger('robot_out', __filename);
import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { BairenNidEnum } from '../../../common/constant/game/BairenNidEnum';
import { getHead } from "../../../utils";
import { createPlayerUid } from "../../../utils/general";
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { getOneAvailableRobot } from '../../../servers/robot/lib/robotServerController';
import { gold_config } from "../../../../config/data/robot/bairen_gold_Config";



/**  创建机器人 user/player 的接口*/
export async function createUserAndPlayerForRobot() {
    try {
        // 创建 player 参数
        const playerImpl = await new PlayerBuilder()
            .createPlayer()
            .setGuestId(null)
            .setPlayerRole(2)
            .getPlayerImpl();

        const cfg = await SystemConfigManager.findOne({ id: 1 });
        playerImpl.gold = cfg.startGold || 0;
        const p = await RobotManagerDao.insertOne(playerImpl);
        return Promise.resolve(p);
    } catch (error) {
        robotlogger.warn(`robotCommonOp.createUserAndPlayerForRobot ==> 创建机器人账户失败: ${error.stack || error.message || error}`);
        return Promise.resolve(null);
    }
};
export function GetOnePl() {
    const uid = createPlayerUid(7);
    const headurl = getHead();
    // const guestid = generateID();
    const isRobot = RoleEnum.ROBOT;
    return {
        uid,
        nickname: `P${uid}`,
        headurl,
        // guestid,
        isRobot,
        sid: "robot",
        gold: 0
    }
}

export interface enterPl {
    uid?: string;
    guestid?: string;
    nickname?: string;
    headurl?: string;
    isRobot?: RoleEnum;
    sid?: string;
};
type IenterRobotFunc = (nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr?: number[]) => void;

type IgetRoomList = () => SystemRoom<PlayerInfo>[];
export default class RobotManger {
    public nid: string = '';
    enterRobotFunc: IenterRobotFunc = null;
    getRoomList: IgetRoomList = null;
    setInterval: NodeJS.Timeout = null;
    allRobotConfig: JsonConfig.robotConfigInterface[];
    robotRoomnum: { [key: string]: { maxCount: number, addTime: number } } = {}
    updateNum = 0;
    //true是IO模式
    Mode_IO: boolean;
    //bairen reshtime
    RefreshTime = 0;//秒;
    registerAddRobotListener(nid: string, Mode_IO: boolean, enterRobotFunc: IenterRobotFunc, getRoomList: IgetRoomList) {
        this.nid = nid;
        this.Mode_IO = Mode_IO;
        this.getRoomList = getRoomList;
        this.enterRobotFunc = enterRobotFunc;
    };
    start() {
        this.allRobotConfig = JsonConfig.get_all_robotStatus();
        if (!this.allRobotConfig.length) {
            return;
        }
        // 游戏的机器人配置
        let robotConfig = commonUtil.getArrayMember(this.allRobotConfig, 'nid', this.nid);
        if (!robotConfig || !robotConfig.nid) {
            return;
        }
        clearInterval(this.setInterval);
        if (this.Mode_IO == false) {
            this.setInterval = setInterval(() => {
                this.RobotNumMonitor();
                this.updateNum++;
                if (this.updateNum == 2000) {//周期删除过期数据
                    const Now = Math.round(new Date().getTime() / 1000);//秒
                    for (const key in this.robotRoomnum) {
                        if (Now - this.robotRoomnum[key].addTime > 10 * 60) {
                            delete this.robotRoomnum[key];
                        }
                    }
                    this.updateNum = 0;
                }
            }, 1000);
        } else {
            this.setInterval = setInterval(() => {
                this.simulationNumMonitor();
            }, 10 * 1000);
        }
    }
    stop() {
        clearInterval(this.setInterval);
        this.setInterval = null;
    }
    //对战随机进入多少人
    getRanomByCount(maxCount: number) {
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
            sum = sum - weights[weightIndex]
            if (sum < compareWeight) {
                return weightIndex + 1;
            }
            weightIndex = weightIndex + 1;
        }
    }
    /**开始机器人数量监测，根据设置的时间间隔补机器人 */
    async RobotNumMonitor() {
        try {
            let robotConfig = commonUtil.getArrayMember(this.allRobotConfig, 'nid', this.nid);
            if (!robotConfig || !robotConfig.nid) {
                return;
            }

            if (hallConst.BAIREN_SCENE_ID.includes(this.nid)) {//百人类型 拿出来 单独处理
                this.bairen_bu_robot();
            } else {//对战类游戏
                let roomList = this.getRoomList();
                for (let Isystem_room of roomList) {
                    // 房间中当前机器人的数量
                    const real_pl_num = Isystem_room.players.filter(c => c && c.isRobot == 0).length;
                    const robot_pl_num = Isystem_room.players.filter(c => c && c.isRobot == 2).length;
                    if (!robotConfig.fenscene.includes(Isystem_room.sceneId)) {
                        continue;
                    }
                    if (real_pl_num == 0) {
                        continue;
                    }
                    if (Isystem_room["status"] != "INWAIT" && Isystem_room["status"] != "NONE") {
                        if (this.nid !== GameNidEnum.andarBahar)
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

                        /**至少留一个位置给AI */
                        if (robot_pl_num == 0) {
                            isAdd = true;
                        }
                        //这是满员开局的游戏
                        if (this.nid == GameNidEnum.Erba ||
                            this.nid == GameNidEnum.qznnpp ||
                            this.nid == GameNidEnum.LuckyDice ||
                            this.nid == GameNidEnum.land ||
                            this.nid == GameNidEnum.DicePoker ||
                            this.nid == GameNidEnum.qzpj) {
                            isAdd = (robot_pl_num + real_pl_num) < Isystem_room.maxCount;
                        }
                    } while (0);
                    if (isAdd) {
                        // console.warn('33333添加瓦加',)
                        const pl = GetOnePl();
                        this.enterRobotFunc(this.nid, Isystem_room.sceneId, Isystem_room.roomId, this.Mode_IO, pl);
                    }
                }
            }
        } catch (error) {
            robotlogger.warn(`robotNumMonitor|error|${this.nid}|${error.stack || error}`);
        }
    }

    async simulationNumMonitor() {
        try {
            if (hallConst.BAIREN_SCENE_ID.includes(this.nid)) {//百人类型 拿出来 单独处理
                this.simulationbairen_bu_robot();
            } else {//对战类游戏
                const sceneList = await SceneManagerDao.findList({ nid: this.nid });
                for (let sceneInfo of sceneList) {
                    let player: enterPl = await getOneAvailableRobot();
                    if (!player) {
                        continue;
                    }
                    this.enterRobotFunc(this.nid, sceneInfo.sceneId, "", this.Mode_IO, player);
                }
            }
        } catch (error) {
            robotlogger.warn(`robotNumMonitor|error|${this.nid}|${error.stack || error}`);
        }
    }
    /**
    allin:true则一次进满
    */
    async bairen_bu_robot(allin = false) {
        let roomList = this.getRoomList();
        if (!roomList.length) {
            return;
        }

        for (let Isystem_room of roomList) {
            // const pl_num = await PlayersInRoomDao.count(pinus.app.getServerId(), Isystem_room.roomId);
            const pl_num: { REAL_PLAYER: string[], ROBOT: string[] } = { REAL_PLAYER: [], ROBOT: [] };
            for (const pl of Isystem_room.players) {
                if (pl && pl.isRobot == 0) {
                    pl_num.REAL_PLAYER.push(pl.uid);
                } else if (pl && pl.isRobot == 2) {
                    pl_num.ROBOT.push(pl.uid);
                }
            }
            // let players = Isystem_room.users;//.filter(m => m && m.isRobot == 2);
            if ((pl_num.ROBOT.length + pl_num.REAL_PLAYER.length) >= 35) {
                continue;
            }
            const Now = Math.round(new Date().getTime() / 1000);//秒;
            if (Now - this.RefreshTime >= 10 * 60) {
                this.RefreshTime = Now;
                for (const intoGold of gold_config) {
                    for (const It of intoGold.intoGold) {
                        It.num = commonUtil.randomFromRange(It.limits[0], It.limits[1]);//根据配置随机一个玩家num值
                    }
                }
            }
            // 房间中当前机器人的数量
            let intoGold = gold_config[0].intoGold;
            if (!gold_config[Isystem_room.sceneId]) {
                intoGold = gold_config[0].intoGold;
            } else {
                intoGold = gold_config[Isystem_room.sceneId]['intoGold'];
            }
            const fn1 = (users: any[], gold_min: number, gold_max: number, isROBOT: boolean) => {
                let robot_num = 0;
                for (const user of users) {
                    if (isROBOT) {
                        const player = Isystem_room.players.find(c => c && c.uid == user && c.isRobot == 2);
                        if (player) {
                            let gold = player.gold;
                            if (gold < gold_max && gold > gold_min)
                                robot_num++;
                        }
                    } else {
                        const player = Isystem_room.players.find(c => c && c.uid == user && c.isRobot == 0);
                        if (player) {
                            let gold = player.gold;
                            if (gold < gold_max && gold > gold_min)
                                robot_num++;
                        }
                    }
                }
                return robot_num;
            }

            for (const key in intoGold) {
                const value = intoGold[key];
                let temp_players_num_Real = fn1(pl_num.REAL_PLAYER, value.gold[0], value.gold[1], false);//金币范围内的玩家
                let temp_players_num_Robo = fn1(pl_num.ROBOT, value.gold[0], value.gold[1], true);//金币范围内的玩家
                if (temp_players_num_Real + temp_players_num_Robo < value.num) {//玩家数量小于设置的最小值 拉一个ai进来
                    let num = value.num - (temp_players_num_Real + temp_players_num_Robo);
                    // if (num > 3) num = 3;//一个房间最多一次加5个人，防止 一个房间时间太久，其他房间 很长时间没人
                    if (allin) num = utils.random(1, 5);
                    for (let i = 0; i < num; i++) {
                        const pl = GetOnePl();
                        this.enterRobotFunc(this.nid, Isystem_room.sceneId, Isystem_room.roomId, this.Mode_IO, pl, value.gold);
                    }
                }
            }
        }
    }
    /**
    allin:true则一次进满
    */
    async simulationbairen_bu_robot() {
        const sceneList = await SceneManagerDao.findList({ nid: this.nid });
        for (let sceneInfo of sceneList) {
            let intoGold: any[];
            if (!gold_config[sceneInfo.sceneId]) {
                intoGold = gold_config['0']['intoGold'];
            } else {
                intoGold = gold_config[sceneInfo.sceneId]['intoGold'];
            }
            const value = intoGold[0];

            let player: enterPl = await getOneAvailableRobot();
            if (!player) {
                continue;
            }
            this.enterRobotFunc(this.nid, sceneInfo.sceneId, "roomId", this.Mode_IO, player, value.gold);
        }
    }
}

// export default new RobotManger();
