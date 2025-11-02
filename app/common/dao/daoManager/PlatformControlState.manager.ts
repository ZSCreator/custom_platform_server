import {PlatformControlStateEntity} from "../mysql/entity/PlatformControlState.entity";
import PlatformControlStateMysqlDao from '../mysql/PlatformControlState.mysql.dao';
import {PlatformControlType} from "../../../services/newControl/constants";

type Parameter<T> = { [P in keyof T]?: T[P] };
type PlatformInfo = {platformId: string, type: PlatformControlType, tenantId?: string, nid?: string}

class PlatformControlStateManager {
    async createOne(parameter: Parameter<PlatformControlStateEntity>) {
        return PlatformControlStateMysqlDao.insertOne(parameter);
    }

    async findOne(params: PlatformInfo) {
        return PlatformControlStateMysqlDao.findOne(params);
    }

    async updateOne(params: PlatformInfo, updateParam: Parameter<PlatformControlStateEntity>) {
        return PlatformControlStateMysqlDao.updateOne(params, updateParam);
    }

    /**
     * 根据nidList获取杀率
     * @param where
     */
    async findManyByNidList(where: {platformId: string, tenantId: string, type: PlatformControlType, nidList: string[]}) {
        return PlatformControlStateMysqlDao.findManyByNidList(where);
    }

    /**
     * 删除
     * @param params
     */
    async delete(params: PlatformInfo) {
        return PlatformControlStateMysqlDao.delete(params);
    }
}

export default new PlatformControlStateManager();