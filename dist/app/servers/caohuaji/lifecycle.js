'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const timerService = require("../../services/common/timerService");
const caohuajiService = require("../../services/caohuajiService");
const CHJRoomManagerImpl_1 = require("./lib/CHJRoomManagerImpl");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const CaoHuaJiGameManagerImpl_1 = require("./lib/CaoHuaJiGameManagerImpl");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), "草花机服务器启动之前");
        await new CaoHuaJiGameManagerImpl_1.CaoHuaJiGameManagerImpl(GameNidEnum_1.GameNidEnum.caohuaji).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.log(app.getServerId(), "草花机服务器启动之后");
        await CHJRoomManagerImpl_1.default.init();
        caohuajiService.resetHistory();
        timerService.caohuajiTimerJackpot(GameNidEnum_1.GameNidEnum.caohuaji);
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.caohuaji });
        cb();
    }
    ;
    afterStartAll(app) {
        console.log(app.getServerId(), "草花机所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await timerService.delayServerClose();
        console.log(app.getServerId(), "草花机服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2FvaHVhamkvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFHYixtRUFBbUU7QUFFbkUsa0VBQWtFO0FBRWxFLGlFQUE0RTtBQUc1RSx3RUFBcUU7QUFDckUscUZBQWtGO0FBQ2xGLDJFQUF3RTtBQUV4RTtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFDWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM3QyxNQUFNLElBQUksaURBQXVCLENBQUMseUJBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvRCxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBQ0YsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFLN0MsTUFBTSw0QkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUdoQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUM7UUFHL0IsWUFBWSxDQUFDLG9CQUFvQixDQUFDLHlCQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFHeEQsTUFBTSx1Q0FBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUseUJBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRzNFLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDeEYsTUFBTSxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV0QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM3QyxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFBQSxDQUFDO0NBQ0wifQ==