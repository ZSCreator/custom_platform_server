"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const roomManager_1 = require("./lib/roomManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const gameManager_1 = require("./lib/gameManager");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "Crash 配服务器启动之前");
        await gameManager_1.default.init(GameNidEnum_1.GameNidEnum.Crash);
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "Crash 配服务器启动之后");
        await roomManager_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.Crash, bankerGame: true });
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "Crash 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "Crash 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ3Jhc2gvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esd0VBQW1FO0FBQ25FLG1EQUE0QztBQUM1QyxxRkFBZ0Y7QUFDaEYsbURBQXNEO0FBRXREO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUNYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFHbEQsTUFBTSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUlsRCxNQUFNLHFCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHekIsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFFMUYsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBR3hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2pELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9