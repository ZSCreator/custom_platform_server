'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const SicBoRoomMgr_1 = require("./lib/SicBoRoomMgr");
const SicBoGameManager_1 = require("./lib/SicBoGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new LifeCycle();
}
exports.default = default_1;
class LifeCycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), "骰宝服务器启动之前");
        await new SicBoGameManager_1.default(GameNidEnum_1.GameNidEnum.SicBo).init();
        cb();
    }
    async afterStartup(app, cb) {
        gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.SicBo });
        console.log(app.getServerId(), "骰宝服务器启动之后");
        await SicBoRoomMgr_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.SicBo);
        cb();
    }
    async afterStartAll(app) {
        console.log(app.getServerId(), "骰宝所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.log(app.getServerId(), "骰宝服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvU2ljQm8vbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYixtRUFBb0U7QUFFcEUsNEVBQTZFO0FBQzdFLHFEQUE4QztBQUM5Qyw2REFBeUQ7QUFFekQsd0VBQW1FO0FBQ25FLHFGQUFnRjtBQUVoRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU1QyxNQUFNLElBQUksMEJBQW1CLENBQUMseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4RCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUkvQyx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUseUJBQVcsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sc0JBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUxQixxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0I7UUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXRDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztDQUNKIn0=