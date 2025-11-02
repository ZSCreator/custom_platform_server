import { AbstractDao } from "../ADao.abstract";
import { DayPlayerRebateRecord } from "./entity/DayPlayerRebateRecord.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class DayPlayerRebateRecordMysqlDao extends AbstractDao<DayPlayerRebateRecord> {
    async findList(parameter: {id? : number ,uid? : string, dayRebate? : number, rebateUid? : string, createDate? : Date}): Promise<DayPlayerRebateRecord[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(DayPlayerRebateRecord)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id? : number ,uid? : string}): Promise<DayPlayerRebateRecord> {
        try {
            const dayPlayerRebateRecord = await ConnectionManager.getConnection()
                .getRepository(DayPlayerRebateRecord)
                .findOne(parameter);
            return dayPlayerRebateRecord;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id? : number ,uid? : string,dayRebate? : number, rebateUid? : string, createDate? : Date}): Promise<any> {
        try {

            const mailRecordsRepository = ConnectionManager.getConnection()
                .getRepository(DayPlayerRebateRecord);

            const p = mailRecordsRepository.create(parameter);
            return await mailRecordsRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{ id? : number ,uid? : string,} , partialEntity :{ id? : number ,uid? : string,dayRebate? : number, rebateUid? : string, createDate? : Date } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(DayPlayerRebateRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id? : number ,uid? : string}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(DayPlayerRebateRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }





    async insertMany(parameterList: Array<DayPlayerRebateRecord>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(DayPlayerRebateRecord)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`每日统计玩家当日获得返佣 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }

    /**
     * 获取最后一天玩家佣金记录,获取返佣人员的uid和当日佣金记录，然后再根据uid 来获取所有的7天记录
     * dayStartTime 当天的前一天开始时间
     * dayStartTime 当天的前一天结束时间
     */
    async getFinallyTodayRecord(uid:string , dayStartTime : string , dayEndTime : string ,page : number , limit: number , startTime : string , endTime : string ,): Promise<any> {
        try {
            let startLimit = (page - 1) * limit;
            const sql = `
           			SELECT
                      spa.rebateUid,
                      spa.dayRebate
                     FROM
                        Sp_DayPlayerRebateRecord  AS spa
						WHERE spa.uid = "${uid}"
						AND spa.createDate >  "${dayStartTime}"
						AND spa.createDate <= "${dayEndTime}"
					  ORDER BY id DESC
                    LIMIT ${startLimit} , ${limit}
            `;
            const res = await ConnectionManager
                .getConnection(true)
                .query(sql);
            if(res.length > 0){
                let uidList = [];
                let resultList = [];
                for(let m of res){
                    uidList.push(m.rebateUid);
                }
                const sql_1 = `SELECT
				        spa.rebateUid,
						SUM(spa.dayRebate) AS totalRebate
                        FROM
                        Sp_DayPlayerRebateRecord  AS spa
						WHERE spa.uid = "${uid}"
						AND spa.rebateUid IN (${uidList})
						AND spa.createDate >  "${startTime}"
						AND spa.createDate <= "${endTime}"
					  GROUP BY  spa.rebateUid , spa.dayRebate`;
                const res_1 = await ConnectionManager
                    .getConnection(true)
                    .query(sql_1);
                for(let m of res){
                    const item = res_1.find(x=>x.rebateUid == m.rebateUid);
                    m['totalRebate'] = Number(item.totalRebate) ;
                    m['name'] = 'p' + m.rebateUid ;
                    resultList.push(m);
                }
                return resultList;
            }else{
                return [];
            }

        } catch (e) {
            return false;
        }
    }





    /**
     *  删除一个月前的玩家每日佣金统计记录
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async deleteDayPlayerRebateRecord(time : string) {
        try {

            const sql = `
					DELETE 
					from 
					Sp_DayPlayerRebateRecord
	 				where
                    Sp_DayPlayerRebateRecord.createDate < "${time}"
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

export default new DayPlayerRebateRecordMysqlDao();