"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const ShopGold_entity_1 = require("./entity/ShopGold.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class ShopGoldMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(ShopGold_entity_1.ShopGold)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const shopGold = await connectionManager_1.default.getConnection()
                .getRepository(ShopGold_entity_1.ShopGold)
                .findOne(parameter);
            return shopGold;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const shopGoldRepository = connectionManager_1.default.getConnection()
                .getRepository(ShopGold_entity_1.ShopGold);
            const p = shopGoldRepository.create(parameter);
            return await shopGoldRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(ShopGold_entity_1.ShopGold)
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
                .getRepository(ShopGold_entity_1.ShopGold)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit, startTime, endTime) {
        try {
            const result = await connectionManager_1.default.getConnection()
                .getRepository(ShopGold_entity_1.ShopGold)
                .createQueryBuilder("ShopGold")
                .where("ShopGold.createDate BETWEEN :start AND :end", { start: startTime, end: endTime })
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            console.warn("result", result);
            return null;
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = new ShopGoldMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvcEdvbGQubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvU2hvcEdvbGQubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsb0RBQStDO0FBQy9DLDhEQUFvRDtBQUNwRCxzRUFBK0Q7QUFFL0QsTUFBTSxnQkFBaUIsU0FBUSwyQkFBcUI7SUFDaEQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFtSztRQUM5SyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQywwQkFBUSxDQUFDO2lCQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQW1LO1FBQzdLLElBQUk7WUFDQSxNQUFNLFFBQVEsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDbkQsYUFBYSxDQUFDLDBCQUFRLENBQUM7aUJBQ3ZCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLFFBQVEsQ0FBQztTQUNuQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1LO1FBQy9LLElBQUk7WUFDQSxNQUFNLGtCQUFrQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLDBCQUFRLENBQUMsQ0FBQztZQUU3QixNQUFNLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0MsT0FBTyxNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWtLLEVBQUcsYUFBd0s7UUFDelYsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLDBCQUFRLENBQUM7aUJBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQW1LO1FBQzVLLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQywwQkFBUSxDQUFDO2lCQUN2QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFHRCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQWEsRUFBRyxLQUFjLEVBQUcsU0FBZ0IsRUFBRyxPQUFhO1FBQ25GLElBQUk7WUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDakQsYUFBYSxDQUFDLDBCQUFRLENBQUM7aUJBQ3ZCLGtCQUFrQixDQUFDLFVBQVUsQ0FBQztpQkFDOUIsS0FBSyxDQUFDLDZDQUE2QyxFQUFDLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRyxHQUFHLEVBQUUsT0FBTyxFQUFDLENBQUM7aUJBQ3RGLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQ3hCLElBQUksQ0FBRSxLQUFLLENBQUM7aUJBQ1osZUFBZSxFQUFFLENBQUM7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUMsTUFBTSxDQUFDLENBQUE7WUFDN0IsT0FBUSxJQUFJLENBQUM7U0FDaEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIn0=