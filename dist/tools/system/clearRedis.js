"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseRedisManager_1 = require("../../app/common/dao/redis/lib/BaseRedisManager");
async function clear() {
    const conn = await BaseRedisManager_1.default.getConnection();
    await conn.flushall();
    console.warn('清理完成');
    process.exit();
}
process.nextTick(clear);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYXJSZWRpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3N5c3RlbS9jbGVhclJlZGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0ZBQStFO0FBRy9FLEtBQUssVUFBVSxLQUFLO0lBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQWdCLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDcEQsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUVELE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMifQ==