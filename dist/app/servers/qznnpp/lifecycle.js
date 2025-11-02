"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const qznnMgr_1 = require("./lib/qznnMgr");
const timerService = require("../../services/common/timerService");
const qznnGameManager_1 = require("./lib/qznnGameManager");
const utils = require("../../utils/index");
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
        await new qznnGameManager_1.default(GameNidEnum_1.GameNidEnum.qznnpp).init();
        cb();
    }
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), "抢庄牛牛配服务器启动之后");
        await qznnMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.qznnpp });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.qznnpp);
        setInterval(() => {
            const roomList = qznnMgr_1.default.getAllRooms();
            let num = roomList.filter(c => c.status == "INWAIT");
            for (const roomInfo of roomList) {
                if (roomInfo.status != "INWAIT" && Date.now() - roomInfo.statusTime >= 60 * 1000 * 2) {
                    console.warn(num.length, roomInfo.roomId, roomInfo.status, utils.cDate(roomInfo.statusTime), utils.cDate());
                }
            }
        }, 1000);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcXpubnBwL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDJDQUFvQztBQUVwQyxtRUFBb0U7QUFFcEUsMkRBQW9EO0FBQ3BELDJDQUE0QztBQUU1Qyw0RUFBNkU7QUFDN0Usd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUdsRjtJQUNFLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFNLFNBQVM7SUFFYixLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUNoRCxNQUFNLElBQUkseUJBQWUsQ0FBQyx5QkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JELEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQ2pELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRWhELE1BQU0saUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQixNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3RCxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2YsTUFBTSxRQUFRLEdBQUcsaUJBQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUV2QyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQztZQUNyRCxLQUFLLE1BQU0sUUFBUSxJQUFJLFFBQVEsRUFBRTtnQkFDL0IsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRTtvQkFDcEYsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDN0c7YUFFRjtRQUdILENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNSLEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQjtRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBQzFGLE1BQU0sWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDL0MsUUFBUSxFQUFFLENBQUM7SUFDYixDQUFDO0NBQ0YifQ==