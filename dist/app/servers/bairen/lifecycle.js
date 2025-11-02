"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BairenRoomManager_1 = require("./lib/BairenRoomManager");
const BaiRenGameManager_1 = require("./lib/BaiRenGameManager");
const pinus_logger_1 = require("pinus-logger");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const bairenLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        bairenLogger.warn(app.getServerId(), "百人牛牛服务器启动之前");
        await new BaiRenGameManager_1.default(GameNidEnum_1.GameNidEnum.bairen).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        bairenLogger.warn(app.getServerId(), "百人牛牛服务器启动之后");
        BairenRoomManager_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.bairen, bankerGame: true });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.bairen);
        cb();
    }
    ;
    afterStartAll(app) {
        bairenLogger.warn(app.getServerId(), "百人牛牛所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        bairenLogger.warn(app.getServerId(), "百人牛牛服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpcmVuL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtEQUFnRDtBQUNoRCwrREFBd0Q7QUFDeEQsK0NBQXlDO0FBQ3pDLHdFQUFxRTtBQUNyRSxxRkFBa0Y7QUFDbEYsbUVBQW9FO0FBRXBFLDRFQUE2RTtBQUU3RSxNQUFNLFlBQVksR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRXpEO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUNYLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2hELFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBS3BELE1BQU0sSUFBSSwyQkFBaUIsQ0FBQyx5QkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUUvQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUdwRCwyQkFBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBR2pCLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXRDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3BELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9