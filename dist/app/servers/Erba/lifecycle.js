'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ErbaRoomMgr_1 = require("./lib/ErbaRoomMgr");
const utils = require("../../utils/index");
const ErbaGameManager_1 = require("./lib/ErbaGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "Erba|服务器启动之前");
        await new ErbaGameManager_1.default(GameNidEnum_1.GameNidEnum.Erba).init();
        ErbaRoomMgr_1.default.init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.Erba, bankerGame: false });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.Erba);
        console.warn(app.getServerId(), "Erba|服务器启动之后");
        setInterval(() => {
            const roomList = ErbaRoomMgr_1.default.getAllRooms();
            let num = roomList.filter(c => c.status == "INWAIT");
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.startGameTime >= 60 * 1000 * 2) {
                    console.warn(num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.startGameTime), utils.cDate());
                }
            }
        }, 1000);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "Erba|所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "|Erba服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRXJiYS9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLG1EQUF3QztBQUN4QywyQ0FBNEM7QUFDNUMsMkRBQXNEO0FBRXRELDRFQUE0RTtBQUM1RSx3RUFBcUU7QUFDckUscUZBQWtGO0FBR2xGO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUNYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRWhELE1BQU0sSUFBSSx5QkFBaUIsQ0FBQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JELHFCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFHL0MsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUYscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRCxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2IsTUFBTSxRQUFRLEdBQUcscUJBQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQztZQUNyRCxLQUFLLE1BQU0sUUFBUSxJQUFJLFFBQVEsRUFBRTtnQkFDN0IsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsSUFBSSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRTtvQkFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDbEg7YUFFSjtRQUdMLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNSLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUV4RixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRCxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==