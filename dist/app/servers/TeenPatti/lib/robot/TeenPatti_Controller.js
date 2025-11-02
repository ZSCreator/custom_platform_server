"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnter = void 0;
const events = require("events");
const EventEmitter = events.EventEmitter;
const TeenPattiRobot_1 = require("./TeenPattiRobot");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const Scene_manager_1 = require("../../../../common/dao/daoManager/Scene.manager");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const TeenPattiMgr_1 = require("../TeenPattiMgr");
const nid = '16';
function robotEnter(Mode_IO = false) {
    const RoomMgr = TeenPattiMgr_1.default;
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(nid, Mode_IO, SingleRobotEnter, RoomMgr.getAllRooms.bind(RoomMgr));
    robotManger.start();
    return robotManger;
}
exports.robotEnter = robotEnter;
;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    const TeenPattiRobot_ = new TeenPattiRobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await TeenPattiRobot_.enterHall(player, nid);
        }
        else {
            TeenPattiRobot_.enterHallMode(player, nid);
        }
        TeenPattiRobot_.setRobotGoldBeforeEnter(nid, sceneId);
        TeenPattiRobot_.initGold = TeenPattiRobot_.playerGold;
        const scene = await Scene_manager_1.default.findOne({ nid, sceneId });
        if (!scene) {
            throw `biPaiSingleRobotEnter 未获取到场信息`;
        }
        TeenPattiRobot_.entryCond = scene.entryCond;
        TeenPattiRobot_.lowBet = scene.lowBet;
        TeenPattiRobot_.betNum = scene.lowBet;
        await TeenPattiRobot_.enterGameOrSelectionList(nid, sceneId, roomId);
        await TeenPattiRobot_.Loaded();
        TeenPattiRobot_.registerListener();
    }
    catch (error) {
        robotlogger.warn(`TeenPatti_Controller|${sceneId}|${roomId}|${JSON.stringify(error)}`);
        TeenPattiRobot_.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVlblBhdHRpX0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9UZWVuUGF0dGkvbGliL3JvYm90L1RlZW5QYXR0aV9Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBR2IsaUNBQWtDO0FBQ2xDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDekMscURBQThDO0FBQzlDLHFHQUF5RztBQUN6RyxtRkFBOEU7QUFDOUUsK0NBQXlDO0FBQ3pDLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdkQsa0RBQTJDO0FBRTNDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQztBQUlqQixTQUFnQixVQUFVLENBQUMsT0FBTyxHQUFHLEtBQUs7SUFDdEMsTUFBTSxPQUFPLEdBQUcsc0JBQVksQ0FBQztJQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLHVCQUFXLEVBQUUsQ0FBQztJQUN0QyxXQUFXLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTkQsZ0NBTUM7QUFBQSxDQUFDO0FBQ0YsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZTtJQUMzRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1QsT0FBTztLQUNWO0lBRUQsTUFBTSxlQUFlLEdBQUcsSUFBSSx3QkFBYyxDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUN2RCxJQUFJO1FBRUEsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzlDO2FBQU07WUFDTCxlQUFlLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUM1QztRQUVILGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdEQsZUFBZSxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUMsVUFBVSxDQUFDO1FBQ3RELE1BQU0sS0FBSyxHQUFHLE1BQU0sdUJBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsTUFBTSwrQkFBK0IsQ0FBQztTQUN6QztRQUVELGVBQWUsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUU1QyxlQUFlLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDdEMsZUFBZSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRXRDLE1BQU0sZUFBZSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFckUsTUFBTSxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFL0IsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDdEM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLFdBQVcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLE9BQU8sSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkYsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCO0FBQ0wsQ0FBQyJ9