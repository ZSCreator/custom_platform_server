"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCommissionManager = void 0;
const GameCommission_mysql_dao_1 = require("../mysql/GameCommission.mysql.dao");
const GameCommission_redis_dao_1 = require("../redis/GameCommission.redis.dao");
const GameCommission_entity_1 = require("../mysql/entity/GameCommission.entity");
const GameCommission_entity_2 = require("../redis/entity/GameCommission.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class GameCommissionManager {
    async findList(parameter) {
        try {
            let list = await GameCommission_mysql_dao_1.default.findList(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            let gameCommissionInfo = await GameCommission_redis_dao_1.default.findOne(parameter);
            if (gameCommissionInfo) {
                return gameCommissionInfo;
            }
            if (!gameCommissionInfo) {
                const gameCommissionOnMysql = await GameCommission_mysql_dao_1.default.findOne(parameter);
                if (gameCommissionOnMysql) {
                    const sec = await GameCommission_redis_dao_1.default.insertOne(new GameCommission_entity_2.GameCommissionInRedis(gameCommissionOnMysql));
                }
                return gameCommissionOnMysql;
            }
            else {
                return null;
            }
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            await GameCommission_mysql_dao_1.default.insertOne(parameter);
            await GameCommission_redis_dao_1.default.insertOne(new GameCommission_entity_2.GameCommissionInRedis(parameter));
            return true;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(GameCommission_entity_1.GameCommission)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await GameCommission_redis_dao_1.default.updateOne(parameter, new GameCommission_entity_2.GameCommissionInRedis(partialEntity));
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(GameCommission_entity_1.GameCommission)
                .delete(parameter);
            const isSuccess = !!affected;
            if (isSuccess) {
                await GameCommission_redis_dao_1.default.delete(parameter);
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async deleteAllInRedis(parameter) {
        try {
            await GameCommission_redis_dao_1.default.deleteAll(parameter);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.GameCommissionManager = GameCommissionManager;
exports.default = new GameCommissionManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUNvbW1pc3Npb24ubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvR2FtZUNvbW1pc3Npb24ubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnRkFBdUU7QUFDdkUsZ0ZBQXVFO0FBQ3ZFLGlGQUFxRTtBQUNyRSxpRkFBNEU7QUFDNUUsc0VBQStEO0FBRy9ELE1BQWEscUJBQXFCO0lBRTlCLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBb0M7UUFDL0MsSUFBSTtZQUVBLElBQUksSUFBSSxHQUFHLE1BQU0sa0NBQXNCLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDO1NBQ2I7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFvQztRQUM5QyxJQUFJO1lBRUksSUFBSSxrQkFBa0IsR0FBRyxNQUFNLGtDQUFzQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RSxJQUFJLGtCQUFrQixFQUFFO2dCQUNwQixPQUFPLGtCQUFrQixDQUFDO2FBQzdCO1lBQ0QsSUFBRyxDQUFDLGtCQUFrQixFQUFDO2dCQUNuQixNQUFNLHFCQUFxQixHQUFHLE1BQU0sa0NBQXNCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUU5RSxJQUFJLHFCQUFxQixFQUFFO29CQUN2QixNQUFNLEdBQUcsR0FBRyxNQUFNLGtDQUFzQixDQUFDLFNBQVMsQ0FBQyxJQUFJLDZDQUFxQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztpQkFDeEc7Z0JBQ0QsT0FBTyxxQkFBcUIsQ0FBQzthQUNoQztpQkFBSTtnQkFDRCxPQUFPLElBQUksQ0FBQzthQUNmO1NBQ1I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFvQztRQUNoRCxJQUFJO1lBRUEsTUFBTSxrQ0FBc0IsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsTUFBTSxrQ0FBc0IsQ0FBQyxTQUFTLENBQUMsSUFBSSw2Q0FBcUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUEwQixFQUFFLGFBQXdDO1FBQ2hGLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDN0IsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsTUFBTSxrQ0FBc0IsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksNkNBQXFCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUMvRjtZQUNELE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQTBCO1FBQ25DLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxzQ0FBYyxDQUFDO2lCQUM3QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM3QixJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNLGtDQUFzQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUNsRDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUdELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUEwQjtRQUM3QyxJQUFJO1lBQ0EsTUFBTSxrQ0FBc0IsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBR0o7QUF0RkQsc0RBc0ZDO0FBRUQsa0JBQWUsSUFBSSxxQkFBcUIsRUFBRSxDQUFDIn0=