"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const roomManager_1 = require("./lib/roomManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const gameManager_1 = require("./lib/gameManager");
const robotServerController = require("../robot/lib/robotServerController");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "番摊 配服务器启动之前");
        await gameManager_1.default.init(GameNidEnum_1.GameNidEnum.fanTan);
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "番摊 配服务器启动之后");
        await roomManager_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.fanTan });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.fanTan);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "番摊 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "番摊 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmFuVGFuL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHdFQUFtRTtBQUNuRSxtREFBNEM7QUFDNUMscUZBQWdGO0FBQ2hGLG1EQUFrRDtBQUNsRCw0RUFBNkU7QUFFN0U7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBQ1gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0MsTUFBTSxxQkFBaUIsQ0FBQyxJQUFJLENBQUMseUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0MsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBR3pCLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUd4RSxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFHeEYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUMsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=