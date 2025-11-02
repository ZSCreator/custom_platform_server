"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogTelegramCustomerRecordMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const LogTelegramCustomerRecord_entity_1 = require("./entity/LogTelegramCustomerRecord.entity");
class LogTelegramCustomerRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    findOne(parameter) {
        throw new Error("Method not implemented.");
    }
    async insertOne(parameter) {
        try {
            const LogTelegramCustomerRecordRepository = connectionManager_1.default.getConnection()
                .getRepository(LogTelegramCustomerRecord_entity_1.LogTelegramCustomerRecord);
            const p = LogTelegramCustomerRecordRepository.create(parameter);
            return await LogTelegramCustomerRecordRepository.save(p);
        }
        catch (e) {
            console.error(e.stack);
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(LogTelegramCustomerRecord_entity_1.LogTelegramCustomerRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(LogTelegramCustomerRecord_entity_1.LogTelegramCustomerRecord)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async getCountTotal() {
        try {
            const sql = `
            SELECT 
                COUNT(log.id) total
                FROM Log_TelegramCustomer_record log 
                RIGHT JOIN Sp_TelegramCustomer tc 
                    ON log.fk_telegramCustomer_id = tc.id
                WHERE tc.status = 1
          `;
            const res = await connectionManager_1.default.getConnection()
                .query(sql);
            return res;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async getCountForEveryCustomer() {
        try {
            const sql = `
                SELECT 
                    tc.id,
                    tc.nickname,
                    tc.per,
                    tc.url,
                    count(log.fk_telegramCustomer_id) count
                FROM Sp_TelegramCustomer tc 
                LEFT JOIN Log_TelegramCustomer_record log 
                    ON log.fk_telegramCustomer_id = tc.id
                WHERE tc.status = 1
                GROUP BY tc.id`;
            const res = await connectionManager_1.default.getConnection()
                .query(sql);
            return res;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.LogTelegramCustomerRecordMysqlDao = LogTelegramCustomerRecordMysqlDao;
exports.default = new LogTelegramCustomerRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nVGVsZWdyYW1DdXN0b21lclJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9Mb2dUZWxlZ3JhbUN1c3RvbWVyUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBK0M7QUFDL0Msc0VBQStEO0FBQy9ELGdHQUFzRjtBQVF0RixNQUFhLGlDQUFrQyxTQUFRLDJCQUFzQztJQUN6RixRQUFRLENBQUMsU0FBMEM7UUFDL0MsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxPQUFPLENBQUMsU0FBMEM7UUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQTBDO1FBQ3RELElBQUk7WUFDQSxNQUFNLG1DQUFtQyxHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDeEUsYUFBYSxDQUFDLDREQUF5QixDQUFDLENBQUM7WUFFOUMsTUFBTSxDQUFDLEdBQUcsbUNBQW1DLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sTUFBTSxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUEwQztRQUNuRCxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsNERBQXlCLENBQUM7aUJBQ3hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUNELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBMEMsRUFBRSxhQUE4QztRQUN0RyxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsNERBQXlCLENBQUM7aUJBQ3hDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYTtRQUNmLElBQUk7WUFDQSxNQUFNLEdBQUcsR0FBRzs7Ozs7OztXQU9iLENBQUE7WUFFQyxNQUFNLEdBQUcsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDOUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyx3QkFBd0I7UUFFMUIsSUFBSTtZQUNBLE1BQU0sR0FBRyxHQUFHOzs7Ozs7Ozs7OzsrQkFXTyxDQUFBO1lBRW5CLE1BQU0sR0FBRyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUM5QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEIsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0o7QUF2RkQsOEVBdUZDO0FBRUQsa0JBQWUsSUFBSSxpQ0FBaUMsRUFBRSxDQUFDIn0=