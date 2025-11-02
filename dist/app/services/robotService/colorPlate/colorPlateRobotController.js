"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterColorPlate = void 0;
const robotCommonOp_1 = require("../overallController/robotCommonOp");
const robotGoldUtil = require("../../../utils/robot/robotGoldUtil");
const colorPlateRobot_1 = require("../robot/colorPlateRobot");
const commonUtil = require("../../../utils/lottery/commonUtil");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const roomManager_1 = require("../../../servers/colorPlate/lib/roomManager");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
function robotEnterColorPlate(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.colorPlate, Mode_IO, SingleRobotEnter, roomManager_1.default.getAllRooms.bind(roomManager_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEnterColorPlate = robotEnterColorPlate;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const robot = new colorPlateRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        robot.gold_min = intoGold_arr[0];
        robot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.playerGold = robot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        await robot.load();
        robot.registerListener();
    }
    catch (err) {
        robotlogger.warn(`SingleRobotEnter|uid:${robot.uid}|nid:${nid}|roomId:${roomId}|sceneId:${sceneId}|${err.stack || err}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JQbGF0ZVJvYm90Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9yb2JvdFNlcnZpY2UvY29sb3JQbGF0ZS9jb2xvclBsYXRlUm9ib3RDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNFQUEwRTtBQUMxRSxvRUFBb0U7QUFDcEUsOERBQXVEO0FBQ3ZELGdFQUFnRTtBQUNoRSwyRUFBd0U7QUFDeEUsNkVBQXNFO0FBRXRFLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3ZELFNBQWdCLG9CQUFvQixDQUFDLE9BQU8sR0FBRyxLQUFLO0lBRWhELE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUscUJBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHFCQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsb0RBTUM7QUFHRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsWUFBc0I7SUFDbkksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNULE9BQU87S0FDVjtJQUNELElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQWUsQ0FBQyxFQUFFLE9BQU8sRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRXZHLElBQUk7UUFDQSxLQUFLLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxLQUFLLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQyxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNMLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ2xDO1FBRUgsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV6RSxNQUFNLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRzNELE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRW5CLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQzVCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixXQUFXLENBQUMsSUFBSSxDQUFDLHdCQUF3QixLQUFLLENBQUMsR0FBRyxRQUFRLEdBQUcsV0FBVyxNQUFNLFlBQVksT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN6SCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbkI7QUFDTCxDQUFDIn0=