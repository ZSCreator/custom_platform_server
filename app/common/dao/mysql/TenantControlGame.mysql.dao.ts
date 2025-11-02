import {AbstractDao} from "../ADao.abstract";
import {TenantControlGame} from "./entity/TenantControlGame.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

interface TenantControlGameDto {
    id?: number;
    tenant?: string;
    nid?: string;
    sceneId?: number;
    probability?: number;
    sceneName?: string;
    createDate?: Date,
    updatedDate?: Date
}

class TenantControlGameMysqlDao extends AbstractDao<TenantControlGame> {
    async findList(parameter:TenantControlGameDto): Promise<TenantControlGame[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(TenantControlGame)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: TenantControlGameDto): Promise<TenantControlGame> {
        try {
            return await ConnectionManager.getConnection()
                .getRepository(TenantControlGame)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: TenantControlGameDto): Promise<any> {
        try {
            const payInfoRepository = ConnectionManager.getConnection()
                .getRepository(TenantControlGame);

            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async updateOne(parameter: TenantControlGameDto, partialEntity: TenantControlGameDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlGame)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: TenantControlGameDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlGame)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    //根据时间查询分页查询
    async findListToLimit(page: number, limit: number): Promise<any> {
        try {
            const [list, count] = await ConnectionManager.getConnection()
                .getRepository(TenantControlGame)
                .createQueryBuilder("TenantControlGame")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("TenantControlGame.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return {list, count};
        } catch (e) {
            return {list: [], count: 0};
        }
    }


}

export default new TenantControlGameMysqlDao();