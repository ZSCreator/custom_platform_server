"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterQznn = void 0;
const qzpjRobot_1 = require("./qzpjRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const nid = GameNidEnum_1.GameNidEnum.qzpj;
const qzpjMgr_1 = require("../qzpjMgr");
function robotEnterQznn(Mode_IO = false) {
    const RoomMgr = qzpjMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    return robotManger;
}
exports.robotEnterQznn = robotEnterQznn;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player)
        return;
    const qzpjRobot = new qzpjRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await qzpjRobot.enterHall(player, nid);
        }
        else {
            qzpjRobot.enterHallMode(player, nid);
        }
        qzpjRobot.setRobotGoldBeforeEnter(nid, sceneId);
        await qzpjRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        await qzpjRobot.loaded();
        qzpjRobot.registerListener();
    }
    catch (err) {
        robotlogger.debug(`zqnnAdvance.qzpjSingleRobotEnter ==> ${JSON.stringify(err)}`);
        qzpjRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpwakNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xenBqL2xpYi9yb2JvdC9xenBqQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyQ0FBb0M7QUFDcEMscUdBQXlHO0FBQ3pHLCtDQUF5QztBQUN6Qyw4RUFBMkU7QUFDM0UsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUN2RCxNQUFNLEdBQUcsR0FBRyx5QkFBVyxDQUFDLElBQUksQ0FBQztBQUU3Qix3Q0FBaUM7QUFFakMsU0FBZ0IsY0FBYyxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBRTFDLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUM7SUFDeEIsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFHdEMsT0FBTyxXQUFXLENBQUM7QUFDdkIsQ0FBQztBQVBELHdDQU9DO0FBQUEsQ0FBQztBQUVGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLE1BQWMsRUFBRSxPQUFnQixFQUFFLE1BQWU7SUFDM0csSUFBSSxDQUFDLE1BQU07UUFDUCxPQUFPO0lBQ1gsTUFBTSxTQUFTLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUM1QyxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3hDO2FBQU07WUFDTCxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUVILFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFaEQsTUFBTSxTQUFTLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvRCxNQUFNLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUV6QixTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUNoQztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsV0FBVyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakYsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCO0FBQ0wsQ0FBQyJ9