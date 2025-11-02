"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const moment = require("moment");
const SubGameRecord_mysql_dao_1 = require("../../app/common/dao/mysql/SubGameRecord.mysql.dao");
const PlatformNameAgentList_redis_dao_1 = require("../../app/common/dao/redis/PlatformNameAgentList.redis.dao");
const HallImplementation = require("../../app/servers/schedule/service/hall/implementation/hallImplementation");
async function copyGameRecordTable() {
    await RDSClient_1.RDSClient.demoInit();
    console.time("开始迁移数据");
    const createTimeDate = "2021-06-11 00:00:00";
    const beforeDateTime = "2021-07-01 00:00:00";
    const tableDate = moment(createTimeDate).format("YYYYMM");
    await SubGameRecord_mysql_dao_1.default.createTableAndCopyData(tableDate, beforeDateTime);
    console.timeEnd("开始迁移数据");
    process.exit();
    return true;
}
async function copyGameRecordTableForServen() {
    await RDSClient_1.RDSClient.demoInit();
    console.time("开始迁移数据");
    await HallImplementation.StartServerCheckGameRecordTable();
    let platformList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(true);
    for (let item of platformList) {
        let platformName = item.platformName;
        let platformUid = item.platformUid;
        let platformAgentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: platformName });
        if (!platformAgentList || platformAgentList.length == 0) {
            continue;
        }
        const startTime = moment(new Date()).startOf('month').format('YYYY-MM-DD 00:00:00.000');
        const endTime = moment(new Date()).endOf('month').format("YYYY-MM-DD 23:59:59.999");
        const tableDate = moment(new Date()).format("YYYYMM");
        console.warn("startTime", startTime);
        console.warn("endtTime", endTime);
        console.warn("tableDate", tableDate);
        console.warn("platformName", platformName);
        console.warn("platformUid", platformUid);
        await SubGameRecord_mysql_dao_1.default.copyDate(tableDate, startTime, endTime, platformUid, platformAgentList);
    }
    console.timeEnd("开始迁移数据");
    process.exit();
    return true;
}
copyGameRecordTableForServen();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZERpZmZEYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL0dhbWVSZWNvcmREaWZmRGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0VBQXFFO0FBQ3JFLGlDQUFpQztBQUNqQyxnR0FBdUY7QUFDdkYsZ0hBQXlHO0FBQ3pHLGdIQUFpSDtBQWVqSCxLQUFLLFVBQVUsbUJBQW1CO0lBQzlCLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDO0lBQzdDLE1BQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDO0lBQzdDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUQsTUFBTSxpQ0FBcUIsQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDOUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBUUQsS0FBSyxVQUFVLDRCQUE0QjtJQUN2QyxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQU92QixNQUFNLGtCQUFrQixDQUFDLCtCQUErQixFQUFFLENBQUM7SUFDM0QsSUFBSSxZQUFZLEdBQUcsTUFBTSx5Q0FBK0IsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0RixLQUFJLElBQUksSUFBSSxJQUFJLFlBQVksRUFBQztRQVN6QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ3JDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDbkMsSUFBSSxpQkFBaUIsR0FBRyxNQUFNLHlDQUErQixDQUFDLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRyxZQUFZLEVBQUMsQ0FBQyxDQUFDO1FBQ3RHLElBQUcsQ0FBQyxpQkFBaUIsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO1lBQ25ELFNBQVM7U0FDWjtRQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1FBQ3ZGLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3ZDLE1BQU0saUNBQXFCLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3hHO0lBQ0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMxQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZixPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBR0QsNEJBQTRCLEVBQUUsQ0FBQSJ9