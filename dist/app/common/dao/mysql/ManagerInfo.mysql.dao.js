"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const ManagerInfo_entity_1 = require("./entity/ManagerInfo.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class ManagerInfoMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const managerInfo = await connectionManager_1.default.getConnection()
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
                .findOne(parameter);
            return managerInfo;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const managerInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(ManagerInfo_entity_1.ManagerInfo);
            const p = managerInfoRepository.create(parameter);
            return await managerInfoRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
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
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            console.warn(e);
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
                .createQueryBuilder("ManagerInfo")
                .orderBy("ManagerInfo.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findForWhere(userName) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
                .createQueryBuilder("ManagerInfo")
                .where("ManagerInfo.userName = :userName", { userName: userName })
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListForPlatform(page, limit, agent) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(ManagerInfo_entity_1.ManagerInfo)
                .createQueryBuilder("ManagerInfo")
                .where("ManagerInfo.rootAgent = :rootAgent", { rootAgent: agent })
                .orderBy("ManagerInfo.id", "DESC")
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
exports.default = new ManagerInfoMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFuYWdlckluZm8ubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvTWFuYWdlckluZm8ubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLG9FQUEwRDtBQUMxRCxzRUFBK0Q7QUFFL0QsTUFBTSxtQkFBb0IsU0FBUSwyQkFBd0I7SUFDdEQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUE0TjtRQUN2TyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQTJOO1FBQ3JPLElBQUk7WUFDQSxNQUFNLFdBQVcsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdEQsYUFBYSxDQUFDLGdDQUFXLENBQUM7aUJBQzFCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixPQUFPLFdBQVcsQ0FBQztTQUN0QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQThOO1FBQzFPLElBQUk7WUFDQSxNQUFNLHFCQUFxQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDMUQsYUFBYSxDQUFDLGdDQUFXLENBQUMsQ0FBQztZQUVoQyxNQUFNLENBQUMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLHFCQUFxQixDQUFDLElB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