"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PromotionReportApp_entity_1 = require("./entity/PromotionReportApp.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PromotionReportAppMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PromotionReportApp_entity_1.PromotionReportApp)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const promotionReportApp = await connectionManager_1.default.getConnection(true)
                .getRepository(PromotionReportApp_entity_1.PromotionReportApp)
                .findOne(parameter);
            return promotionReportApp;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(PromotionReportApp_entity_1.PromotionReportApp);
            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PromotionReportApp_entity_1.PromotionReportApp)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PromotionReportApp_entity_1.PromotionReportApp)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertMany(parameterList) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .insert()
                .into(PromotionReportApp_entity_1.PromotionReportApp)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`每日统计玩家当日推广数据 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async getPromotionReportApp(platformName) {
        try {
            const sql = `
                SELECT  
                        IFNULL(reportApp.agentName,'无') AS agentName,
                        IFNULL(reportApp.agentUid,'无') AS agentUid,
                        IFNULL(reportApp.platformName,'无') AS platformName,
                        IFNULL(SUM(reportApp.todayPlayer),0) AS todayPlayer,
                        IFNULL(SUM(reportApp.todayAddRmb),0) AS todayAddRmb,
                        IFNULL(SUM(reportApp.todayTixian),0) AS todayTixian,
                        IFNULL(SUM(reportApp.todayCommission),0) AS todayCommission,
                        IFNULL(SUM(reportApp.todayFlow),0) AS todayFlow
                FROM
                        Sp_PromotionReportApp AS reportApp
                WHERE           
                 reportApp.platformName = "${platformName}"			
                GROUP BY agentName ,agentUid, platformName
            `;
            const result = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            console.error(e.stack);
            return [];
        }
    }
    async getPromotionReportApp_Agent(agentName, startTimeDate, endTimeDate) {
        try {
            const sql = `
                SELECT  
                        IFNULL(reportApp.agentName,'无') AS agentName,
                        IFNULL(SUM(reportApp.todayPlayer),0) AS todayPlayer,
                        IFNULL(SUM(reportApp.todayAddRmb),0) AS todayAddRmb,
                        IFNULL(SUM(reportApp.todayTixian),0) AS todayTixian,
                        IFNULL(SUM(reportApp.todayCommission),0) AS todayCommission,
                        IFNULL(SUM(reportApp.todayFlow),0) AS todayFlow
                FROM
                        Sp_PromotionReportApp AS reportApp
                WHERE    
                    reportApp.createDate  >=  "${startTimeDate}"    
                AND reportApp.createDate  <  "${endTimeDate}"    
                AND reportApp.agentName = "${agentName}"			
                   
            `;
            const result = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            console.error(e.stack);
            return [];
        }
    }
}
exports.default = new PromotionReportAppMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW90aW9uUmVwb3J0QXBwLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1Byb21vdGlvblJlcG9ydEFwcC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msa0ZBQXdFO0FBQ3hFLHNFQUErRDtBQUUvRCxNQUFNLDBCQUEyQixTQUFRLDJCQUErQjtJQUNwRSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWlPO1FBQzVPLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLDhDQUFrQixDQUFDO2lCQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWtPO1FBQzVPLElBQUk7WUFDQSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDakUsYUFBYSxDQUFDLDhDQUFrQixDQUFDO2lCQUNqQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsT0FBTyxrQkFBa0IsQ0FBQztTQUM3QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1PO1FBQy9PLElBQUk7WUFFQSxNQUFNLHFCQUFxQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDMUQsYUFBYSxDQUFDLDhDQUFrQixDQUFDLENBQUM7WUFFdkMsTUFBTSxDQUFDLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFD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