"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PlayerRebateRecord_entity_1 = require("./entity/PlayerRebateRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerRebateRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlayerRebateRecord_entity_1.PlayerRebateRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const playerRebateRecord = await connectionManager_1.default.getConnection()
                .getRepository(PlayerRebateRecord_entity_1.PlayerRebateRecord)
                .findOne(parameter);
            return playerRebateRecord;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerRebateRecord_entity_1.PlayerRebateRecord);
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
                .getRepository(PlayerRebateRecord_entity_1.PlayerRebateRecord)
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
                .getRepository(PlayerRebateRecord_entity_1.PlayerRebateRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async getDayPlayerRebateForUid(uid, startTime, endTime) {
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
            const res = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return res;
        }
        catch (e) {
            return false;
        }
    }
    async getStatisticsUid(startTime, endTime) {
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
            const res = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return res;
        }
        catch (e) {
            return false;
        }
    }
    async deletePlayerRebateRecord(time) {
        try {
            const sql = `
					DELETE 
					from 
					Sp_PlayerRebateRecord
	 				where
                    Sp_PlayerRebateRecord.createDate < "${time}"
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
exports.default = new PlayerRebateRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyUmViYXRlUmVjb3JkLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1BsYXllclJlYmF0ZVJlY29yZC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msa0ZBQXdFO0FBQ3hFLHNFQUErRDtBQUUvRCxNQUFNLDBCQUEyQixTQUFRLDJCQUErQjtJQUNwRSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQW9LO1FBQy9LLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLDhDQUFrQixDQUFDO2lCQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXlDO1FBQ25ELElBQUk7WUFDQSxNQUFNLGtCQUFrQixHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUM3RCxhQUFhLENBQUMsOENBQWtCLENBQUM7aUJBQ2pDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLGtCQUFrQixDQUFDO1NBQzdCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBcUs7UUFDakwsSUFBSTtZQUVBLE1BQU0scUJBQXFCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMxRCxhQUFhLENBQUMsOENBQWtCLENBQUMsQ0FBQztZQUV2QyxNQUFNLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsT0FB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