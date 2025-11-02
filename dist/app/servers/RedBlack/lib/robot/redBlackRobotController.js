"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterRedBlack = void 0;
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const events = require("events");
const EventEmitter = events.EventEmitter;
const robotGoldUtil = require("../../../../utils/robot/robotGoldUtil");
const redBlackRobot_1 = require("./redBlackRobot");
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const nid = BairenNidEnum_1.BairenNidEnum.RedBlack;
const RedBlackMgr_1 = require("../RedBlackMgr");
function robotEnterRedBlack(Mode_IO = false) {
    const RoomMgr = RedBlackMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterRedBlack = robotEnterRedBlack;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const redBlackrobot = new redBlackRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        redBlackrobot.gold_min = intoGold_arr[0];
        redBlackrobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await redBlackrobot.enterHall(player, nid);
        }
        else {
            redBlackrobot.enterHallMode(player, nid);
        }
        redBlackrobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await redBlackrobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await redBlackrobot.redBlackLoaded();
        redBlackrobot.registerListener();
    }
    catch (err) {
        robotlogger.warn(`redBlackSingleRobotEnter|uid:${redBlackrobot.uid}|${err.stack || err}`);
        redBlackrobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkQmxhY2tSb2JvdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9SZWRCbGFjay9saWIvcm9ib3QvcmVkQmxhY2tSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxxR0FBeUc7QUFDekcsaUNBQWtDO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsdUVBQXdFO0FBQ3hFLG1EQUE0QztBQUM1QyxrRkFBK0U7QUFFL0UsbUVBQW1FO0FBQ25FLE1BQU0sR0FBRyxHQUFHLDZCQUFhLENBQUMsUUFBUSxDQUFDO0FBRW5DLGdEQUF5QztBQUl6QyxTQUFnQixrQkFBa0IsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUU5QyxNQUFNLE9BQU8sR0FBRyxxQkFBVyxDQUFDO0lBQzVCLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFQRCxnREFPQztBQUFBLENBQUM7QUFHRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsWUFBc0I7SUFDbkksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNULE9BQU87S0FDVjtJQUNELElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sYUFBYSxHQUFHLElBQUksdUJBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdHLElBQUk7UUFDQSxhQUFhLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QyxhQUFhLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUd6QyxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUM7YUFBTTtZQUNMLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzFDO1FBRUgsYUFBYSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFOUQsTUFBTSxhQUFhLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUduRSxNQUFNLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVyQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUNwQztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsV0FBVyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsYUFBYSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDMUYsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzNCO0FBQ0wsQ0FBQyJ9