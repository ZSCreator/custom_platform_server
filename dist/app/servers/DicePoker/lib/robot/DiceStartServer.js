"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterDiceZhuang = void 0;
const DiceRobot_1 = require("./DiceRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const EventEmitter = require('events').EventEmitter;
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const nid = GameNidEnum_1.GameNidEnum.DicePoker;
const DiceRoomMgr_1 = require("../DiceRoomMgr");
function robotEnterDiceZhuang(Mode_IO = false) {
    const RoomMgr = DiceRoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterDiceZhuang = robotEnterDiceZhuang;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const DiceRobot_ = new DiceRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await DiceRobot_.enterHall(player, nid);
        }
        else {
            DiceRobot_.enterHallMode(player, nid);
        }
        DiceRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        await DiceRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        await DiceRobot_.DiceLoaded();
        DiceRobot_.registerListener();
    }
    catch (error) {
        robotlogger.warn(`Dice|SingleRobotEnter ==> ${JSON.stringify(error)}`);
        DiceRobot_.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljZVN0YXJ0U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRGljZVBva2VyL2xpYi9yb2JvdC9EaWNlU3RhcnRTZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwyQ0FBb0M7QUFDcEMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFJcEQsOEVBQTJFO0FBQzNFLE1BQU0sR0FBRyxHQUFHLHlCQUFXLENBQUMsU0FBUyxDQUFDO0FBRWxDLGdEQUF5QztBQUd6QyxTQUFnQixvQkFBb0IsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUNoRCxNQUFNLE9BQU8sR0FBRyxxQkFBVyxDQUFDO0lBQzVCLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFORCxvREFNQztBQUFBLENBQUM7QUFDRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO0lBQzNHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFHRCxNQUFNLFVBQVUsR0FBRyxJQUFJLG1CQUFTLENBQUMsRUFBQyxPQUFPLEdBQUUsQ0FBQyxDQUFDO0lBQzdDLElBQUk7UUFFQSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDekM7YUFBTTtZQUNMLFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZDO1FBRUgsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRCxNQUFNLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTlCLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ2pDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixXQUFXLENBQUMsSUFBSSxDQUFDLDZCQUE2QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEI7QUFDTCxDQUFDIn0=