"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnter = void 0;
const events = require("events");
const EventEmitter = events.EventEmitter;
const MJRobot_1 = require("./MJRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const mjGameManger_1 = require("../mjGameManger");
const nid = '13';
function robotEnter(Mode_IO = false) {
    const RoomMgr = mjGameManger_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnter = robotEnter;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const MJRobot_ = new MJRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await MJRobot_.enterHall(player, nid);
        }
        else {
            MJRobot_.enterHallMode(player, nid);
        }
        MJRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        await MJRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        MJRobot_.registerListener();
        await MJRobot_.Loaded();
    }
    catch (error) {
        robotlogger.warn(`MJ SingleRobotEnter|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        MJRobot_.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTUpfQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL01KL2xpYi9yb2JvdC9NSl9Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsaUNBQWtDO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsdUNBQWdDO0FBQ2hDLHFHQUF5RztBQUV6RywrQ0FBeUM7QUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV2RCxrREFBMkM7QUFDM0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBSWpCLFNBQWdCLFVBQVUsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUV0QyxNQUFNLE9BQU8sR0FBRyxzQkFBWSxDQUFDO0lBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFQRCxnQ0FPQztBQUFBLENBQUM7QUFFRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO0lBQzNHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFPLENBQUMsRUFBQyxPQUFPLEdBQUUsQ0FBQyxDQUFDO0lBQ3pDLElBQUk7UUFFQSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdkM7YUFBTTtZQUNMLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JDO1FBRUgsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQVMvQyxNQUFNLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTlELFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRTVCLE1BQU0sUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzNCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixXQUFXLENBQUMsSUFBSSxDQUFDLHVCQUF1QixPQUFPLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0QjtBQUNMLENBQUMifQ==