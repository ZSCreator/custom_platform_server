"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const SumTenantOperationalData_entity_1 = require("../../app/common/dao/mysql/entity/SumTenantOperationalData.entity");
const moment = require("moment");
const SumTenantOperationalData_mysql_dao_1 = require("../../app/common/dao/mysql/SumTenantOperationalData.mysql.dao");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
const PlatformNameAgentList_redis_dao_1 = require("../../app/common/dao/redis/PlatformNameAgentList.redis.dao");
async function sumGameRecordTable() {
    try {
        await RDSClient_1.RDSClient.demoInit();
        console.time("开始统计");
        const lastRecord = await connectionManager_1.default.getConnection()
            .getRepository(SumTenantOperationalData_entity_1.SumTenantOperationalData)
            .createQueryBuilder("gr")
            .select("gr.sumDate")
            .orderBy("gr.sumDate", "DESC")
            .getOne();
        let lastDateTime = "2021-07-01 00:00:00";
        const beforeDateTime = "2021-07-06 00:00:00";
        if (lastRecord) {
            lastDateTime = moment(lastRecord.sumDate).format("YYYY-MM-DD HH:mm:ss");
        }
        const diffDays = moment(beforeDateTime).diff(lastDateTime, "day");
        console.log(`最近的汇总记录日期`, lastDateTime, diffDays);
        for (let i = 1; i < diffDays; i++) {
            const checkTargetDate1 = moment(lastDateTime).add(i, "day").format("YYYY-MM-DD");
            const checkTargetDate2 = moment(lastDateTime).add(i + 1, "day").format("YYYY-MM-DD");
            const startDateTime = `${checkTargetDate1} 00:00:00`;
            const endDateTime = `${checkTargetDate2} 00:00:00`;
            console.warn(`开始统计`, startDateTime, endDateTime);
            let tableTime = moment(startDateTime).format("YYYYMM");
            const platformList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(false);
            for (let key of platformList) {
                let platformUid = key.platformUid;
                const tableName = `Sp_GameRecord_${platformUid}_${tableTime}`;
                const result = await SumTenantOperationalData_mysql_dao_1.default.copyTenantOperationalData(tableName, startDateTime, endDateTime);
                await SumTenantOperationalData_mysql_dao_1.default.insertMany(result);
            }
        }
        console.timeEnd("开始统计");
        process.exit();
    }
    catch (e) {
        console.error(e.stack);
    }
}
sumGameRecordTable();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlY29yZEZvclN1bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvR2FtZVJlY29yZEZvclN1bS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdFQUFxRTtBQUdyRSx1SEFBNkc7QUFFN0csaUNBQWlDO0FBSWpDLHNIQUE2RztBQUM3Ryx3RkFBaUY7QUFDakYsZ0hBQXVHO0FBV3ZHLEtBQUssVUFBVSxrQkFBa0I7SUFDN0IsSUFBSTtRQUNBLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBTXBCLE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2FBQ3JELGFBQWEsQ0FBQywwREFBd0IsQ0FBQzthQUN2QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7YUFDeEIsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUNwQixPQUFPLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQzthQUM3QixNQUFNLEVBQUUsQ0FBQztRQUVkLElBQUksWUFBWSxHQUFJLHFCQUFxQixDQUFDO1FBQzFDLE1BQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDO1FBQzdDLElBQUksVUFBVSxFQUFDO1lBQ1gsWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDM0U7UUFJRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVsRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFakQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQixNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNqRixNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDckYsTUFBTSxhQUFhLEdBQUcsR0FBRyxnQkFBZ0IsV0FBVyxDQUFDO1lBQ3JELE1BQU0sV0FBVyxHQUFHLEdBQUcsZ0JBQWdCLFdBQVcsQ0FBQztZQUVuRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDakQsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxNQUFNLFlBQVksR0FBRyxNQUFNLHlDQUE2QixDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZGLEtBQUssSUFBSSxHQUFHLElBQUksWUFBWSxFQUFDO2dCQUN6QixJQUFJLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO2dCQUNsQyxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDO2dCQUM5RCxNQUFNLE1BQU0sR0FBSSxNQUFNLDRDQUFnQyxDQUFDLHlCQUF5QixDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3hILE1BQU0sNENBQWdDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzdEO1NBRUo7UUFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNsQjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUI7QUFDTCxDQUFDO0FBRUQsa0JBQWtCLEVBQUUsQ0FBQyJ9