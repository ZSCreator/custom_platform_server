'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const robotServerController = require("../robot/lib/robotServerController");
const ldGameManager_1 = require("./lib/ldGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const ldMgr_1 = require("./lib/ldMgr");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "幸运骰子 配服务器启动之前");
        await new ldGameManager_1.default(GameNidEnum_1.GameNidEnum.LuckyDice).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "幸运骰子 配服务器启动之后");
        await ldMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.LuckyDice });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.LuckyDice);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "幸运骰子 所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "幸运骰子 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvTHVja3lEaWNlL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2IsNEVBQTZFO0FBQzdFLHVEQUFnRDtBQUNoRCx3RUFBcUU7QUFDckUsdUNBQWdDO0FBQ2hDLHFGQUFrRjtBQUNsRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNqRCxNQUFNLElBQUksdUJBQWEsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUVqRCxNQUFNLGVBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDNUUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsYUFBYSxDQUFDLEdBQWdCO1FBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFFeEYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDaEQsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=