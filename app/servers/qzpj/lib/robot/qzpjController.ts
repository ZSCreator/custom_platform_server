// 抢庄牌九进机器人
import qzpjrobot from "./qzpjRobot";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../../../common/constant/game/GameNidEnum';
const robotlogger = getLogger('robot_out', __filename);
const nid = GameNidEnum.qzpj;

import qzpjMgr from '../qzpjMgr';

export function robotEnterQznn(Mode_IO = false) {

    const RoomMgr = qzpjMgr;
    const robotManger = new RobotManger();
    // robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    // robotManger.start();
    return robotManger;
};

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player)
        return;
    const qzpjRobot = new qzpjrobot({Mode_IO,}); //创建一个机器人对象
    try {
        // 登录到大厅
        if (Mode_IO) {
            await qzpjRobot.enterHall(player, nid);
          } else {
            qzpjRobot.enterHallMode(player, nid);
          }
        // 调整金币
        qzpjRobot.setRobotGoldBeforeEnter(nid, sceneId);

        await qzpjRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await qzpjRobot.loaded();

        qzpjRobot.registerListener(); //监听所有通知
    } catch (err) {
        robotlogger.debug(`zqnnAdvance.qzpjSingleRobotEnter ==> ${JSON.stringify(err)}`);
        qzpjRobot.destroy();
    }
}
