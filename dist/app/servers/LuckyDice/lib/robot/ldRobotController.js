"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDouDiZhuRobot = void 0;
const ldRobot_1 = require("./ldRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const ldMgr_1 = require("../ldMgr");
const nid = GameNidEnum_1.GameNidEnum.LuckyDice;
function handleDouDiZhuRobot(Mode_IO = false) {
    const RoomMgr = ldMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.handleDouDiZhuRobot = handleDouDiZhuRobot;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    const ldRobot_ = new ldRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await ldRobot_.enterHall(player, nid);
        }
        else {
            ldRobot_.enterHallMode(player, nid);
        }
        ldRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        await ldRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        await ldRobot_.ddzLoaded();
        ldRobot_.registerListener();
    }
    catch (err) {
        robotlogger.warn(`ld_robot_enter|${sceneId}|${roomId}|${JSON.stringify(err)}`);
        ldRobot_.destroy();
    }
    finally {
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRSb2JvdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9MdWNreURpY2UvbGliL3JvYm90L2xkUm9ib3RDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBUWIsdUNBQWdDO0FBQ2hDLHFHQUF5RztBQUV6RywrQ0FBeUM7QUFDekMsOEVBQTJFO0FBQzNFLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQsb0NBQTZCO0FBQzdCLE1BQU0sR0FBRyxHQUFHLHlCQUFXLENBQUMsU0FBUyxDQUFDO0FBS2xDLFNBQWdCLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxLQUFLO0lBRS9DLE1BQU0sT0FBTyxHQUFHLGVBQUssQ0FBQztJQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBUEQsa0RBT0M7QUFBQSxDQUFDO0FBR0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUUzRyxNQUFNLFFBQVEsR0FBRyxJQUFJLGlCQUFPLENBQUMsRUFBQyxPQUFPLEdBQUUsQ0FBQyxDQUFDO0lBQ3pDLElBQUk7UUFFQSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdkM7YUFBTTtZQUNMLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JDO1FBRUgsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUUvQyxNQUFNLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTlELE1BQU0sUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRTNCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQy9CO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFrQixPQUFPLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0QjtZQUFTO0tBQ1Q7QUFDTCxDQUFDIn0=