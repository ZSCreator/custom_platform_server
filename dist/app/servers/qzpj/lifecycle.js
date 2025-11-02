"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qzpjMgr_1 = require("./lib/qzpjMgr");
const qzpjGameManager_1 = require("./lib/qzpjGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "抢庄牌九配服务器启动之前");
        await new qzpjGameManager_1.default(GameNidEnum_1.GameNidEnum.qzpj).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "抢庄牌九配服务器启动之后");
        await qzpjMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.qzpj });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.qzpj);
        cb();
    }
    afterStartAll(app) {
        console.warn(app.getServerId(), "抢庄牌九所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "抢庄牌九服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcXpwai9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBb0M7QUFJcEMsMkRBQW9EO0FBRXBELDRFQUE0RTtBQUM1RSx3RUFBcUU7QUFDckUscUZBQWtGO0FBR2xGO0lBQ0UsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUViLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sSUFBSSx5QkFBZSxDQUFDLHlCQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbkQsRUFBRSxFQUFFLENBQUM7SUFDUCxDQUFDO0lBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDakQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFaEQsTUFBTSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJCLE1BQU0sdUNBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHlCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RSxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQjtRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBRTFGLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUNGIn0=