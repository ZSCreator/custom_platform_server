"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPLRecordMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const IPLRecord_entity_1 = require("./entity/IPLRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class IPLRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    findList(parameter) {
        throw new Error("Method not implemented.");
    }
    findOne(parameter) {
        throw new Error("Method not implemented.");
    }
    async insertOne(parameter) {
        try {
            const recordRepository = connectionManager_1.default.getConnection()
                .getRepository(IPLRecord_entity_1.IPLRecord);
            const p = recordRepository.create(parameter);
            return await recordRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    delete(parameter) {
        throw new Error("Method not implemented.");
    }
    async findLastOneByUid(uid) {
        try {
            return await connectionManager_1.default.getConnection()
                .getRepository(IPLRecord_entity_1.IPLRecord)
                .createQueryBuilder("record")
                .where("record.uid = :uid", { uid })
                .andWhere("record.type = :deposit", { deposit: "deposit" })
                .orderBy("record.createTime", "DESC")
                .getOne();
        }
        catch (e) {
            return false;
        }
    }
}
exports.IPLRecordMysqlDao = IPLRecordMysqlDao;
exports.default = new IPLRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVBMUmVjb3JkLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL0lQTFJlY29yZC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQStDO0FBQy9DLGdFQUFzRDtBQUN0RCxzRUFBK0Q7QUFHL0QsTUFBYSxpQkFBa0IsU0FBUSwyQkFBc0I7SUFDekQsUUFBUSxDQUFDLFNBQXNQO1FBQzNQLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsT0FBTyxDQUFDLFNBQXNQO1FBQzFQLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFzUDtRQUNsUSxJQUFJO1lBQ0EsTUFBTSxnQkFBZ0IsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyw0QkFBUyxDQUFDLENBQUM7WUFFOUIsTUFBTSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTdDLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFNBQXNQO1FBQ3pQLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQVc7UUFDOUIsSUFBSTtZQUNBLE9BQU8sTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3pDLGFBQWEsQ0FBQyw0QkFBUyxDQUFDO2lCQUN4QixrQkFBa0IsQ0FBQyxRQUFRLENBQUM7aUJBQzVCLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO2lCQUNuQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUM7aUJBQzFELE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUM7aUJBQ3BDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQXJDRCw4Q0FxQ0M7QUFFRCxrQkFBZSxJQUFJLGlCQUFpQixFQUFFLENBQUMifQ==