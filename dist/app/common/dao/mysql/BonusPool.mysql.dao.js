"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusPoolMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const BonusPool_entity_1 = require("./entity/BonusPool.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const signMD5 = (str) => require('crypto').createHash('md5').update(str).digest('hex');
const randomString = () => Math.random().toString(36).substr(2, 8);
class BonusPoolMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(BonusPool_entity_1.BonusPool)
                .find(parameter);
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(BonusPool_entity_1.BonusPool)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const BonusPoolRepository = connectionManager_1.default.getConnection()
                .getRepository(BonusPool_entity_1.BonusPool);
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
                .getRepository(BonusPool_entity_1.BonusPool)
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
                .getRepository(BonusPool_entity_1.BonusPool)
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
                .getRepository(BonusPool_entity_1.BonusPool)
                .createQueryBuilder("BonusPool")
                .orderBy("BonusPool.id", "DESC")
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
                .getRepository(BonusPool_entity_1.BonusPool)
                .createQueryBuilder("BonusPool")
                .where("BonusPool.status = :status", { status: status })
                .orderBy("BonusPool.id", "DESC")
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
            .getRepository(BonusPool_entity_1.BonusPool)
            .createQueryBuilder('BonusPool')
            .where("BonusPool.nid  = :nid", { nid: params.nid })
            .andWhere("BonusPool.sceneId = :sceneId", { sceneId: params.sceneId })
            .orderBy('BonusPool.updateDateTime', 'DESC')
            .getOne();
    }
    async findListToLimitStatus(status) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(BonusPool_entity_1.BonusPool)
                .createQueryBuilder("BonusPool")
                .where("BonusPool.status = :status", { status: status })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9udXNQb29sLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL0JvbnVzUG9vbC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQTZDO0FBQzdDLGdFQUFvRDtBQUNwRCxzRUFBK0Q7QUFrQy9ELE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFLL0YsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBR25FLE1BQWEsaUJBQWtCLFNBQVEsMkJBQXNCO0lBQ3pELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBcUI7UUFDaEMsSUFBSTtZQUNBLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNuQyxhQUFhLENBQUMsNEJBQVMsQ0FBQztpQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBcUI7UUFDL0IsSUFBSTtZQUNBLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNuQyxhQUFhLENBQUMsNEJBQVMsQ0FBQztpQkFDeEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FB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