"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterTTZZhuang = void 0;
const BGRobot_1 = require("./BGRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const nid = GameNidEnum_1.GameNidEnum.BlackGame;
const BGRoomManager_1 = require("../BGRoomManager");
function robotEnterTTZZhuang(Mode_IO = false) {
    const RoomMgr = BGRoomManager_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterTTZZhuang = robotEnterTTZZhuang;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const BlackGameRobot = new BGRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await BlackGameRobot.enterHall(player, nid);
        }
        else {
            BlackGameRobot.enterHallMode(player, nid);
        }
        BlackGameRobot.setRobotGoldBeforeEnter(nid, sceneId);
        await BlackGameRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await BlackGameRobot.ttzLoaded();
        BlackGameRobot.registerListener();
    }
    catch (error) {
        robotlogger.warn(`BlackGame|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        BlackGameRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tHYW1lU3RhcnRTZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0dhbWUvbGliL3JvYm90L0JsYWNrR2FtZVN0YXJ0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsdUNBQWdDO0FBQ2hDLHFHQUF5RztBQUN6RywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDO0FBRXBELDhFQUEyRTtBQUUzRSxNQUFNLEdBQUcsR0FBRyx5QkFBVyxDQUFDLFNBQVMsQ0FBQztBQUVsQyxvREFBMkM7QUFJM0MsU0FBZ0IsbUJBQW1CLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDL0MsTUFBTSxPQUFPLEdBQUcsdUJBQVcsQ0FBQztJQUM1QixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsa0RBTUM7QUFBQSxDQUFDO0FBRUYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUMzRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBSUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNqRCxJQUFJO1FBSUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDTCxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMzQztRQUVILGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckQsTUFBTSxjQUFjLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwRSxNQUFNLGNBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVqQyxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUNyQztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCO0FBQ0wsQ0FBQyJ9