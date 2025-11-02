import fisheryRobot from "../robot/fisheryrobot";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";
import roomManager from '../../../servers/fishery/lib/FisheryRoomManagerImpl';
import RobotManger, { enterPl } from '../overallController/robotCommonOp';
import { getLogger } from 'pinus-logger';

const logger = getLogger('robot_out', __filename);

export function robotEnterFishery(Mode_IO = false) {
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(GameNidEnum.fishery, Mode_IO, SingleRobotEnter, roomManager.getAllRooms.bind(roomManager));
    robotManger.start();
    return robotManger;
}

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player) {
        return;
    }
    let robot = new fisheryRobot({ Mode_IO, }); //创建一个机器人对象
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        } else {
            robot.enterHallMode(player, nid);
        }

        // 调整金币
        robot.gold = robot.setRobotGoldBeforeEnter(nid, sceneId);
        // 进入游戏
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);

        await robot.loaded();
        robot.registerListener(); //监听所有通知
    } catch (err) {
        logger.warn(`FisheryAdvance.fisherySingleRobotEnter ==> ${err.stack || err.message || err}`);
        robot.destroy();
    }
}