"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterSicbo = void 0;
const sicboRobot_1 = require("./sicboRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
const robotGoldUtil = require("../../../../utils/robot/robotGoldUtil");
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const nid = BairenNidEnum_1.BairenNidEnum.SicBo;
const SicBoRoomMgr_1 = require("../SicBoRoomMgr");
function robotEnterSicbo(Mode_IO = false) {
    const RoomMgr = SicBoRoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterSicbo = robotEnterSicbo;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const sicboRobot = new sicboRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        sicboRobot.gold_min = intoGold_arr[0];
        sicboRobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await sicboRobot.enterHall(player, nid);
        }
        else {
            sicboRobot.enterHallMode(player, nid);
        }
        sicboRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await sicboRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await sicboRobot.sicboLoaded();
        sicboRobot.registerListener();
    }
    catch (error) {
        robotlogger.warn(`sicboSingleRobotEnter|${nid}|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        sicboRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ljYm9TdGFydFNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1NpY0JvL2xpYi9yb2JvdC9zaWNib1N0YXJ0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsNkNBQXNDO0FBQ3RDLHFHQUF5RztBQUN6RywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDO0FBQ3BELHVFQUF3RTtBQUN4RSxrRkFBK0U7QUFDL0UsbUVBQW1FO0FBQ25FLE1BQU0sR0FBRyxHQUFHLDZCQUFhLENBQUMsS0FBSyxDQUFDO0FBRWhDLGtEQUEyQztBQUkzQyxTQUFnQixlQUFlLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDM0MsTUFBTSxPQUFPLEdBQUcsc0JBQVksQ0FBQztJQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsMENBTUM7QUFBQSxDQUFDO0FBQ0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFlBQXNCO0lBQ25JLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFDRCxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxNQUFNLFVBQVUsR0FBRyxJQUFJLG9CQUFVLENBQUMsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2RyxJQUFJO1FBQ0EsVUFBVSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsVUFBVSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDTCxVQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN2QztRQUVILFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTNELE1BQU0sVUFBVSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFaEUsTUFBTSxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDakM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxPQUFPLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9GLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4QjtBQUNMLENBQUMifQ==