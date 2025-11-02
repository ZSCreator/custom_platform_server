"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sambaGameManager_1 = require("./lib/sambaGameManager");
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
        console.log(app.getServerId(), 'Samba 配服务器启动之前');
        await new sambaGameManager_1.default(GameNidEnum_1.GameNidEnum.Samba).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), 'Samba 配服务器启动之后');
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.Samba });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
        cb();
    }
    ;
    async afterStartAll(app) {
        console.log(app.getServerId(), "Samba 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.log(app.getServerId(), "Samba 服务器关闭之前");
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvU2FtYmEvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkRBQXNEO0FBQ3RELHFGQUFnRjtBQUNoRix3RUFBbUU7QUFDbkUsaUVBQTREO0FBQzVELG1EQUE0QztBQUU1QztJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBSWpELE1BQU0sSUFBSSwwQkFBZ0IsQ0FBQyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFHbEQsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUseUJBQVcsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sdUNBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHaEMsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXpCLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCO1FBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDeEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFHaEQsTUFBTSxxQkFBVyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFckMsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=