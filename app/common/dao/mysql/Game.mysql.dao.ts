import { pinus } from "pinus";
import { AbstractDao } from "../ADao.abstract";
import { Game } from "./entity/Game.entity";
import { RDSClient } from "./lib/RDSClient";
import ConnectionManager from "../mysql/lib/connectionManager";

class GameMysqlDao extends AbstractDao<Game>{
    async findList(parameter: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<Game[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Game)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<Game> {
        try {
            const game = await ConnectionManager.getConnection()
                .getRepository(Game)
                .findOne(parameter);

            return game;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }, partialEntity: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Game)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<any> {
        let reconnected = false;
        try {
            const gameRepository = ConnectionManager.getConnection()
                .getRepository(Game);

            const p = gameRepository.create(parameter);

            return await gameRepository.save(p);
        } catch (e) {
            if (e.name === "Connection is not established with mysql database" && !reconnected) {
                console.warn(`插入游戏配置信息出错:${e.stack}`);
                console.warn(`插入游戏配置信息出错: 补丁 若是未有连接|动态启动|清档重启等等，则重新创建连接`);
                await RDSClient.init(pinus.app.getServerId());
                reconnected = true;
                await this.insertOne(parameter);
            } else {
                console.error(`插入游戏配置信息出错:${e.stack}`);
            }
            return null;
        }
    }

    async delete(parameter: { id?: number; nid?: string; name?: string; zname?: string; opened?: boolean; whetherToShowGamingInfo?: boolean; whetherToShowScene?: boolean; whetherToShowRoom?: boolean; roomCount?: number; roomUserLimit?: number; sort?: number; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Game)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

}

export default new GameMysqlDao();