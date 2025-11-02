"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const DayPlayerRebateRecord_entity_1 = require("./entity/DayPlayerRebateRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class DayPlayerRebateRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(DayPlayerRebateRecord_entity_1.DayPlayerRebateRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const dayPlayerRebateRecord = await connectionManager_1.default.getConnection()
                .getRepository(DayPlayerRebateRecord_entity_1.DayPlayerRebateRecord)
                .findOne(parameter);
            return dayPlayerRebateRecord;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(DayPlayerRebateRecord_entity_1.DayPlayerRebateRecord);
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
                .getRepository(DayPlayerRebateRecord_entity_1.DayPlayerRebateRecord)
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
                .getRepository(DayPlayerRebateRecord_entity_1.DayPlayerRebateRecord)
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
                .into(DayPlayerRebateRecord_entity_1.DayPlayerRebateRecord)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`每日统计玩家当日获得返佣 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async getFinallyTodayRecord(uid, dayStartTime, dayEndTime, page, limit, startTime, endTime) {
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
            const res = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            if (res.length > 0) {
                let uidList = [];
                let resultList = [];
                for (let m of res) {
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
                const res_1 = await connectionManager_1.default
                    .getConnection(true)
                    .query(sql_1);
                for (let m of res) {
                    const item = res_1.find(x => x.rebateUid == m.rebateUid);
                    m['totalRebate'] = Number(item.totalRebate);
                    m['name'] = 'p' + m.rebateUid;
                    resultList.push(m);
                }
                return resultList;
            }
            else {
                return [];
            }
        }
        catch (e) {
            return false;
        }
    }
    async deleteDayPlayerRebateRecord(time) {
        try {
            const sql = `
					DELETE 
					from 
					Sp_DayPlayerRebateRecord
	 				where
                    Sp_DayPlayerRebateRecord.createDate < "${time}"
            `;
            await connectionManager_1.default
                .getConnection()
                .query(sql);
            return true;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.default = new DayPlayerRebateRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF5UGxheWVyUmViYXRlUmVjb3JkLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL0RheVBsYXllclJlYmF0ZVJlY29yZC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msd0ZBQThFO0FBQzlFLHNFQUErRDtBQUUvRCxNQUFNLDZCQUE4QixTQUFRLDJCQUFrQztJQUMxRSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQXNHO1FBQ2pILElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLG9EQUFxQixDQUFDO2lCQUNwQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXlDO1FBQ25ELElBQUk7WUFDQSxNQUFNLHFCQUFxQixHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNoRSxhQUFhLENBQUMsb0RBQXFCLENBQUM7aUJBQ3BDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLHFCQUFxQixDQUFDO1NBQ2hDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBcUc7UUFDakgsSUFBSTtZQUVBLE1BQU0scUJBQXFCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMxRCxhQUFhLENBQUMsb0RBQXFCLENBQUMsQ0FBQztZQUUxQyxNQUFNLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFD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