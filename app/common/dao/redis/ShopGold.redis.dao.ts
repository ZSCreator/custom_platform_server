import { DB3 } from "../../constant/RedisDict";
import { RedisDB } from "./config/DBCfg.enum";
import { ShopGoldInRedis } from "./entity/ShopGold.entity";
import redisManager from "./lib/BaseRedisManager";
import { AbstractDao } from "../ADao.abstract";

export class ShopGoldRedisDao implements AbstractDao<ShopGoldInRedis>{
    /**
     * 获取商城的商品数据
     * @returns {Array<IOnlineGameHash>}
     * @description  shopGold
     */
    async findList(parameter: { id?: number; name?: string; sort?: number; isOpen?: boolean; gold?: number; dese?: string; price?: number; createDate?: Date }): Promise<ShopGoldInRedis[]> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const data = await conn.hgetall(`${DB3.shopGold}`);
            let list = [];
            for (let key in data) {
                list.push(JSON.parse(data[key]));
            }
            return list;
        } catch (e) {
            console.error(`Redis | DB3 | 获取所有真实玩家信息出错: ${e.stack}`);
            return [];
        }
    }
    /**
     * 获取一个商城的商品数据
     * @param {string} uid
     * @returns
     */
    async findOne(parameter: { id?: number; name?: string; sort?: number; isOpen?: boolean; gold?: number; dese?: string; price?: number; createDate?: Date }): Promise<ShopGoldInRedis> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            if (parameter.id) {
                return null;
            }
            const DayLoginPLayerWithStr = await conn.hget(`${DB3.shopGold}`, parameter.id.toString());
            return !!DayLoginPLayerWithStr ? JSON.parse(DayLoginPLayerWithStr) : null;
        } catch (e) {
            console.error(`Redis | DB3 | 获取一个真实在线玩家信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 更新获取一个商城的商品数据
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @returns {boolean}
     * @description  shopGold
     */
    async updateOne(parameter: { id?: number; name?: string; sort?: number; isOpen?: boolean; gold?: number; dese?: string; price?: number; createDate?: Date }, partialEntity: { id?: number; name?: string; sort?: number; isOpen?: boolean; gold?: number; dese?: string; price?: number; createDate?: Date }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            if (parameter.id.toString()) {
                return null;
            }
            await conn.hset(DB3.shopGold, parameter.id.toString(), JSON.stringify(partialEntity));
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 更新玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 新增商城的商品数据
     * @param {string}          uid    玩家编号
     * @param {IOnlineGameHash} data   保存信息
     * @description hall:shopGold
     */
    async insertOne(parameter: { id?: number; name?: string; sort?: number; isOpen?: boolean; gold?: number; dese?: string; price?: number; createDate?: Date }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            if (parameter.id.toString()) {
                return null;
            }
            await conn.set(DB3.shopGold, parameter.id.toString(), JSON.stringify(parameter));
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 新增玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除商城的商品数据
     * @returns {boolean}
     * @description Sys:shopGold
     */
    async delete(parameter: {}): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            await conn.del(DB3.shopGold,);
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 删除玩家当日登陆信息: ${e.stack}`);
            return null;
        }
    }
    /**
     * 删除单个商城的商品数据
     * @returns {boolean}
     * @description Sys:shopGold
     */
    async deleteOne(parameter: { id?: number; name?: string; sort?: number; isOpen?: boolean; gold?: number; dese?: string; price?: number; createDate?: Date }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            if (!parameter.id) {
                return null;
            }
            await conn.hdel(DB3.shopGold, parameter.id.toString());
            return 1;
        } catch (e) {
            console.error(`Redis | DB3 | 删除单个商城的商品数据: ${e.stack}`);
            return null;
        }
    }

}

export default new ShopGoldRedisDao();