import { DB3 } from "../../constant/RedisDict";
import { AbstractDao } from "../ADao.abstract";
import { RedisDB } from "./config/DBCfg.enum";
import { Game } from "../mysql/entity/Game.entity";
import GameMysqlDao from "../mysql/Game.mysql.dao";
import redisManager from "./lib/BaseRedisManager";
import { IBaseRedisDao } from "./interface.ts/IBaseRedisDao.interface";

export class GameRedisDao extends IBaseRedisDao implements AbstractDao<Game> {

    async exits(nid: string): Promise<boolean> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            return !!await conn.hexists(DB3.game, nid);
        } catch (e) {
            return false;
        }
    }

    async count() {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            return await conn.hlen(DB3.game);
        } catch (e) {
            return 0;
        }
    }

    async findList(parameter: {}): Promise<Game[]> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const list = await conn.hvals(DB3.game);

            return list.reduce((res, str) => {
                res.push(JSON.parse(str));
                return res;
            }, []);
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {  nid? : string;  }): Promise<Game> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hget(DB3.game, parameter.nid);

            return !!game ? JSON.parse(game) : null;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: { nid? : string; }, partialEntity: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            // const game = await conn.hset(DB3.game, parameter.nid, JSON.stringify(partialEntity));
            const game = await conn.hget(DB3.game, parameter.nid);
            if (game) {
                await conn.hset(DB3.game, parameter.nid, JSON.stringify(Object.assign(JSON.parse(game), partialEntity)));
            } else {
                const gameOne = await GameMysqlDao.findOne({ nid: parameter.nid });
                if (gameOne) {
                    await conn.hset(DB3.game, parameter.nid, JSON.stringify(Object.assign(gameOne, partialEntity)));
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<any> {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hset(DB3.game, parameter.nid, JSON.stringify(parameter));

            return !!game;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: { nid?: string; }) {
        const conn = await redisManager.getConnection(RedisDB.SysData);
        try {
            const game = await conn.hdel(DB3.game, parameter.nid);

            return true;
        } catch (e) {
            return false;
        }
    }

}

export default new GameRedisDao();