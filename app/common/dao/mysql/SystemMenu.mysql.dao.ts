import { AbstractDao } from "../ADao.abstract";
import { SystemMenu } from "./entity/SystemMenu.entity";
import ConnectionManager from "../mysql/lib/connectionManager";

class SystemMenuMysqlDao extends AbstractDao<SystemMenu> {
    async findList(parameter: {id?: number; menuName?: string; sort?: number; menuLevel?: number;    menuNum?: string ; webIndex?: string ; menuCoin?: string ; parentMenuNum?: string; }): Promise<SystemMenu[]> {
        try {
            const list = await ConnectionManager.getConnection()
                .getRepository(SystemMenu)
                .find(parameter);

            return list;
        } catch (e) {
            return [];
        }
    }

    async findOne(parameter: {id?: number; menuName?: string; sort?: number; menuLevel?: number;  menuNum?: string ; webIndex?: string ; menuCoin?: string ; parentMenuNum?: string;}): Promise<SystemMenu> {
        try {
            const systemMenu = await ConnectionManager.getConnection(true)
                .getRepository(SystemMenu)
                .findOne(parameter);

            return systemMenu;
        } catch (e) {
            return null;
        }
    }

    async insertOne(parameter: { id?: number; menuName?: string; sort?: number; menuLevel?: number;  menuNum?: string ; webIndex?: string ; menuCoin?: string ; parentMenuNum?: string; }): Promise<any> {
        try {
            const managerInfoRepository = ConnectionManager.getConnection()
                .getRepository(SystemMenu);

            const p = managerInfoRepository.create(parameter);
            return await managerInfoRepository.save(p);
        } catch (e) {
            return null;
        }
    }

    async updateOne(parameter:{id?: number; menuName?: string; sort?: number; menuLevel?: number;  menuNum?: string ; webIndex?: string ; menuCoin?: string ; parentMenuNum?: string;} , partialEntity :{ id?: number; menuCoin?: string ; menuName?: string; webIndex?: string ; sort?: number; menuLevel?: number;  menuNum?: string ; parentMenuNum?: string;} ): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemMenu)
                .update(parameter, partialEntity);
            return !!affected;
        } catch (e) {
            return false;
        }
    }

    async delete(parameter: {id?: number; menuName?: string; sort?: number; menuLevel?: number; menuCoin?: string ;  menuNum?: string ; webIndex?: string ; parentMenuNum?: string;}): Promise<any> {
        try {
            const { affected } = await ConnectionManager.getConnection()
                .getRepository(SystemMenu)
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
                .getRepository(SystemMenu)
                .createQueryBuilder("SystemMenu")
                .orderBy("SystemMenu.id","DESC")
                .skip((page - 1) * limit)
                .take( limit)
                .getManyAndCount();
            return  {list ,count};
        } catch (e) {
            return false;
        }
    }


    /**
     * 根据角色获取菜单
     * @param roleMenu
     */
    async findListForRole(roleMenu : string [] ,  ): Promise<any> {
        try {
            const list =[];
            roleMenu.forEach(x=>{
                list.push(`"${x}"`)
            });
            let sql = `SELECT * FROM  Sys_SystemMenu WHERE Sys_SystemMenu.menuNum in (${list})`;
            const result = await ConnectionManager.getConnection(true)
                .query(sql);

            return result;
        } catch (e) {
            return false;
        }
    }

}

export default new SystemMenuMysqlDao();