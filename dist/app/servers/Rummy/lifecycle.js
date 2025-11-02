'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
const RummyRoomManager_1 = require("./lib/RummyRoomManager");
const RummyGameManager_1 = require("./lib/RummyGameManager");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "Rummy|beforeStartup");
        await new RummyGameManager_1.default(GameNidEnum_1.GameNidEnum.Rummy).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "Rummy|afterStartup");
        await RummyRoomManager_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.Rummy });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.Rummy);
        console.warn(app.getServerId(), "Rummy|afterStartup");
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "Rummy|afterStartAll");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "Rummy|beforeShutdown");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvUnVtbXkvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixtRUFBbUU7QUFFbkUsNEVBQTZFO0FBQzdFLDZEQUFpRDtBQUNqRCw2REFBc0Q7QUFDdEQsd0VBQXFFO0FBQ3JFLHFGQUFnRjtBQUdoRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFDRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBR3ZELE1BQU0sSUFBSSwwQkFBZ0IsQ0FBQyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUsvQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBR3RELE1BQU0sMEJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV6QixNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFeEUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3RELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixNQUFNLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBR3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDeEQsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=