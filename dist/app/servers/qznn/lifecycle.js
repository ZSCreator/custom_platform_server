"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qznnMgr_1 = require("./lib/qznnMgr");
const timerService = require("../../services/common/timerService");
const qznnGameManager_1 = require("./lib/qznnGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "抢庄牛牛配服务器启动之前");
        await new qznnGameManager_1.default(GameNidEnum_1.GameNidEnum.qznn).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "抢庄牛牛配服务器启动之后");
        await qznnMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.qznn });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.qznn);
        cb();
    }
    afterStartAll(app) {
        console.warn(app.getServerId(), "抢庄牛牛所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "抢庄牛牛服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcXpubi9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBb0M7QUFFcEMsbUVBQW9FO0FBRXBFLDJEQUFvRDtBQUVwRCw0RUFBNkU7QUFDN0Usd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUdsRjtJQUNFLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFYixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUkseUJBQWUsQ0FBQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25ELEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2pELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRWhELE1BQU0saUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQixNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdkUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxFQUFFLEVBQUUsQ0FBQztJQUNQLENBQUM7SUFFRCxhQUFhLENBQUMsR0FBZ0I7UUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUMxRixNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUNGIn0=