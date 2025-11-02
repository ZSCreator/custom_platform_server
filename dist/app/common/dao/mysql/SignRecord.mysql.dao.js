"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignRecordMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const SignRecord_entity_1 = require("./entity/SignRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SignRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(SignRecord_entity_1.SignRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const signRecord = await connectionManager_1.default.getConnection()
                .getRepository(SignRecord_entity_1.SignRecord)
                .findOne(parameter);
            return signRecord;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SignRecord_entity_1.SignRecord)
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
                .getRepository(SignRecord_entity_1.SignRecord);
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
                .getRepository(SignRecord_entity_1.SignRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findSignToUid(uid) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(SignRecord_entity_1.SignRecord)
                .createQueryBuilder("SignRecord")
                .where(`SignRecord.uid = ${uid}`)
                .orderBy("SignRecord.id", "DESC")
                .getOne();
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async findPlayerWeekSign(uid, startTime) {
        try {
            const list = await connectionManager_1.default.getConnection(true)
                .getRepository(SignRecord_entity_1.SignRecord)
                .createQueryBuilder("SignRecord")
                .where(`SignRecord.uid = ${uid}`)
                .andWhere(`SignRecord.createDate >= "${startTime}"`)
                .orderBy("SignRecord.id", "DESC")
                .getMany();
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async deleteSignRecord(time) {
        try {
            const sql = `
					DELETE 
					from 
					Sp_SignRecord
	 				where
                    Sp_SignRecord.createDate < "${time}"
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
exports.SignRecordMysqlDao = SignRecordMysqlDao;
exports.default = new SignRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnblJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9TaWduUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBK0M7QUFDL0Msa0VBQXdEO0FBQ3hELHNFQUErRDtBQUkvRCxNQUFhLGtCQUFtQixTQUFRLDJCQUF1QjtJQUMzRCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQXNCO1FBQ2pDLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBc0I7UUFDaEMsSUFBSTtZQUNBLE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNyRCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhCLE9BQU8sVUFBVSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBc0IsRUFBRSxhQUEwQjtRQUM5RCxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUV0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENB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