"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterQznn = void 0;
const events = require("events");
const EventEmitter = events.EventEmitter;
const qznnrobot_1 = require("./qznnrobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const nid = GameNidEnum_1.GameNidEnum.qznn;
const qznnMgr_1 = require("../qznnMgr");
function robotEnterQznn(Mode_IO = false) {
    const RoomMgr = qznnMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterQznn = robotEnterQznn;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player)
        return;
    const qznnRobot = new qznnrobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await qznnRobot.enterHall(player, nid);
        }
        else {
            qznnRobot.enterHallMode(player, nid);
        }
        qznnRobot.setRobotGoldBeforeEnter(nid, sceneId);
        await qznnRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await qznnRobot.loaded();
        qznnRobot.registerListener();
    }
    catch (err) {
        robotlogger.debug(`zqnnAdvance.qznnSingleRobotEnter ==> ${JSON.stringify(err)}`);
        qznnRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpubkNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5uL2xpYi9yb2JvdC9xem5uQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBa0M7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN6QywyQ0FBb0M7QUFFcEMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6Qyw4RUFBMkU7QUFDM0UsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFNLEdBQUcsR0FBRyx5QkFBVyxDQUFDLElBQUksQ0FBQztBQUU3Qix3Q0FBaUM7QUFFakMsU0FBZ0IsY0FBYyxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBRTFDLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUM7SUFDeEIsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQVBELHdDQU9DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWU7SUFDM0csSUFBSSxDQUFDLE1BQU07UUFDUCxPQUFPO0lBQ1gsTUFBTSxTQUFTLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUM1QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUVILFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFaEQsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvRCxNQUFNLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV6QixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUNoQztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsV0FBVyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakYsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCO0FBQ0wsQ0FBQyJ9