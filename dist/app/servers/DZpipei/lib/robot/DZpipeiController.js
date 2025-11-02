"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterDZ = void 0;
const FFF_DzRobot_1 = require("./FFF_DzRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const robotGoldUtil = require("../../../../utils/robot/robotGoldUtil");
const nid = '40';
const dzRoomMgr_1 = require("../dzRoomMgr");
function robotEnterDZ(Mode_IO = false) {
    const RoomMgr = dzRoomMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnterDZ = robotEnterDZ;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const Dz_robot_obj = new FFF_DzRobot_1.default({ Mode_IO, });
    try {
        Dz_robot_obj.registerListener();
        if (Mode_IO) {
            await Dz_robot_obj.enterHall(player, nid);
        }
        else {
            Dz_robot_obj.enterHallMode(player, nid);
        }
        Dz_robot_obj.setRobotGoldBeforeEnter(nid, sceneId);
        const currGold = robotGoldUtil.getRanomByWeight(nid, sceneId);
        await Dz_robot_obj.enterGameOrSelectionList(nid, sceneId, roomId, { currGold: currGold });
        await Dz_robot_obj.loaded();
    }
    catch (error) {
        robotlogger.warn(`dz.robot ==> ${player.uid}|${JSON.stringify(error)}`);
        Dz_robot_obj.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRFpwaXBlaUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EWnBpcGVpL2xpYi9yb2JvdC9EWnBpcGVpQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLCtDQUF3QztBQUN4QyxxR0FBeUc7QUFDekcsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQsdUVBQXdFO0FBQ3hFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUVqQiw0Q0FBcUM7QUFJckMsU0FBZ0IsWUFBWSxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBQzFDLE1BQU0sT0FBTyxHQUFHLG1CQUFTLENBQUM7SUFDMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSx1QkFBVyxFQUFFLENBQUM7SUFDdEMsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN4RyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEIsT0FBTyxXQUFXLENBQUM7QUFDckIsQ0FBQztBQU5ELG9DQU1DO0FBRUQsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUM3RyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsT0FBTztLQUNSO0lBQ0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxxQkFBVyxDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNuRCxJQUFJO1FBQ0YsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFaEMsSUFBSSxPQUFPLEVBQUU7WUFDWCxNQUFNLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTCxZQUFZLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN6QztRQUVELFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkQsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU5RCxNQUFNLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzdCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDZCxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4QjtBQUNILENBQUMifQ==