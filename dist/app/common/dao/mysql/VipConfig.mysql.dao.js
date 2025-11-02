"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipConfigMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const VipConfig_entity_1 = require("./entity/VipConfig.entity");
class VipConfigMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(VipConfig_entity_1.VipConfig)
                .find(parameter);
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(VipConfig_entity_1.VipConfig)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const BonusPoolRepository = connectionManager_1.default.getConnection()
                .getRepository(VipConfig_entity_1.VipConfig);
            const p = BonusPoolRepository.create(parameter);
            return await BonusPoolRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(VipConfig_entity_1.VipConfig)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(VipConfig_entity_1.VipConfig)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async findListToLimit(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(VipConfig_entity_1.VipConfig)
                .createQueryBuilder("cfg")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.VipConfigMysqlDao = VipConfigMysqlDao;
exports.default = new VipConfigMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlwQ29uZmlnLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1ZpcENvbmZpZy5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQStDO0FBQy9DLHNFQUErRDtBQUMvRCxnRUFBc0Q7QUFjdEQsTUFBYSxpQkFBa0IsU0FBUSwyQkFBc0I7SUFDekQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUEwQjtRQUNyQyxJQUFJO1lBQ0EsT0FBTywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ25DLGFBQWEsQ0FBQyw0QkFBUyxDQUFDO2lCQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUEwQjtRQUNwQyxJQUFJO1lBQ0EsT0FBTywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ25DLGFBQWEsQ0FBQyw0QkFBUyxDQUFDO2lCQUN4QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEwQjtRQUN0QyxJQUFJO1lBQ0EsTUFBTSxtQkFBbUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3hELGFBQWEsQ0FBQyw0QkFBUyxDQUFDLENBQUM7WUFFOUIsTUFBTSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUEwQjtRQUNuQyxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsNEJBQVMsQ0FBQztpQkFDeEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEwQixFQUFFLGFBQThCO1FBQ3RFLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyw0QkFBUyxDQUFDO2lCQUN4QixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFZLEVBQUUsS0FBYTtRQUM3QyxJQUFJO1lBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzVELGFBQWEsQ0FBQyw0QkFBUyxDQUFDO2lCQUN4QixrQkFBa0IsQ0FBQyxLQUFLLENBQUM7aUJBQ3pCLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUM7aUJBQ1gsZUFBZSxFQUFFLENBQUM7WUFDdkIsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUMxQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQ0o7QUF0RUQsOENBc0VDO0FBRUQsa0JBQWUsSUFBSSxpQkFBaUIsRUFBRSxDQUFDIn0=