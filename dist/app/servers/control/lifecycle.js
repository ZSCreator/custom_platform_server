"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
const schedule_1 = require("../../services/bonusPools/schedule");
const backendControlService_1 = require("../../services/newControl/backendControlService");
const platformControlManager_1 = require("../../services/newControl/lib/platformControlManager");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    beforeStartup(app, cb) {
        console.warn("调控服务器启动之前");
        cb();
    }
    ;
    async afterStartup(app, cb) {
        console.warn("调控服务器启动之后");
        await backendControlService_1.BackendControlService.clearOnlineTotalControlPlayer();
        await platformControlManager_1.default.init();
        cb();
    }
    ;
    afterStartAll(app) {
        (0, schedule_1.runScheduleJob)();
        console.warn("调控所有服务器启动之后");
    }
    ;
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.warn("调控服务器关闭之前");
        await platformControlManager_1.default.saveAll();
        shutDown();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29udHJvbC9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQ0FBeUM7QUFDekMsaUVBQWtFO0FBQ2xFLDJGQUFzRjtBQUN0RixpR0FBMEY7QUFHMUY7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBR1g7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUcxQixNQUFNLDZDQUFxQixDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFHNUQsTUFBTSxnQ0FBc0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVwQyxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFBQSxDQUFDO0lBRUYsYUFBYSxDQUFDLEdBQWdCO1FBRTFCLElBQUEseUJBQWMsR0FBRSxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFDeEYsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixNQUFNLGdDQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3ZDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUFBLENBQUM7Q0FDTCJ9