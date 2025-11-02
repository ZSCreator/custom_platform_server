import { AbstractDao } from "../ADao.abstract";
import { SystemGameType } from "./entity/SystemGameType.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class SystemGameTypeMysqlDao extends AbstractDao<SystemGameType> {
    async findList(parameter: {id?: number; typeId?: number; sort?: number; name?: string;  open?: boolean; nidList?: string;hotNidList?: string;}): Promise<SystemGameType[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(SystemGameType)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; typeId?: number; sort?: number; name?: string;  open?: boolean; nidList?: string;hotNidList?: string;}): Promise<SystemGameType> {
        try {
            const systemGameType = await ConnectionManager.getConnection()
                .getRepository(SystemGameType)
                .findOne(parameter);

            return systemGameType;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; typeId?: number; sort?: number; name?: string;  open?: boolean; nidList?: string;hotNidList?: string; }): Promise<any> {
        try {
            const systemGameTypeRepository = ConnectionManager.getConnection()
                .getRepository(SystemGameType);

            const p = systemGameTypeRepository.create(parameter);
            return await systemGameTypeRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; typeId?: number; sort?: number; name?: string;  open?: boolean; nidList?: string;hotNidList?: string;} , partialEntity :{ id?: number; typeId?: number; sort?: number; name?: string;  open?: boolean; nidList?: string;hotNidList?: string;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemGameType)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemGameType)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

}

export default new SystemGameTypeMysqlDao();