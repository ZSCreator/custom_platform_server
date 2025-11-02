"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
const main_1 = require("./lib/main");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async afterStartup(app, cb) {
        (0, main_1.nestRun)();
        this.logger.info(`http服务 | 启动完成`);
        cb();
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        try {
            shutDown();
        }
        catch (e) {
            this.logger.error(`http服务 | 关闭服务器 | 出错 : ${e.stack}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpZmVjeWNsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtDQUF5QztBQUN6QyxxQ0FBbUM7QUFHbkM7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBTSxTQUFTO0lBR1g7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBZ0IsRUFBRSxFQUFjO1FBQy9DLElBQUEsY0FBTyxHQUFFLENBQUM7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsQyxFQUFFLEVBQUUsQ0FBQztJQUNULENBQUM7SUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLEdBQWdCLEVBQUUsUUFBb0IsRUFBRSxtQkFBK0I7UUFFeEYsSUFBSTtZQUNBLFFBQVEsRUFBRSxDQUFDO1NBQ2Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUN6RDtJQUNMLENBQUM7Q0FDSiJ9