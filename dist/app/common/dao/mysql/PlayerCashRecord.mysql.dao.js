"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerCashMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const PlayerCashRecord_entity_1 = require("./entity/PlayerCashRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerCashMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlayerCashRecord_entity_1.PlayerCashRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const playerCashRecord = await connectionManager_1.default.getConnection()
                .getRepository(PlayerCashRecord_entity_1.PlayerCashRecord)
                .findOne(parameter);
            return playerCashRecord;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerCashRecord_entity_1.PlayerCashRecord)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        try {
            const playerRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerCashRecord_entity_1.PlayerCashRecord);
            const p = playerRepository.create(parameter);
            return await playerRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerCashRecord_entity_1.PlayerCashRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findManyAndCountForOrderStatusToUid(uid, page, pageSize = 20) {
        try {
            const list = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerCashRecord_entity_1.PlayerCashRecord)
                .createQueryBuilder("PlayerCashRecord")
                .select(["PlayerCashRecord.orderNo", "PlayerCashRecord.money", "PlayerCashRecord.createDate", "PlayerCashRecord.orderStatus", "PlayerCashRecord.cashStatus"])
                .where(`PlayerCashRecord.uid = ${uid}`)
                .skip((page - 1) * pageSize)
                .take(page * pageSize)
                .orderBy("PlayerCashRecord.id", "DESC")
                .getMany();
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async selectWhere(where, page, pageSize) {
        try {
            if (!where) {
                return { list: [], count: 0 };
            }
            let startLimit = (page - 1) * pageSize;
            let selectCount = `COUNT(Sp_PlayerCashRecord.id) AS length`;
            let sql = `
               SELECT * From Sp_PlayerCashRecord WHERE ${where}
            `;
            sql = sql + `ORDER BY id DESC
                         LIMIT ${startLimit} , ${pageSize}`;
            let sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                    Sp_PlayerCashRecord
                WHERE 
                    ${where} 
                `;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            const countResult = await connectionManager_1.default.getConnection(true)
                .query(sqlCount);
            let count = 0;
            for (let key of countResult) {
                count += Number(key.length);
            }
            return { list: result, count: count };
        }
        catch (e) {
            console.error(e.stack);
            return { list: [], count: 0 };
        }
    }
    async todayAddTixian(startTime, endTime) {
        try {
            const sql = `SELECT
                    IFNULL(cashRecord.groupRemark,'无') AS agentName,					
                    IFNULL(SUM(cashRecord.money),0) AS todayTixian
            FROM
                    Sp_PlayerCashRecord AS cashRecord
            WHERE           
                 cashRecord.createDate >= "${startTime}"
                 AND cashRecord.createDate < "${endTime}"
                 AND cashRecord.cashStatus = 1
              GROUP BY agentName`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddTixian_uid(groupRemarkList, startTime, endTime) {
        try {
            let list = [];
            groupRemarkList.forEach(x => {
                list.push(`"${x}"`);
            });
            const sql = `SELECT
                    IFNULL(cashRecord.groupRemark,'无') AS agentName,					
                    IFNULL(cashRecord.uid,'无') AS uid
            FROM
                    Sp_PlayerCashRecord AS cashRecord
            WHERE           
                 cashRecord.createDate >= "${startTime}"
                 AND cashRecord.createDate < "${endTime}"
                 AND cashRecord.cashStatus = 1
                 AND cashRecord.groupRemark IN (${list})
              GROUP BY agentName , uid`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddTixian_groupRemark(groupRemark, startTime, endTime) {
        try {
            const sql = `SELECT
                    IFNULL(cashRecord.groupRemark,'无') AS agentName,					
                    IFNULL(SUM(cashRecord.money),0) AS todayTixian
            FROM
                    Sp_PlayerCashRecord AS cashRecord
            WHERE           
                 cashRecord.createDate >= "${startTime}"
                 AND cashRecord.createDate < "${endTime}"
                 AND cashRecord.groupRemark = "${groupRemark}"
                 AND cashRecord.cashStatus = 1
              GROUP BY agentName`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
}
exports.PlayerCashMysqlDao = PlayerCashMysqlDao;
exports.default = new PlayerCashMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyQ2FzaFJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9QbGF5ZXJDYXNoUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBK0M7QUFDL0MsOEVBQW9FO0FBQ3BFLHNFQUErRDtBQVEvRCxNQUFhLGtCQUFtQixTQUFRLDJCQUE2QjtJQUNqRSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQTRCO1FBQ3ZDLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLDBDQUFnQixDQUFDO2lCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQTRCO1FBQ3RDLElBQUk7WUFDQSxNQUFNLGdCQUFnQixHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMzRCxhQUFhLENBQUMsMENBQWdCLENBQUM7aUJBQy9CLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixPQUFPLGdCQUFnQixDQUFDO1NBQzNCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBNEIsRUFBRSxhQUFnQztRQUMxRSxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsMENBQWdCLENBQUM7aUJBQy9CLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFdEMsT0FB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