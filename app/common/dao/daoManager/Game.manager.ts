import { Game } from "../mysql/entity/Game.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import GameMysqlDao from "../mysql/Game.mysql.dao";
import GameRedisDao from "../redis/Game.redis.dao";

type Parameter<T> = { [P in keyof T]?: T[P] };

export class GameManager {

    async findList(params: Parameter<Game>, onlyMysql = false) {
        try {
            let list = [];
            if (onlyMysql) {
                list = await GameMysqlDao.findList(params);
            } else {
                list = await GameRedisDao.findList(params);
            }

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(params: Parameter<Game>, onlyMysql = false) {
        try {

            if (!onlyMysql) {
                const game = await GameRedisDao.findOne(params);

                if (game) {
                    return game;
                }

                const gameInMysql = await GameMysqlDao.findOne(params);

                if (gameInMysql) {
                    await GameRedisDao.insertOne(gameInMysql)
                }

                return gameInMysql;
            }

            const game = await GameMysqlDao.findOne(params);
            if(game){
                await GameRedisDao.insertOne(game)
            }
            return game;
        } catch (e) {
            return null;
        }
    }

    async insertOne(params: Parameter<Game>) {

        try {
            const [, game] = await Promise.all([
                GameRedisDao.insertOne(params),
                GameMysqlDao.insertOne(params)
            ]);

            return game;
        } catch (e) {
            return null;
        }
    }

    async updateOne(params: Parameter<Game>, partialEntity: Parameter<Game>) {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Game)
                .update(params, partialEntity);

            const isSuccess = !!affected;

            if (isSuccess) {
                await GameRedisDao.updateOne(params, partialEntity);
            }

            return isSuccess;
        } catch (e) {
            return false;
        }
    }
    async delete(params: { nid: string; }) {
        await GameMysqlDao.delete(params);
        await GameRedisDao.delete(params);
    }
}

export default new GameManager();