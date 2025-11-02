"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterBRNN = void 0;
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const BRNNRobot_1 = require("./BRNNRobot");
const pinus_logger_1 = require("pinus-logger");
const bairenLogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const commonUtil = require("../../../../utils/lottery/commonUtil");
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const EventEmitter = require('events').EventEmitter;
let nid = BairenNidEnum_1.BairenNidEnum.bairen;
const BairenRoomManager_1 = require("../BairenRoomManager");
function robotEnterBRNN(Mode_IO = false) {
    const RoomMgr = BairenRoomManager_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterBRNN = robotEnterBRNN;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const bullFightRobot = new BRNNRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await bullFightRobot.enterHall(player, nid);
        }
        else {
            bullFightRobot.enterHallMode(player, nid);
        }
        bullFightRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await bullFightRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        bullFightRobot.gold_min = intoGold_arr[0];
        bullFightRobot.gold_max = intoGold_arr[1];
        await bullFightRobot.bullFightLoaded();
        bullFightRobot.registerListener();
    }
    catch (err) {
        bairenLogger.warn(`BRNN|SingleRobotEnter|uid:${bullFightRobot.uid || player}|${JSON.stringify(err)}`);
        bullFightRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQlJOTlN0YXJ0U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpcmVuL2xpYi9yb2JvdC9CUk5OU3RhcnRTZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUdBQXlHO0FBQ3pHLDJDQUFvQztBQUNwQywrQ0FBeUM7QUFDekMsTUFBTSxZQUFZLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUV4RCxtRUFBbUU7QUFDbkUsa0ZBQStFO0FBQy9FLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFFcEQsSUFBSSxHQUFHLEdBQUcsNkJBQWEsQ0FBQyxNQUFNLENBQUM7QUFFL0IsNERBQTZDO0FBRTdDLFNBQWdCLGNBQWMsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUMxQyxNQUFNLE9BQU8sR0FBRywyQkFBUyxDQUFDO0lBQzFCLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFORCx3Q0FNQztBQUFBLENBQUM7QUFHRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsWUFBc0I7SUFDbkksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNULE9BQU87S0FDVjtJQUNELElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sY0FBYyxHQUFHLElBQUksbUJBQVMsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDbkQsSUFBSTtRQUVBLElBQUksT0FBTyxFQUFFO1lBQ1QsTUFBTSxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM3QzthQUFNO1lBQ0wsY0FBYyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDM0M7UUFFSCxjQUFjLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUcvRCxNQUFNLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BFLGNBQWMsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFDLE1BQU0sY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBRXZDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3JDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixZQUFZLENBQUMsSUFBSSxDQUFDLDZCQUE2QixjQUFjLENBQUMsR0FBRyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7QUFDTCxDQUFDIn0=