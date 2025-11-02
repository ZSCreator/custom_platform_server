"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timerService = require("../../services/common/timerService");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    constructor() {
        this.loggerPreStr = '网关服务器 | ';
    }
    beforeStartup(app, next) {
        next();
    }
    afterStartup(app, next) {
        console.log(`${this.loggerPreStr}${app.getServerId()} | 启动完成`);
        next();
    }
    afterStartAll(app) {
        console.log(`${this.loggerPreStr} 全部启动完成`);
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        console.log(`${this.loggerPreStr}${app.getServerId()} 正在关闭`);
        await timerService.delayServerClose();
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ2F0ZS9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtRUFBb0U7QUFHcEU7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBTSxTQUFTO0lBQWY7UUFFSSxpQkFBWSxHQUFXLFVBQVUsQ0FBQztJQW9CdEMsQ0FBQztJQWxCRyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxJQUFnQjtRQUM1QyxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFRCxZQUFZLENBQUMsR0FBZ0IsRUFBRSxJQUFnQjtRQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQzlELElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksU0FBUyxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQixFQUFFLG1CQUErQjtRQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQzVELE1BQU0sWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdEMsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0NBQ0oifQ==