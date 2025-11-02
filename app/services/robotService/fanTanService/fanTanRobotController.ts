import RobotManger, { enterPl } from '../overallController/robotCommonOp';
import * as robotGoldUtil from '../../../utils/robot/robotGoldUtil';
import FanTanRobot from "../robot/fanTanRobot";
import * as commonUtil from '../../../utils/lottery/commonUtil';
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import roomManager from '../../../servers/fanTan/lib/roomManager';

import { getLogger } from 'pinus-logger';
const logger = getLogger('robot_out', __filename);

export function robotEnterFanTan(Mode_IO = false) {
    // 注册添加机器人事件
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.fanTan, Mode_IO, SingleRobotEnter, roomManager.getAllRooms.bind(roomManager));
    robotManger.start();
    return robotManger;
}
/**单个机器人进入 */
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl, intoGold_arr: number[]) {
    if (!player) {
        return;
    }
    const robot = new FanTanRobot({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    try {
        robot.gold_min = intoGold_arr[0];
        robot.gold_max = intoGold_arr[1];
        // 登录到大厅
        if (Mode_IO) {
            await robot.enterHall(player, nid);
          } else {
            robot.enterHallMode(player, nid);
          }
        // 调整金币
        robot.playerGold = robot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        // 进入游戏
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);

        // 加载
        await robot.load();
        // 监听所有通知
        robot.registerListener();
    } catch (err) {
        logger.warn(`SingleRobotEnter|uid:${robot.uid}|nid:${nid}|roomId:${roomId}|sceneId:${sceneId}|${err.stack || err}`);
        robot.destroy();
    }
}