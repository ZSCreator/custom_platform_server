"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_entity_1 = require("../mysql/entity/Game.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const Game_mysql_dao_1 = require("../mysql/Game.mysql.dao");
const Game_redis_dao_1 = require("../redis/Game.redis.dao");
class GameManager {
    async findList(params, onlyMysql = false) {
        try {
            let list = [];
            if (onlyMysql) {
                list = await Game_mysql_dao_1.default.findList(params);
            }
            else {
                list = await Game_redis_dao_1.default.findList(params);
            }
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(params, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                const game = await Game_redis_dao_1.default.findOne(params);
                if (game) {
                    return game;
                }
                const gameInMysql = await Game_mysql_dao_1.default.findOne(params);
                if (gameInMysql) {
                    await Game_redis_dao_1.default.insertOne(gameInMysql);
                }
                return gameInMysql;
            }
            const game = await Game_mysql_dao_1.default.findOne(params);
            if (game) {
                await Game_redis_dao_1.default.insertOne(game);
            }
            return game;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(params) {
        try {
            const [, game] = await Promise.all([
                Game_redis_dao_1.default.insertOne(params),
                Game_mysql_dao_1.default.insertOne(params)
            ]);
            return game;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(params, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Game_entity_1.Game)
                .update(params, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await Game_redis_dao_1.default.updateOne(params, partialEntity);
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async delete(params) {
        await Game_mysql_dao_1.default.delete(params);
        await Game_redis_dao_1.default.delete(params);
    }
}
exports.GameManager = GameManager;
exports.default = new GameManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vZGFvTWFuYWdlci9HYW1lLm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkRBQW1EO0FBQ25ELHNFQUErRDtBQUMvRCw0REFBbUQ7QUFDbkQsNERBQW1EO0FBSW5ELE1BQWEsV0FBVztJQUVwQixLQUFLLENBQUMsUUFBUSxDQUFDLE1BQXVCLEVBQUUsU0FBUyxHQUFHLEtBQUs7UUFDckQsSUFBSTtZQUNBLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLElBQUksU0FBUyxFQUFFO2dCQUNYLElBQUksR0FBRyxNQUFNLHdCQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlDO2lCQUFNO2dCQUNILElBQUksR0FBRyxNQUFNLHdCQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlDO1lBRUQsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXVCLEVBQUUsU0FBUyxHQUFHLEtBQUs7UUFDcEQsSUFBSTtZQUVBLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osTUFBTSxJQUFJLEdBQUcsTUFBTSx3QkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxJQUFJLEVBQUU7b0JBQ04sT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSx3QkFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFdkQsSUFBSSxXQUFXLEVBQUU7b0JBQ2IsTUFBTSx3QkFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtpQkFDNUM7Z0JBRUQsT0FBTyxXQUFXLENBQUM7YUFDdEI7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLHdCQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELElBQUcsSUFBSSxFQUFDO2dCQUNKLE1BQU0sd0JBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDckM7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBdUI7UUFFbkMsSUFBSTtZQUNBLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDL0Isd0JBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO2dCQUM5Qix3QkFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7YUFDakMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQXVCLEVBQUUsYUFBOEI7UUFDbkUsSUFBSTtZQUNBLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdkQsYUFBYSxDQUFDLGtCQUFJLENBQUM7aUJBQ25CLE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFbkMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUU3QixJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNLHdCQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQzthQUN2RDtZQUVELE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQXdCO1FBQ2pDLE1BQU0sd0JBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsTUFBTSx3QkFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBQ0o7QUFqRkQsa0NBaUZDO0FBRUQsa0JBQWUsSUFBSSxXQUFXLEVBQUUsQ0FBQyJ9