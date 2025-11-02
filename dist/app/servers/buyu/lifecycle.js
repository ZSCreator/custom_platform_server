'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BuYuRoomManagerImpl_1 = require("./lib/BuYuRoomManagerImpl");
const fishGameManager_1 = require("./lib/fishGameManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const limitConfigManager_1 = require("./lib/limitConfigManager");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "捕鱼 服务器启动之前");
        await fishGameManager_1.default.getInstance().init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "捕鱼 服务器启动之后");
        await limitConfigManager_1.LimitConfigManager.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.buyu });
        await BuYuRoomManagerImpl_1.default.init();
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "捕鱼 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "捕鱼 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYnV5dS9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUliLG1FQUF1RDtBQUN2RCwyREFBbUQ7QUFHbkQscUZBQWtGO0FBQ2xGLHdFQUFxRTtBQUNyRSxpRUFBOEQ7QUFFOUQ7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBQ1gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUMsTUFBTSx5QkFBYyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFDLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFDRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUU5QyxNQUFNLHVDQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hDLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RSxNQUFNLDZCQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUV4RixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM5QyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==