"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneManager = void 0;
const Scene_entity_1 = require("../mysql/entity/Scene.entity");
const Scene_entity_2 = require("../redis/entity/Scene.entity");
const Scene_mysql_dao_1 = require("../mysql/Scene.mysql.dao");
const Scene_redis_dao_1 = require("../redis/Scene.redis.dao");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class SceneManager {
    async findList(parameter, onlyMysql = false) {
        try {
            if (!parameter.nid) {
                return [];
            }
            if (!onlyMysql) {
                const list = await Scene_redis_dao_1.default.findList(parameter);
                if (list.length != 0) {
                    return list;
                }
            }
            const listOnMysql = await Scene_mysql_dao_1.default.findList(parameter);
            const listInRedis = await Scene_redis_dao_1.default.findList(parameter);
            if (listOnMysql.length != listInRedis.length) {
                if (listOnMysql.length > 0) {
                    for (let i = 0; i < listOnMysql.length; i++) {
                        const sceneInfo = listOnMysql[i];
                        await Scene_redis_dao_1.default.insertOne(new Scene_entity_2.SceneInRedis(sceneInfo));
                    }
                }
            }
            return listOnMysql;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                const scene = await Scene_redis_dao_1.default.findOne(parameter);
                if (scene) {
                    return scene;
                }
                const sceneOnMysql = await Scene_mysql_dao_1.default.findOne(parameter);
                if (sceneOnMysql) {
                    const sec = await Scene_redis_dao_1.default.insertOne(new Scene_entity_2.SceneInRedis(sceneOnMysql));
                }
                return sceneOnMysql;
            }
            const scene = await Scene_mysql_dao_1.default.findOne(parameter);
            return scene;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const sec = await Scene_redis_dao_1.default.insertOne(new Scene_entity_2.SceneInRedis(parameter));
            return await Scene_mysql_dao_1.default.insertOne(parameter);
        }
        catch (e) {
            console.error(`插入场信息出错:${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Scene_entity_1.Scene)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await Scene_redis_dao_1.default.updateOne(parameter, new Scene_entity_2.SceneInRedis(partialEntity));
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            await Scene_mysql_dao_1.default.delete(parameter);
            await Scene_redis_dao_1.default.delete(parameter);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async getAllSceneData() {
        try {
            const list = await connectionManager_1.default.getConnection(true)
                .getRepository(Scene_entity_1.Scene)
                .createQueryBuilder("Scene")
                .select(["Scene.nid", "Scene.sceneId"])
                .getMany();
            return list;
        }
        catch (e) {
            return false;
        }
    }
}
exports.SceneManager = SceneManager;
exports.default = new SceneManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL2Rhb01hbmFnZXIvU2NlbmUubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBcUQ7QUFDckQsK0RBQTREO0FBQzVELDhEQUFxRDtBQUNyRCw4REFBcUQ7QUFDckQsc0VBQStEO0FBSS9ELE1BQWEsWUFBWTtJQUNyQixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQTJCLEVBQUUsWUFBcUIsS0FBSztRQUNsRSxJQUFJO1lBQ0EsSUFBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUM7Z0JBQ2QsT0FBTyxFQUFFLENBQUM7YUFDYjtZQUNELElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ1osTUFBTSxJQUFJLEdBQUcsTUFBTSx5QkFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDckQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7YUFDSjtZQUNELE1BQU0sV0FBVyxHQUFHLE1BQU0seUJBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQUcsTUFBTSx5QkFBYSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM1RCxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDMUMsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3pDLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsTUFBTSx5QkFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJC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