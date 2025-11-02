"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const TenantControlAwardKill_entity_1 = require("./entity/TenantControlAwardKill.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class TenantControlAwardKillMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(TenantControlAwardKill_entity_1.TenantControlAwardKill)
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
                .getRepository(TenantControlAwardKill_entity_1.TenantControlAwardKill)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const payInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(TenantControlAwardKill_entity_1.TenantControlAwardKill);
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
                .getRepository(TenantControlAwardKill_entity_1.TenantControlAwardKill)
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
                .getRepository(TenantControlAwardKill_entity_1.TenantControlAwardKill)
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
                .getRepository(TenantControlAwardKill_entity_1.TenantControlAwardKill)
                .createQueryBuilder("TenantControlAwardKill")
                .orderBy("TenantControlAwardKill.id", "DESC")
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
exports.default = new TenantControlAwardKillMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbEF3YXJkS2lsbC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9UZW5hbnRDb250cm9sQXdhcmRLaWxsLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUE2QztBQUM3QywwRkFBOEU7QUFDOUUsc0VBQStEO0FBVS9ELE1BQU0sOEJBQStCLFNBQVEsMkJBQW1DO0lBQzVFLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBbUM7UUFDOUMsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsc0RBQXNCLENBQUM7aUJBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBb0M7UUFDOUMsSUFBSTtZQUNBLE9BQU8sTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3pDLGFBQWEsQ0FBQyxzREFBc0IsQ0FBQztpQkFDckMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBb0M7UUFDaEQsSUFBSTtZQUNBLE1BQU0saUJBQWlCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN0RCxhQUFhLENBQUMsc0RBQXNCLENBQUMsQ0FBQztZQUUzQyxNQUFNLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUMsT0FBTyxNQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBb0MsRUFBRSxhQUF3QztRQUMxRixJQUFJO1lBQ0EsTUFBTSxFQUFDLFFBQVEsRUFBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNyRCxhQUFhLENBQUMsc0RBQXNCLENBQUM7aUJBQ3JDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQW9DO1FBQzdDLElBQUk7WUFDQSxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyxzREFBc0IsQ0FBQztpQkFDckMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFZLEVBQUUsS0FBYTtRQUM3QyxJQUFJO1lBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDeEQsYUFBYSxDQUFDLHNEQUFzQixDQUFDO2lCQUNyQyxrQkFBa0IsQ0FBQyx3QkFBd0IsQ0FBQztpQkFFNUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLE1BQU0sQ0FBQztpQkFDNUMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDeEIsSUFBSSxDQUFFLEtBQUssQ0FBQztpQkFDWixlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FFSjtBQUVELGtCQUFlLElBQUksOEJBQThCLEVBQUUsQ0FBQyJ9