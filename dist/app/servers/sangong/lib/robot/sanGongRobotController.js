"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterSanGong = void 0;
const sanGongRobot_1 = require("./sanGongRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const SangongMgr_1 = require("../SangongMgr");
const nid = '46';
function robotEnterSanGong(Mode_IO = false) {
    const RoomMgr = SangongMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterSanGong = robotEnterSanGong;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const robot = new sanGongRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.setRobotGoldBeforeEnter(nid, sceneId);
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        await robot.sanGongLoaded();
        robot.registerListener();
    }
    catch (err) {
        robotlogger.warn(`sanGongSingleRobotEnter|${sceneId}|${roomId}|${(err.stack || err.message || err)}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuR29uZ1JvYm90Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3NhbmdvbmcvbGliL3JvYm90L3NhbkdvbmdSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFLYixpREFBMEM7QUFDMUMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELDhDQUF1QztBQUN2QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFHakIsU0FBZ0IsaUJBQWlCLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFFN0MsTUFBTSxPQUFPLEdBQUcsb0JBQVUsQ0FBQztJQUMzQixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBUEQsOENBT0M7QUFBQSxDQUFDO0FBR0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUMzRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxzQkFBWSxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUM3QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNsQztRQUVILEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFNUMsTUFBTSxLQUFLLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUzRCxNQUFNLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUU1QixLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUU1QjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsV0FBVyxDQUFDLElBQUksQ0FBQywyQkFBMkIsT0FBTyxJQUFJLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0FBQ0wsQ0FBQyJ9