"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const XiYouJiGameManager_1 = require("./lib/XiYouJiGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const limitConfigManager_1 = require("./lib/limitConfigManager");
const roomManager_1 = require("./lib/roomManager");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        await new XiYouJiGameManager_1.default(GameNidEnum_1.GameNidEnum.xiyouji).init();
        return cb();
    }
    ;
    async afterStartup(app, cb) {
        console.log(app.getServerId(), "猴王传奇 所有服务器启动");
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.xiyouji });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
    }
    ;
    afterStartAll(app) {
        console.log(app.getServerId(), "猴王传奇 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMveGl5b3VqaS9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpRUFBMEQ7QUFDMUQsd0VBQXFFO0FBQ3JFLHFGQUFnRjtBQUNoRixpRUFBNEQ7QUFDNUQsbURBQTRDO0FBRTVDO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUNELE1BQU0sU0FBUztJQUNYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBS2hELE1BQU0sSUFBSSw0QkFBa0IsQ0FBQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pELE9BQU8sRUFBRSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUcvQyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7UUFDeEUsTUFBTSx1Q0FBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdoQyxNQUFNLHFCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUV4RixNQUFNLHFCQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNyQyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==