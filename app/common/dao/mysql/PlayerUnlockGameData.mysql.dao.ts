import { AbstractDao } from "../ADao.abstract";
import ConnectionManager from "../mysql/lib/connectionManager";
import { PlayerUnlockGameData } from "./entity/PlayerUnlockGameData.entity";

type playerUnlockGameParams = {
    id?: number;
    uid?: string;
    unlockGames?: string;
    createTime?: Date;
};

export class PlayerUnlockGameDataMysqlDao extends AbstractDao<PlayerUnlockGameData>{
    async findList(parameter: playerUnlockGameParams): Promise<PlayerUnlockGameData[]> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(PlayerUnlockGameData)
                .find(parameter);
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: playerUnlockGameParams): Promise<PlayerUnlockGameData> {
        try {
            return ConnectionManager.getConnection()
                .getRepository(PlayerUnlockGameData)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: playerUnlockGameParams): Promise<any> {
        try {
            const playerUnlockRepository = ConnectionManager.getConnection()
                .getRepository(PlayerUnlockGameData);

            const p = playerUnlockRepository.create(parameter);
            return await playerUnlockRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async delete(parameter: playerUnlockGameParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerUnlockGameData)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async updateOne(parameter: playerUnlockGameParams, partialEntity: playerUnlockGameParams): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(PlayerUnlockGameData)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            console.error(e.stack);
            return false;
        }
    }
}

export default new PlayerUnlockGameDataMysqlDao();
