"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SumTenantOperationalDataDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const SumTenantOperationalData_entity_1 = require("./entity/SumTenantOperationalData.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SumTenantOperationalDataDao extends ADao_abstract_1.AbstractDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    findOne(parameter) {
        throw new Error("Method not implemented.");
    }
    updateOne(parameter, partialEntity) {
        throw new Error("Method not implemented.");
    }
    async insertOne(parameter) {
        try {
            const gameRepository = connectionManager_1.default.getConnection()
                .getRepository(SumTenantOperationalData_entity_1.SumTenantOperationalData);
            const p = gameRepository.create(parameter);
            return await gameRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    delete(parameter) {
        throw new Error("Method not implemented.");
    }
    async insertMany(parameterList) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .insert()
                .into(SumTenantOperationalData_entity_1.SumTenantOperationalData)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`租户运营数据 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async copyTenantOperationalData(table, startDateTime, endDateTime) {
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
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async existBySumDate(sumDate) {
        try {
            const oneRecord = await connectionManager_1.default.getConnection()
                .getRepository(SumTenantOperationalData_entity_1.SumTenantOperationalData)
                .createQueryBuilder("sto")
                .select("sto.id")
                .where("sumDate LIKE :date ", {
                date: sumDate
            })
                .getOne();
            return !!oneRecord;
        }
        catch (e) {
            console.error(`租户运营数据 | 判断 ${sumDate} 是否汇总 | 出错:${e.stack}`);
            return false;
        }
    }
    async todayAddFlow(startTime, endTime) {
        try {
            let sql = ` SELECT  
                        IFNULL(Tenant.groupRemark,'无') AS groupRemark,
                        Tenant.fk_uid AS uid,
                        IFNULL(SUM(Tenant.validBetTotal),0) AS validBetTotal,
                        IFNULL(SUM(Tenant.bet_commissionTotal),0) AS bet_commissionTotal,
                        IFNULL(SUM(Tenant.win_commissionTotal),0) AS win_commissionTotal,
                        IFNULL(SUM(Tenant.settle_commissionTotal),0) AS settle_commissionTotal
                        
                    FROM
                        Sum_TenantOperationalData AS Tenant
                    WHERE           
                     Tenant.sumDate >= "${startTime}"
                    AND Tenant.sumDate <  "${endTime}"
                    GROUP BY groupRemark ,uid 
                `;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
}
exports.SumTenantOperationalDataDao = SumTenantOperationalDataDao;
exports.default = new SumTenantOperationalDataDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VtVGVuYW50T3BlcmF0aW9uYWxEYXRhLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1N1bVRlbmFudE9wZXJhdGlvbmFsRGF0YS5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQStDO0FBQy9DLDhGQUFvRjtBQUNwRixzRUFBK0Q7QUFFL0QsTUFBYSwyQkFBNEIsU0FBUSwyQkFBcUM7SUFDbEYsUUFBUSxDQUFDLFNBQW1DO1FBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsT0FBTyxDQUFDLFNBQW1DO1FBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsU0FBUyxDQUFDLFNBQW1DLEVBQUUsYUFBdUM7UUFDbEYsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1DO1FBQy9DLElBQUk7WUFDQSxNQUFNLGNBQWMsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ25ELGFBQWEsQ0FBQywwREFBd0IsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0MsT0FBTyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdkM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQW1DO1FBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUE4QztRQUMzRCxJQUFJO1lBQ0EsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ2xDLGtCQUFrQixFQUFFO2lCQUNwQixNQUFNLEVBQUU7aUJBQ1IsSUFBSSxDQUFDLDBEQUF3QixDQUFDO2lCQUM5QixNQUFNLENBQUMsYUFBYSxDQUFDO2lCQUNyQixPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1lBQzlDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxLQUFjLEVBQUcsYUFBcUIsRUFBRSxXQUFtQjtRQUN2RixJQUFJO1lBQ0EsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBeUJELGFBQWE7Ozs7c0JBSWQsS0FBSzs7O3lDQUdjLGFBQWE7MkNBQ1gsV0FBVzs7O2FBR3pDLENBQUM7WUFDRixNQUFNLE1BQU0sR0FBSSxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQ3RELEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQVdoQixPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBRVIsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQWU7UUFDaEMsSUFBSTtZQUNBLE1BQU0sU0FBUyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNwRCxhQUFhLENBQUMsMERBQXdCLENBQUM7aUJBQ3ZDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztpQkFDekIsTUFBTSxDQUFDLFFBQVEsQ0FBQztpQkFDaEIsS0FBSyxDQUFDLHFCQUFxQixFQUFFO2dCQUMxQixJQUFJLEVBQUUsT0FBTzthQUNoQixDQUFDO2lCQUNELE1BQU0sRUFBRSxDQUFDO1lBQ2QsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDO1NBQ3RCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsT0FBTyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1lBQzVELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQVlELEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFHLE9BQU87UUFDbEMsSUFBSTtZQUNBLElBQUksR0FBRyxHQUFHOzs7Ozs7Ozs7OzswQ0FXb0IsU0FBUzs2Q0FDTixPQUFPOztpQkFFbkMsQ0FBQztZQUNOLE1BQU0sTUFBTSxHQUFJLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RSxPQUFPLE1BQU0sQ0FBQztTQUNqQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7Q0FHSjtBQXpKRCxrRUF5SkM7QUFFRCxrQkFBZSxJQUFJLDJCQUEyQixFQUFFLENBQUMifQ==