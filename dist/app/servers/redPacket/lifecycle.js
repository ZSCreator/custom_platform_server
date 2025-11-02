"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifeCycle = void 0;
const pinus_logger_1 = require("pinus-logger");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const RedPacketDynamicRoomManager_1 = require("./lib/RedPacketDynamicRoomManager");
const RedPacketTenantRoomManager_1 = require("./lib/RedPacketTenantRoomManager");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
function default_1() {
    return new LifeCycle();
}
exports.default = default_1;
class LifeCycle {
    async beforeStartup(app, cb) {
        logger.info(`红包扫雷服务器 ${app.getServerId()} | 启动之前`);
        cb();
    }
    async afterStartup(app, cb) {
        const serverId = app.getServerId();
        try {
            await RedPacketDynamicRoomManager_1.RedPacketDynamicRoomManager
                .getInstance()
                .init();
            await RedPacketTenantRoomManager_1.default.init();
            await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.redPacket });
            logger.info(`红包扫雷服务器 ${serverId} | 启动完成`);
            robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.redPacket);
        }
        catch (e) {
            console.error(`红包扫雷: ${serverId} | 启动加载配置信息出错:${e.stack}`);
        }
        cb();
    }
    async afterStartAll(app) {
        logger.info(`红包扫雷服务器 ${app.getServerId()} | 所有服务器启动完成`);
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        logger.info(`红包扫雷服务器 ${app.getServerId()} | 开始关闭`);
        shutDown();
        logger.info(`红包扫雷服务器 ${app.getServerId()} | 关闭完成`);
    }
}
exports.LifeCycle = LifeCycle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcmVkUGFja2V0L2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQ0FBeUM7QUFDekMsNEVBQTRFO0FBQzVFLHdFQUFxRTtBQUNyRSxxRkFBa0Y7QUFDbEYsbUZBQWdGO0FBQ2hGLGlGQUEyRDtBQUUzRCxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRW5EO0lBQ0UsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsU0FBUztJQUVwQixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUVsRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNuRCxFQUFFLEVBQUUsQ0FBQztJQUNQLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNqRCxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkMsSUFBSTtZQVFGLE1BQU0seURBQTJCO2lCQUM5QixXQUFXLEVBQUU7aUJBQ2IsSUFBSSxFQUFFLENBQUM7WUFJVixNQUFNLG9DQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFekIsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxRQUFRLFNBQVMsQ0FBQyxDQUFDO1lBRTFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7U0FFakU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxRQUFRLGlCQUFpQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtTQUMzRDtRQUNELEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBZ0I7UUFFbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUMxRixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUduRCxRQUFRLEVBQUUsQ0FBQztRQUVYLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7Q0FFRjtBQXBERCw4QkFvREMifQ==