import { AbstractDao } from "../ADao.abstract";
import ConnectionManager from "../mysql/lib/connectionManager";
import { LogTelegramCustomerRecord } from "./entity/LogTelegramCustomerRecord.entity";

type logTelegramCustomerRecordParams = {
    id?: number;
    fk_telegramCustomer_id?: number;
    createDateTime?: Date;
};

export class LogTelegramCustomerRecordMysqlDao extends AbstractDao<LogTelegramCustomerRecord>{
    findList(parameter: logTelegramCustomerRecordParams): Promise<LogTelegramCustomerRecord[]> {
        throw new Error("Method not implemented.");
    }
    findOne(parameter: logTelegramCustomerRecordParams): Promise<LogTelegramCustomerRecord> {
        throw new Error("Method not implemented.");
    }
    async insertOne(parameter: logTelegramCustomerRecordParams): Promise<any> {
        try {
            const LogTelegramCustomerRecordRepository = ConnectionManager.getConnection()
                .getRepository(LogTelegramCustomerRecord);

            const p = LogTelegramCustomerRecordRepository.create(parameter);
            return await LogTelegramCustomerRecordRepository.save(p);
        } catch (e) {
            console.error(e.stack);
            return null;
        }
    }

    async delete(parameter: logTelegramCustomerRecordParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(LogTelegramCustomerRecord)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateOne(parameter: logTelegramCustomerRecordParams, partialEntity: logTelegramCustomerRecordParams) {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(LogTelegramCustomerRecord)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
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
          `

            const res = await ConnectionManager.getConnection()
                .query(sql);
            return res;
        } catch (e) {
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
                GROUP BY tc.id`

            const res = await ConnectionManager.getConnection()
                .query(sql);
            return res;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}

export default new LogTelegramCustomerRecordMysqlDao();