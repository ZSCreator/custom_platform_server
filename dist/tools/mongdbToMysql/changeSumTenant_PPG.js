"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const SumTenantOperationalData_mysql_dao_1 = require("../../app/common/dao/mysql/SumTenantOperationalData.mysql.dao");
const moment = require("moment");
const connectionManager_1 = require("../../app/common/dao/mysql/lib/connectionManager");
async function run() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn(`首先删除ppg统计表  1-30好的统计数据 开始=============`);
    const sql = ` DELETE from Sum_TenantOperationalData
                  where 
				      Sum_TenantOperationalData.sumDate >= '2022-06-01 00:00:00'
				   AND Sum_TenantOperationalData.sumDate <= '2022-06-30 00:00:00'
				   AND Sum_TenantOperationalData.groupRemark = 'ppg001'`;
    await connectionManager_1.default.getConnection()
        .query(sql);
    console.warn(`首先删除ppg统计表  1-30好的统计数据 完成===========`);
    let lastDateTime = "2022-06-01 00:00:00";
    for (let i = 0; i < 30; i++) {
        const checkTargetDate1 = moment(lastDateTime).add(i, "day").format("YYYY-MM-DD");
        const checkTargetDate2 = moment(lastDateTime).add(i + 1, "day").format("YYYY-MM-DD");
        const startDateTime = `${checkTargetDate1} 00:00:00`;
        const endDateTime = `${checkTargetDate2} 00:00:00`;
        console.warn(`开始统计=======`, startDateTime, endDateTime);
        const tableName = `Sp_GameRecord_62853180_202206`;
        const result = await copyTenantOperationalData(tableName, startDateTime, endDateTime);
        if (result && result.length > 0) {
            await SumTenantOperationalData_mysql_dao_1.default.insertMany(result);
        }
    }
    console.warn('结束');
    process.exit();
}
exports.run = run;
async function copyTenantOperationalData(table, startDateTime, endDateTime) {
    try {
        const sql = `            
            WITH playerAgent  AS (
            SELECT
                    pa.parent_uid as parent_uid,
                    pa.fk_uid  as uid,
                    pa.platform_name AS platform_name
            FROM
                    Sp_Player_Agent AS pa                 
            WHERE
                    pa.role_type  = 3
            )
            SELECT
                    IFNULL(playerAgent.uid,'无') AS fk_uid,
                    IFNULL(gr.groupRemark,'无') AS groupRemark,
                    COUNT(gr.id) AS recordCount,
                    IFNULL(gr.game_id,'无') AS nid,
                    IFNULL(gr.gameName,'无') AS gameName,
                    IFNULL(SUM(gr.validBet),0) AS validBetTotal,
                    COUNT(IF(gr.profit > 0,1,null)) AS winCount,
                    SUM(IF(gr.profit>0,gr.profit,0)) AS winTotal,
                    SUM(IF(gr.profit<0,gr.profit,0)) AS loseTotal,
                    IFNULL(SUM(gr.profit),0) AS profitTotal,
                    IFNULL(SUM(gr.bet_commission),0) AS bet_commissionTotal,
                    IFNULL(SUM(gr.win_commission),0) AS win_commissionTotal,
                    IFNULL(SUM(gr.settle_commission),0) AS settle_commissionTotal,
                    "${startDateTime}" AS sumDate,
                    IFNULL(playerAgent.parent_uid,'无') AS parentUid,
                    NOW() AS createDateTime
            FROM
                    ${table} AS gr
					RIGHT JOIN playerAgent ON  playerAgent.platform_name =  gr.groupRemark 
            WHERE           
                 gr.createTimeDate >= "${startDateTime}"
                AND gr.createTimeDate < "${endDateTime}"
                AND gr.game_id not in ('t1','t2')
              GROUP BY groupRemark,parentUid,fk_uid,nid,gameName
            `;
        const result = await connectionManager_1.default.getConnection()
            .query(sql);
        return result;
    }
    catch (e) {
        return [];
    }
}
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlU3VtVGVuYW50X1BQRy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL21vbmdkYlRvTXlzcWwvY2hhbmdlU3VtVGVuYW50X1BQRy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3RUFBcUU7QUFDckUsc0hBQTZHO0FBQzdHLGlDQUFpQztBQUNqQyx3RkFBaUY7QUFFMUUsS0FBSyxVQUFVLEdBQUc7SUFFckIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztJQUN2RCxNQUFNLEdBQUcsR0FBRzs7Ozs0REFJNEMsQ0FBQztJQUN6RCxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUNsQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFaEIsT0FBTyxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0lBSXJELElBQUssWUFBWSxHQUFHLHFCQUFxQixDQUFDO0lBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakYsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sYUFBYSxHQUFHLEdBQUcsZ0JBQWdCLFdBQVcsQ0FBQztRQUNyRCxNQUFNLFdBQVcsR0FBRyxHQUFHLGdCQUFnQixXQUFXLENBQUM7UUFFbkQsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sU0FBUyxHQUFHLCtCQUErQixDQUFDO1FBQ2xELE1BQU0sTUFBTSxHQUFJLE1BQU0seUJBQXlCLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN2RixJQUFHLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUMzQixNQUFNLDRDQUFnQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3RDtLQUVKO0lBR0QsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVuQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQXJDRCxrQkFxQ0M7QUFHRCxLQUFLLFVBQVUseUJBQXlCLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxXQUFXO0lBQ3RFLElBQUk7UUFDQSxNQUFNLEdBQUcsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkF5QkcsYUFBYTs7OztzQkFJZCxLQUFLOzs7eUNBR2MsYUFBYTsyQ0FDWCxXQUFXOzs7YUFHekMsQ0FBQztRQUNOLE1BQU0sTUFBTSxHQUFJLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2FBQ2xELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoQixPQUFPLE1BQU0sQ0FBQztLQUNqQjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBRVIsT0FBTyxFQUFFLENBQUM7S0FDYjtBQUNMLENBQUM7QUFFRCxHQUFHLEVBQUUsQ0FBQyJ9