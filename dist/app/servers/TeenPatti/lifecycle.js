'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const TeenPattiMgr_1 = require("./lib/TeenPattiMgr");
const TeenPattiGameManager_1 = require("./lib/TeenPattiGameManager");
const robotServerController = require("../robot/lib/robotServerController");
const GameNidEnum_1 = require("../../common/constant/game/GameNidEnum");
const gameControlService_1 = require("../../services/newControl/gameControlService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.warn(app.getServerId(), "TeenPatti 配服务器启动之前");
        await new TeenPattiGameManager_1.default(GameNidEnum_1.GameNidEnum.TeenPatti).init();
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn(app.getServerId(), 'TeenPatti !!afterStartup');
        await TeenPattiMgr_1.default.init();
        await gameControlService_1.GameControlService.getInstance().init({ nid: GameNidEnum_1.GameNidEnum.TeenPatti });
        robotServerController.start_robot_server(GameNidEnum_1.GameNidEnum.TeenPatti);
        cb();
    }
    ;
    afterStartAll(app) {
        console.warn(app.getServerId(), "TeenPatti 所有服务器启动之后");
    }
    ;
    beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn(app.getServerId(), "TeenPatti 服务器关闭之前");
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvVGVlblBhdHRpL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIscURBQThDO0FBRzlDLHFFQUEyRDtBQUUzRCw0RUFBNEU7QUFDNUUsd0VBQXFFO0FBQ3JFLHFGQUFrRjtBQUVsRjtJQUNJLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRkQsNEJBRUM7QUFDRCxNQUFNLFNBQVM7SUFFWCxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sSUFBSSw4QkFBaUIsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFELEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1FBRTVELE1BQU0sc0JBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUcxQixNQUFNLHVDQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSx5QkFBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDNUUscUJBQXFCLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsYUFBYSxDQUFDLEdBQWdCO1FBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUFBLENBQUM7SUFFRixjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUVsRixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9