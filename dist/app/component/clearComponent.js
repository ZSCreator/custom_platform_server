"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearComponent = void 0;
const DatabaseConst = require("../consts/databaseConst");
const redisManager_1 = require("../common/dao/redis/lib/redisManager");
class ClearComponent {
    constructor(app, opts) {
        this.name = '__clear__';
        this.app = app;
    }
    async beforeStart(cb) {
        console.warn(`--------------------  服务器名字: ${this.app.serverType} --------------------`);
        process.nextTick(cb);
    }
    async start(cb) {
        await (0, redisManager_1.deleteKeyFromRedis)(DatabaseConst.AUTH_CODE_INFO_KEY);
    }
}
exports.ClearComponent = ClearComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJDb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvY29tcG9uZW50L2NsZWFyQ29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHlEQUF5RDtBQUN6RCx1RUFBd0U7QUFLeEUsTUFBYSxjQUFjO0lBSXZCLFlBQVksR0FBZ0IsRUFBRSxJQUFTO1FBSHZDLFNBQUksR0FBVyxXQUFXLENBQUM7UUFJdkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUtELEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBYztRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsdUJBQXVCLENBQUMsQ0FBQztRQUt6RixPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQWM7UUFrQnRCLE1BQU0sSUFBQSxpQ0FBa0IsRUFBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0o7QUF4Q0Qsd0NBd0NDIn0=