'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const chinese_pokerMgr_1 = require("./lib/chinese_pokerMgr");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const BaijiaGameManager_1 = require("./lib/BaijiaGameManager");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "13张服务器启动之前");
        await new BaijiaGameManager_1.default(GameNidEnum_1.GameNidEnum.ChinesePoker).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "13张服务器启动之后");
        chinese_pokerMgr_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.ChinesePoker);
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.ChinesePoker });
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "13张所有服务器启动之后");
    }
    ;
    beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "13张服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2hpbmVzZV9wb2tlci9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLDZEQUFnRDtBQUloRCw0RUFBNEU7QUFDNUUsd0VBQXFFO0FBQ3JFLCtEQUF3RDtBQUN4RCxxRkFBa0Y7QUFFbEY7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBQ1gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDOUMsTUFBTSxJQUFJLDJCQUFpQixDQUFDLHlCQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0QsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRTlDLDBCQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEIscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUduRSxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDL0UsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUEsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBQUEsQ0FBQztJQUVGLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBRWxGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzlDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9