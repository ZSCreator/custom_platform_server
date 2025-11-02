"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusPoolMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const BonusPoolHistory_entity_1 = require("./entity/BonusPoolHistory.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const signMD5 = (str) => require('crypto').createHash('md5').update(str).digest('hex');
const randomString = () => Math.random().toString(36).substr(2, 8);
class BonusPoolMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const BonusPoolRepository = connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory);
            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
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
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
                .createQueryBuilder("BonusPoolHistory")
                .orderBy("BonusPoolHistory.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit, status) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
                .createQueryBuilder("BonusPoolHistory")
                .where("BonusPoolHistory.status = :status", { status: status })
                .orderBy("BonusPoolHistory.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findLastOneByParams(params) {
        return await connectionManager_1.default.getConnection()
            .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
            .createQueryBuilder('BonusPoolHistory')
            .orderBy('BonusPoolHistory.updateDateTime', 'DESC')
            .where("BonusPoolHistory. = :nid", { nid: params.nid })
            .andWhere("BonusPoolHistory. = :sceneId", { sceneId: params.sceneId })
            .getOne();
    }
    async findListToLimitStatus(status) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(BonusPoolHistory_entity_1.BonusPoolHistory)
                .createQueryBuilder("BonusPoolHistory")
                .where("BonusPoolHistory.status = :status", { status: status })
                .getCount();
        }
        catch (e) {
            return 0;
        }
    }
    getUUID() {
        return signMD5(`${randomString()}${Date.now()}`);
    }
}
exports.BonusPoolMysqlDao = BonusPoolMysqlDao;
exports.default = new BonusPoolMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sSGlzdG9yeS5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9Cb251c1Bvb2xIaXN0b3J5Lm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvREFBNkM7QUFDN0MsOEVBQWtFO0FBQ2xFLHNFQUErRDtBQW9CL0QsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUsvRixNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFHbkUsTUFBYSxpQkFBa0IsU0FBUSwyQkFBNkI7SUFDaEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFxQjtRQUNoQyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQywwQ0FBZ0IsQ0FBQztpQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFxQjtRQUMvQixJQUFJO1lBQ0EsT0FBTywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ25DLGFBQWEsQ0FBQywwQ0FBZ0IsQ0FBQztpQkFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsT0FBTyxDQUFDLEVB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