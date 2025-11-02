"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PlayerReceiveRebateRecord_entity_1 = require("./entity/PlayerReceiveRebateRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerReceiveRebateRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlayerReceiveRebateRecord_entity_1.PlayerReceiveRebateRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const playerReceiveRebateRecord = await connectionManager_1.default.getConnection()
                .getRepository(PlayerReceiveRebateRecord_entity_1.PlayerReceiveRebateRecord)
                .findOne(parameter);
            return playerReceiveRebateRecord;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerReceiveRebateRecord_entity_1.PlayerReceiveRebateRecord);
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
                .getRepository(PlayerReceiveRebateRecord_entity_1.PlayerReceiveRebateRecord)
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
                .getRepository(PlayerReceiveRebateRecord_entity_1.PlayerReceiveRebateRecord)
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
                .into(PlayerReceiveRebateRecord_entity_1.PlayerReceiveRebateRecord)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`每日统计玩家当日获得返佣 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async getPlayerReceiveRebateRecord(uid, page, limit) {
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
            const res = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return res;
        }
        catch (e) {
            return [];
        }
    }
    async deletePlayerReceiveRebateRecord(time) {
        try {
            const sql = `
					DELETE 
					from 
					Sp_PlayerReceiveRebateRecord
	 				where
                    Sp_PlayerReceiveRebateRecord.createDate < "${time}"
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
exports.default = new PlayerReceiveRebateRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyUmVjZWl2ZVJlYmF0ZVJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9QbGF5ZXJSZWNlaXZlUmViYXRlUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyxnR0FBc0Y7QUFDdEYsc0VBQStEO0FBRS9ELE1BQU0saUNBQWtDLFNBQVEsMkJBQXNDO0lBQ2xGLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBK0U7UUFDMUYsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsNERBQXlCLENBQUM7aUJBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBeUM7UUFDbkQsSUFBSTtZQUNBLE1BQU0seUJBQXlCLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3BFLGFBQWEsQ0FBQyw0REFBeUIsQ0FBQztpQkFDeEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hCLE9BQU8seUJBQXlCLENBQUM7U0FDcEM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUErRTtRQUMzRixJQUFJO1lBRUEsTUFBTSxxQkFBcUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzFELGFBQWEsQ0FBQyw0REFBeUIsQ0FBQyxDQUFDO1lBRTlDLE1BQU0sQ0FBQyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMs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