import {AbstractDao} from "../ADao.abstract";
import {TenantControlTotalBetKill} from "./entity/TenantControlTotalBetKill.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

interface TenantTotalBetKillDto {
    id?: number;
    tenant?: string;
    totalBet?: number;
    createDate?: Date,
    updatedDate?: Date
}

class TenantControlTotalBetKillMysqlDao extends AbstractDao<TenantControlTotalBetKill> {
    async findList(parameter:TenantTotalBetKillDto): Promise<TenantControlTotalBetKill[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(TenantControlTotalBetKill)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: TenantTotalBetKillDto): Promise<TenantControlTotalBetKill> {
        try {
            return await ConnectionManager.getConnection()
                .getRepository(TenantControlTotalBetKill)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: TenantTotalBetKillDto): Promise<any> {
        try {
            const payInfoRepository = ConnectionManager.getConnection()
                .getRepository(TenantControlTotalBetKill);

            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async updateOne(parameter: TenantTotalBetKillDto, partialEntity: TenantTotalBetKillDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlTotalBetKill)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: TenantTotalBetKillDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlTotalBetKill)
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
                .getRepository(TenantControlTotalBetKill)
                .createQueryBuilder("TenantControlTotalBetKill")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("TenantControlTotalBetKill.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return {list, count};
        } catch (e) {
            return {list: [], count: 0};
        }
    }

}

export default new TenantControlTotalBetKillMysqlDao();