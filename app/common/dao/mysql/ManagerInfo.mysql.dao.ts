import { AbstractDao } from "../ADao.abstract";
import { ManagerInfo } from "./entity/ManagerInfo.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class ManagerInfoMysqlDao extends AbstractDao<ManagerInfo> {
    async findList(parameter: {id?: number; userName?: string; passWord?: string;token?: string; managerId?: string; platformUid?: string;  remark?: string; agent?: string; rootAgent?: string; parentAgent?: string; role?: string;ip?: any;}): Promise<ManagerInfo[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(ManagerInfo)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; userName?: string; passWord?: string;token?: string; managerId?: string; platformUid?: string;  remark?: string; agent?: string;role?: string;ip?: any; rootAgent?: string; parentAgent?: string;}): Promise<ManagerInfo> {
        try {
            const managerInfo = await ConnectionManager.getConnection()
                .getRepository(ManagerInfo)
                .findOne(parameter);

            return managerInfo;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; userName?: string; passWord?: string; token?: string; managerId?: string;  platformUid?: string; remark?: string; agent?: string;role?: string;ip?: any; rootAgent?: string; parentAgent?: string; }): Promise<any> {
        try {
            const managerInfoRepository = ConnectionManager.getConnection()
                .getRepository(ManagerInfo);

            const p = managerInfoRepository.create(parameter);
            return await managerInfoRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; userName?: string; passWord?: string; token?: string; managerId?: string; platformUid?: string;  remark?: string; agent?: string;role?: string;ip?: any; rootAgent?: string; parentAgent?: string;} , partialEntity :{ id?: number; userName?: string; passWord?: string; token?: string; platformUid?: string; managerId?: string;  remark?: string; agent?: string;role?: string;ip?: any; rootAgent?: string; parentAgent?: string;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ManagerInfo)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; userName?: string; passWord?: string; token?: string; managerId?: string;  platformUid?: string; remark?: string; agent?: string;role?: string;ip?: any; rootAgent?: string; parentAgent?: string;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(ManagerInfo)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            console.warn(e)
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    async findListToLimitNoTime(page : number , limit : number  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ManagerInfo)
                .createQueryBuilder("ManagerInfo")
                .orderBy("ManagerInfo.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    async findForWhere(userName : string): Promise<any> {
        try {
            const [list ,count]  = await ConnectionManager.getConnection(true)
                .getRepository(ManagerInfo)
                .createQueryBuilder("ManagerInfo")
                .where("ManagerInfo.userName = :userName", { userName: userName })
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    async findListForPlatform(page : number , limit : number ,agent : string ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(ManagerInfo)
                .createQueryBuilder("ManagerInfo")
                .where("ManagerInfo.rootAgent = :rootAgent", { rootAgent: agent })
                .orderBy("ManagerInfo.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }




}

export default new ManagerInfoMysqlDao();