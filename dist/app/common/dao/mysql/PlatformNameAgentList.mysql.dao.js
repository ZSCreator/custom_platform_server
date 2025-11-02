"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PlatformForAgentGold_entity_1 = require("./entity/PlatformForAgentGold.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class ThirdGoldRecordMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const platformForAgentGold = await connectionManager_1.default.getConnection()
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .findOne(parameter);
            return platformForAgentGold;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const thirdGoldRecordRepository = connectionManager_1.default.getConnection()
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold);
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
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
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
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .orderBy("PlatformForAgentGold.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.warn(e);
            return false;
        }
    }
    async findListForUid(uid, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .where("PlatformForAgentGold.uid = :uid", { uid: uid })
                .orderBy("PlatformForAgentGold.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async getPlatformToAgentGoldRecordList(platformName, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .where("PlatformForAgentGold.platformName = :platformName", { platformName: platformName })
                .orderBy("PlatformForAgentGold.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async searchPlatformToAgentGoldRecordList(platformName, agentSearch, page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(PlatformForAgentGold_entity_1.PlatformForAgentGold)
                .createQueryBuilder("PlatformForAgentGold")
                .where("PlatformForAgentGold.agentName = :agentName", { agentName: agentSearch })
                .orderBy("PlatformForAgentGold.id", "DESC")
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
exports.default = new ThirdGoldRecordMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhdGZvcm1OYW1lQWdlbnRMaXN0Lm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1BsYXRmb3JtTmFtZUFnZW50TGlzdC5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msc0ZBQTRFO0FBQzVFLHNFQUErRDtBQUUvRCxNQUFNLHVCQUF3QixTQUFRLDJCQUFpQztJQUNuRSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWdNO1FBQzNNLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLGtEQUFvQixDQUFDO2lCQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWdNO1FBQzFNLElBQUk7WUFDQSxNQUFNLG9CQUFvQixHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvRCxhQUFhLENBQUMsa0RBQW9CLENBQUM7aUJBQ25DLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixPQUFPLG9CQUFvQixDQUFDO1NBQy9CO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBa007UUFDOU0sSUFBSTtZQUVBLE1BQU0seUJBQXlCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUM5RCxhQUFhLENBQUMsa0RBQW9CLENBQUMsQ0FBQztZQUV6QyxNQUFNLENBQUMsR0FBRyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFD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