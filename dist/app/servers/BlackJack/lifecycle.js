"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const BlackJackDynamicRoomManager_1 = require("./lib/BlackJackDynamicRoomManager");
const pinus_logger_1 = require("pinus-logger");
const BlackJackTenantRoomManager_1 = require("./lib/BlackJackTenantRoomManager");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), "21点服务器启动之前");
        cb();
    }
    async afterStartup(app, cb) {
        console.log(app.getServerId(), "21点服务器启动之后");
        await BlackJackDynamicRoomManager_1.BlackJackDynamicRoomManager
            .getInstance()
            .init();
        await BlackJackTenantRoomManager_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.BlackJack });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.BlackJack);
        cb();
    }
    afterStartAll(app) {
        console.log(app.getServerId(), "21点所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.log(app.getServerId(), "21点服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmxhY2tKYWNrL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1FQUFvRTtBQUVwRSw0RUFBNkU7QUFDN0Usd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUNsRixtRkFBZ0Y7QUFDaEYsK0NBQXlDO0FBQ3pDLGlGQUEwRTtBQUUxRSxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR25EO0lBQ0UsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUNiLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2xELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRzdDLEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUNELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRzdDLE1BQU0seURBQTJCO2FBQzlCLFdBQVcsRUFBRTthQUNiLElBQUksRUFBRSxDQUFDO1FBR1YsTUFBTSxvQ0FBMEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV4QyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFNUUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxFQUFFLEVBQUUsQ0FBQztJQUNQLENBQUM7SUFFRCxhQUFhLENBQUMsR0FBZ0I7UUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQ2xCLEdBQWdCLEVBQ2hCLFFBQW9CLEVBQ3BCLG1CQUErQjtRQUUvQixNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzdDLFFBQVEsRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUNGIn0=