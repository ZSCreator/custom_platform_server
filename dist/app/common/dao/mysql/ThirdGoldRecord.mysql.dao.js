"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const ThirdGoldRecord_entity_1 = require("./entity/ThirdGoldRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const ThirdGoldRecord_redis_dao_1 = require("../redis/ThirdGoldRecord.redis.dao");
class ThirdGoldRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const thirdGoldRecord = await connectionManager_1.default.getConnection()
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .findOne(parameter);
            return thirdGoldRecord;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            if (parameter.status && parameter.status == 0) {
                await ThirdGoldRecord_redis_dao_1.default.addLength({ length: 1 });
            }
            const thirdGoldRecordRepository = connectionManager_1.default.getConnection()
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord);
            const p = thirdGoldRecordRepository.create(parameter);
            return await thirdGoldRecordRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
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
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findOneForEesc(uid) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.uid = :uid", { uid: uid })
                .orderBy("ThirdGoldRecord.id", "DESC")
                .getOne();
            return result;
        }
        catch (e) {
            return false;
        }
    }
    async findListForStatus({}) {
        try {
            const count = await connectionManager_1.default.getConnection(true)
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.status = :status", { status: '0' })
                .getCount();
            return count;
        }
        catch (e) {
            return 0;
        }
    }
    async findListToLimitNoTime(startTime, endTime, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.createDateTime BETWEEN :start AND :end", { start: startTime, end: endTime })
                .orderBy("ThirdGoldRecord.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListForUid(uid, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.uid = :uid", { uid: uid })
                .orderBy("ThirdGoldRecord.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async getPlatformToAgentGoldRecordList(agentList, managerAgent, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where("ThirdGoldRecord.type = :type", { type: 2 })
                .andWhere("ThirdGoldRecord.agentRemark  IN (:...agentRemarks)", { agentRemarks: agentList })
                .orderBy("ThirdGoldRecord.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async getAgentForPlayerGoldRecordList(where, page, pageSize) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .createQueryBuilder("ThirdGoldRecord")
                .where(where)
                .skip((page - 1) * pageSize)
                .take(pageSize)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.warn(e);
            return false;
        }
    }
    async PlayerLoginHourData() {
        try {
            const list = await connectionManager_1.default.getConnection(true).query(`SELECT
                    DATE_FORMAT(createDateTime, '%H') as hour,	
                    COUNT(id) as id,	
                    Sum(gold) as loginGold
                    FROM Log_ThirdGoldRecord
                    where TO_DAYS(createDateTime) = TO_DAYS(NOW()) AND gold > 0
                    GROUP BY DATE_FORMAT(createDateTime,'%H')`);
            return list;
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
                .from(ThirdGoldRecord_entity_1.ThirdGoldRecord)
                .where(`Log_ThirdGoldRecord.createDateTime < "${startTime}" AND Log_ThirdGoldRecord.status  IN  ('1', '3') `)
                .execute();
            return list;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new ThirdGoldRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRHb2xkUmVjb3JkLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1RoaXJkR29sZFJlY29yZC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0MsNEVBQWtFO0FBQ2xFLHNFQUErRDtBQUMvRCxrRkFBMkU7QUFFM0UsTUFBTSx1QkFBd0IsU0FBUSwyQkFBNEI7SUFDOUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFnTjtRQUMzTixJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyx3Q0FBZSxDQUFDO2lCQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWdOO1FBQzFOLElBQUk7WUFDQSxNQUFNLGVBQWUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDMUQsYUFBYSxDQUFDLHdDQUFlLENBQUM7aUJBQzlCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixPQUFPLGVBQWUsQ0FBQztTQUMxQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWlOO1FBQzdOLElBQUk7WUFDQSxJQUFHLFNBQVMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7Z0JBRXpDLE1BQU0sbUNBQXlCLENBQUMsU0FBUyxDQUFDLEVBQUMsTUFBTSxFQUFHLENBQUMsRUFBQyxDQUFDLENBQUM7YUFDM0Q7WUFFRCxNQUFN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