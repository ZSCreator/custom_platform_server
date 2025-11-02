import {AbstractDao} from "../ADao.abstract";
import {TenantControlBetKill} from "./entity/TenantControlBetKill.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

interface TenantBetKillDto {
    id?: number;
    tenant?: string;
    bet?: number;
    createDate?: Date,
    updatedDate?: Date
}

class TenantControlBetKillMysqlDao extends AbstractDao<TenantControlBetKill> {
    async findList(parameter:TenantBetKillDto): Promise<TenantControlBetKill[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(TenantControlBetKill)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: TenantBetKillDto): Promise<TenantControlBetKill> {
        try {
            return await ConnectionManager.getConnection()
                .getRepository(TenantControlBetKill)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: TenantBetKillDto): Promise<any> {
        try {
            const payInfoRepository = ConnectionManager.getConnection()
                .getRepository(TenantControlBetKill);

            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async updateOne(parameter: TenantBetKillDto, partialEntity: TenantBetKillDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlBetKill)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: TenantBetKillDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlBetKill)
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
                .getRepository(TenantControlBetKill)
                .createQueryBuilder("TenantControlBetKill")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("TenantControlBetKill.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return {list, count};
        } catch (e) {
            return {list: [], count: 0};
        }
    }

}

export default new TenantControlBetKillMysqlDao();