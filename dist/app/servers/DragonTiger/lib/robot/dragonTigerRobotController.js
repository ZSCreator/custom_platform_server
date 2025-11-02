"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterDragonTiger = void 0;
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const robotGoldUtil = require("../../../../utils/robot/robotGoldUtil");
const dragonTigerRobot_1 = require("./dragonTigerRobot");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const events = require("events");
const EventEmitter = events.EventEmitter;
const nid = BairenNidEnum_1.BairenNidEnum.DragonTiger;
const DragonTigerRoomMangerImpl_1 = require("../DragonTigerRoomMangerImpl");
function robotEnterDragonTiger(Mode_IO = false) {
    const RoomMgr = DragonTigerRoomMangerImpl_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterDragonTiger = robotEnterDragonTiger;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const dragonTigerRobot = new dragonTigerRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        dragonTigerRobot.gold_min = intoGold_arr[0];
        dragonTigerRobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await dragonTigerRobot.enterHall(player, nid);
        }
        else {
            dragonTigerRobot.enterHallMode(player, nid);
        }
        dragonTigerRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await dragonTigerRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await dragonTigerRobot.dragonTigerLoaded();
        dragonTigerRobot.registerListener();
    }
    catch (err) {
        robotlogger.warn(`dragonTigerRobotController|uid:${dragonTigerRobot.uid}|${JSON.stringify(err)}`);
        dragonTigerRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZ29uVGlnZXJSb2JvdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EcmFnb25UaWdlci9saWIvcm9ib3QvZHJhZ29uVGlnZXJSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYixxR0FBeUc7QUFDekcsdUVBQXdFO0FBQ3hFLHlEQUFrRDtBQUNsRCxtRUFBbUU7QUFDbkUsa0ZBQStFO0FBQy9FLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELGlDQUFrQztBQUNsQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBRXpDLE1BQU0sR0FBRyxHQUFHLDZCQUFhLENBQUMsV0FBVyxDQUFDO0FBR3RDLDRFQUFxRTtBQUdyRSxTQUFnQixxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUNqRCxNQUFNLE9BQU8sR0FBRyxtQ0FBeUIsQ0FBQztJQUMxQyxNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsc0RBTUM7QUFBQSxDQUFDO0FBRUYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFlBQXNCO0lBQ25JLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFDRCxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxNQUFNLGdCQUFnQixHQUFHLElBQUksMEJBQWdCLENBQUMsRUFBRSxPQUFPLEVBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuSCxJQUFJO1FBQ0EsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVDLElBQUksT0FBTyxFQUFFO1lBQ1QsTUFBTSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDTCxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzdDO1FBRUgsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVqRSxNQUFNLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFHdEUsTUFBTSxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRTNDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDdkM7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM5QjtBQUNMLENBQUMifQ==