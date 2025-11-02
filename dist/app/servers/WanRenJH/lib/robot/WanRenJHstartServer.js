"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterWanRenJinHua = void 0;
const wrjhRobot_1 = require("./wrjhRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const events = require("events");
const EventEmitter = events.EventEmitter;
const commonUtil = require("../../../../utils/lottery/commonUtil");
const WanrenMgr_1 = require("../WanrenMgr");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
function robotEnterWanRenJinHua(Mode_IO = false) {
    const RoomMgr = WanrenMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.WanRenJH, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterWanRenJinHua = robotEnterWanRenJinHua;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player)
        return;
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    let wrjhRobot = new wrjhRobot_1.default({ Mode_IO, });
    try {
        wrjhRobot.gold_min = intoGold_arr[0];
        wrjhRobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await wrjhRobot.enterHall(player, nid);
        }
        else {
            wrjhRobot.enterHallMode(player, nid);
        }
        wrjhRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await wrjhRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await wrjhRobot.loaded();
        wrjhRobot.registerListener();
    }
    catch (error) {
        robotlogger.warn(`WanRenJinHuaStartServer.wrJinHuaSingleRobotEnter ==> ${error.stack || error.message || JSON.stringify(error)}`);
        wrjhRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FuUmVuSkhzdGFydFNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1dhblJlbkpIL2xpYi9yb2JvdC9XYW5SZW5KSHN0YXJ0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsMkNBQXdDO0FBQ3hDLHFHQUF5RztBQUN6RywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxpQ0FBa0M7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN6QyxtRUFBbUU7QUFHbkUsNENBQXFDO0FBQ3JDLDhFQUEyRTtBQUkzRSxTQUFnQixzQkFBc0IsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUNsRCxNQUFNLE9BQU8sR0FBRyxtQkFBUyxDQUFDO0lBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN6SCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQU5ELHdEQU1DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWUsRUFBRSxZQUFzQjtJQUNuSSxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU87SUFDcEIsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUUsSUFBSSxTQUFTLEdBQUcsSUFBSSxtQkFBYSxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJO1FBQ0EsU0FBUyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsU0FBUyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUVILFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTFELE1BQU0sU0FBUyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDL0QsTUFBTSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekIsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDaEM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0RBQXdELEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsSSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7QUFDTCxDQUFDIn0=