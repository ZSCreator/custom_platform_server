'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const BGRoomManager_1 = require("./lib/BGRoomManager");
const utils = require("../../utils/index");
const BGGameManager_1 = require("./lib/BGGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const gameControlService_1 = require("../../services/newControl/gameControlService");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        await BGGameManager_1.default.getInstance().init();
        console.warn(app.getServerId(), "21点|服务器启动之前");
        cb();
    }
    ;
    async afterStartup(app, cb) {
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.BlackGame });
        await BGRoomManager_1.default.init();
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.BlackGame);
        console.warn(app.getServerId(), "21点|服务器启动之后");
        setInterval(() => {
            const roomList = BGRoomManager_1.default.getAllRooms();
            let num = roomList.filter(c => c.status != "INWAIT");
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.lastWaitTime >= 60 * 1000 * 2) {
                    console.warn("BG", num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.lastWaitTime), utils.cDate());
                }
            }
        }, 10 * 1000);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "21点|所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "21点|服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQmxhY2tHYW1lL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBSWIsdURBQThDO0FBQzlDLDJDQUE0QztBQUM1Qyx1REFBZ0Q7QUFFaEQsNEVBQTRFO0FBQzVFLHFGQUFrRjtBQUNsRix3RUFBcUU7QUFFckU7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBQ1gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsTUFBTSx1QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFDRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUcvQyxNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDNUUsTUFBTSx1QkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0MsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUNiLE1BQU0sUUFBUSxHQUFHLHVCQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFM0MsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLENBQUM7WUFFckQsS0FBSyxNQUFNLFFBQVEsSUFBSSxRQUFRLEVBQUU7Z0JBQzdCLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQyxZQUFZLElBQUksRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ3BGLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUN2SDthQUVKO1FBR0wsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUViLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixhQUFhLENBQUMsR0FBZ0I7UUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFFeEYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDL0MsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=