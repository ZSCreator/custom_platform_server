import RobotManger, { enterPl } from "../overallController/robotCommonOp";
import * as robotGoldUtil from '../../../utils/robot/robotGoldUtil';
import AndarBaharRobot from "../robot/andarBaharRobot";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import roomManager from '../../../servers/andarBahar/lib/roomManager';

import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);

export function robotEnterAndarBahar(Mode_IO = false) {
    // 注册添加机器人事件
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.andarBahar, Mode_IO, SingleRobotEnter, roomManager.getAllRooms.bind(roomManager));
    robotManger.start();
    return robotManger;
}


/**单个机器人进入 */
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    const robot = new AndarBaharRobot({ Mode_IO,betLowLimit: robotGoldUtil.getBetLowLimit(GameNidEnum.andarBahar, sceneId) });

    try {

        if (Mode_IO) {
            await robot.enterHall(player, nid);
        } else {
            robot.enterHallMode(player, nid);
        }

        // 调整金币
        robot.playerGold = robot.setRobotGoldBeforeEnter(GameNidEnum.andarBahar, sceneId);
        // 进入游戏
        await robot.enterGameOrSelectionList(GameNidEnum.andarBahar, sceneId, roomId);
        // 加载
        await robot.load();
        // 监听所有通知
        robot.registerListener();
    } catch (err) {
        logger.warn(`SingleRobotEnter|uid:${robot.uid}|nid:${GameNidEnum.andarBahar}|roomId:${roomId}|sceneId:${sceneId}|${err.stack || err}`);
        robot.destroy();
    }
}