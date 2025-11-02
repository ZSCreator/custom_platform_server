"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEntry = void 0;
const robotCommonOp_1 = require("../../../services/robotService/overallController/robotCommonOp");
const RedPacketRobotImpl_1 = require("./RedPacketRobotImpl");
const robotConfigJsonPath = 'robot/bairen/redPacketConfig';
const GameNidEnum_1 = require("../../../common/constant/game/GameNidEnum");
const sceneList = require("../../../../config/data/scenes/redPacket.json");
const RedPacketTenantRoomManager_1 = require("./RedPacketTenantRoomManager");
function robotEntry(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.redPacket, Mode_IO, singleRobotEnter, RedPacketTenantRoomManager_1.default.getAllRooms.bind(RedPacketTenantRoomManager_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEntry = robotEntry;
async function singleRobotEnter(nid, sceneId, roomId, Mode_IO, player) {
    if (!player)
        return;
    const robot = new RedPacketRobotImpl_1.RedPacketRobotImpl({ Mode_IO, });
    try {
        if (Mode_IO) {
            await robot.enterHall(player, nid);
        }
        else {
            robot.enterHallMode(player, nid);
        }
        const gold = robot.setRobotGoldBeforeEnter(nid, sceneId);
        robot.playerGold = gold;
        robot.initGold = robot.playerGold;
        const sceneInfo = sceneList.find(sI => sI.id === sceneId);
        robot.entryCond = sceneInfo.entryCond;
        robot.lowBet = sceneInfo.lowBet;
        robot.capBet = sceneInfo.capBet;
        robot.redParketNum = sceneInfo.redParketNum;
        robot.lossRation = sceneInfo.lossRation;
        await robot.enterGameOrSelectionList(nid, sceneId, roomId);
        await robot.agentMessage.loaded();
        robot.registerListener();
    }
    catch (error) {
        robot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkUGFja2V0Um9ib3RTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpYi9yZWRQYWNrZXRSb2JvdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0Esa0dBQXNHO0FBRXRHLDZEQUEwRDtBQUMxRCxNQUFNLG1CQUFtQixHQUFHLDhCQUE4QixDQUFDO0FBRzNELDJFQUF3RTtBQUd4RSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsK0NBQStDLENBQUMsQ0FBQTtBQUUxRSw2RUFBdUQ7QUFFdkQsU0FBZ0IsVUFBVSxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBRXhDLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsb0NBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9DQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDO0FBTkQsZ0NBTUM7QUFFRCxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQWUsRUFBRSxNQUFjLEVBQUUsT0FBZ0IsRUFBRSxNQUFlO0lBRTdHLElBQUksQ0FBQyxNQUFNO1FBQUUsT0FBTztJQUlwQixNQUFNLEtBQUssR0FBRyxJQUFJLHVDQUFrQixDQUFDLEVBQUMsT0FBTyxHQUFFLENBQUMsQ0FBQztJQUVqRCxJQUFJO1FBSUYsSUFBSSxPQUFPLEVBQUU7WUFDWCxNQUFNLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxLQUFLLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNsQztRQUVELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDekQsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFFeEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBS2xDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzFELEtBQUssQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUN0QyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDaEMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ2hDLEtBQUssQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztRQUM1QyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7UUFHeEMsTUFBTSxLQUFLLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUczRCxNQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFbEMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FFMUI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNqQjtBQUVILENBQUMifQ==