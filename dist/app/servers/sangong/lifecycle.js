'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const SangongMgr_1 = require("./lib/SangongMgr");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const BaijiaGameManager_1 = require("./lib/BaijiaGameManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "三公服务器启动之前");
        await new BaijiaGameManager_1.default(GameNidEnum_1.GameNidEnum.sangong).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "三公服务器启动之后");
        await SangongMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.sangong });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.sangong);
        cb();
    }
    ;
    async afterStartAll(app) {
        console.warn(app.getServerId(), "三公所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "三公服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvc2FuZ29uZy9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLGlEQUEwQztBQUMxQyx3RUFBcUU7QUFDckUsK0RBQXdEO0FBQ3hELHFGQUFrRjtBQUNsRixtRUFBb0U7QUFFcEUsNEVBQTZFO0FBRTdFO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUNYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLE1BQU0sSUFBSSwyQkFBaUIsQ0FBQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3hELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU3QyxNQUFNLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHeEIsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTFFLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0I7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDeEYsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM3QyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==