import { AbstractDao } from "../ADao.abstract";
import { PlayerAgent } from "./entity/PlayerAgent.entity";
import  PlayerAgentRedisDao  from "../redis/PlayerAgent.redis.dao";
import  { playerAgentInRedis }  from "../redis/entity/playerAgent.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type IPlayerAgent = { id?: number; language?: string; uid?: string; thirdUid?: string; closeGameList?: string;  platformName?: string; platformGold?: number; rootUid?: string; parentUid?: string; deepLevel?: number; roleType?: number; status?: number; };

export class PlayerAgentMysqlDao extends AbstractDao<PlayerAgent> {
    async findList(parameter: IPlayerAgent): Promise<PlayerAgent[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(PlayerAgent)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: IPlayerAgent): Promise<PlayerAgent> {
        try {
            const playerAgent = await ConnectionManager.getConnection(true)
                .getRepository(PlayerAgent)
                .findOne(parameter);

            return playerAgent;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: IPlayerAgent, partialEntity: IPlayerAgent): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerAgent)
                .update(parameter, partialEntity);

            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: IPlayerAgent): Promise<any> {
        try {
            const playerRepository = ConnectionManager.getConnection()
                .getRepository(PlayerAgent);

            const p = playerRepository.create(parameter);

            return await playerRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: IPlayerAgent): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerAgent)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertMany(parameterList: Array<IPlayerAgent>): Promise<boolean> {
        try {
            await ConnectionManager.getConnection()
                .createQueryBuilder()
                .insert()
                .into(PlayerAgent)
                .values(parameterList)
                .execute();
            return true;
        } catch (e) {
            console.error(`玩家代理关系表 | 批量插入 | 出错:${e.stack}`)
            return false;
        }
    }

    /** 查询平台分页列表信息 */
    async findManyAndCountForPlatform(platformUid: string, currentPage: number, pageSize: number = 20) {
        try {
            if (platformUid) {
                const result = await ConnectionManager.getConnection(true)
                    .getRepository(PlayerAgent)
                    .createQueryBuilder("playerAgent")
                    .where("playerAgent.uid = :uid", { uid: platformUid })
                    .getManyAndCount();
                return result;
            } else {
                const result = await ConnectionManager.getConnection(true)
                    .getRepository(PlayerAgent)
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

        } catch (e) {
            return [[], 0];
        }
    }

    /** 查询代理分页列表信息 */
    async findManyAndCountForAgentFromPlatform(rootUid: string, currentPage: number, pageSize: number = 20) {
        return await ConnectionManager.getConnection(true)
            .getRepository(PlayerAgent)
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


    /** 查询代理分页列表信息 */
    async bingManagerAgentList(rootUid: string) {
        try {
        const sql = `
            SELECT Sp_Player_Agent.platform_name 
            FROM Sp_Player_Agent  
            WHERE Sp_Player_Agent.root_uid = "${rootUid}"  AND Sp_Player_Agent.role_type = 3"
            `;

        const res = await ConnectionManager
            .getConnection(true)
            .query(sql);

        return  res ;

        } catch (e) {
            return [];
        }
    }



    /**
     * 作用于删除平台相关数据 获取这个平台下面所有的uid
     * @param uid
     */
    async findPlatformAllUid(uid: string): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(PlayerAgent)
                .createQueryBuilder("PlayerAgent")
                .where("PlayerAgent.rootUid = :rootUid", { rootUid: uid })
                .orderBy("PlayerAgent.id", "DESC")
                .select(['PlayerAgent.uid'])
                .getMany();
            return result;
        } catch (e) {
            return [];
        }
    }

    /**
     * 作用于删除代理相关数据 获取这个平台下面所有的uid
     * @param uid
     */
    async findAgentAllUid(uid: string): Promise<any> {
        try {
            const result = await ConnectionManager.getConnection(true)
                .getRepository(PlayerAgent)
                .createQueryBuilder("PlayerAgent")
                .where("PlayerAgent.parentUid = :parentUid", { parentUid: uid })
                .orWhere("PlayerAgent.uid = :uid", { uid: uid })
                .orderBy("PlayerAgent.id", "DESC")
                .select(['PlayerAgent.uid'])
                .getMany();
            return result;
        } catch (e) {
            return [];
        }
    }



    /**
     * 增加代理的金币额度 针对 http 上分处
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateAddForThirdApi(platformName: string, partialEntity: { gold: number }) {
        try {
            const {
                gold,
            } = partialEntity;

            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold + ${gold}
                    WHERE platform_name = "${platformName}"
            `;

            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            if (isSuccess) {
                let p = await PlayerAgentRedisDao.findOneInRedis({ platformName });
                if(p){
                    p.platformGold = p.platformGold + gold;
                    await PlayerAgentRedisDao.updateOne({ platformName }, new playerAgentInRedis(p));
                }else {
                    await PlayerAgentRedisDao.findOne({platformName});
                }

            }
            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }


    /**
     * 减少代理的金币额度 针对 http 上分处
     * @param parameter
     * @param partialEntity
     * @returns
     */
    async updateDeleForThirdApi(platformName: string, partialEntity: { gold: number }) {
        try {
            const {
                gold,
            } = partialEntity;

            const sql = `
                UPDATE Sp_Player_Agent 
                    SET
                        platform_gold = platform_gold - ${gold}
                    WHERE platform_name = "${platformName}"
            `;
            
            const res = await ConnectionManager
                .getConnection()
                .query(sql);

            const isSuccess = !!res.affectedRows;

            if (isSuccess) {
                let p = await PlayerAgentRedisDao.findOneInRedis({ platformName });
                if(p){
                    p.platformGold = p.platformGold - gold;
                    await PlayerAgentRedisDao.updateOne({ platformName }, new playerAgentInRedis(p));
                }else {
                    await PlayerAgentRedisDao.findOne({platformName});
                }
            }
            return isSuccess;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }



}

export default new PlayerAgentMysqlDao();
