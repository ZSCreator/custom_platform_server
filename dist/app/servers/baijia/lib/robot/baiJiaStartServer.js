"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterBaijia = void 0;
const baiJiaRobot_1 = require("./baiJiaRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const events = require("events");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const EventEmitter = events.EventEmitter;
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const nid = BairenNidEnum_1.BairenNidEnum.baijia;
const BaijiaRoomManagerImpl_1 = require("../BaijiaRoomManagerImpl");
function robotEnterBaijia(Mode_IO = false) {
    const RoomMgr = BaijiaRoomManagerImpl_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterBaijia = robotEnterBaijia;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const baiJiaLeRobot = new baiJiaRobot_1.default({ Mode_IO, });
    try {
        baiJiaLeRobot.gold_min = intoGold_arr[0];
        baiJiaLeRobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await baiJiaLeRobot.enterHall(player, nid);
        }
        else {
            baiJiaLeRobot.enterHallMode(player, nid);
        }
        baiJiaLeRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await baiJiaLeRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await baiJiaLeRobot.baiJiaLeLoaded();
        baiJiaLeRobot.registerListener();
    }
    catch (error) {
        logger.warn(`baijia|SingleRobotEnter|${baiJiaLeRobot.uid}|${JSON.stringify(error)}`);
        baiJiaLeRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFpSmlhU3RhcnRTZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlqaWEvbGliL3JvYm90L2JhaUppYVN0YXJ0U2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsK0NBQXdDO0FBRXhDLHFHQUF5RztBQUN6RyxpQ0FBa0M7QUFDbEMsbUVBQW1FO0FBQ25FLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMsa0ZBQStFO0FBQy9FLCtDQUF5QztBQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sR0FBRyxHQUFHLDZCQUFhLENBQUMsTUFBTSxDQUFDO0FBQ2pDLG9FQUEwRTtBQUcxRSxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFPLEdBQUcsS0FBSztJQUM1QyxNQUFNLE9BQU8sR0FBRywrQkFBVyxDQUFDO0lBQzVCLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDeEcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFORCw0Q0FNQztBQUFBLENBQUM7QUFFRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsWUFBc0I7SUFDbkksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNULE9BQU87S0FDVjtJQUNELElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTVFLE1BQU0sYUFBYSxHQUFHLElBQUkscUJBQVcsQ0FBQyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDcEQsSUFBSTtRQUNBLGFBQWEsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpDLElBQUksT0FBTyxFQUFFO1lBQ1QsTUFBTSxhQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBQ0wsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDMUM7UUFFSCxhQUFhLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU5RCxNQUFNLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25FLE1BQU0sYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXJDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3BDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLDJCQUEyQixhQUFhLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JGLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMzQjtBQUNMLENBQUMifQ==