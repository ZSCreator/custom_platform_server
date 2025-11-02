"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopGoldManager = void 0;
const ShopGold_mysql_dao_1 = require("../mysql/ShopGold.mysql.dao");
const ShopGold_redis_dao_1 = require("../redis/ShopGold.redis.dao");
const ShopGold_entity_1 = require("../mysql/entity/ShopGold.entity");
const ShopGold_entity_2 = require("../redis/entity/ShopGold.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class ShopGoldManager {
    async findList(parameter) {
        try {
            let list = await ShopGold_redis_dao_1.default.findList(parameter);
            if (list.length == 0) {
                list = await ShopGold_mysql_dao_1.default.findList(parameter);
                if (list.length > 0) {
                    for (let gameType of list) {
                        await ShopGold_redis_dao_1.default.insertOne(gameType);
                    }
                }
            }
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            let ShopGold = await ShopGold_redis_dao_1.default.findOne(parameter);
            if (ShopGold) {
                return ShopGold;
            }
            if (!ShopGold) {
                const ShopGold = await ShopGold_mysql_dao_1.default.findOne(parameter);
                if (ShopGold) {
                    await ShopGold_redis_dao_1.default.insertOne(new ShopGold_entity_2.ShopGoldInRedis(ShopGold));
                    return ShopGold;
                }
                else {
                    return null;
                }
            }
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            await ShopGold_mysql_dao_1.default.insertOne(parameter);
            return await ShopGold_redis_dao_1.default.insertOne(new ShopGold_entity_2.ShopGoldInRedis(parameter));
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
            const isSuccess = !!affected;
            if (isSuccess) {
                await ShopGold_redis_dao_1.default.updateOne(parameter, new ShopGold_entity_2.ShopGoldInRedis(partialEntity));
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await ShopGold_mysql_dao_1.default.delete(parameter);
            await ShopGold_redis_dao_1.default.delete(parameter);
            const isSuccess = !!affected;
            if (isSuccess) {
                await ShopGold_redis_dao_1.default.delete(parameter);
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
}
exports.ShopGoldManager = ShopGoldManager;
exports.default = new ShopGoldManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvcEdvbGQubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvU2hvcEdvbGQubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvRUFBMkQ7QUFDM0Qsb0VBQTJEO0FBQzNELHFFQUF5RDtBQUN6RCxxRUFBZ0U7QUFDaEUsc0VBQStEO0FBRy9ELE1BQWEsZUFBZTtJQUV4QixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQThCO1FBQ3pDLElBQUk7WUFFQSxJQUFJLElBQUksR0FBRyxNQUFNLDRCQUFnQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0RCxJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO2dCQUNoQixJQUFJLEdBQUcsTUFBTSw0QkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2xELElBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7b0JBQ2YsS0FBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUM7d0JBQ3JCLE1BQU0sNEJBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM5QztpQkFDSjthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQThCO1FBQ3hDLElBQUk7WUFFSSxJQUFJLFFBQVEsR0FBRyxNQUFNLDRCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RCxJQUFJLFFBQVEsRUFBRTtnQkFDVixPQUFPLFFBQVEsQ0FBQzthQUNuQjtZQUNELElBQUcsQ0FBQyxRQUFRLEVBQUM7Z0JBQ1QsTUFBTSxRQUFRLEdBQUcsTUFBTSw0QkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTNELElBQUksUUFBUSxFQUFFO29CQUNULE1BQU0sNEJBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksaUNBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNoRSxPQUFPLFFBQVEsQ0FBQztpQkFDcEI7cUJBQUs7b0JBQ0YsT0FBUSxJQUFJLENBQUM7aUJBQ2hCO2FBQ0o7U0FFUjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQThCO1FBQzFDLElBQUk7WUFFQSxNQUFNLDRCQUFnQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1QyxPQUFPLE1BQU0sNEJBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksaUNBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzNFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBOEIsRUFBRSxhQUFrQztRQUM5RSxJQUFJO1lBQ0EsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sMkJBQWlCLENBQUMsYUFBYSxFQUFFO2lCQUN2RCxhQUFhLENBQUMsMEJBQVEsQ0FBQztpQkFDdkIsTUFBTSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN0QyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1lBQzdCLElBQUksU0FBUyxFQUFFO2dCQUNYLE1BQU0sNEJBQWdCLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLGlDQUFlLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUNuRjtZQUNELE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQThCO1FBQ3ZDLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSw0QkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUQsTUFBTSw0QkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM3QixJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNLDRCQUFnQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM1QztZQUNELE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FJSjtBQXBGRCwwQ0FvRkM7QUFFRCxrQkFBZSxJQUFJLGVBQWUsRUFBRSxDQUFDIn0=