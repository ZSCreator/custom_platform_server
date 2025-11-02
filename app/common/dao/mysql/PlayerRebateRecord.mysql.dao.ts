import { AbstractDao } from "../ADao.abstract";
import { PlayerRebateRecord } from "./entity/PlayerRebateRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PlayerRebateRecordMysqlDao extends AbstractDao<PlayerRebateRecord> {
    async findList(parameter: {id? : number ,uid? : string,rebate? : number, rebateUid? : string, commission? : number, level? : number, rebateProportion? : number,createDate? : Date}): Promise<PlayerRebateRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlayerRebateRecord)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id? : number ,uid? : string}): Promise<PlayerRebateRecord> {
        try {
            const playerRebateRecord = await ConnectionManager.getConnection()
                .getRepository(PlayerRebateRecord)
                .findOne(parameter);
            return playerRebateRecord;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,uid? : string,rebate? : number, rebateUid? : string, level? : number, commission? : number, rebateProportion? : number,createDate? : Date }): Promise<any> {
        try {

            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(PlayerRebateRecord);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,uid? : string,} , partialEntity :{ id? : number ,uid? : string,rebate? : number, level? : number, rebateUid? : string, commission? : number, rebateProportion? : number,createDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerRebateRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,uid? : string}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerRebateRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }




    /**
     * 每日统计玩家得总返佣
     */
    async getDayPlayerRebateForUid(uid: string ,startTime : string , endTime : string ): Promise<any> {
        try {
            const sql = `SELECT
                spa.uid,
				spa.rebateUid,
                SUM(spa.rebate) AS dayRebate
            FROM
                Sp_PlayerRebateRecord AS spa
						WHERE spa.uid = "${uid}"
						AND spa.createDate >  "${startTime}"
						AND spa.createDate <= "${endTime}"
            GROUP BY spa.rebateUid
            `;
            const res = await ConnectionManager
                .getConnection(true)
                .query(sql);

            return res;
        } catch (e) {
            return false;
        }
    }


    /**
     * 查询每日需要进行统计得uid
     */
    async getStatisticsUid(startTime : string , endTime : string ): Promise<any> {
        try {
            const sql = `
            SELECT
                spa.uid
            FROM
                Sp_PlayerRebateRecord AS spa					
                WHERE spa.createDate >  "${startTime}"
                AND   spa.createDate <= "${endTime}"
            GROUP BY spa.uid
            `;
            const res = await ConnectionManager
                .getConnection(true)
                .query(sql);
            return res;
        } catch (e) {
            return false;
        }
    }


    /**
     *  删除一个月前的玩家返佣记录
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async deletePlayerRebateRecord(time : string) {
        try {

            const sql = `
					DELETE 
					from 
					Sp_PlayerRebateRecord
	 				where
                    Sp_PlayerRebateRecord.createDate < "${time}"
            `;
           await ConnectionManager
                .getConnection()
                .query(sql);
            return true;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }


}

export default new PlayerRebateRecordMysqlDao();