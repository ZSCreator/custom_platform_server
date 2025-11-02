"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipBonusDetailsMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const VipBonusDetails_entity_1 = require("./entity/VipBonusDetails.entity");
class VipBonusDetailsMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(VipBonusDetails_entity_1.VipBonusDetails)
                .find(parameter);
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            return connectionManager_1.default.getConnection()
                .getRepository(VipBonusDetails_entity_1.VipBonusDetails)
                .findOne(parameter);
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const BonusPoolRepository = connectionManager_1.default.getConnection()
                .getRepository(VipBonusDetails_entity_1.VipBonusDetails);
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
                .getRepository(VipBonusDetails_entity_1.VipBonusDetails)
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
                .getRepository(VipBonusDetails_entity_1.VipBonusDetails)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(VipBonusDetails_entity_1.VipBonusDetails)
                .createQueryBuilder("detail")
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
exports.VipBonusDetailsMysqlDao = VipBonusDetailsMysqlDao;
exports.default = new VipBonusDetailsMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlwQm9udXNEZXRhaWxzLm15c3FsLmRhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL215c3FsL1ZpcEJvbnVzRGV0YWlscy5teXNxbC5kYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0RBQStDO0FBQy9DLHNFQUErRDtBQUMvRCw0RUFBa0U7QUFnQmxFLE1BQWEsdUJBQXdCLFNBQVEsMkJBQTRCO0lBQ3JFLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBZ0M7UUFDM0MsSUFBSTtZQUNBLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNuQyxhQUFhLENBQUMsd0NBQWUsQ0FBQztpQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQ3hCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBZ0M7UUFDMUMsSUFBSTtZQUNBLE9BQU8sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUNuQyxhQUFhLENBQUMsd0NBQWUsQ0FBQztpQkFDOUIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBZ0M7UUFDNUMsSUFBSTtZQUNBLE1BQU0sbUJBQW1CLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN4RCxhQUFhLENBQUMsd0NBQWUsQ0FBQyxDQUFDO1lBRXBDLE1BQU0sQ0FBQyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoRCxPQUFPLE1BQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBZ0M7UUFDekMsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLHdDQUFlLENBQUM7aUJBQzlCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBZ0MsRUFBRSxhQUFvQztRQUNsRixJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsd0NBQWUsQ0FBQztpQkFDOUIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBWSxFQUFFLEtBQWE7UUFDN0MsSUFBSTtZQUNBLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2lCQUM1RCxhQUFhLENBQUMsd0NBQWUsQ0FBQztpQkFDOUIsa0JBQWtCLENBQUMsUUFBUSxDQUFDO2lCQUM1QixJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO2lCQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUNYLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDMUI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUNKO0FBckVELDBEQXFFQztBQUVELGtCQUFlLElBQUksdUJBQXVCLEVBQUUsQ0FBQyJ9