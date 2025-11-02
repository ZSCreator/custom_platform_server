"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const ManagerLogs_entity_1 = require("./entity/ManagerLogs.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class ManagerLogsMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(ManagerLogs_entity_1.ManagerLogs)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const managerLogs = await connectionManager_1.default.getConnection()
                .getRepository(ManagerLogs_entity_1.ManagerLogs)
                .findOne(parameter);
            return managerLogs;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const managerLogsRepository = connectionManager_1.default.getConnection()
                .getRepository(ManagerLogs_entity_1.ManagerLogs);
            const p = managerLogsRepository.create(parameter);
            return await managerLogsRepository.save(p);
        }
        catch (e) {
            console.error("e...", e);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(ManagerLogs_entity_1.ManagerLogs)
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
                .getRepository(ManagerLogs_entity_1.ManagerLogs)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit() {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ManagerLogs_entity_1.ManagerLogs)
                .createQueryBuilder("ManagerLogs")
                .orderBy("ManagerLogs.id", "DESC")
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async getSelectWhereForLogs(where, page) {
        try {
            let selectCount = `COUNT(Sp_ManagerLogs.id) AS length`;
            let sql = `        
                SELECT
                  *
                FROM
                    Sp_ManagerLogs
                WHERE 
                    ${where} 
                `;
            let sqlCount = `        
                SELECT
                    ${selectCount}
                FROM
                    Sp_ManagerLogs
                WHERE 
                    ${where} 
                `;
            let startLimit = (page - 1) * 20;
            sql = sql + `ORDER BY createDate DESC , id DESC
                         LIMIT ${startLimit} , ${20}`;
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
            return false;
        }
    }
    async deletData(startTime) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .delete()
                .from(ManagerLogs_entity_1.ManagerLogs)
                .where(`Sp_ManagerLogs.createDate < "${startTime}"`)
                .execute();
            return list;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new ManagerLogsMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFuYWdlckxvZ3MubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvTWFuYWdlckxvZ3MubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLG9FQUEwRDtBQUMxRCxzRUFBK0Q7QUFHL0QsTUFBTSxtQkFBb0IsU0FBUSwyQkFBd0I7SUFDdEQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUF5STtRQUNwSixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXlJO1FBQ25KLElBQUk7WUFDQSxNQUFNLFdBQVcsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdEQsYUFBYSxDQUFDLGdDQUFXLENBQUM7aUJBQzFCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLFdBQVcsQ0FBQztTQUN0QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQXlJO1FBQ3JKLElBQUk7WUFDQSxNQUFNLHFCQUFxQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDMUQsYUFBYSxDQUFDLGdDQUFXLENBQUMsQ0FBQztZQUVoQyxNQUFNLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLHFCQUFxQixDQUFDLElB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