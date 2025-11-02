"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const SpicyhotPotGameManager_1 = require("./lib/SpicyhotPotGameManager");
const RoomMgr_1 = require("./lib/RoomMgr");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const limitConfigManager_1 = require("./lib/limitConfigManager");
function default_1() {
    return new LifeCycle();
}
exports.default = default_1;
class LifeCycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), "麻辣火锅服务器启动之前");
        await new SpicyhotPotGameManager_1.default(GameNidEnum_1.GameNidEnum.SpicyhotPot).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.log(app.getServerId(), "麻辣火锅服务器启动之后");
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.SpicyhotPot });
        await limitConfigManager_1.LimitConfigManager.init();
        await RoomMgr_1.default.init();
    }
    async afterStartAll(app) {
        console.log(app.getServerId(), "麻辣火锅所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.log(app.getServerId(), "麻辣火锅服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvU3BpY3lob3RQb3QvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esd0VBQXFFO0FBQ3JFLHlFQUFrRTtBQUNsRSwyQ0FBd0M7QUFDeEMscUZBQWdGO0FBQ2hGLGlFQUE0RDtBQUU1RDtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM5QyxNQUFNLElBQUksZ0NBQXNCLENBQUMseUJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUk5QyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFDNUUsTUFBTSx1Q0FBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxNQUFNLGlCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0I7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM5QyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7Q0FDSiJ9