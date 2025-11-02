import ShopGoldMysqlDao from "../mysql/ShopGold.mysql.dao";
import ShopGoldRedisDao from "../redis/ShopGold.redis.dao";
import {ShopGold} from "../mysql/entity/ShopGold.entity";
import {ShopGoldInRedis} from "../redis/entity/ShopGold.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

type Parameter<T> = { [P in keyof T]?: T[P] };
export class ShopGoldManager  {

    async findList(parameter: Parameter<ShopGold>): Promise<any> {
        try {
            /**先从redis 里面找,如果redis里面没有就从数据库找然后存入redis */
            let list = await ShopGoldRedisDao.findList(parameter);
            if(list.length == 0){
                list = await ShopGoldMysqlDao.findList(parameter);
                if(list.length > 0){
                    for(let gameType of list){
                        await ShopGoldRedisDao.insertOne(gameType);
                    }
                }
            }
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: Parameter<ShopGold>): Promise< any > {
        try {
            // Step 1: 是否只读 Mysql 数据库;
                let ShopGold = await ShopGoldRedisDao.findOne(parameter);
                if (ShopGold) {
                    return ShopGold;
                }
                if(!ShopGold){
                    const ShopGold = await ShopGoldMysqlDao.findOne(parameter);
                    /** Mysql 有数据则更新进redis，无则返回 */
                    if (ShopGold) {
                         await ShopGoldRedisDao.insertOne(new ShopGoldInRedis(ShopGold));
                         return ShopGold;
                    }else {
                        return  null;
                    }
                }

        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: Parameter<ShopGold>): Promise<any> {
        try {
            // 将数组存储成字符串
            await ShopGoldMysqlDao.insertOne(parameter);
            return await ShopGoldRedisDao.insertOne(new ShopGoldInRedis(parameter));
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: Parameter<ShopGold>, partialEntity: Parameter<ShopGold>): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ShopGold)
                .update(parameter, partialEntity);
            const isSuccess = !!affected;
            if (isSuccess) {
                await ShopGoldRedisDao.updateOne(parameter, new ShopGoldInRedis(partialEntity));
            }
            return isSuccess;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: Parameter<ShopGold>): Promise<any> {
        try {
            const { affected } = await ShopGoldMysqlDao.delete(parameter);
            await ShopGoldRedisDao.delete(parameter);
            const isSuccess = !!affected;
            if (isSuccess) {
                await ShopGoldRedisDao.delete(parameter);
            }
            return isSuccess;
        } catch (e) {
            return false;
        }
    }



}

export default new ShopGoldManager();
