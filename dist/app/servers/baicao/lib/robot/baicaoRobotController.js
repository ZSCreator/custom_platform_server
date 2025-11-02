"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterSanGong = void 0;
const baicaoRobot_1 = require("./baicaoRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const baicaoMgr_1 = require("../baicaoMgr");
const nid = '2';
function robotEnterSanGong(Mode_IO = false) {
    const RoomMgr = baicaoMgr_1.default;
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
    const robot = new baicaoRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.setRobotGoldBeforeEnter(nid, sceneId);
        robot.initGold = robot.playerGold;
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        await robot.sanGongLoaded();
        robot.registerListener();
    }
    catch (err) {
        robotlogger.warn(`baicao|leRobotEnter|${sceneId}|${roomId}|${JSON.stringify(err)}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFpY2FvUm9ib3RDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpY2FvL2xpYi9yb2JvdC9iYWljYW9Sb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFLYiwrQ0FBd0M7QUFDeEMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRXZELDRDQUFxQztBQUVyQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFHaEIsU0FBZ0IsaUJBQWlCLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDN0MsTUFBTSxPQUFPLEdBQUcsbUJBQVMsQ0FBQztJQUMxQixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsOENBTUM7QUFBQSxDQUFDO0FBR0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUMzRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQkFBVyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUM1QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNsQztRQUVILEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFNUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBRWxDLE1BQU0sS0FBSyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFM0QsTUFBTSxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFNUIsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FFNUI7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLFdBQVcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLE9BQU8sSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEYsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0FBQ0wsQ0FBQyJ9