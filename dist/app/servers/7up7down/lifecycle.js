'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const up7RoomMgr_1 = require("./lib/up7RoomMgr");
const up7GameManager_1 = require("./lib/up7GameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new LifeCycle();
}
exports.default = default_1;
class LifeCycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "7up7down 服务器启动之前");
        await new up7GameManager_1.default(GameNidEnum_1.GameNidEnum.up7down).init();
        cb();
    }
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.up7down });
        console.warn(app.getServerId(), "7up7down 服务器启动之后");
        await up7RoomMgr_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.up7down);
        cb();
    }
    async afterStartAll(app) {
        console.warn(app.getServerId(), "7up7down 所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "7up7down 服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvN3VwN2Rvd24vbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYixtRUFBb0U7QUFFcEUsNEVBQTZFO0FBQzdFLGlEQUEwQztBQUMxQyx5REFBdUQ7QUFFdkQsd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUVsRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRXBELE1BQU0sSUFBSSx3QkFBbUIsQ0FBQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBRy9DLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMxRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRXBELE1BQU0sb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QixxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0I7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBQ3hGLE1BQU0sWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNwRCxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7Q0FDSiJ9