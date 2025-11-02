"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterQznn = void 0;
const events = require("events");
const EventEmitter = events.EventEmitter;
const qznnpprobot_1 = require("./qznnpprobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const nid = '23';
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
    const qznnRobot = new qznnpprobot_1.default({ Mode_IO, });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpubnBwQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3F6bm5wcC9saWIvcm9ib3QvcXpubnBwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBa0M7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN6QywrQ0FBc0M7QUFFdEMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUNqQix3Q0FBaUM7QUFHakMsU0FBZ0IsY0FBYyxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBQzFDLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUM7SUFDeEIsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQU5ELHdDQU1DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWU7SUFDM0csSUFBSSxDQUFDLE1BQU07UUFDUCxPQUFPO0lBQ1gsTUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUM1QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUVILFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFaEQsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvRCxNQUFNLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV6QixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUNoQztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsV0FBVyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakYsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCO0FBQ0wsQ0FBQyJ9