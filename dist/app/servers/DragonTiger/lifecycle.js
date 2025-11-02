'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DragonTigerRoomMangerImpl_1 = require("./lib/DragonTigerRoomMangerImpl");
const DragonTigerGameManager_1 = require("./lib/DragonTigerGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "龙虎斗服务器启动之前");
        await new DragonTigerGameManager_1.default(GameNidEnum_1.GameNidEnum.DragonTiger).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "龙虎斗服务器启动之后");
        await DragonTigerRoomMangerImpl_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.DragonTiger, bankerGame: true });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.DragonTiger);
        cb();
    }
    ;
    async afterStartAll(app) {
        console.warn(app.getServerId(), "龙虎斗所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "龙虎斗服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRHJhZ29uVGlnZXIvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYiwrRUFBaUU7QUFDakUseUVBQWtFO0FBQ2xFLHdFQUFtRTtBQUNuRSxxRkFBZ0Y7QUFFaEYsbUVBQW9FO0FBRXBFLDRFQUE2RTtBQUs3RTtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM5QyxNQUFNLElBQUksZ0NBQXNCLENBQUMseUJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFOUMsTUFBTSxtQ0FBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdoQyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM5RixxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWxFLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCO1FBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBQ3hGLE1BQU0sWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUMsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=