"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const WhiteIpRecord_entity_1 = require("./entity/WhiteIpRecord.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const WhiteIpRecord_redis_dao_1 = require("../redis/WhiteIpRecord.redis.dao");
class WhiteIpRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const whiteIpRecord = await connectionManager_1.default.getConnection(true)
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
                .findOne(parameter);
            return whiteIpRecord;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const whiteIpRecordRepository = connectionManager_1.default.getConnection()
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord);
            const p = whiteIpRecordRepository.create(parameter);
            await whiteIpRecordRepository.save(p);
            await WhiteIpRecord_redis_dao_1.default.insertOne(parameter);
            return true;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
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
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
                .delete(parameter);
            if (!!affected) {
                await WhiteIpRecord_redis_dao_1.default.delete(parameter);
            }
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
                .createQueryBuilder("WhiteIpRecord")
                .orderBy("WhiteIpRecord.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitFromAccount(account) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
                .createQueryBuilder("WhiteIpRecord")
                .where("WhiteIpRecord.account = :account", { account: account })
                .orderBy("WhiteIpRecord.id", "DESC")
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitFromUserName(page, limit, manager) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(WhiteIpRecord_entity_1.WhiteIpRecord)
                .createQueryBuilder("WhiteIpRecord")
                .where("WhiteIpRecord.createUser = :createUser", { createUser: manager })
                .orderBy("WhiteIpRecord.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new WhiteIpRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2hpdGVJcFJlY29yZC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9XaGl0ZUlwUmVjb3JkLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyx3RUFBOEQ7QUFDOUQsc0VBQStEO0FBQy9ELDhFQUFxRTtBQUNyRSxNQUFNLHFCQUFzQixTQUFRLDJCQUEwQjtJQUMxRCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWtIO1FBQzdILElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLG9DQUFhLENBQUM7aUJBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBa0g7UUFDNUgsSUFBSTtZQUNBLE1BQU0sYUFBYSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDNUQsYUFBYSxDQUFDLG9DQUFhLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixPQUFPLGFBQWEsQ0FBQztTQUN4QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1IO1FBQy9ILElBQUk7WUFDQSxNQUFNLHVCQUF1QixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDNUQsYUFBYSxDQUFDLG9DQUFhLENBQUMsQ0FBQztZQUVsQyxNQUFNLENBQUMsR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFD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