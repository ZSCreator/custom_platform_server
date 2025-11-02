"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FisheryRoomManagerImpl_1 = require("./lib/FisheryRoomManagerImpl");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const gameManager_1 = require("./lib/gameManager");
const timerService = require("../../services/common/timerService");
const robotServerController = require("../robot/lib/robotServerController");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "渔场大亨服务器启动之前");
        await (0, gameManager_1.init)(GameNidEnum_1.GameNidEnum.fishery);
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "渔场大亨服务器启动之后");
        await FisheryRoomManagerImpl_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.fishery });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.fishery);
        cb();
    }
    afterStartAll(app) {
        console.warn(app.getServerId(), "渔场大亨所有服务器启动之后");
    }
    async beforeShutdown(app, shutDown) {
        await timerService.delayServerClose();
        console.warn(app.getServerId(), "渔场大亨服务器关闭之前");
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmlzaGVyeS9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx5RUFBOEQ7QUFDOUQsd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUNsRixtREFBNEQ7QUFDNUQsbUVBQW9FO0FBRXBFLDRFQUE2RTtBQUU3RTtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUcvQyxNQUFNLElBQUEsa0JBQWUsRUFBQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTNDLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRy9DLE1BQU0sZ0NBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHaEMsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRTFFLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUQsRUFBRSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRUQsYUFBYSxDQUFDLEdBQWdCO1FBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0I7UUFDdkQsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMvQyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7Q0FDSiJ9