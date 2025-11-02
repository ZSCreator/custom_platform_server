import { AbstractDao } from "../ADao.abstract";
import { PromotionReportApp } from "./entity/PromotionReportApp.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PromotionReportAppMysqlDao extends AbstractDao<PromotionReportApp> {
    async findList(parameter: {id? : number, agentUid? : string, agentName? : string, platformName? : string, todayPlayer? : number,todayAddRmb? : number,todayTixian? : number, todayFlow? : number, todayCommission? : number, createDate? : Date}): Promise<PromotionReportApp[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PromotionReportApp)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id? : number, agentUid? : string, agentName? : string, platformName? : string, todayPlayer? : number,todayAddRmb? : number,todayTixian? : number, todayFlow? : number, todayCommission? : number, createDate? : Date}): Promise<PromotionReportApp> {
        try {
            const promotionReportApp = await ConnectionManager.getConnection(true)
                .getRepository(PromotionReportApp)
                .findOne(parameter);
            return promotionReportApp;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id? : number, agentUid? : string, agentName? : string, platformName? : string, todayPlayer? : number,todayAddRmb? : number,todayTixian? : number, todayFlow? : number, todayCommission? : number, createDate? : Date }): Promise<any> {
        try {

            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(PromotionReportApp);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number} , partialEntity :{  id? : number, agentUid? : string, agentName? : string, platformName? : string, todayPlayer? : number,todayAddRmb? : number,todayTixian? : number, todayFlow? : number, todayCommission? : number, createDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PromotionReportApp)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PromotionReportApp)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }



    async insertMany(parameterList: Array<PromotionReportApp>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(PromotionReportApp)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`每日统计玩家当日推广数据 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }


    /**
     * 对某一个渠道下面所有代理进行数据的汇总
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async getPromotionReportApp(platformName: string ) {
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
            const result = await ConnectionManager
                .getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            console.error(e.stack);
            return [];
        }
    }


    /**
     * 对某一个渠道下面所有代理进行数据的汇总
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async getPromotionReportApp_Agent(agentName ,startTimeDate ,endTimeDate) {
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
            const result = await ConnectionManager
                .getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            console.error(e.stack);
            return [];
        }
    }



}

export default new PromotionReportAppMysqlDao();