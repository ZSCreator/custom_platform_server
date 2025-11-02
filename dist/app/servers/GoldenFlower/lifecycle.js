'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const GoldenFlowerMgr_1 = require("./lib/GoldenFlowerMgr");
const BaiRenGameManager_1 = require("./lib/BaiRenGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "炸金花 配服务器启动之前");
        await new BaiRenGameManager_1.default(GameNidEnum_1.GameNidEnum.GoldenFlower).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), '炸金花!!afterStartup');
        await GoldenFlowerMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.GoldenFlower });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.GoldenFlower);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "炸金花 所有服务器启动之后");
    }
    ;
    beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "炸金花 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvR29sZGVuRmxvd2VyL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsMkRBQStDO0FBRy9DLCtEQUF3RDtBQUV4RCw0RUFBNEU7QUFDNUUsd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUVsRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFDRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUksMkJBQWlCLENBQUMseUJBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3RCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUVyRCxNQUFNLHlCQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHeEIsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkUsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBQUEsQ0FBQztJQUVGLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBRWxGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FFTCJ9