'use strict';

// 各个服务器开始进入机器人
import { pinus } from 'pinus';
import * as robotConst from '../../../consts/robotConst';
import bullFightStartServer = require('../../bairen/lib/robot/BRNNStartServer');
import bjStartServer = require('../../baijia/lib/robot/baiJiaStartServer');
import RobotManger, { enterPl } from "../../../services/robotService/overallController/robotCommonOp";
import BlackJackController = require('../../BlackJack/lib/robot/BlackJackController');
import dzpipeiAdvance = require('../../DZpipei/lib/robot/DZpipeiController');
import sicboStartServer = require('../../SicBo/lib/robot/sicboStartServer');
import zhaJinHuaRobotController = require('../../GoldenFlower/lib/robot/GoldenFlowerRobotController');
import TeenPatti_Controller = require("../../TeenPatti/lib/robot/TeenPatti_Controller");
import baicaoRobotController = require("../../baicao/lib/robot/baicaoRobotController");
import dragonTigerRobotController = require('../../DragonTiger/lib/robot/dragonTigerRobotController');
import redBlackRobotController = require('../../RedBlack/lib/robot/redBlackRobotController');
import ErbaStartServer = require('../../Erba/lib/robot/ErbaStartServer');
import chinesePokerRobotController = require('../../chinese_poker/lib/robot/cpRobotController');
import up7RobotController = require("../../7up7down/lib/robot/up7RobotController");
import benzRobotController = require("../../BenzBmw/lib/robot/benzRobotController");
import BlackGameStartServer = require("../../BlackGame/lib/robot/BlackGameStartServer");
import FCS_Controller = require("../../FiveCardStud/lib/robot/FCS_Controller");
import sanGongRobotController = require('../../sangong/lib/robot/sanGongRobotController');
import MJ_Controller = require("../../MJ/lib/robot/MJ_Controller");
import ttzBankerStartServer = require('../../bairenTTZ/lib/robot/ttzBankerStartServer');
import fisheryStart = require('../../../services/robotService/fishery/fisheryController');
import qznnController = require('../../qznn/lib/robot/qznnController');
import qznnppController = require('../../qznnpp/lib/robot/qznnppController');
import buyuRobotController = require('../../buyu/lib/robot/buyuRobotController');
import WanRenJHstartServer = require('../../WanRenJH/lib/robot/WanRenJHstartServer');
import DiceStartServer = require('../../DicePoker/lib/robot/DiceStartServer');
import douDiZhuRobotController = require('../../land/lib/robot/landRobotController');
import colorPlateRobotController = require('../../../services/robotService/colorPlate/colorPlateRobotController');
import andarBaharRobotController = require('../../../services/robotService/andarBahar/andarBaharRobotController');
import RummyRobotController = require('../../../services/robotService/Rummy/RummyRobotController');
import redPacketRobotService = require('../../redPacket/lib/redPacketRobotService');
import ldRobotController = require('../../LuckyDice/lib/robot/ldRobotController');
import qzpjController = require('../../qzpj/lib/robot/qzpjController');
import JsonConfig = require("../../../pojo/JsonConfig")
import { GameNidEnum } from '../../../common/constant/game/GameNidEnum';
import GameMangerDao from '../../../common/dao/daoManager/Game.manager';
import { RoleEnum } from '../../../common/constant/player/RoleEnum';
import { getLogger } from 'pinus-logger';
import { robotEnterFanTan } from "../../../services/robotService/fanTanService/fanTanRobotController";
import redisManager = require('../../../common/dao/redis/lib/redisManager');
const robotlogger = getLogger('robot_out', __filename);
import { GetAllSpPl, createTestPlayer } from "./AiAutoCreat";




/**机器人启动提示 */
export let robot_run: { [nid: string]: { nid: string, run: boolean, robotManger?: RobotManger } } = {};
export const robot_Controller = {
    async start() {
        return await redisManager.setObjectIntoRedisNoExpiration("robot:Controller", 1).catch(error => {
        });
    },
    async get() {
        return await redisManager.getObjectFromRedis("robot:Controller");
    },
    async stop() {
        return await redisManager.setObjectIntoRedisNoExpiration("robot:Controller", 0).catch(error => {
        });
    },
};

