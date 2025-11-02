"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRedisDao = void 0;
const RedisDict_1 = require("../../constant/RedisDict");
const DBCfg_enum_1 = require("./config/DBCfg.enum");
const Game_mysql_dao_1 = require("../mysql/Game.mysql.dao");
const BaseRedisManager_1 = require("./lib/BaseRedisManager");
const IBaseRedisDao_interface_1 = require("./interface.ts/IBaseRedisDao.interface");
class GameRedisDao extends IBaseRedisDao_interface_1.IBaseRedisDao {
    async exits(nid) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            return !!await conn.hexists(RedisDict_1.DB3.game, nid);
        }
        catch (e) {
            return false;
        }
    }
    async count() {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            return await conn.hlen(RedisDict_1.DB3.game);
        }
        catch (e) {
            return 0;
        }
    }
    async findList(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const list = await conn.hvals(RedisDict_1.DB3.game);
            return list.reduce((res, str) => {
                res.push(JSON.parse(str));
                return res;
            }, []);
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hget(RedisDict_1.DB3.game, parameter.nid);
            return !!game ? JSON.parse(game) : null;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hget(RedisDict_1.DB3.game, parameter.nid);
            if (game) {
                await conn.hset(RedisDict_1.DB3.game, parameter.nid, JSON.stringify(Object.assign(JSON.parse(game), partialEntity)));
            }
            else {
                const gameOne = await Game_mysql_dao_1.default.findOne({ nid: parameter.nid });
                if (gameOne) {
                    await conn.hset(RedisDict_1.DB3.game, parameter.nid, JSON.stringify(Object.assign(gameOne, partialEntity)));
                }
            }
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hset(RedisDict_1.DB3.game, parameter.nid, JSON.stringify(parameter));
            return !!game;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.SysData);
        try {
            const game = await conn.hdel(RedisDict_1.DB3.game, parameter.nid);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.GameRedisDao = GameRedisDao;
exports.default = new GameRedisDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZS5yZWRpcy5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9yZWRpcy9HYW1lLnJlZGlzLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBK0M7QUFFL0Msb0RBQThDO0FBRTlDLDREQUFtRDtBQUNuRCw2REFBa0Q7QUFDbEQsb0ZBQXVFO0FBRXZFLE1BQWEsWUFBYSxTQUFRLHVDQUFhO0lBRTNDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBVztRQUNuQixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSTtZQUNBLE9BQU8sQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQzlDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSztRQUNQLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJO1lBQ0EsT0FBTyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLENBQUMsQ0FBQztTQUNaO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBYTtRQUN4QixNQUFNLElBQUksR0FBRyxNQUFNLDBCQUFZLENBQUMsYUFBYSxDQUFDLG9CQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0QsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFHLENBQUMsSUFBSSxDQUFD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