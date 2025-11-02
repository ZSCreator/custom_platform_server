"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SlotsGameManager_1 = require("./lib/SlotsGameManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const limitConfigManager_1 = require("./lib/limitConfigManager");
const roomManager_1 = require("./lib/roomManager");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), '金鸡报喜 配服务器启动之前');
        await new SlotsGameManager_1.default(GameNidEnum_1.GameNidEnum.FortuneRooster).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), '金鸡报喜 配服务器启动之后');
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.FortuneRooster });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
        cb();
    }
    ;
    async afterStartAll(app) {
        console.log(app.getServerId(), "金鸡报喜 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.log(app.getServerId(), "金鸡报喜 服务器关闭之前");
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRm9ydHVuZVJvb3N0ZXIvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkRBQXNEO0FBQ3RELHFGQUFnRjtBQUNoRix3RUFBbUU7QUFDbkUsaUVBQTREO0FBQzVELG1EQUE0QztBQUU1QztJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUloRCxNQUFNLElBQUksMEJBQWdCLENBQUMseUJBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU5RCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUdqRCxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSx5QkFBVyxDQUFDLGNBQWMsRUFBQyxDQUFDLENBQUM7UUFDL0UsTUFBTSx1Q0FBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdoQyxNQUFNLHFCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFekIsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0I7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUcvQyxNQUFNLHFCQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVyQyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==