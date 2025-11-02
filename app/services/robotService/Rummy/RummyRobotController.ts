import RobotManger, { enterPl } from "../overallController/robotCommonOp";
import * as robotGoldUtil from '../../../utils/robot/robotGoldUtil';
import RummyRobot from "../../../servers/Rummy/robot/RummyRobot";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import roomManager from '../../../servers/Rummy/lib/RummyRoomManager';



export function robotEnterAndRummy(Mode_IO = false) {
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.Rummy, Mode_IO, SingleRobotEnter, roomManager.getAllRooms.bind(roomManager));
    robotManger.start();
    return robotManger;
};

/**单个机器人进入 */
async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    const robot = new RummyRobot({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(GameNidEnum.Rummy, sceneId) });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        } else {
            robot.enterHallMode(player, nid);
        }

        // 调整金币
        robot.playerGold = robot.setRobotGoldBeforeEnter(GameNidEnum.Rummy, sceneId);
        // 进入游戏
        await robot.enterGameOrSelectionList(GameNidEnum.Rummy, sceneId, roomId);
        // 加载
        await robot.load();
        // 监听所有通知
        robot.registerListener();
    } catch (err) {
        robot.destroy();
    }
}