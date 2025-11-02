"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterFishery = void 0;
const fisheryrobot_1 = require("../robot/fisheryrobot");
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const FisheryRoomManagerImpl_1 = require("../../../servers/fishery/lib/FisheryRoomManagerImpl");
const robotCommonOp_1 = require("../overallController/robotCommonOp");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
function robotEnterFishery(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.fishery, Mode_IO, SingleRobotEnter, FisheryRoomManagerImpl_1.default.getAllRooms.bind(FisheryRoomManagerImpl_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEnterFishery = robotEnterFishery;
async function SingleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player) {
        return;
    }
    let robot = new fisheryrobot_1.default({ Mode_IO, });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        robot.gold = robot.setRobotGoldBeforeEnter(nid, sceneId);
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        await robot.loaded();
        robot.registerListener();
    }
    catch (err) {
        logger.warn(`FisheryAdvance.fisherySingleRobotEnter ==> ${err.stack || err.message || err}`);
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlzaGVyeUNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvcm9ib3RTZXJ2aWNlL2Zpc2hlcnkvZmlzaGVyeUNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQWlEO0FBQ2pELDJFQUF3RTtBQUN4RSxnR0FBOEU7QUFDOUUsc0VBQTBFO0FBQzFFLCtDQUF5QztBQUV6QyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRWxELFNBQWdCLGlCQUFpQixDQUFDLE9BQU8sR0FBRyxLQUFLO0lBQzdDLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsZ0NBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdDQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ2hJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBTEQsOENBS0M7QUFFRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO0lBQzNHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFDRCxJQUFJLEtBQUssR0FBRyxJQUFJLHNCQUFZLENBQUMsRUFBRSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLElBQUk7UUFDQSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDdEM7YUFBTTtZQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO1FBR0QsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsdUJBQXVCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXpELE1BQU0sS0FBSyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFM0QsTUFBTSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckIsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDNUI7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsOENBQThDLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNuQjtBQUNMLENBQUMifQ==