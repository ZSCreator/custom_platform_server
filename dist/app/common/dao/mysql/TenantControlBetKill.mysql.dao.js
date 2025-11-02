"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const TenantControlBetKill_entity_1 = require("./entity/TenantControlBetKill.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class TenantControlBetKillMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(TenantControlBetKill_entity_1.TenantControlBetKill)
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
                .getRepository(TenantControlBetKill_entity_1.TenantControlBetKill)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const payInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(TenantControlBetKill_entity_1.TenantControlBetKill);
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
                .getRepository(TenantControlBetKill_entity_1.TenantControlBetKill)
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
                .getRepository(TenantControlBetKill_entity_1.TenantControlBetKill)
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
                .getRepository(TenantControlBetKill_entity_1.TenantControlBetKill)
                .createQueryBuilder("TenantControlBetKill")
                .orderBy("TenantControlBetKill.id", "DESC")
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
exports.default = new TenantControlBetKillMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEJldEtpbGwubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvVGVuYW50Q29udHJvbEJldEtpbGwubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQTZDO0FBQzdDLHNGQUEwRTtBQUMxRSxzRUFBK0Q7QUFVL0QsTUFBTSw0QkFBNkIsU0FBUSwyQkFBaUM7SUFDeEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUEwQjtRQUNyQyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxrREFBb0IsQ0FBQztpQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUEyQjtRQUNyQyxJQUFJO1lBQ0EsT0FBTyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDekMsYUFBYSxDQUFDLGtEQUFvQixDQUFDO2lCQUNuQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDM0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEyQjtRQUN2QyxJQUFJO1lBQ0EsTUFBTSxpQkFBaUIsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3RELGFBQWEsQ0FBQyxrREFBb0IsQ0FBQyxDQUFDO1lBRXpDLE1BQU0sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QyxPQUFPLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEyQixFQUFFLGFBQStCO1FBQ3hFLElBQUk7WUFDQSxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyxrREFBb0IsQ0FBQztpQkFDbkMsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBMkI7UUFDcEMsSUFBSTtZQUNBLE1BQU0sRUFBQyxRQUFRLEVBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDckQsYUFBYSxDQUFDLGtEQUFvQixDQUFDO2lCQUNuQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQVksRUFBRSxLQUFhO1FBQzdDLElBQUk7WUFDQSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN4RCxhQUFhLENBQUMsa0RBQW9CLENBQUM7aUJBQ25DLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDO2lCQUUxQyxPQUFPLENBQUMseUJBQXlCLEVBQUUsTUFBTSxDQUFDO2lCQUMxQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4QixJQUFJLENBQUUsS0FBSyxDQUFDO2lCQUNaLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7U0FDeEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUksNEJBQTRCLEVBQUUsQ0FBQyJ9