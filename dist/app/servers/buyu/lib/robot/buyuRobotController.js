"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterbuyu = void 0;
const buyuRobot_1 = require("./buyuRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const events = require("events");
const EventEmitter = events.EventEmitter;
const BuYuRoomManagerImpl_1 = require("../BuYuRoomManagerImpl");
function robotEnterbuyu(Mode_IO = false) {
    const RoomMgr = BuYuRoomManagerImpl_1.default;
    const robotManger = new robotCommonOp_1.default();
    return robotManger;
}
exports.robotEnterbuyu = robotEnterbuyu;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold) {
    if (!player) {
        return;
    }
    const BuyuRobot = new buyuRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await BuyuRobot.enterHall(player, nid);
        }
        else {
            BuyuRobot.enterHallMode(player, nid);
        }
        BuyuRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold[0]);
        await BuyuRobot.baiJiaLeLoaded({ roomId: roomId });
        BuyuRobot.registerListener();
    }
    catch (error) {
        robotlogger.warn(`baiJiaStartServer.baijiaSingleRobotEnter|${nid}|${BuyuRobot.sceneId}|${BuyuRobot.roomId}|${error.stack || error}`);
        BuyuRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV5dVJvYm90Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2J1eXUvbGliL3JvYm90L2J1eXVSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwyQ0FBb0M7QUFDcEMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELGlDQUFrQztBQUNsQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBR3pDLGdFQUF5RDtBQUl6RCxTQUFnQixjQUFjLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFFMUMsTUFBTSxPQUFPLEdBQUcsNkJBQW1CLENBQUM7SUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFHdEMsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQVBELHdDQU9DO0FBQUEsQ0FBQztBQUdGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWUsRUFBRSxRQUFrQjtJQUMvSCxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUM5QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUVILFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdELE1BQU0sU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRW5ELFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ2hDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixXQUFXLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNySSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7QUFDTCxDQUFDIn0=