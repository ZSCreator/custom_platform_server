// 抢庄牛牛进机器人
import events = require('events');
const EventEmitter = events.EventEmitter;
import qznnrobot from "./qznnrobot";
import * as robotConst from "../../../../consts/robotConst";
import RobotManger, { enterPl } from "../../../../services/robotService/overallController/robotCommonOp";
import { getLogger } from 'pinus-logger';
import { GameNidEnum } from '../../../../common/constant/game/GameNidEnum';
const robotlogger = getLogger('robot_out', __filename);
const nid = GameNidEnum.qznn;

import qznnMgr from '../qznnMgr';

export function robotEnterQznn(Mode_IO = false) {

    const RoomMgr = qznnMgr;
    const robotManger = new RobotManger();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
};

async function SingleRobotEnter(nid: string, sceneId: number, roomId: string, Mode_IO: boolean, player: enterPl) {
    if (!player)
        return;
    const qznnRobot = new qznnrobot({Mode_IO,}); //创建一个机器人对象
    try {
        // 登录到大厅
        if (Mode_IO) {
            await qznnRobot.enterHall(player, nid);
          } else {
            qznnRobot.enterHallMode(player, nid);
          }
        // 调整金币
        qznnRobot.setRobotGoldBeforeEnter(nid, sceneId);

        await qznnRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await qznnRobot.loaded();

        qznnRobot.registerListener(); //监听所有通知
    } catch (err) {
        robotlogger.debug(`zqnnAdvance.qznnSingleRobotEnter ==> ${JSON.stringify(err)}`);
        qznnRobot.destroy();
    }
}
