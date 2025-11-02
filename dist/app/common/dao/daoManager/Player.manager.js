"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const Player_entity_1 = require("../mysql/entity/Player.entity");
const player_entity_1 = require("../redis/entity/player.entity");
const Player_mysql_dao_1 = require("../mysql/Player.mysql.dao");
const Player_redis_dao_1 = require("../redis/Player.redis.dao");
const OnlinePlayer_redis_dao_1 = require("../redis/OnlinePlayer.redis.dao");
const connectionManager_1 = require("../mysql/lib/connectionManager");
const redisManager_1 = require("../redis/lib/redisManager");
class PlayerManager {
    async findList(parameter) {
        try {
            const list = await Player_mysql_dao_1.default.findList(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter, onlyMysql = false) {
        try {
            if (!onlyMysql) {
                const player = await Player_redis_dao_1.default.findOne(parameter);
                if (player) {
                    return player;
                }
                const playerOnMysql = await Player_mysql_dao_1.default.findOne(parameter);
                if (playerOnMysql) {
                    const sec = await Player_redis_dao_1.default.insertOne(new player_entity_1.PlayerInRedis(playerOnMysql));
                }
                return playerOnMysql;
            }
            else {
                const player = await Player_mysql_dao_1.default.findOne(parameter);
                if (player) {
                    const sec = await Player_redis_dao_1.default.insertOne(new player_entity_1.PlayerInRedis(player));
                }
                return player;
            }
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const p = await Player_mysql_dao_1.default.insertOne(parameter);
            await Player_redis_dao_1.default.insertOne(new player_entity_1.PlayerInRedis(p));
            return p;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await Player_redis_dao_1.default.updateOne(parameter, new player_entity_1.PlayerInRedis(partialEntity));
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async updateOneForRecordGeneral(uid, partialEntity, beResetGold = false) {
        try {
            const { instantNetProfit, oneWin, dailyFlow, flowCount, maxBetGold, gold, withdrawalChips } = partialEntity;
            const goldPartial = gold >= 0 ? `+ ${gold}` : `- ${Math.abs(gold)}`;
            const goldSql = beResetGold ? `gold = 0` : `gold = gold ${goldPartial}`;
            const sql = `
                UPDATE Sp_Player 
                    SET
                        instantNetProfit = ${instantNetProfit},
                        ${goldSql},
                        oneWin = ${oneWin},
                        dailyFlow = ${dailyFlow},
                        flowCount = ${flowCount},
                        maxBetGold = ${maxBetGold},
                        withdrawalChips = ${withdrawalChips}
                    WHERE pk_uid = "${uid}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            if (isSuccess) {
                const p = await Player_redis_dao_1.default.findOne({ uid });
                p.instantNetProfit = instantNetProfit;
                p.oneWin = oneWin;
                p.dailyFlow = dailyFlow;
                p.flowCount = flowCount;
                p.maxBetGold = maxBetGold;
                p.gold = beResetGold ? 0 : parseFloat((p.gold + gold).toFixed(3));
                p.withdrawalChips = withdrawalChips;
                await Player_redis_dao_1.default.updateOne({ uid }, new player_entity_1.PlayerInRedis(p));
            }
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateOneForaddPlayerMoney(uid, partialEntity) {
        let _lock = null;
        try {
            _lock = await (0, redisManager_1.lock)(uid);
            const { gold, oneAddRmb, addDayRmb, withdrawalChips, addRmb } = partialEntity;
            const sql = `
                UPDATE Sp_Player 
                    SET
                        oneWin = 0,
                        gold = gold + ${gold},
                        addDayRmb =  ${addDayRmb},
                        oneAddRmb =  ${oneAddRmb},
                        withdrawalChips =  ${withdrawalChips},
                        addRmb = ${addRmb}
                    WHERE pk_uid = "${uid}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            if (isSuccess) {
                const p = await Player_redis_dao_1.default.findOne({ uid });
                if (p) {
                    p.gold = p.gold + gold;
                    p.oneWin = 0;
                    p.addDayRmb = addDayRmb;
                    p.oneAddRmb = oneAddRmb;
                    p.withdrawalChips = withdrawalChips;
                    p.addRmb = addRmb;
                    await Player_redis_dao_1.default.updateOne({ uid }, new player_entity_1.PlayerInRedis(p));
                }
                else {
                    await this.findOne({ uid }, true);
                }
            }
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
        finally {
            !!_lock && await (0, redisManager_1.unlock)(_lock);
        }
    }
    async updateOneCash(uid, partialEntity) {
        let _lock = null;
        try {
            _lock = await (0, redisManager_1.lock)(uid);
            const { gold, addTixian, } = partialEntity;
            const sql = `
                UPDATE Sp_Player 
                    SET
                        oneWin = 0,
                        gold = gold + ${gold},
                        addTixian = ${addTixian}
                    WHERE pk_uid = "${uid}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            if (isSuccess) {
                const p = await Player_redis_dao_1.default.findOne({ uid });
                if (p) {
                    p.gold = p.gold + gold;
                    p.addTixian = addTixian;
                    await Player_redis_dao_1.default.updateOne({ uid }, new player_entity_1.PlayerInRedis(p));
                }
                else {
                    await this.findOne({ uid }, true);
                }
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
        finally {
            !!_lock && await (0, redisManager_1.unlock)(_lock);
        }
    }
    async updatePlayerGold(uid, gold) {
        let _lock = null;
        try {
            _lock = await (0, redisManager_1.lock)(uid);
            const sql = `
                UPDATE Sp_Player 
                    SET
                        gold = gold + ${gold}
                    WHERE pk_uid = "${uid}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            if (isSuccess) {
                const p = await Player_redis_dao_1.default.findOne({ uid });
                if (p) {
                    p.gold = p.gold + gold;
                    await Player_redis_dao_1.default.updateOne({ uid }, new player_entity_1.PlayerInRedis(p));
                }
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
        finally {
            !!_lock && await (0, redisManager_1.unlock)(_lock);
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(Player_entity_1.Player)
                .delete(parameter);
            await Player_redis_dao_1.default.delete(parameter);
            const isSuccess = !!affected;
            if (isSuccess) {
                await Player_redis_dao_1.default.delete(parameter);
            }
            return isSuccess;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitForManager(page, limit, selectFile) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .orderBy("Player.id", "DESC")
                .select(selectFile)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            return false;
        }
    }
    async findListForManager(where, page, limit, selectFile) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .where(where)
                .orderBy("Player.id", "DESC")
                .select(selectFile)
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.warn(e);
            return false;
        }
    }
    async fileExprotData(startTime, endTime, selectFile) {
        try {
            const list = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .orderBy("Player.id", "DESC")
                .select(selectFile)
                .getMany();
            return list;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimitInUids(selectFile, uidList) {
        try {
            const list = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .where("Player.uid IN (:...uids)", { uids: uidList })
                .select(selectFile)
                .getMany();
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findListRedisInUidsForSid() {
        try {
            const onlineList = await OnlinePlayer_redis_dao_1.default.findList();
            const uidList = onlineList.map(pl => pl.uid);
            const list = await Player_redis_dao_1.default.findListInUids(uidList);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOneForUid(uid) {
        try {
            const player = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .where("Player.uid = :uid", { uid: uid })
                .getOne();
            return player;
        }
        catch (e) {
            return null;
        }
    }
    async findOneForthirdUid(thirdUid) {
        try {
            const player = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .where("Player.thirdUid = :thirdUid", { thirdUid: thirdUid })
                .getOne();
            return player;
        }
        catch (e) {
            return null;
        }
    }
    async findPlayerDayLoginData() {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(Player_entity_1.Player)
                .createQueryBuilder("Player")
                .select("SUM(Player.addDayRmb)", "addDayRmb")
                .addSelect("SUM(Player.addDayTixian)", "addDayTixian")
                .addSelect("SUM(Player.gold)", "gold")
                .where("Player.updateTime >= date_format(now(),'%Y-%m-%d 00:00:00')")
                .getRawOne();
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddPlayer(startTime, endTime) {
        try {
            const sql_player = `SELECT
                    COUNT(player.id) AS todayPlayer,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.createTime >= "${startTime}"
                 AND player.createTime < "${endTime}"
            GROUP BY agentName`;
            const result = await connectionManager_1.default.getConnection(true).query(sql_player);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddPlayer_uid(group_id, startTime, endTime) {
        try {
            const sql_player = `SELECT
                    IFNULL(player.pk_uid,'无') AS uid,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.createTime >= "${startTime}"
                 AND player.createTime < "${endTime}"
                 AND player.group_id = "${group_id}"	
            GROUP BY agentName,uid`;
            const result = await connectionManager_1.default.getConnection(true).query(sql_player);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayBetPlayer(group_id, startTime, endTime) {
        try {
            const sql_player = `
            SELECT
                    IFNULL(player.pk_uid,'无') AS uid,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.dailyFlow >= 0
            AND      player.group_id = "${group_id}"	
            AND      player.createTime >=  "${startTime}"
            AND      player.createTime <   "${endTime}"			 
            GROUP BY agentName,uid`;
            const result = await connectionManager_1.default.getConnection(true).query(sql_player);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddPlayer_groupRemark(groupRemark, startTime, endTime) {
        try {
            const sql_player = `SELECT
                    COUNT(player.id) AS todayPlayer,
                    IFNULL(player.groupRemark,'无') AS agentName
            FROM
                    Sp_Player AS player
            WHERE           
                     player.createTime >=  "${startTime}"
                 AND player.createTime <   "${endTime}"
                 AND player.groupRemark = "${groupRemark}"
                     GROUP BY agentName`;
            const result = await connectionManager_1.default.getConnection(true).query(sql_player);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async optimize() {
        try {
            await connectionManager_1.default.getConnection()
                .query(`optimize table Sp_Player`);
            return true;
        }
        catch (e) {
            console.error(`释放玩家表空间出错: ${e.stack}`);
            return false;
        }
    }
}
exports.PlayerManager = PlayerManager;
exports.default = new PlayerManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLm1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9kYW9NYW5hZ2VyL1BsYXllci5tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlFQUF1RDtBQUN2RCxpRUFBOEQ7QUFDOUQsZ0VBQXVEO0FBQ3ZELGdFQUF1RDtBQUN2RCw0RUFBOEQ7QUFDOUQsc0VBQStEO0FBQy9ELDREQUF5RDtBQUl6RCxNQUFhLGFBQWE7SUFFdEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUE0QjtRQUN2QyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBYyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0RCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBNEIsRUFBRSxZQUFxQixLQUFLO1FBQ2xFLElBQUk7WUFFQSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNaLE1BQU0sTUFBTSxHQUFHLE1BQU0sMEJBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXZELElBQUksTUFBTSxFQUFFO29CQUNSLE9BQU8sTUFBTSxDQUFDO2lCQUNqQjtnQkFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLDBCQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUU5RCxJQUFJLGFBQWEsRUFBRTtvQkFFZixNQUFNLEdBQUcsR0FBRyxNQUFNLDBCQUFjLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2lCQUNoRjtnQkFFRCxPQUFPLGFBQWEsQ0FBQzthQUN4QjtpQkFBTTtnQkFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLDBCQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMs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