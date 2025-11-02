import {AbstractDao} from "../ADao.abstract";
import {TenantControlAwardKill} from "./entity/TenantControlAwardKill.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

interface TenantControlAwardKillDto {
    id?: number;
    tenant?: string;
    returnAwardRate?: number;
    createDate?: Date,
    updatedDate?: Date
}

class TenantControlAwardKillMysqlDao extends AbstractDao<TenantControlAwardKill> {
    async findList(parameter:TenantControlAwardKillDto): Promise<TenantControlAwardKill[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(TenantControlAwardKill)
                .find(parameter);
            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: TenantControlAwardKillDto): Promise<TenantControlAwardKill> {
        try {
            return await ConnectionManager.getConnection()
                .getRepository(TenantControlAwardKill)
                .findOne(parameter);
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: TenantControlAwardKillDto): Promise<any> {
        try {
            const payInfoRepository = ConnectionManager.getConnection()
                .getRepository(TenantControlAwardKill);

            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async updateOne(parameter: TenantControlAwardKillDto, partialEntity: TenantControlAwardKillDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlAwardKill)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: TenantControlAwardKillDto): Promise<any> {
        try {
            const {affected} = await ConnectionManager.getConnection()
                .getRepository(TenantControlAwardKill)
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
                .getRepository(TenantControlAwardKill)
                .createQueryBuilder("TenantControlAwardKill")
                // .where("alarmEventThing.createTime BETWEEN :start AND :end",{start: startTime , end: endTime})
                .orderBy("TenantControlAwardKill.id", "DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return {list, count};
        } catch (e) {
            return false;
        }
    }

}

export default new TenantControlAwardKillMysqlDao();