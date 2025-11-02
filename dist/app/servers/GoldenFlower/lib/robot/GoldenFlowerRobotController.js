"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterZhaJinHua = void 0;
const events = require("events");
const EventEmitter = events.EventEmitter;
const FFFGoldenFlowerRobot_1 = require("./FFFGoldenFlowerRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const GoldenFlowerMgr_1 = require("../GoldenFlowerMgr");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
function robotEnterZhaJinHua(Mode_IO = false) {
    const RoomMgr = GoldenFlowerMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.GoldenFlower, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterZhaJinHua = robotEnterZhaJinHua;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const zhaJinHuaRobot = new FFFGoldenFlowerRobot_1.default({ Mode_IO, });
    try {
        zhaJinHuaRobot.registerListener();
        if (Mode_IO) {
            await zhaJinHuaRobot.enterHall(player, nid);
        }
        else {
            zhaJinHuaRobot.enterHallMode(player, nid);
        }
        zhaJinHuaRobot.setRobotGoldBeforeEnter(nid, sceneId);
        await zhaJinHuaRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await zhaJinHuaRobot.zhaJinHuaLoaded();
    }
    catch (error) {
        robotlogger.warn(`JHSingleRobotEnter|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        zhaJinHuaRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29sZGVuRmxvd2VyUm9ib3RDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvR29sZGVuRmxvd2VyL2xpYi9yb2JvdC9Hb2xkZW5GbG93ZXJSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYixpQ0FBa0M7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUd6QyxpRUFBMEQ7QUFDMUQscUdBQXlHO0FBRXpHLCtDQUF5QztBQUN6Qyx3REFBaUQ7QUFDakQsOEVBQTJFO0FBQzNFLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFJdkQsU0FBZ0IsbUJBQW1CLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFFL0MsTUFBTSxPQUFPLEdBQUcseUJBQWUsQ0FBQztJQUNoQyxNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMseUJBQVcsQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDN0gsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFQRCxrREFPQztBQUFBLENBQUM7QUFFRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO0lBQzNHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLDhCQUFvQixDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUM5RCxJQUFJO1FBRUEsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFbEMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDSCxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM3QztRQUVELGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckQsTUFBTSxjQUFjLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVwRSxNQUFNLGNBQWMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUMxQztJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osV0FBVyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsT0FBTyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRixjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7QUFDTCxDQUFDIn0=