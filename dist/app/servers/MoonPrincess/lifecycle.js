"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CandyPartyGameManager_1 = require("./lib/CandyPartyGameManager");
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
        await CandyPartyGameManager_1.default.getInstance().init();
        return cb();
    }
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.CandyParty });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
        cb();
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTW9vblByaW5jZXNzL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVFQUE2RDtBQUM3RCxxRkFBZ0Y7QUFDaEYsd0VBQW1FO0FBQ25FLGlFQUE0RDtBQUM1RCxtREFBNEM7QUFFNUM7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBRVgsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsTUFBTSwrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM5QyxPQUFPLEVBQUUsRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUUvQyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7UUFDM0UsTUFBTSx1Q0FBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdoQyxNQUFNLHFCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBQ3hGLE1BQU0scUJBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztDQUVKIn0=