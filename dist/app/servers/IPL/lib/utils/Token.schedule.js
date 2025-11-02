"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToken = exports.initToken = void 0;
const Schedule = require("node-schedule");
const IPLtoken_redis_dao_1 = require("../../../../common/dao/redis/IPLtoken.redis.dao");
const IPLHttp_utill_1 = require("./IPLHttp.utill");
async function initToken() {
    const token = await IPLHttp_utill_1.default.getIDToken();
    const accountHttp = IPLHttp_utill_1.default.getAccountHttp();
    await IPLtoken_redis_dao_1.default.updateOne(token);
    accountHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    updateToken();
}
exports.initToken = initToken;
async function updateToken() {
    Schedule.scheduleJob("*/50 * * * *", async function () {
        const token = await IPLHttp_utill_1.default.getIDToken();
        console.warn(`板球token 定时任务 ${token}`);
        const accountHttp = IPLHttp_utill_1.default.getAccountHttp();
        accountHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await IPLtoken_redis_dao_1.default.updateOne(token);
    });
}
exports.updateToken = updateToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9rZW4uc2NoZWR1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9JUEwvbGliL3V0aWxzL1Rva2VuLnNjaGVkdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDBDQUEyQztBQUMzQyx3RkFBK0U7QUFDL0UsbURBQTJDO0FBRXBDLEtBQUssVUFBVSxTQUFTO0lBQzNCLE1BQU0sS0FBSyxHQUFHLE1BQU0sdUJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM5QyxNQUFNLFdBQVcsR0FBRyx1QkFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ2xELE1BQU0sNEJBQWdCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxVQUFVLEtBQUssRUFBRSxDQUFDO0lBQ3pFLFdBQVcsRUFBRSxDQUFDO0FBQ2xCLENBQUM7QUFORCw4QkFNQztBQUtNLEtBQUssVUFBVSxXQUFXO0lBQzdCLFFBQVEsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLEtBQUs7UUFDdEMsTUFBTSxLQUFLLEdBQUcsTUFBTSx1QkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDckMsTUFBTSxXQUFXLEdBQUcsdUJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNsRCxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsVUFBVSxLQUFLLEVBQUUsQ0FBQztRQUN6RSxNQUFNLDRCQUFnQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFSRCxrQ0FRQyJ9