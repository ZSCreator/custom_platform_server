'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const robotServerController = require("../robot/lib/robotServerController");
const landGameManager_1 = require("./lib/landGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const landMgr_1 = require("./lib/landMgr");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "斗地主 配服务器启动之前");
        await new landGameManager_1.default(GameNidEnum_1.GameNidEnum.land).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "斗地主 配服务器启动之后");
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.land });
        await landMgr_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.land);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "斗地主 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "斗地主 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvbGFuZC9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLDRFQUE2RTtBQUM3RSwyREFBb0Q7QUFDcEQsd0VBQXFFO0FBQ3JFLDJDQUFvQztBQUNwQyxxRkFBa0Y7QUFFbEY7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBQ1gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDaEQsTUFBTSxJQUFJLHlCQUFlLENBQUMseUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuRCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDaEQsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0saUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFFeEYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDL0MsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=