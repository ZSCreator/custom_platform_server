"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dzRoomMgr_1 = require("./lib/dzRoomMgr");
const BaiRenGameManager_1 = require("./lib/BaiRenGameManager");
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "德州匹配服务器启动之前");
        await new BaiRenGameManager_1.default(GameNidEnum_1.GameNidEnum.dzpipei).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "德州匹配服务器启动之后");
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.dzpipei, bankerGame: true });
        dzRoomMgr_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.dzpipei);
        cb();
    }
    afterStartAll(app) {
        console.warn(app.getServerId(), "德州匹配所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "德州匹配服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRFpwaXBlaS9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQ0FBd0M7QUFDeEMsK0RBQXdEO0FBQ3hELG1FQUFvRTtBQUVwRSw0RUFBNkU7QUFDN0Usd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUNsRjtJQUNFLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFYixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvQyxNQUFNLElBQUksMkJBQWlCLENBQUMseUJBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4RCxFQUFFLEVBQUUsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUVqRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUcvQyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUU1RixtQkFBUyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWpCLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUQsRUFBRSxFQUFFLENBQUM7SUFDUCxDQUFDO0lBRUQsYUFBYSxDQUFDLEdBQWdCO1FBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDMUYsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvQyxRQUFRLEVBQUUsQ0FBQztJQUNiLENBQUM7Q0FDRiJ9