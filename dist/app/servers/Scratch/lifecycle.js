"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ScratchGameManager_1 = require("./lib/ScratchGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const roomManager_1 = require("./lib/roomManager");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "刮刮乐服务器启动之前");
        await new ScratchGameManager_1.default(GameNidEnum_1.GameNidEnum.Scratch).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.Scratch });
        await roomManager_1.default.init();
        console.warn(app.getServerId(), "刮刮乐服务器启动之后");
        cb();
    }
    afterStartAll(app) {
        console.log(app.getServerId(), '!!after start all');
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.log("刮刮乐服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvU2NyYXRjaC9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpRUFBMEQ7QUFDMUQsd0VBQW1FO0FBQ25FLHFGQUFnRjtBQUNoRixtREFBNEM7QUFHNUM7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBTVgsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFJOUMsTUFBTSxJQUFJLDRCQUFrQixDQUFDLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekQsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQU9GLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztRQUd6RSxNQUFNLHFCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHekIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUMsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsYUFBYSxDQUFDLEdBQWdCO1FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUdELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTFCLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9