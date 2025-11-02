"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterChinesePoke = void 0;
const events = require("events");
const EventEmitter = events.EventEmitter;
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const cpRobot_1 = require("./cpRobot");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const chinese_pokerMgr_1 = require("../chinese_pokerMgr");
const nid = '45';
function robotEnterChinesePoke(Mode_IO = false) {
    const RoomMgr = chinese_pokerMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterChinesePoke = robotEnterChinesePoke;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const robot = new cpRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.setRobotGoldBeforeEnter(nid, sceneId);
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        await robot.chinesePokerLoaded();
        robot.registerListener();
    }
    catch (err) {
        logger.warn(`cpRobotEnter|${robot.uid}|${roomId}|${JSON.stringify(err)}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3BSb2JvdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGluZXNlX3Bva2VyL2xpYi9yb2JvdC9jcFJvYm90Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLGlDQUFrQztBQUNsQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBRXpDLHFHQUF5RztBQUN6Ryx1Q0FBZ0M7QUFDaEMsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEQsMERBQW1EO0FBQ25ELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUlqQixTQUFnQixxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUVqRCxNQUFNLE9BQU8sR0FBRywwQkFBZ0IsQ0FBQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBUEQsc0RBT0M7QUFBQSxDQUFDO0FBR0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUMzRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUN0QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNsQztRQUVILEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFNUMsTUFBTSxLQUFLLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUzRCxNQUFNLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRWpDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQzVCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixLQUFLLENBQUMsR0FBRyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbkI7QUFDTCxDQUFDIn0=