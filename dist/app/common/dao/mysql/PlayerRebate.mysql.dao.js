"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PlayerRebate_entity_1 = require("./entity/PlayerRebate.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerRebateMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlayerRebate_entity_1.PlayerRebate)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const playerRebate = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerRebate_entity_1.PlayerRebate)
                .findOne(parameter);
            return playerRebate;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerRebate_entity_1.PlayerRebate);
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
                .getRepository(PlayerRebate_entity_1.PlayerRebate)
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
                .getRepository(PlayerRebate_entity_1.PlayerRebate)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async updateAddRebate(uid, rebate) {
        try {
            const sql = `
            INSERT INTO Sp_PlayerRebate (uid,todayRebate)
            VALUES(${uid},${rebate})
            ON DUPLICATE KEY UPDATE todayRebate = todayRebate+ ${rebate}
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateAddDayPeople(uid, dayPeople) {
        try {
            const sql = `
            INSERT INTO Sp_PlayerRebate (uid,dayPeople,sharePeople)
            VALUES(${uid},${dayPeople},${dayPeople})
            ON DUPLICATE KEY UPDATE dayPeople = dayPeople+ ${dayPeople},sharePeople = sharePeople + ${dayPeople}
            `;
            console.warn("updateAddDayPeople_sql", sql);
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateAddIplRebate(uid, iplRebate) {
        try {
            const sql = `
            INSERT INTO Sp_PlayerRebate (uid,iplRebate)
            VALUES(${uid},${iplRebate})
            ON DUPLICATE KEY UPDATE iplRebate = iplRebate+ ${iplRebate}
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            return isSuccess;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    async updateDelIplRebate(uid, iplRebate) {
        try {
            const sql = `
                UPDATE Sp_PlayerRebate 
                    SET
                        iplRebate = iplRebate - ${iplRebate}
                    WHERE uid = "${uid}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateDelRebate(uid, todayRebate) {
        try {
            const sql = `
                UPDATE Sp_PlayerRebate 
                    SET
                        dayPeople = 0,
                        todayRebate = 0,
                        iplRebate = 0,
                        yesterdayRebate = ${todayRebate},
                        allRebate = allRebate + ${todayRebate}
                    WHERE uid = "${uid}"
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
    async getPlayerRebate() {
        try {
            const sql = `
              SELECT
				spa.uid,
                spa.todayRebate,
                spa.iplRebate
              FROM
                Sp_PlayerRebate  AS spa
                WHERE spa.todayRebate > 0 OR spa.iplRebate > 0
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            return res;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.default = new PlayerRebateMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyUmViYXRlLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1BsYXllclJlYmF0ZS5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msc0VBQTREO0FBQzVELHNFQUErRDtBQUUvRCxNQUFNLG9CQUFxQixTQUFRLDJCQUF5QjtJQUN4RCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWdLO1FBQzNLLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBa0Q7UUFDNUQsSUFBSTtZQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDM0QsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQXVMO1FBQ25NLElBQUk7WUFFQSxNQUFNLHFCQUFxQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDMUQsYUFBYSxDQUFDLGtDQUFZLENBQUMsQ0FBQztZQUVqQyxNQUFNLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLHFC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