/** 获取所有可用的机器人*/
export async function getAllAvailableRobot(): Promise<any[]> {
    return await redisManager.getAllFromSet(robotConst.AVAILABLE_ROBOT_SET);
};
/**
回收机器人
*/
export async function increaseAvailableRobot(guestid: string) {
    let ret = await redisManager.storeInSet(robotConst.AVAILABLE_ROBOT_SET, guestid).catch(error => {
        robotlogger.warn(`robotCommonOp.increaseAvailableRobot|${error.stack || error.message || error}`)
    });
};
/** 获取一个可用机器人 */
export async function getOneAvailableRobot() {
    let guestid: string = await redisManager.spop(robotConst.AVAILABLE_ROBOT_SET);
    if (guestid) {
        return { guestid };
    }
    return null;
};

/**
 * 初始化特定 平台租户玩家
 */
export async function inventoryRobots() {
    try {
        const allRobotPlayer = await GetAllSpPl();

        if (!Array.isArray(allRobotPlayer)) {
            return;
        }

        /**遍历所有机器人,不在线的 放入 队列 */
        for (const guestid of allRobotPlayer) {
            await increaseAvailableRobot(guestid);
        }
        return allRobotPlayer;
    } catch (error) {
        return Promise.reject(error.stack)
    }
};

/**清点机器人、检查昵称、分配机器人进入到各个游戏 */
export async function afterRobotServerStarted() {
    try {
        //删除集合
        await redisManager.deleteKeyFromRedis(robotConst.AVAILABLE_ROBOT_SET);
        // TAG: 执行addTestPlayer.js 脚本 不要在启动时创建
        // await createTestPlayer();
        // 将所有可用的机器人放入到内存
        await inventoryRobots();
        let allRobot = await getAllAvailableRobot();
        robotlogger.warn(`${pinus.app.getServerId()}|allRobot.length:${allRobot.length}`);
        await robot_Controller.start();
    } catch (error) {
        robotlogger.warn(`robotServerController.afterRobotServerStarted|${error}`);
    }
};

export function start_robot_server(nid: string, Mode_IO = false, delay: number = 5 * 1000) {
    setTimeout(async () => {
        if (robot_run[nid]) {
            robot_run[nid].robotManger.start();
            return;
        }
        let starting = await robot_Controller.get();
        if (starting == 1) {
            robot_run[nid] = { nid, run: true };
            let allRobotConfig = JsonConfig.get_all_robotStatus();
            for (let oneRobotConfig of allRobotConfig) {
                // 配置开启机器人，才添加机器人
                if (oneRobotConfig.open && oneRobotConfig.nid == nid) {
                    robot_run[nid].robotManger = await robotEnterEachGameEx(oneRobotConfig.nid, Mode_IO);
                    break;
                }
            }
        } else {
            start_robot_server(nid, Mode_IO, 1000);
        }
    }, delay);//防止hall还没启动，延迟60s在启动机器人
}

export function stop_robot_server(nid: string,) {
    if (!robot_run[nid]) {
        return;
    }
    robot_run[nid].robotManger.stop();
}

