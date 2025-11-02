"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerAgentMysqlDao = void 0;
const ADao_abstract_1 = require("../ADao.abstract");
const PlayerAgent_entity_1 = require("./entity/PlayerAgent.entity");
const PlayerAgent_redis_dao_1 = require("../redis/PlayerAgent.redis.dao");
const playerAgent_entity_1 = require("../redis/entity/playerAgent.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PlayerAgentMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PlayerAgent_entity_1.PlayerAgent)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const playerAgent = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerAgent_entity_1.PlayerAgent)
                .findOne(parameter);
            return playerAgent;
        }
        catch (e) {
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerAgent_entity_1.PlayerAgent)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertOne(parameter) {
        try {
            const playerRepository = connectionManager_1.default.getConnection()
                .getRepository(PlayerAgent_entity_1.PlayerAgent);
            const p = playerRepository.create(parameter);
            return await playerRepository.save(p);
        }
        catch (e) {
            return null;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PlayerAgent_entity_1.PlayerAgent)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async insertMany(parameterList) {
        try {
            await connectionManager_1.default.getConnection()
                .createQueryBuilder()
                .insert()
                .into(PlayerAgent_entity_1.PlayerAgent)
                .values(parameterList)
                .execute();
            return true;
        }
        catch (e) {
            console.error(`玩家代理关系表 | 批量插入 | 出错:${e.stack}`);
            return false;
        }
    }
    async findManyAndCountForPlatform(platformUid, currentPage, pageSize = 20) {
        try {
            if (platformUid) {
                const result = await connectionManager_1.default.getConnection(true)
                    .getRepository(PlayerAgent_entity_1.PlayerAgent)
                    .createQueryBuilder("playerAgent")
                    .where("playerAgent.uid = :uid", { uid: platformUid })
                    .getManyAndCount();
                return result;
            }
            else {
                const result = await connectionManager_1.default.getConnection(true)
                    .getRepository(PlayerAgent_entity_1.PlayerAgent)
                    .createQueryBuilder("playerAgent")
                    .where("playerAgent.deep_level = 1")
                    .andWhere("playerAgent.role_type = 2")
                    .andWhere("playerAgent.status = 1")
                    .skip((currentPage - 1) * pageSize)
                    .take(currentPage * pageSize)
                    .orderBy("playerAgent.id", "DESC")
                    .getManyAndCount();
                return result;
            }
        }
        catch (e) {
            return [[], 0];
        }
    }
    async findManyAndCountForAgentFromPlatform(rootUid, currentPage, pageSize = 20) {
        return await connectionManager_1.default.getConnection(true)
            .getRepository(PlayerAgent_entity_1.PlayerAgent)
            .createQueryBuilder("playerAgent")
            .where("playerAgent.root_uid = :rootUid")
            .andWhere("playerAgent.deep_level = 2")
            .andWhere("playerAgent.role_type = 3")
            .andWhere("playerAgent.status = 1")
            .skip((currentPage - 1) * pageSize)
            .take(pageSize)
            .orderBy("playerAgent.createDateTime")
            .setParameters({ rootUid })
            .getManyAndCount();
    }
    async bingManagerAgentList(rootUid) {
        try {
            const sql = `
            SELECT Sp_Player_Agent.platform_name 
            FROM Sp_Player_Agent  
            WHERE Sp_Player_Agent.root_uid = "${rootUid}"  AND Sp_Player_Agent.role_type = 3"
            `;
            const res = await connectionManager_1.default
                .getConnection(true)
                .query(sql);
            return res;
        }
        catch (e) {
            return [];
        }
    }
    async findPlatformAllUid(uid) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerAgent_entity_1.PlayerAgent)
                .createQueryBuilder("PlayerAgent")
                .where("PlayerAgent.rootUid = :rootUid", { rootUid: uid })
                .orderBy("PlayerAgent.id", "DESC")
                .select(['PlayerAgent.uid'])
                .getMany();
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async findAgentAllUid(uid) {
        try {
            const result = await connectionManager_1.default.getConnection(true)
                .getRepository(PlayerAgent_entity_1.PlayerAgent)
                .createQueryBuilder("PlayerAgent")
                .where("PlayerAgent.parentUid = :parentUid", { parentUid: uid })
                .orWhere("PlayerAgent.uid = :uid", { uid: uid })
                .orderBy("PlayerAgent.id", "DESC")
                .select(['PlayerAgent.uid'])
                .getMany();
            return result;
        }
        catch (e) {
            return [];
        }
    }
    async updateAddForThirdApi(platformName, partialEntity) {
        try {
            const { gold, } = partialEntity;
            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold + ${gold}
                    WHERE platform_name = "${platformName}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            if (isSuccess) {
                let p = await PlayerAgent_redis_dao_1.default.findOneInRedis({ platformName });
                if (p) {
                    p.platformGold = p.platformGold + gold;
                    await PlayerAgent_redis_dao_1.default.updateOne({ platformName }, new playerAgent_entity_1.playerAgentInRedis(p));
                }
                else {
                    await PlayerAgent_redis_dao_1.default.findOne({ platformName });
                }
            }
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
    async updateDeleForThirdApi(platformName, partialEntity) {
        try {
            const { gold, } = partialEntity;
            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold - ${gold}
                    WHERE platform_name = "${platformName}"
            `;
            const res = await connectionManager_1.default
                .getConnection()
                .query(sql);
            const isSuccess = !!res.affectedRows;
            if (isSuccess) {
                let p = await PlayerAgent_redis_dao_1.default.findOneInRedis({ platformName });
                if (p) {
                    p.platformGold = p.platformGold - gold;
                    await PlayerAgent_redis_dao_1.default.updateOne({ platformName }, new playerAgent_entity_1.playerAgentInRedis(p));
                }
                else {
                    await PlayerAgent_redis_dao_1.default.findOne({ platformName });
                }
            }
            return isSuccess;
        }
        catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}
exports.PlayerAgentMysqlDao = PlayerAgentMysqlDao;
exports.default = new PlayerAgentMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyQWdlbnQubXlzcWwuZGFvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbXlzcWwvUGxheWVyQWdlbnQubXlzcWwuZGFvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG9EQUErQztBQUMvQyxvRUFBMEQ7QUFDMUQsMEVBQW1FO0FBQ25FLDJFQUEwRTtBQUMxRSxzRUFBK0Q7QUFJL0QsTUFBYSxtQkFBb0IsU0FBUSwyQkFBd0I7SUFDN0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUF1QjtRQUNsQyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQXVCO1FBQ2pDLElBQUk7WUFDQSxNQUFNLFdBQVcsR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7aUJBQzFELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsT0FBTyxXQUFXLENBQUM7U0FDdEI7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUF1QixFQUFFLGFBQTJCO1FBQ2hFLElBQUk7WUFDQSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQ3ZELGFBQWEsQ0FBQyxnQ0FBVyxDQUFDO2lCQUMxQixNQUFNLENBQUMsU0FBUyxFQUFFLGFBQWEs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