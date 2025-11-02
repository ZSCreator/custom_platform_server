"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterErbaZhuang = void 0;
const ErbaRobot_1 = require("./ErbaRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const nid = GameNidEnum_1.GameNidEnum.Erba;
const ErbaRoomMgr_1 = require("../ErbaRoomMgr");
function robotEnterErbaZhuang(Mode_IO = false) {
    const RoomMgr = ErbaRoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterErbaZhuang = robotEnterErbaZhuang;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const ErbaRobot_ = new ErbaRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await ErbaRobot_.enterHall(player, nid);
        }
        else {
            ErbaRobot_.enterHallMode(player, nid);
        }
        ErbaRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        await ErbaRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        await ErbaRobot_.ErbaLoaded();
        ErbaRobot_.registerListener();
    }
    catch (error) {
        robotlogger.warn(`Erba|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        ErbaRobot_.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXJiYVN0YXJ0U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRXJiYS9saWIvcm9ib3QvRXJiYVN0YXJ0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsMkNBQW9DO0FBQ3BDLHFHQUF5RztBQUN6RywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDO0FBSXBELDhFQUEyRTtBQUMzRSxNQUFNLEdBQUcsR0FBRyx5QkFBVyxDQUFDLElBQUksQ0FBQztBQUU3QixnREFBeUM7QUFHekMsU0FBZ0Isb0JBQW9CLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDaEQsTUFBTSxPQUFPLEdBQUcscUJBQVcsQ0FBQztJQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsb0RBTUM7QUFBQSxDQUFDO0FBQ0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUMzRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBR0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUM3QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3pDO2FBQU07WUFDTCxVQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN2QztRQUVILFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFakQsTUFBTSxVQUFVLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRSxNQUFNLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUU5QixVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUNqQztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkUsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3hCO0FBQ0wsQ0FBQyJ9