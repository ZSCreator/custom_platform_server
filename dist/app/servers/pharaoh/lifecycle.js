"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pharaohGameManager_1 = require("./lib/pharaohGameManager");
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
        await pharaohGameManager_1.default.getInstance().init();
        return cb();
    }
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.pharaoh });
        await limitConfigManager_1.LimitConfigManager.init();
        await roomManager_1.default.init();
        cb();
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await roomManager_1.default.saveAllRoomsPool();
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcGhhcmFvaC9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpRUFBMEQ7QUFDMUQscUZBQWdGO0FBQ2hGLHdFQUFtRTtBQUNuRSxpRUFBNEQ7QUFDNUQsbURBQTRDO0FBRTVDO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUVYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2hELE1BQU0sNEJBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFFL0MsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUseUJBQVcsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sdUNBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHaEMsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixNQUFNLHFCQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNyQyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7Q0FFSiJ9