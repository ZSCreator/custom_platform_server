"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDouDiZhuRobot = void 0;
const landRobot_1 = require("./landRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const landMgr_1 = require("../landMgr");
const nid = '50';
function handleDouDiZhuRobot(Mode_IO = false) {
    const RoomMgr = landMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.handleDouDiZhuRobot = handleDouDiZhuRobot;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    const douDiZhuRobot = new landRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await douDiZhuRobot.enterHall(player, nid);
        }
        else {
            douDiZhuRobot.enterHallMode(player, nid);
        }
        douDiZhuRobot.setRobotGoldBeforeEnter(nid, sceneId);
        await douDiZhuRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await douDiZhuRobot.ddzLoaded();
        douDiZhuRobot.registerListener();
    }
    catch (err) {
        robotlogger.warn(`land_robot_enter|${sceneId}|${roomId}|${JSON.stringify(err)}`);
        douDiZhuRobot.destroy();
    }
    finally {
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZFJvYm90Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xhbmQvbGliL3JvYm90L2xhbmRSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFRYiwyQ0FBd0M7QUFDeEMscUdBQXlHO0FBRXpHLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELHdDQUFpQztBQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFLakIsU0FBZ0IsbUJBQW1CLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFFL0MsTUFBTSxPQUFPLEdBQUcsaUJBQU8sQ0FBQztJQUN4QixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBUEQsa0RBT0M7QUFBQSxDQUFDO0FBSUYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUUzRyxNQUFNLGFBQWEsR0FBRyxJQUFJLG1CQUFhLENBQUMsRUFBQyxPQUFPLEdBQUUsQ0FBQyxDQUFDO0lBQ3BELElBQUk7UUFFQSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDNUM7YUFBTTtZQUNMLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzFDO1FBRUgsYUFBYSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVwRCxNQUFNLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRW5FLE1BQU0sYUFBYSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRWhDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3BDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixPQUFPLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMzQjtZQUFTO0tBQ1Q7QUFDTCxDQUFDIn0=