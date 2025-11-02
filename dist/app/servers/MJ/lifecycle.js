'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mjGameManger_1 = require("./lib/mjGameManger");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const landGameManager_1 = require("./lib/landGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "二人麻将 配服务器启动之前");
        await new landGameManager_1.default(GameNidEnum_1.GameNidEnum.mj).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), '二人麻将!!afterStartup');
        await mjGameManger_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.mj });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.mj);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "二人麻将 所有服务器启动之后");
    }
    ;
    beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "二人麻将 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTUovbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixxREFBOEM7QUFHOUMsd0VBQXFFO0FBQ3JFLDJEQUFvRDtBQUVwRCw0RUFBNEU7QUFDNUUscUZBQWtGO0FBRWxGO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUNELE1BQU0sU0FBUztJQUVYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sSUFBSSx5QkFBZSxDQUFDLHlCQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakQsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFFdEQsTUFBTSxzQkFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyRSxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQUEsQ0FBQztJQUVGLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBRWxGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FFTCJ9