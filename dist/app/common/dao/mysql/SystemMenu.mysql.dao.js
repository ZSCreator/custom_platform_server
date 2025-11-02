"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const SystemMenu_entity_1 = require("./entity/SystemMenu.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SystemMenuMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(SystemMenu_entity_1.SystemMenu)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const systemMenu = await connectionManager_1.default.getConnection(true)
                .getRepository(SystemMenu_entity_1.SystemMenu)
                .findOne(parameter);
            return systemMenu;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const managerInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(SystemMenu_entity_1.SystemMenu);
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
                .getRepository(SystemMenu_entity_1.SystemMenu)
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
                .getRepository(SystemMenu_entity_1.SystemMenu)
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
                .getRepository(SystemMenu_entity_1.SystemMenu)
                .createQueryBuilder("SystemMenu")
                .orderBy("SystemMenu.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListForRole(roleMenu) {
        try {
            const list = [];
            roleMenu.forEach(x => {
                list.push(`"${x}"`);
            });
            let sql = `SELECT * FROM  Sys_SystemMenu WHERE Sys_SystemMenu.menuNum in (${list})`;
            const result = await connectionManager_1.default.getConnection(true)
                .query(sql);
            return result;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new SystemMenuMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtTWVudS5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9TeXN0ZW1NZW51Lm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyxrRUFBd0Q7QUFDeEQsc0VBQStEO0FBRS9ELE1BQU0sa0JBQW1CLFNBQVEsMkJBQXVCO0lBQ3BELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBc0s7UUFDakwsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFtSztRQUM3SyxJQUFJO1lBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUN6RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXhCLE9BQU8sVUFBVSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBcUs7UUFDakwsSUFBSTtZQUNBLE1BQU0scUJBQXFCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMxRCxhQUFhLENBQUMsOEJBQVUsQ0FBQyxDQUFDO1lBRS9CLE1BQU0sQ0FBQyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxPQUFPLE1BQU0scUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBa0ssRUFBRyxhQUF3SztRQUN6VixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsOEJBQVUsQ0FBQztpQkFDekIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBbUs7UUFDNUssSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUlELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFhLEVBQUcsS0FBYztRQUN0RCxJQUFJO1lBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzVELGFBQWEsQ0FBQyw4QkFBVSxDQUFDO2lCQUN6QixrQkFBa0IsQ0FBQyxZQUFZLENBQUM7aUJBQ2hDLE9BQU8sQ0FBQyxlQUFlLEVBQUMsTUFBTSxDQUFDO2lCQUMvQixJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4QixJQUFJLENBQUUsS0FBSyxDQUFDO2lCQUNaLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLE9BQVEsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDekI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQU9ELEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBb0I7UUFDdEMsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFFLEVBQUUsQ0FBQztZQUNmLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxHQUFHLEdBQUcsa0VBQWtFLElBQUksR0FBRyxDQUFDO1lBQ3BGLE1BQU0sTUFBTSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztpQkFDckQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWhCLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUksa0JBQWtCLEVBQUUsQ0FBQyJ9