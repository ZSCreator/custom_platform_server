"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const SystemGameType_entity_1 = require("./entity/SystemGameType.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SystemGameTypeMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(SystemGameType_entity_1.SystemGameType)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const systemGameType = await connectionManager_1.default.getConnection()
                .getRepository(SystemGameType_entity_1.SystemGameType)
                .findOne(parameter);
            return systemGameType;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const systemGameTypeRepository = connectionManager_1.default.getConnection()
                .getRepository(SystemGameType_entity_1.SystemGameType);
            const p = systemGameTypeRepository.create(parameter);
            return await systemGameTypeRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(SystemGameType_entity_1.SystemGameType)
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
                .getRepository(SystemGameType_entity_1.SystemGameType)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new SystemGameTypeMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtR2FtZVR5cGUubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvU3lzdGVtR2FtZVR5cGUubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLDBFQUFnRTtBQUNoRSxzRUFBK0Q7QUFFL0QsTUFBTSxzQkFBdUIsU0FBUSwyQkFBMkI7SUFDNUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUErSDtRQUMxSSxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQStIO1FBQ3pJLElBQUk7WUFDQSxNQUFNLGNBQWMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDekQsYUFBYSxDQUFDLHNDQUFjLENBQUM7aUJBQzdCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixPQUFPLGNBQWMsQ0FBQztTQUN6QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWlJO1FBQzdJLElBQUk7WUFDQSxNQUFNLHdCQUF3QixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDN0QsYUFBYSxDQUFDLHNDQUFjLENBQUMsQ0FBQztZQUVuQyxNQUFNLENBQUMsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckQsT0FBTyxNQUFNLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQThILEVBQUcsYUFBb0k7UUFDalIsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLHNDQUFjLENBQUM7aUJBQzdCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWE7UUFDdEIsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLHNDQUFjLENBQUM7aUJBQzdCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSxzQkFBc0IsRUFBRSxDQUFDIn0=