import {AbstractDao} from "../ADao.abstract";
import {PlatformControlStateEntity} from "./entity/PlatformControlState.entity";
import ConnectionManager from "../mysql/lib/connectionManager";
import {PlatformControlType} from "../../../services/newControl/constants";
import {cDate} from "../../../utils";
type Parameter<T> = { [P in keyof T]?: T[P] };

class PlatformControlStateMysqlDao extends  AbstractDao<PlatformControlStateEntity> {
    async insertOne(parameter) {
        const repository = ConnectionManager.getConnection().getRepository(PlatformControlStateEntity);
        const p = repository.create(parameter);
        return await repository.save(p);
    }

    /**
     * 更新一个
     * @param param
     * @param updateParam
     */
    async updateOne(param: {platformId: string, type: PlatformControlType, nid?: string}, updateParam: Parameter<PlatformControlStateEntity>) {
        return ConnectionManager.getConnection()
            .getRepository(PlatformControlStateEntity)
            .update(param, updateParam);
    }

    /**
     * 删除
     * @param params
     */
    async delete(params: {platformId: string, type: PlatformControlType, nid?: string}) {
        return ConnectionManager.getConnection()
            .getRepository(PlatformControlStateEntity)
            .delete(params);
    }

    /**
     * 查找一个
     * @param params
     */
    async findOne(params: {platformId: string, type: PlatformControlType, tenantId?: string, nid?: string}) {
        return ConnectionManager.getConnection()
            .getRepository(PlatformControlStateEntity)
            .findOne(params);
    }

    /**
     * 根据nidList获取杀率
     * @param where
     */
    async findManyByNidList(where: {platformId: string, tenantId: string, type: PlatformControlType, nidList: string[]}) {
        let list = [];
        where.nidList.forEach(x => {
            list.push(`"${x}"`)
        });

        const sql = `SELECT *
            FROM Sp_PlatformControlState as P 
            WHERE P.platformId="${where.platformId}"
              AND P.tenantId="${where.tenantId}"
              AND P.state_type="${where.type}"
              AND P.nid in (${list})`;

        return ConnectionManager.getConnection(true).query(sql);
    }


    async findList() {
        return [];
    }





}

export default new PlatformControlStateMysqlDao();