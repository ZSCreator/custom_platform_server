"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    constructor() {
        this.loggerPreStr = '网关http服务器 | ';
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
    async beforeShutdown(app, shutDown) {
        console.log(`${this.loggerPreStr}${app.getServerId()} 正在关闭`);
        shutDown();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ2F0ZUh0dHAvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBTSxTQUFTO0lBQWY7UUFFSSxpQkFBWSxHQUFXLGNBQWMsQ0FBQztJQW1CMUMsQ0FBQztJQWpCRyxhQUFhLENBQUMsR0FBZ0IsRUFBRSxJQUFnQjtRQUM1QyxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFRCxZQUFZLENBQUMsR0FBZ0IsRUFBRSxJQUFnQjtRQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFBO1FBQzlELElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVELGFBQWEsQ0FBQyxHQUFnQjtRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksU0FBUyxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0IsRUFBRSxRQUFvQjtRQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQzVELFFBQVEsRUFBRSxDQUFDO0lBQ2YsQ0FBQztDQUNKIn0=