"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const SystemRole_entity_1 = require("./entity/SystemRole.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SystemRoleMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(SystemRole_entity_1.SystemRole)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const systemRole = await connectionManager_1.default.getConnection(true)
                .getRepository(SystemRole_entity_1.SystemRole)
                .findOne(parameter);
            return systemRole;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const managerInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(SystemRole_entity_1.SystemRole);
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
                .getRepository(SystemRole_entity_1.SystemRole)
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
                .getRepository(SystemRole_entity_1.SystemRole)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitNoTime(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(SystemRole_entity_1.SystemRole)
                .createQueryBuilder("SystemRole")
                .where("SystemRole.roleLevel > ")
                .orderBy("SystemRole.id", "DESC")
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
exports.default = new SystemRoleMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtUm9sZS5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9TeXN0ZW1Sb2xlLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyxrRUFBd0Q7QUFDeEQsc0VBQStEO0FBRS9ELE1BQU0sa0JBQW1CLFNBQVEsMkJBQXVCO0lBQ3BELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBaUk7UUFDNUksSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFrSTtRQUM1SSxJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUN6RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhCLE9BQU8sVUFBVSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBbUk7UUFDL0ksSUFBSTtZQUNBLE1BQU0scUJBQXFCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMxRCxhQUFhLENBQUMsOEJBQVUsQ0FBQyxDQUFDO1lBRS9CLE1BQU0sQ0FBQyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxPQUFPLE1BQU0scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBaUksRUFBRyxhQUF1STtRQUN2UixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBNEc7UUFDckgsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUlELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFhLEVBQUcsS0FBYztRQUN0RCxJQUFJO1lBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzVELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixrQkFBa0IsQ0FBQyxZQUFZLENBQUM7aUJBQ2hDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQztpQkFDaEMsT0FBTyxDQUFDLGVBQWUsRUFBQyxNQUFNLENBQUM7aUJBQy9CLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ3hCLElBQUksQ0FBRSxLQUFLLENBQUM7aUJBQ1osZUFBZSxFQUFFLENBQUM7WUFDdkIsT0FBUSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUN6QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBRUo7QUFFRCxrQkFBZSxJQUFJLGtCQUFrQixFQUFFLENBQUMifQ==