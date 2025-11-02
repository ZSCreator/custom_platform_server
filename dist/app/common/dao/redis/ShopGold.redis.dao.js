"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopGoldRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
class ShopGoldRedisDao {
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const data = await conn.hgetall(`${RedisDict_1.DB3.shopGold}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        }
        catch (e) {
            console.error(`Redis | DB3 | 获取所有真实玩家信息出错: ${e.stack}`);
            return [];
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            if (parameter.id) {
                return null;
            }
            const DayLoginPLayerWithStr = await conn.hget(`${RedisDict_1.DB3.shopGold}`, parameter.id.toString());
            return !!DayLoginPLayerWithStr ? JSON.parse(DayLoginPLayerWithStr) : null;
        }
        catch (e) {
            console.error(`Redis | DB3 | 获取一个真实在线玩家信息: ${e.stack}`);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            if (parameter.id.toString()) {
                return null;
            }
            await conn.hset(RedisDict_1.DB3.shopGold, parameter.id.toString(), JSON.stringify(partialEntity));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB3 | 更新玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            if (parameter.id.toString()) {
                return null;
            }
            await conn.set(RedisDict_1.DB3.shopGold, parameter.id.toString(), JSON.stringify(parameter));
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB3 | 新增玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            await conn.del(RedisDict_1.DB3.shopGold);
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB3 | 删除玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    async deleteOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            if (!parameter.id) {
                return null;
            }
            await conn.hdel(RedisDict_1.DB3.shopGold, parameter.id.toString());
            return 1;
        }
        catch (e) {
            console.error(`Redis | DB3 | 删除单个商城的商品数据: ${e.stack}`);
            return null;
        }
    }
}
exports.ShopGoldRedisDao = ShopGoldRedisDao;
exports.default = new ShopGoldRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvcEdvbGQucmVkaXMuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvU2hvcEdvbGQucmVkaXMuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUErQztBQUMvQyxvREFBOEM7QUFFOUMsNkRBQWtEO0FBR2xELE1BQWEsZ0JBQWdCO0lBTXpCLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBMkk7UUFDdEosTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUk7WUFDQSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxlQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNuRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZCxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEM7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN4RCxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQU1ELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBMkk7UUFDckosTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUk7WUFDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2QsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUNELE1BQU0scUJBQXFCLEdBQUcs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