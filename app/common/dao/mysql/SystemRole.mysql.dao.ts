import { AbstractDao } from "../ADao.abstract";
import { SystemRole } from "./entity/SystemRole.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class SystemRoleMysqlDao extends AbstractDao<SystemRole> {
    async findList(parameter: {id?: number; roleName?: string; sort?: number; roleLevel?: number; role?: string; roleMenu?: any; roleRoute?: any;  }): Promise<SystemRole[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(SystemRole)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; roleName?: string; sort?: number;  roleLevel?: number;  role?: string; roleMenu?: any;roleRoute?: any;  }): Promise<SystemRole> {
        try {
            const systemRole = await ConnectionManager.getConnection(true)
                .getRepository(SystemRole)
                .findOne(parameter);

            return systemRole;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: {id?: number; roleName?: string; sort?: number;  roleLevel?: number;  role?: string; roleMenu?: any; roleRoute?: any;  }): Promise<any> {
        try {
            const managerInfoRepository = ConnectionManager.getConnection()
                .getRepository(SystemRole);

            const p = managerInfoRepository.create(parameter);
            return await managerInfoRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; roleName?: string; sort?: number;  roleLevel?: number;  role?: string; roleMenu?: any;roleRoute?: any;  } , partialEntity :{ id?: number; roleName?: string;  roleLevel?: number;  role?: string; sort?: number; roleMenu?: any; roleRoute?: any; } ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemRole)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; roleName?: string; sort?: number; role?: string; roleMenu?: any; roleRoute?: any; }): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemRole)
                .delete(parameter);
            return !!affected;
        } catch (e) {
            return false;
        }
    }


    //根据时间查询分页查询  倒序
    async findListToLimitNoTime(page : number , limit : number  ): Promise<any> {
        try {
            const [list ,count] = await ConnectionManager.getConnection(true)
                .getRepository(SystemRole)
                .createQueryBuilder("SystemRole")
                .where("SystemRole.roleLevel > ")
                .orderBy("SystemRole.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }

}

export default new SystemRoleMysqlDao();