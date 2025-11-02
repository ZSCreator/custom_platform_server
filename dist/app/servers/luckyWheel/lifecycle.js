"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameManager_1 = require("./lib/gameManager");
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
        await new gameManager_1.default(GameNidEnum_1.GameNidEnum.luckyWheel).init();
        return cb();
    }
    ;
    async afterStartup(app, cb) {
        console.log(app.getServerId(), "幸运转盘 所有服务器启动");
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.luckyWheel });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
    }
    ;
    afterStartAll(app) {
        console.log(app.getServerId(), "幸运转盘 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvbHVja3lXaGVlbC9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtREFBNEM7QUFDNUMsd0VBQXFFO0FBQ3JFLHFGQUFnRjtBQUNoRixpRUFBNEQ7QUFDNUQsbURBQTRDO0FBRTVDO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUNELE1BQU0sU0FBUztJQUNYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBS2hELE1BQU0sSUFBSSxxQkFBVyxDQUFDLHlCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckQsT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRy9DLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLHlCQUFXLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUMzRSxNQUFNLHVDQUFrQixDQUFDLElBQUksRUFBRSxDQUFDO1FBR2hDLE1BQU0scUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBRXhGLE1BQU0scUJBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3JDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9