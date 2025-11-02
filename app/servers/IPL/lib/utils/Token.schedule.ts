
import Schedule = require("node-schedule");
import IPLtokenRedisDao from "../../../../common/dao/redis/IPLtoken.redis.dao";
import IPLHttpUtill from "./IPLHttp.utill";

export async function initToken() {
    const token = await IPLHttpUtill.getIDToken();
    const accountHttp = IPLHttpUtill.getAccountHttp();
    await IPLtokenRedisDao.updateOne(token);
    accountHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    updateToken();
}

/**
 * 每50分钟维护一次
 */
export async function updateToken() {
    Schedule.scheduleJob("*/50 * * * *", async function () {
        const token = await IPLHttpUtill.getIDToken();
        console.warn(`板球token 定时任务 ${token}`)
        const accountHttp = IPLHttpUtill.getAccountHttp();
        accountHttp.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await IPLtokenRedisDao.updateOne(token);
    });
}