export async function robotEnterEachGameEx(nid: string, Mode_IO = false) {
    const game = await GameMangerDao.findOne({ nid });
    if (!game) {
        return null;
    }
    switch (nid) {
        // case GameNidEnum.DicePoker:
        //     return DiceStartServer.robotEnterDiceZhuang(Mode_IO);
        //     break;
        // case GameNidEnum.baicao:
        //     return baicaoRobotController.robotEnterSanGong(Mode_IO);
        //     break;
        // case GameNidEnum.up7down:
        //     return up7RobotController.robotEnterSicbo(Mode_IO);
        //     break;
        // case GameNidEnum.FiveCardStud:
        //     return FCS_Controller.robotEnterDZ(Mode_IO);
        //     break;
        // case GameNidEnum.buyu:
        //     return buyuRobotController.robotEnterbuyu(Mode_IO);
        //     break;
        // case GameNidEnum.baijia:
        //     return bjStartServer.robotEnterBaijia(Mode_IO);
        //     break;
        // case "9":
        // case GameNidEnum.bairen:
        //     return bullFightStartServer.robotEnterBRNN(Mode_IO);
        //     break;
        // case GameNidEnum.mj:
        //     return MJ_Controller.robotEnter(Mode_IO);
        //     break;
        // case GameNidEnum.BenzBmw:
        //     return benzRobotController.robotEnterBenzBmw(Mode_IO);
        //     break;
        // case GameNidEnum.qzpj:
        //     return qzpjController.robotEnterQznn(Mode_IO);
        //     break;
        // case GameNidEnum.TeenPatti:
        //     return TeenPatti_Controller.robotEnter(Mode_IO);
        //     break;
        // case GameNidEnum.BlackJack:
        //     return BlackJackController.robotEnterDot(Mode_IO);
        //     break;
        // case GameNidEnum.Erba:
        //     return ErbaStartServer.robotEnterErbaZhuang(Mode_IO);
        //     break;
        // case GameNidEnum.RedBlack:
        //     return redBlackRobotController.robotEnterRedBlack(Mode_IO);
        //     break;
        // case GameNidEnum.GoldenFlower:
        //     return zhaJinHuaRobotController.robotEnterZhaJinHua(Mode_IO);
        //     break;
        // case GameNidEnum.LuckyDice:
        //     return ldRobotController.handleDouDiZhuRobot(Mode_IO);
        //     break;
        // case GameNidEnum.BlackGame:
        //     return BlackGameStartServer.robotEnterTTZZhuang(Mode_IO);
        //     break;
        // case GameNidEnum.qznnpp:
        //     return qznnppController.robotEnterQznn(Mode_IO);
        //     break;
        // case GameNidEnum.dzpipei:
        //     return dzpipeiAdvance.robotEnterDZ(Mode_IO);
        //     break;
        // case GameNidEnum.DragonTiger:
        //     return dragonTigerRobotController.robotEnterDragonTiger(Mode_IO);
        //     break;
        // case GameNidEnum.SicBo:
        //     return sicboStartServer.robotEnterSicbo(Mode_IO);
        //     break;
        // case GameNidEnum.ChinesePoker:
        //     return chinesePokerRobotController.robotEnterChinesePoke(Mode_IO);
        //     break;
        // case GameNidEnum.sangong:
        //     return sanGongRobotController.robotEnterSanGong(Mode_IO);
        //     break;
        // case GameNidEnum.qznn:
        //     return qznnController.robotEnterQznn(Mode_IO);
        //     break;
        // case '48':
        //     // ttzStartServer.robotEnterTTZ();
        //     break;
        // case GameNidEnum.bairenTTZ:
        //     return ttzBankerStartServer.robotEnterTTZZhuang(Mode_IO);
        //     break;
        // case GameNidEnum.land:
        //     return douDiZhuRobotController.handleDouDiZhuRobot(Mode_IO);
        //     break;
        // case GameNidEnum.fishery:
        //     return fisheryStart.robotEnterFishery(Mode_IO);
        //     break;
        // case GameNidEnum.WanRenJH:
        //     return WanRenJHstartServer.robotEnterWanRenJinHua(Mode_IO);
        //     break;
        // case GameNidEnum.redPacket:
        //     return redPacketRobotService.robotEntry(Mode_IO);
        //     break;
        // case GameNidEnum.colorPlate:
        //     return colorPlateRobotController.robotEnterColorPlate(Mode_IO);
        //     break;
        // case GameNidEnum.andarBahar:
        //     return andarBaharRobotController.robotEnterAndarBahar(Mode_IO);
        //     break;
        // case GameNidEnum.Rummy:
        //     return RummyRobotController.robotEnterAndRummy(Mode_IO);
        //     break;
        // case GameNidEnum.fanTan:
        //     return robotEnterFanTan(Mode_IO);
            // break;
        default:
            robotlogger.warn(`robotServerController.robotEnterEachGame|游戏 nid 错误：${nid}`);
            return null;
    }
}
