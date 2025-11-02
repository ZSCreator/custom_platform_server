"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterBenzBmw = void 0;
const benzRobot_1 = require("./benzRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const EventEmitter = require('events').EventEmitter;
const robotGoldUtil = require("../../../../utils/robot/robotGoldUtil");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const commonUtil = require("../../../../utils/lottery/commonUtil");
const benzRoomMgr_1 = require("../benzRoomMgr");
const nid = GameNidEnum_1.GameNidEnum.BenzBmw;
function robotEnterBenzBmw(Mode_IO = false) {
    const RoomMgr = benzRoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterBenzBmw = robotEnterBenzBmw;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const benzRobot_ = new benzRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(GameNidEnum_1.GameNidEnum.BenzBmw, sceneId) });
    try {
        benzRobot_.gold_min = intoGold_arr[0];
        benzRobot_.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await benzRobot_.enterHall(player, GameNidEnum_1.GameNidEnum.BenzBmw);
        }
        else {
            benzRobot_.enterHallMode(player, nid);
        }
        benzRobot_.setRobotGoldBeforeEnter(GameNidEnum_1.GameNidEnum.BenzBmw, sceneId, intoGold);
        await benzRobot_.enterGameOrSelectionList(GameNidEnum_1.GameNidEnum.BenzBmw, sceneId, roomId);
        await benzRobot_.Loaded();
        benzRobot_.registerListener();
    }
    catch (error) {
        robotlogger.warn(`BenzBmw|SingleRobotEnter|${GameNidEnum_1.GameNidEnum.BenzBmw}|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        benzRobot_.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuelJvYm90Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JlbnpCbXcvbGliL3JvYm90L2JlbnpSb2JvdENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYiwyQ0FBb0M7QUFDcEMscUdBQXlHO0FBQ3pHLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFDcEQsdUVBQXdFO0FBQ3hFLCtDQUF5QztBQUN6Qyw4RUFBMkU7QUFDM0UsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxtRUFBbUU7QUFFbkUsZ0RBQXlDO0FBR3pDLE1BQU0sR0FBRyxHQUFHLHlCQUFXLENBQUMsT0FBTyxDQUFDO0FBQ2hDLFNBQWdCLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxLQUFLO0lBQzdDLE1BQU0sT0FBTyxHQUFHLHFCQUFXLENBQUM7SUFDNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQU5ELDhDQU1DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWUsRUFBRSxZQUFzQjtJQUNuSSxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBQ0QsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFNUUsTUFBTSxVQUFVLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsY0FBYyxDQUFDLHlCQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2SCxJQUFJO1FBQ0EsVUFBVSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsVUFBVSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0Q7YUFBTTtZQUNILFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3pDO1FBRUQsVUFBVSxDQUFDLHVCQUF1QixDQUFDLHlCQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUUzRSxNQUFNLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFaEYsTUFBTSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDMUIsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDakM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLHlCQUFXLENBQUMsT0FBTyxJQUFJLE9BQU8sSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEgsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3hCO0FBQ0wsQ0FBQyJ9