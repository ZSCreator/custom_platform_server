"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterAndarBahar = void 0;
const robotCommonOp_1 = require("../overallController/robotCommonOp");
const robotGoldUtil = require("../../../utils/robot/robotGoldUtil");
const andarBaharRobot_1 = require("../robot/andarBaharRobot");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const roomManager_1 = require("../../../servers/andarBahar/lib/roomManager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
function robotEnterAndarBahar(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.andarBahar, Mode_IO, SingleRobotEnter, roomManager_1.default.getAllRooms.bind(roomManager_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEnterAndarBahar = robotEnterAndarBahar;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const robot = new andarBaharRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(GameNidEnum_1.GameNidEnum.andarBahar, sceneId) });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.playerGold = robot.setRobotGoldBeforeEnter(GameNidEnum_1.GameNidEnum.andarBahar, sceneId);
        await robot.enterGameOrSelectionList(GameNidEnum_1.GameNidEnum.andarBahar, sceneId, roomId);
        await robot.load();
        robot.registerListener();
    }
    catch (err) {
        logger.warn(`SingleRobotEnter|uid:${robot.uid}|nid:${GameNidEnum_1.GameNidEnum.andarBahar}|roomId:${roomId}|sceneId:${sceneId}|${err.stack || err}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5kYXJCYWhhclJvYm90Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9yb2JvdFNlcnZpY2UvYW5kYXJCYWhhci9hbmRhckJhaGFyUm9ib3RDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNFQUEwRTtBQUMxRSxvRUFBb0U7QUFDcEUsOERBQXVEO0FBQ3ZELDJFQUF3RTtBQUN4RSw2RUFBc0U7QUFFdEUsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFbEQsU0FBZ0Isb0JBQW9CLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFFaEQsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLHlCQUFXLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxxQkFBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMscUJBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbkksV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFORCxvREFNQztBQUlELEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWU7SUFDM0csSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNULE9BQU87S0FDVjtJQUNELE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQWUsQ0FBQyxFQUFFLE9BQU8sRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLGNBQWMsQ0FBQyx5QkFBVyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFMUgsSUFBSTtRQUVBLElBQUksT0FBTyxFQUFFO1lBQ1QsTUFBTSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QzthQUFNO1lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDcEM7UUFHRCxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyx5QkFBVyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVsRixNQUFNLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFOUUsTUFBTSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFbkIsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDNUI7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEtBQUssQ0FBQyxHQUFHLFFBQVEseUJBQVcsQ0FBQyxVQUFVLFdBQVcsTUFBTSxZQUFZLE9BQU8sSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdkksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0FBQ0wsQ0FBQyJ9