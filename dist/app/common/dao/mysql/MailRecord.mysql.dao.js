"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const MailRecord_entity_1 = require("./entity/MailRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class MailRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(MailRecord_entity_1.MailRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const mailRecords = await connectionManager_1.default.getConnection()
                .getRepository(MailRecord_entity_1.MailRecord)
                .findOne(parameter);
            return mailRecords;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const mailRecordsRepository = connectionManager_1.default.getConnection()
                .getRepository(MailRecord_entity_1.MailRecord);
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
                .getRepository(MailRecord_entity_1.MailRecord)
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
                .getRepository(MailRecord_entity_1.MailRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(uid, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(MailRecord_entity_1.MailRecord)
                .createQueryBuilder("MailRecord")
                .where("MailRecord.uid = :uid", { uid: uid })
                .orderBy("MailRecord.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(uid) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(MailRecord_entity_1.MailRecord)
                .createQueryBuilder("MailRecord")
                .where("MailRecord.uid = :uid", { uid: uid })
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTimeForNoRead(uid) {
        try {
            const count = await connectionManager_1.default.getConnection(true)
                .getRepository(MailRecord_entity_1.MailRecord)
                .createQueryBuilder("MailRecord")
                .where("MailRecord.uid = :uid", { uid: uid })
                .andWhere("MailRecord.isRead = :isRead", { isRead: false })
                .getCount();
            return count;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new MailRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbFJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9NYWlsUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyxrRUFBd0Q7QUFDeEQsc0VBQStEO0FBRS9ELE1BQU0sa0JBQW1CLFNBQVEsMkJBQXVCO0lBQ3BELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBeU07UUFDcE4sSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUEwTTtRQUNwTixJQUFJO1lBQ0EsTUFBTSxXQUFXLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3RELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsT0FBTyxXQUFXLENBQUM7U0FDdEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEyTTtRQUN2TixJQUFJO1lBQ0EsTUFBTSxxQkFBcUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzFELGFBQWEsQ0FBQyw4QkFBVSxDQUFDLENBQUM7WUFFL0IsTUFBTSxDQUFDLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sTUFBTSxxQkFBcUIsQ0FBQyxJQUFJ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