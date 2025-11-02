"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MineGameGameManager_1 = require("./lib/MineGameGameManager");
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
        await MineGameGameManager_1.default.getInstance().init();
        return cb();
    }
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.MineGame });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
        cb();
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTWluZUdhbWUvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUVBQTJEO0FBQzNELHFGQUFnRjtBQUNoRix3RUFBbUU7QUFDbkUsaUVBQTREO0FBQzVELG1EQUE0QztBQUU1QztJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxNQUFNLDZCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlDLE9BQU8sRUFBRSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBRS9DLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLHlCQUFXLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLHVDQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO1FBR2hDLE1BQU0scUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN6QixFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDeEYsTUFBTSxxQkFBVyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDckMsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0NBRUoifQ==