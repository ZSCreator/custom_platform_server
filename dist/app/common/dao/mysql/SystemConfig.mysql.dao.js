"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const SystemConfig_entity_1 = require("./entity/SystemConfig.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SystemConfigMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(SystemConfig_entity_1.SystemConfig)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const systemConfig = await connectionManager_1.default.getConnection()
                .getRepository(SystemConfig_entity_1.SystemConfig)
                .findOne(parameter);
            return systemConfig;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const systemConfigRepository = connectionManager_1.default.getConnection()
                .getRepository(SystemConfig_entity_1.SystemConfig);
            const p = systemConfigRepository.create(parameter);
            return await systemConfigRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SystemConfig_entity_1.SystemConfig)
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
                .getRepository(SystemConfig_entity_1.SystemConfig)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new SystemConfigMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtQ29uZmlnLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1N5c3RlbUNvbmZpZy5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvREFBK0M7QUFDL0Msc0VBQTREO0FBQzVELHNFQUErRDtBQUUvRCxNQUFNLG9CQUFxQixTQUFRLDJCQUF5QjtJQUN4RCxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQTJXO1FBQ3RYLElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDL0MsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBOFM7UUFDeFQsSUFBSTtZQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsa0NBQVksQ0FBQztpQkFDM0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhCLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBMmdCO1FBQ3ZoQixJQUFJO1lBQ0EsTUFBTSxzQkFBc0IsR0FBSSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQzVELGFBQWEsQ0FBQyxrQ0FBWSxDQUFDLENBQUM7WUFFakMsTUFBTSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25ELE9BQU8sTUFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDL0M7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUF3QixFQUFHLGFBQWdsQjtRQUN2bkIsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWE7UUFDdEIsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtDQUFZLENBQUM7aUJBQzNCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSxvQkFBb0IsRUFBRSxDQUFDIn0=