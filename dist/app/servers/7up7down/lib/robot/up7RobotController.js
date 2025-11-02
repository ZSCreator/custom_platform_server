"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterSicbo = void 0;
const up7Robot_1 = require("./up7Robot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const EventEmitter = require('events').EventEmitter;
const robotGoldUtil = require("../../../../utils/robot/robotGoldUtil");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const up7RoomMgr_1 = require("../up7RoomMgr");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const nid = "3";
function robotEnterSicbo(Mode_IO = false) {
    const RoomMgr = up7RoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterSicbo = robotEnterSicbo;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const up7Robot_ = new up7Robot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(nid, sceneId) });
    try {
        if (Mode_IO) {
            await up7Robot_.enterHall(player, nid);
        }
        else {
            up7Robot_.enterHallMode(player, nid);
        }
        up7Robot_.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await up7Robot_.enterGameOrSelectionList(nid, sceneId, roomId);
        up7Robot_.gold_min = intoGold_arr[0];
        up7Robot_.gold_max = intoGold_arr[1];
        await up7Robot_.Loaded();
        up7Robot_.registerListener();
    }
    catch (error) {
        logger.warn(`up7 SingleRobotEnter|${nid}|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        up7Robot_.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXA3Um9ib3RDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvN3VwN2Rvd24vbGliL3JvYm90L3VwN1JvYm90Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLHlDQUFrQztBQUNsQyxxR0FBeUc7QUFDekcsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUNwRCx1RUFBd0U7QUFDeEUsK0NBQXlDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEQsOENBQXVDO0FBQ3ZDLG1FQUFtRTtBQUNuRSxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFJaEIsU0FBZ0IsZUFBZSxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBRTNDLE1BQU0sT0FBTyxHQUFHLG9CQUFVLENBQUM7SUFDM0IsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQVBELDBDQU9DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWUsRUFBRSxZQUFzQjtJQUNuSSxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBQ0QsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUUsTUFBTSxTQUFTLEdBQUcsSUFBSSxrQkFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckcsSUFBSTtRQUVBLElBQUksT0FBTyxFQUFFO1lBQ1QsTUFBTSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN4QzthQUFNO1lBQ0wsU0FBUyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdEM7UUFFSCxTQUFTLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUUxRCxNQUFNLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRS9ELFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ2hDO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLENBQUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksT0FBTyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7QUFDTCxDQUFDIn0=