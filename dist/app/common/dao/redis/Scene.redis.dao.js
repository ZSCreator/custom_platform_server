"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
class SceneRedisDao {
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const list = await conn.hgetall(`${RedisDict_1.DB3.scene}:${parameter.nid}`);
            if (list.length == 0) {
                return [];
            }
            const dataList = [];
            for (let key in list) {
                dataList.push(JSON.parse(list[key]));
            }
            return dataList ? dataList : [];
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hget(`${RedisDict_1.DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`);
            return !!game ? JSON.parse(game) : null;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hset(`${RedisDict_1.DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`, JSON.stringify(partialEntity));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hset(`${RedisDict_1.DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`, JSON.stringify(parameter));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            await conn.hdel(`${RedisDict_1.DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.SceneRedisDao = SceneRedisDao;
exports.default = new SceneRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NlbmUucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvU2NlbmUucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHdEQUErQztBQUUvQyw2REFBa0Q7QUFDbEQsb0RBQThDO0FBRTlDLE1BQWEsYUFBYTtJQUN0QixLQUFLLENBQUMsUUFBUSxDQUFDLFNBQWtQO1FBQzdQLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsZUFBRyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUVqRSxJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO2dCQUNoQixPQUFPLEVBQUUsQ0FBQzthQUNiO1lBQ0QsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNsQixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4QztZQUNELE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUNuQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQWtQO1FBQzVQLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBRyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUV0RixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMzQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQWtQLEVBQUUsYUFBa087UUFDbGUsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFHLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFFckgsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQW1QO1FBQy9QLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBRyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRWpILE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNqQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUEyQztRQUNwRCxNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQUcsQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFFekUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBRUo7QUEvREQsc0NBK0RDO0FBRUQsa0JBQWUsSUFBSSxhQUFhLEVBQUUsQ0FBQyJ9