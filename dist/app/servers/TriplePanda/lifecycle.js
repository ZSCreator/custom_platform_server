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
        console.log(app.getServerId(), 'TriplePanda 配服务器启动之前');
        await new SlotsGameManager_1.default(GameNidEnum_1.GameNidEnum.TriplePanda).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), 'TriplePanda 配服务器启动之后');
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.TriplePanda });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
        cb();
    }
    ;
    async afterStartAll(app) {
        console.log(app.getServerId(), "TriplePanda 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.log(app.getServerId(), "TriplePanda 服务器关闭之前");
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvVHJpcGxlUGFuZGEvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkRBQXNEO0FBQ3RELHFGQUFrRjtBQUNsRix3RUFBcUU7QUFDckUsaUVBQThEO0FBQzlELG1EQUE0QztBQUU1QztJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBSXZELE1BQU0sSUFBSSwwQkFBZ0IsQ0FBQyx5QkFBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTNELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFHeEQsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sdUNBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHaEMsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXpCLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDeEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUd0RCxNQUFNLHFCQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUVyQyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==