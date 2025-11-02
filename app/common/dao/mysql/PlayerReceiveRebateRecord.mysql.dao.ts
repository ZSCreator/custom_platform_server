import { AbstractDao } from "../ADao.abstract";
import { PlayerReceiveRebateRecord } from "./entity/PlayerReceiveRebateRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class PlayerReceiveRebateRecordMysqlDao extends AbstractDao<PlayerReceiveRebateRecord> {
    async findList(parameter: {id? : number ,uid? : string, rebate? : number,  createDate? : Date}): Promise<PlayerReceiveRebateRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlayerReceiveRebateRecord)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id? : number ,uid? : string}): Promise<PlayerReceiveRebateRecord> {
        try {
            const playerReceiveRebateRecord = await ConnectionManager.getConnection()
                .getRepository(PlayerReceiveRebateRecord)
                .findOne(parameter);
            return playerReceiveRebateRecord;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,uid? : string, rebate? : number,  createDate? : Date}): Promise<any> {
        try {

            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(PlayerReceiveRebateRecord);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,uid? : string,} , partialEntity :{ id? : number ,uid? : string, rebate? : number,  createDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerReceiveRebateRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,uid? : string}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerReceiveRebateRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    async insertMany(parameterList: Array<PlayerReceiveRebateRecord>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(PlayerReceiveRebateRecord)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`每日统计玩家当日获得返佣 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }

    /**
     * 获取玩家最新的领取记录
     * dayStartTime 当天的前一天开始时间
     * dayStartTime 当天的前一天结束时间
     */
    async getPlayerReceiveRebateRecord(uid:string , page : number , limit: number): Promise<any> {
        try {
            let startLimit = (page - 1) * limit;
            const sql = `
           			SELECT
                      spa.rebate,
                      DATE_FORMAT(spa.createDate,"%Y-%m-%d %H:%i:%s")  createDate
                     FROM
                        Sp_PlayerReceiveRebateRecord  AS spa
						WHERE spa.uid = "${uid}"
					  ORDER BY id DESC
                    LIMIT ${startLimit} , ${limit}
            `;
            const res = await ConnectionManager
                .getConnection(true)
                .query(sql);

            return res;
        } catch (e) {
            return [];
        }
    }


    /**
     *  删除一个月前的玩家返佣领取记录
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async deletePlayerReceiveRebateRecord(time : string) {
        try {

            const sql = `
					DELETE 
					from 
					Sp_PlayerReceiveRebateRecord
	 				where
                    Sp_PlayerReceiveRebateRecord.createDate < "${time}"
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

export default new PlayerReceiveRebateRecordMysqlDao();