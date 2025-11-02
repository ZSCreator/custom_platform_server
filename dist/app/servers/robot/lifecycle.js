'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const robotServerController = require("./lib/robotServerController");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), '!!beforeStartup');
        return cb();
    }
    ;
    async afterStartup(app, cb) {
        console.log(app.getServerId(), '!!afterStartup');
        await robotServerController.robot_Controller.stop();
        await robotServerController.afterRobotServerStarted();
        return cb();
    }
    ;
    async afterStartAll(app) {
        console.warn(app.getServerId(), "==================机器人所有服务器启动之后==============");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        await robotServerController.robot_Controller.stop();
        console.warn("机器人服务器关闭之前");
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcm9ib3QvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFJYixxRUFBc0U7QUFJdEU7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBTSxTQUFTO0lBRVgsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNsRCxPQUFPLEVBQUUsRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNqRCxNQUFNLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BELE1BQU0scUJBQXFCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUN0RCxPQUFPLEVBQUUsRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQjtRQUdoQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSw4Q0FBOEMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBQ3hGLE1BQU0scUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEQsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUUvQixDQUFDO0lBQUEsQ0FBQztDQUNMIn0=