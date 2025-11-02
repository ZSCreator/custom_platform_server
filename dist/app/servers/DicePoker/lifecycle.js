'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DiceRoomMgr_1 = require("./lib/DiceRoomMgr");
const utils = require("../../utils/index");
const DiceGameManager_1 = require("./lib/DiceGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "Dice|服务器启动之前");
        await new DiceGameManager_1.default(GameNidEnum_1.GameNidEnum.DicePoker).init();
        DiceRoomMgr_1.default.init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.DicePoker, bankerGame: false });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.DicePoker);
        console.warn(app.getServerId(), "DicePoker|服务器启动之后");
        setInterval(() => {
            const roomList = DiceRoomMgr_1.default.getAllRooms();
            let num = roomList.filter(c => c.status == "INGAME");
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.startGameTime >= 90 * 1000 * 14) {
                    console.warn(num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.startGameTime), utils.cDate());
                }
            }
        }, 1000);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "Dice|所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "|Dice 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRGljZVBva2VyL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsbURBQTRDO0FBQzVDLDJDQUE0QztBQUM1QywyREFBc0Q7QUFFdEQsNEVBQTRFO0FBQzVFLHdFQUFxRTtBQUNyRSxxRkFBa0Y7QUFHbEY7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBQ1gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFaEQsTUFBTSxJQUFJLHlCQUFpQixDQUFDLHlCQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUQscUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFHL0MsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDL0YscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JELFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDYixNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzNDLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxDQUFDO1lBQ3JELEtBQUssTUFBTSxRQUFRLElBQUksUUFBUSxFQUFFO2dCQUM3QixJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxJQUFJLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxFQUFFO29CQUN0RixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUNsSDthQUVKO1FBR0wsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ1IsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBRXhGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2pELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9