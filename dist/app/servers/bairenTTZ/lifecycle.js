'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ttzRoomMgr_1 = require("./lib/ttzRoomMgr");
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
        console.warn(app.getServerId(), "ttz_zhuang服务器启动之前");
        await new BaiRenGameManager_1.default(GameNidEnum_1.GameNidEnum.bairenTTZ).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        await ttzRoomMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.bairenTTZ, bankerGame: true });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.bairenTTZ);
        console.warn(app.getServerId(), "ttz_zhuang服务器启动之后");
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "ttz_zhuang所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "ttz_zhuang服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpcmVuVFRaL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsaURBQTBDO0FBQzFDLCtEQUF3RDtBQUV4RCw0RUFBNEU7QUFDNUUsd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUdsRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBRXJELE1BQU0sSUFBSSwyQkFBaUIsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUUvQyxNQUFNLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEIsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUYscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUV4RixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9