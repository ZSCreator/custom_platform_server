import { AbstractDao } from "../ADao.abstract";
import ConnectionManager from "../mysql/lib/connectionManager";
import { Room } from "./entity/Room.entity";

interface RoomMysqlDTO {
    id?: number;
    serverId?: string;
    nid?: string;
    sceneId?: number;
    roomId?: string;
    jackpot?: number;
    runningPool?: number;
    profitPool?: number;
    open?: boolean;
    jackpotShow?: any;
    betUpperLimit?: any;
    createTime?: Date;
    updateTime?: Date;
    kind?: number;
}

export class RoomMysqlDao extends AbstractDao<Room> {
    async findList(parameter: RoomMysqlDTO): Promise<Room[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(Room)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: RoomMysqlDTO): Promise<Room> {
        try {
            const room = await ConnectionManager.getConnection()
                .getRepository(Room)
                .findOne(parameter);

            return room;
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter: RoomMysqlDTO, partialEntity: RoomMysqlDTO): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Room)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async insertOne(parameter: RoomMysqlDTO): Promise<any> {
        try {
            const gameRepository = ConnectionManager.getConnection()
                .getRepository(Room);

            const p = gameRepository.create(parameter);

            return await gameRepository.save(p);
        } catch (e) {
            console.error(`插入房间信息出错:${e.stack}`);
            return null;
        }
    }
    async delete(parameter: { serverId: string; roomId: string; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(Room)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

}

export default new RoomMysqlDao();
