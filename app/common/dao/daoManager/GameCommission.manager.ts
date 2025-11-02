import GameCommissionMysqlDao from "../mysql/GameCommission.mysql.dao";
import GameCommissionRedisDao from "../redis/GameCommission.redis.dao";
import {GameCommission} from "../mysql/entity/GameCommission.entity";
import {GameCommissionInRedis} from "../redis/entity/GameCommission.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type Parameter<T> = { [P in keyof T]?: T[P] };
export class GameCommissionManager  {

    async findList(parameter: Parameter<GameCommission>): Promise<any> {
        try {
            /**直接从数据库里面找 */
            let list = await GameCommissionMysqlDao.findList(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<GameCommission>): Promise< any > {
        try {
            // Step 1: 是否只读 Mysql 数据库;
                let gameCommissionInfo = await GameCommissionRedisDao.findOne(parameter);
                if (gameCommissionInfo) {
                    return gameCommissionInfo;
                }
                if(!gameCommissionInfo){
                    const gameCommissionOnMysql = await GameCommissionMysqlDao.findOne(parameter);
                    /** Mysql 有数据则更新进redis，无则返回 */
                    if (gameCommissionOnMysql) {
                        const sec = await GameCommissionRedisDao.insertOne(new GameCommissionInRedis(gameCommissionOnMysql));
                    }
                    return gameCommissionOnMysql;
                }else{
                    return null;
                }
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<GameCommission>): Promise<any> {
        try {
            // 将数组存储成字符串
            await GameCommissionMysqlDao.insertOne(parameter);
            await GameCommissionRedisDao.insertOne(new GameCommissionInRedis(parameter));
            return true;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: {nid? : string}, partialEntity: Parameter<GameCommission>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(GameCommission)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await GameCommissionRedisDao.updateOne(parameter, new GameCommissionInRedis(partialEntity));
            }
            return isSuccess;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {nid? : string} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(GameCommission)
                .delete(parameter);
            const isSuccess = !!affected;
            if (isSuccess) {
                await GameCommissionRedisDao.delete(parameter);
            }
            return true;
        } catch (e) {
            return false;
        }
    }


    async deleteAllInRedis(parameter: {nid? : string} ): Promise<any> {
        try {
            await GameCommissionRedisDao.deleteAll(parameter);
            return true;
        } catch (e) {
            return false;
        }
    }


}

export default new GameCommissionManager();
