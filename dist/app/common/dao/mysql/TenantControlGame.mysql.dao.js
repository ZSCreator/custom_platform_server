"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const TenantControlGame_entity_1 = require("./entity/TenantControlGame.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class TenantControlGameMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(TenantControlGame_entity_1.TenantControlGame)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            return await connectionManager_1.default.getConnection()
                .getRepository(TenantControlGame_entity_1.TenantControlGame)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const payInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(TenantControlGame_entity_1.TenantControlGame);
            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(TenantControlGame_entity_1.TenantControlGame)
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
                .getRepository(TenantControlGame_entity_1.TenantControlGame)
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
                .getRepository(TenantControlGame_entity_1.TenantControlGame)
                .createQueryBuilder("TenantControlGame")
                .orderBy("TenantControlGame.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return { list: [], count: 0 };
        }
    }
}
exports.default = new TenantControlGameMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEdhbWUubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvVGVuYW50Q29udHJvbEdhbWUubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQTZDO0FBQzdDLGdGQUFvRTtBQUNwRSxzRUFBK0Q7QUFhL0QsTUFBTSx5QkFBMEIsU0FBUSwyQkFBOEI7SUFDbEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUE4QjtRQUN6QyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyw0Q0FBaUIsQ0FBQztpQkFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUErQjtRQUN6QyxJQUFJO1lBQ0EsT0FBTyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDekMsYUFBYSxDQUFDLDRDQUFpQixDQUFDO2lCQUNoQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUErQjtRQUMzQyxJQUFJO1lBQ0EsTUFBTSxpQkFBaUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3RELGFBQWEsQ0FBQyw0Q0FBaUIsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QyxPQUFPLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUErQixFQUFFLGFBQW1DO1FBQ2hGLElBQUk7WUFDQSxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyw0Q0FBaUIsQ0FBQztpQkFDaEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBK0I7UUFDeEMsSUFBSTtZQUNBLE1BQU0sRUFBQyxRQUFRLEVBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDckQsYUFBYSxDQUFDLDRDQUFpQixDQUFDO2lCQUNoQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQVksRUFBRSxLQUFhO1FBQzdDLElBQUk7WUFDQSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN4RCxhQUFhLENBQUMsNENBQWlCLENBQUM7aUJBQ2hDLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDO2lCQUV2QyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDO2lCQUN2QyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4QixJQUFJLENBQUUsS0FBSyxDQUFDO2lCQUNaLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7Q0FHSjtBQUVELGtCQUFlLElBQUkseUJBQXlCLEVBQUUsQ0FBQyJ9