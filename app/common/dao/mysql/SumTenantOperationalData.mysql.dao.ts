import { AbstractDao } from "../ADao.abstract";
import { SumTenantOperationalData } from "./entity/SumTenantOperationalData.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

export class SumTenantOperationalDataDao extends AbstractDao<SumTenantOperationalData>{
    findList(parameter: SumTenantOperationalData): Promise<SumTenantOperationalData[]> {
        throw new Error("Method not implemented.");
    }
    findOne(parameter: SumTenantOperationalData): Promise<SumTenantOperationalData> {
        throw new Error("Method not implemented.");
    }
    updateOne(parameter: SumTenantOperationalData, partialEntity: SumTenantOperationalData): Promise<any> {
        throw new Error("Method not implemented.");
    }
    async insertOne(parameter: SumTenantOperationalData): Promise<any> {
        try {
            const gameRepository = ConnectionManager.getConnection()
                .getRepository(SumTenantOperationalData);

            const p = gameRepository.create(parameter);

            return await gameRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    delete(parameter: SumTenantOperationalData): Promise<any> {
        throw new Error("Method not implemented.");
    }

    async insertMany(parameterList: Array<SumTenantOperationalData>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(SumTenantOperationalData)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`租户运营数据 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }

    async copyTenantOperationalData(table : string , startDateTime: string, endDateTime: string) {
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
            const result =  await ConnectionManager.getConnection(true)
                .query(sql);

            // let insertSql = ` INSERT INTO Sum_TenantOperationalData
            //     (fk_uid,groupRemark,recordCount,nid,gameName,validBetTotal,winCount,winTotal,loseTotal,profitTotal,
            //     bet_commissionTotal,
            //     win_commissionTotal,
            //     settle_commissionTotal,
            //     sumDate,
            //     parentUid,
            //     createDateTime)`;

            return result;
        } catch (e) {

            return [];
        }
    }

    /** 判断某天是否汇总 */
    async existBySumDate(sumDate: string): Promise<boolean> {
        try {
            const oneRecord = await ConnectionManager.getConnection()
                .getRepository(SumTenantOperationalData)
                .createQueryBuilder("sto")
                .select("sto.id")
                .where("sumDate LIKE :date ", {
                    date: sumDate
                })
                .getOne();
            return !!oneRecord;
        } catch (e) {
            console.error(`租户运营数据 | 判断 ${sumDate} 是否汇总 | 出错:${e.stack}`)
            return false;
        }
    }


    /**
     * 根据日期获取总码量和抽水
     * @param uid
     * @param nid
     * @param page
     * @param limit
     * @param startTime
     * @param endTime
     */
    async todayAddFlow(startTime , endTime): Promise<any> {
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
            const result =  await ConnectionManager.getConnection(true).query(sql);
            return result;
        } catch (e) {
            return null;
        }
    }


}

export default new SumTenantOperationalDataDao();
