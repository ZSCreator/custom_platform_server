"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterDot = void 0;
const BlackJackRobotImpl_1 = require("./BlackJackRobotImpl");
const robotCommonOp_1 = require("../../../../services/robotService/overallController/robotCommonOp");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const EventEmitter = require('events').EventEmitter;
const BairenNidEnum_1 = require("../../../../common/constant/game/BairenNidEnum");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const nid = BairenNidEnum_1.BairenNidEnum.BlackJack;
const BlackJackTenantRoomManager_1 = require("../BlackJackTenantRoomManager");
const GameNidEnum_1 = require("../../../../common/constant/game/GameNidEnum");
function robotEnterDot(Mode_IO = false) {
    const robotManger = new robotCommonOp_1.default();
    robotManger.registerAddRobotListener(GameNidEnum_1.GameNidEnum.BlackJack, Mode_IO, singleRobotEnter, BlackJackTenantRoomManager_1.default.getAllRooms.bind(BlackJackTenantRoomManager_1.default));
    robotManger.start();
    return robotManger;
}
exports.robotEnterDot = robotEnterDot;
;
async function singleRobotEnter(nid, sceneId, roomId, Mode_IO, player, intoGold_arr) {
    if (!player) {
        return;
    }
    let intoGold = commonUtil.randomFromRange(intoGold_arr[0], intoGold_arr[1]);
    const blackJackRobot = new BlackJackRobotImpl_1.BlackJackRobotImpl({ Mode_IO, });
    try {
        blackJackRobot.gold_min = intoGold_arr[0];
        blackJackRobot.gold_max = intoGold_arr[1];
        if (Mode_IO) {
            await blackJackRobot.enterHall(player, nid);
        }
        else {
            blackJackRobot.enterHallMode(player, nid);
        }
        blackJackRobot.setRobotGoldBeforeEnter(nid, sceneId, intoGold);
        await blackJackRobot.enterGameOrSelectionList(nid, sceneId, roomId);
        const isSuccess = await blackJackRobot.loaded();
        if (isSuccess) {
            blackJackRobot.registerListener();
        }
    }
    catch (error) {
        robotlogger.warn(`blackjack robot ==> ${JSON.stringify(error)}`);
        blackJackRobot.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvcm9ib3QvQmxhY2tKYWNrQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLDZEQUEwRDtBQUMxRCxxR0FBeUc7QUFFekcsbUVBQW1FO0FBQ25FLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFDcEQsa0ZBQStFO0FBQy9FLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sR0FBRyxHQUFHLDZCQUFhLENBQUMsU0FBUyxDQUFDO0FBRXBDLDhFQUF3RDtBQUN4RCw4RUFBMkU7QUFHM0UsU0FBZ0IsYUFBYSxDQUFDLE9BQU8sR0FBRyxLQUFLO0lBR3pDLE1BQU0sV0FBVyxHQUFHLElBQUksdUJBQVcsRUFBRSxDQUFDO0lBQ3RDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsb0NBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9DQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNwQixPQUFPLFdBQVcsQ0FBQztBQUN2QixDQUFDO0FBUEQsc0NBT0M7QUFBQSxDQUFDO0FBRUYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFlBQXNCO0lBRW5JLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPO0tBQ1Y7SUFDRCxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUU1RSxNQUFNLGNBQWMsR0FBRyxJQUFJLHVDQUFrQixDQUFDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUU1RCxJQUFJO1FBQ0EsY0FBYyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsY0FBYyxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUMsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLGNBQWMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDTCxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMzQztRQUdILGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRy9ELE1BQU0sY0FBYyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFcEUsTUFBTSxTQUFTLEdBQUcsTUFBTSxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFaEQsSUFBSSxTQUFTLEVBQUU7WUFDWCxjQUFjLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUNyQztLQUNKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixXQUFXLENBQUMsSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRSxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7QUFDTCxDQUFDIn0=