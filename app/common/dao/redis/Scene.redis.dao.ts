import { AbstractDao } from "../ADao.abstract";
import { DB3 } from "../../constant/RedisDict";
import { Scene } from "../mysql/entity/Scene.entity";
import redisManager from "./lib/BaseRedisManager";
import { RedisDB } from "./config/DBCfg.enum";

export class SceneRedisDao implements AbstractDao<Scene>{
    async findList(parameter: { id?: number; nid?: string; sceneName?: string; sceneId?: number; ante?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any; }): Promise<Scene[]> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const list = await conn.hgetall(`${DB3.scene}:${parameter.nid}`);

            if(list.length == 0){
                return [];
            }
            const dataList = [];
            for (let key in list) {
                dataList.push(JSON.parse(list[key]));
            }
            return dataList ? dataList : [];
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; nid?: string; sceneName?: string; ante?: number; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any; }): Promise<Scene> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hget(`${DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`);

            return !!game ? JSON.parse(game) : null;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: { id?: number; nid?: string; sceneName?: string; ante?: number; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any; }, partialEntity: { id?: number; ante?: number; nid?: string; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hset(`${DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`, JSON.stringify(partialEntity));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: { id?: number;  nid?: string; ante?: number; sceneName?: string; sceneId?: number; name?: string; entryCond?: number; lowBet?: number; capBet?: number; allinMaxNum?: number; room_count?: number; canCarryGold?: any; blindBet?: any; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hset(`${DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`, JSON.stringify(parameter));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { nid: string; sceneId: number }) {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            await conn.hdel(`${DB3.scene}:${parameter.nid}`, `${parameter.sceneId}`);

            return true;
        } catch (e) {
            return false;
        }
    }

}

export default new SceneRedisDao();
