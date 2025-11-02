"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const TenantControlTotalBetKill_entity_1 = require("./entity/TenantControlTotalBetKill.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class TenantControlTotalBetKillMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(TenantControlTotalBetKill_entity_1.TenantControlTotalBetKill)
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
                .getRepository(TenantControlTotalBetKill_entity_1.TenantControlTotalBetKill)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const payInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(TenantControlTotalBetKill_entity_1.TenantControlTotalBetKill);
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
                .getRepository(TenantControlTotalBetKill_entity_1.TenantControlTotalBetKill)
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
                .getRepository(TenantControlTotalBetKill_entity_1.TenantControlTotalBetKill)
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
                .getRepository(TenantControlTotalBetKill_entity_1.TenantControlTotalBetKill)
                .createQueryBuilder("TenantControlTotalBetKill")
                .orderBy("TenantControlTotalBetKill.id", "DESC")
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
exports.default = new TenantControlTotalBetKillMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuYW50Q29udHJvbFRvdGFsQmV0S2lsbC5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9UZW5hbnRDb250cm9sVG90YWxCZXRLaWxsLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUE2QztBQUM3QyxnR0FBb0Y7QUFDcEYsc0VBQStEO0FBVS9ELE1BQU0saUNBQWtDLFNBQVEsMkJBQXNDO0lBQ2xGLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBK0I7UUFDMUMsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUMvQyxhQUFhLENBQUMsNERBQXlCLENBQUM7aUJBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBZ0M7UUFDMUMsSUFBSTtZQUNBLE9BQU8sTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3pDLGFBQWEsQ0FBQyw0REFBeUIsQ0FBQztpQkFDeEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBZ0M7UUFDNUMsSUFBSTtZQUNBLE1BQU0saUJBQWlCLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN0RCxhQUFhLENBQUMsNERBQXlCLENBQUMsQ0FBQztZQUU5QyxNQUFNLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUMsT0FBTyxNQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBZ0MsRUFBRSxhQUFvQztRQUNsRixJQUFJO1lBQ0EsTUFBTSxFQUFDLFFBQVEsRUFBQyxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNyRCxhQUFhLENBQUMsNERBQXlCLENBQUM7aUJBQ3hDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQWdDO1FBQ3pDLElBQUk7WUFDQSxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3JELGFBQWEsQ0FBQyw0REFBeUIsQ0FBQztpQkFDeEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBR0QsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFZLEVBQUUsS0FBYTtRQUM3QyxJQUFJO1lBQ0EsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDeEQsYUFBYSxDQUFDLDREQUF5QixDQUFDO2lCQUN4QyxrQkFBa0IsQ0FBQywyQkFBMkIsQ0FBQztpQkFFL0MsT0FBTyxDQUFDLDhCQUE4QixFQUFFLE1BQU0sQ0FBQztpQkFDL0MsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDeEIsSUFBSSxDQUFFLEtBQUssQ0FBQztpQkFDWixlQUFlLEVBQUUsQ0FBQztZQUN2QixPQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7U0FDL0I7SUFDTCxDQUFDO0NBRUo7QUFFRCxrQkFBZSxJQUFJLGlDQUFpQyxFQUFFLENBQUMifQ==