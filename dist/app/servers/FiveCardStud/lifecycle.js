"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FCSRoomMgr_1 = require("./lib/FCSRoomMgr");
const BaiRenGameManager_1 = require("./lib/BaiRenGameManager");
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "梭哈|匹配服务器启动之前");
        await new BaiRenGameManager_1.default(GameNidEnum_1.GameNidEnum.FiveCardStud).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "梭哈|匹配服务器启动之后");
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.FiveCardStud, bankerGame: false });
        await FCSRoomMgr_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.FiveCardStud);
        cb();
    }
    afterStartAll(app) {
        console.warn(app.getServerId(), "梭哈|匹配所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "梭哈|匹配服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRml2ZUNhcmRTdHVkL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlEQUEwQztBQUMxQywrREFBd0Q7QUFFeEQsbUVBQW9FO0FBRXBFLDRFQUE2RTtBQUM3RSx3RUFBcUU7QUFDckUscUZBQWtGO0FBQ2xGO0lBQ0UsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUViLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sSUFBSSwyQkFBaUIsQ0FBQyx5QkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzdELEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBRWpELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBR2hELE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRWxHLE1BQU0sb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QixxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25FLEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQjtRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDMUYsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRCxRQUFRLEVBQUUsQ0FBQztJQUNiLENBQUM7Q0FDRiJ9