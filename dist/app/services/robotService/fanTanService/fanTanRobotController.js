"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterFanTan = void 0;
const robotCommonOp_1 = require("../overallController/robotCommonOp");
const robotGoldUtil = require("../../../utils/robot/robotGoldUtil");
const fanTanRobot_1 = require("../robot/fanTanRobot");
const commonUtil = require("../../../utils/lottery/commonUtil");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const roomManager_1 = require("../../../servers/fanTan/lib/roomManager");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
function robotEnterFanTan(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.fanTan, Mode_IO, SingleRobotEnter, roomManager_1.default.getAllRooms.bind(roomManager_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEnterFanTan = robotEnterFanTan;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    const robot = new fanTanRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
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
        logger.warn(`SingleRobotEnter|uid:${robot.uid}|nid:${nid}|roomId:${roomId}|sceneId:${sceneId}|${err.stack || err}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFuVGFuUm9ib3RDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL3JvYm90U2VydmljZS9mYW5UYW5TZXJ2aWNlL2ZhblRhblJvYm90Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzRUFBMEU7QUFDMUUsb0VBQW9FO0FBQ3BFLHNEQUErQztBQUMvQyxnRUFBZ0U7QUFDaEUsMkVBQXdFO0FBQ3hFLHlFQUFrRTtBQUVsRSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVsRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUU1QyxNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMseUJBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHFCQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxxQkFBVyxDQUFDLENBQUMsQ0FBQztJQUMvSCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQU5ELDRDQU1DO0FBRUQsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFlBQXNCO0lBQ25JLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLHFCQUFXLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRyxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxJQUFJO1FBQ0EsS0FBSyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsS0FBSyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNsQztRQUVILEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFekUsTUFBTSxLQUFLLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUczRCxNQUFNLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVuQixLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUM1QjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxDQUFDLEdBQUcsUUFBUSxHQUFHLFdBQVcsTUFBTSxZQUFZLE9BQU8sSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEgsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ25CO0FBQ0wsQ0FBQyJ9