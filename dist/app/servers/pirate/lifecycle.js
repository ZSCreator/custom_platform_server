"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PirateGameManager_1 = require("./lib/PirateGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const pinus_1 = require("pinus");
const limitConfigManager_1 = require("./lib/limitConfigManager");
const roomManager_1 = require("./lib/roomManager");
const Logger = (0, pinus_1.getLogger)('server_out', __filename);
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        Logger.warn(app.getServerId(), "海盗服务器启动之前");
        await new PirateGameManager_1.default(GameNidEnum_1.GameNidEnum.pirate).init();
        cb();
    }
    async afterStartup(app, cb) {
        await limitConfigManager_1.LimitConfigManager.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.pirate });
        await roomManager_1.default.init();
        Logger.warn(app.getServerId(), "海盗服务器启动之后");
        cb();
    }
    afterStartAll(app) {
        Logger.warn(app.getServerId(), "海盗所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        Logger.warn(app.getServerId(), "海盗服务器关闭之前");
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcGlyYXRlL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtEQUF3RDtBQUN4RCx3RUFBcUU7QUFDckUscUZBQWtGO0FBQ2xGLGlDQUFrQztBQUNsQyxpRUFBNEQ7QUFDNUQsbURBQTRDO0FBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUEsaUJBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFbkQ7SUFDRSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDekIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBRWIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFNUMsTUFBTSxJQUFJLDJCQUFpQixDQUFDLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkQsRUFBRSxFQUFFLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDakQsTUFBTSx1Q0FBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdoQyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFHeEUsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTVDLEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQjtRQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBQzFGLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRzVDLE1BQU0scUJBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXJDLFFBQVEsRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUVGIn0=