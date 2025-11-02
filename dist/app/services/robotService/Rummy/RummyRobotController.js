"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterAndRummy = void 0;
const robotCommonOp_1 = require("../overallController/robotCommonOp");
const robotGoldUtil = require("../../../utils/robot/robotGoldUtil");
const RummyRobot_1 = require("../../../servers/Rummy/robot/RummyRobot");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const RummyRoomManager_1 = require("../../../servers/Rummy/lib/RummyRoomManager");
function robotEnterAndRummy(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.Rummy, Mode_IO, SingleRobotEnter, RummyRoomManager_1.default.getAllRooms.bind(RummyRoomManager_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEnterAndRummy = robotEnterAndRummy;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const robot = new RummyRobot_1.default({ Mode_IO, betLowLimit: robotGoldUtil.getBetLowLimit(GameNidEnum_1.GameNidEnum.Rummy, sceneId) });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.playerGold = robot.setRobotGoldBeforeEnter(GameNidEnum_1.GameNidEnum.Rummy, sceneId);
        await robot.enterGameOrSelectionList(GameNidEnum_1.GameNidEnum.Rummy, sceneId, roomId);
        await robot.load();
        robot.registerListener();
    }
    catch (err) {
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlSb2JvdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvcm9ib3RTZXJ2aWNlL1J1bW15L1J1bW15Um9ib3RDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNFQUEwRTtBQUMxRSxvRUFBb0U7QUFDcEUsd0VBQWlFO0FBQ2pFLDJFQUF3RTtBQUN4RSxrRkFBc0U7QUFJdEUsU0FBZ0Isa0JBQWtCLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDOUMsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLHlCQUFXLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSwwQkFBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsMEJBQVcsQ0FBQyxDQUFDLENBQUM7SUFDOUgsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLE9BQU8sV0FBVyxDQUFDO0FBQ3ZCLENBQUM7QUFMRCxnREFLQztBQUFBLENBQUM7QUFHRixLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO0lBQzNHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLG9CQUFVLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxjQUFjLENBQUMseUJBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2pILElBQUk7UUFDQSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdEM7YUFBTTtZQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO1FBR0QsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMseUJBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFN0UsTUFBTSxLQUFLLENBQUMsd0JBQXdCLENBQUMseUJBQVcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXpFLE1BQU0sS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRW5CLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQzVCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbkI7QUFDTCxDQUFDIn0=