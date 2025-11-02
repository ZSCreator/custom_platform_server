import { Injectable } from '@nestjs/common';
import SystemMenuMysqlDao from '../../../../../../common/dao/mysql/SystemMenu.mysql.dao';
import SystemRoleMysqlDao from '../../../../../../common/dao/mysql/SystemRole.mysql.dao';
import ServerListRedisDao from '../../../../../../common/dao/redis/ServerList.redis.dao';
import ManagerInfoMysqlDao from "../../../../../../common/dao/mysql/ManagerInfo.mysql.dao";
import Utils = require("../../../../../../utils/index");
import { getLogger } from "pinus-logger";
const ManagerErrorLogger = getLogger('http', __filename);


@Injectable()
export class SystemMenuService {
    /**
     * 创建菜单
     * @param money
     * menuName, sort, menuLevel
     */
    async createMenu(menuName: string, sort: number, menuLevel: number , parentMenuNum : string , webIndex : string , menuCoin : string): Promise<any> {
        try {

            if(menuLevel == 1){
                const menu = await SystemMenuMysqlDao.findOne({ sort , menuLevel  });
                if (menu) {
                    return Promise.reject('该菜单排序已经存在，请重新修改排序');
                }
            }

            let menuNum =  Utils.id();
            const info = {
                menuName: menuName,
                menuNum: menuNum,
                sort: sort,
                menuLevel: menuLevel,
                parentMenuNum: parentMenuNum,
                webIndex: webIndex,
                menuCoin: menuCoin,
            }
            await SystemMenuMysqlDao.insertOne(info);
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`创建菜单异常 :${error.stack || error}`);
            return { code: 500, info: '创建菜单异常' };
        }
    }

    /**
     * 获取菜单
     * @param money
     * menuName, sort, menuLevel
     */
    async getSystemMenu(): Promise<any> {
        try {
            const menusList = await SystemMenuMysqlDao.findList({});
            const levelToOneList = menusList.filter(x=>x.menuLevel == 1);
            const list = levelToOneList.map((info) => {
                const levelToTwoList = menusList.filter(x=> x.parentMenuNum == info.menuNum);
                levelToTwoList.sort((a,b)=>a.sort - b.sort);
                return { lastMenuList:levelToTwoList ,...info };
            });
            list.sort((a,b)=>a.sort - b.sort);
            return  list;
        } catch (error) {
            ManagerErrorLogger.error(`创建菜单异常 :${error.stack || error}`);
            return { code: 500, info: '创建菜单异常' };
        }
    }


    /**
     * 修改菜单
     * @param money
     */
    async updateMenu(id : number , menuName: string, sort: number , menuLevel: number , parentMenuNum : string ,webIndex : string , menuCoin : string): Promise<any> {
        try {
            const info = {
                menuName: menuName,
                sort: sort,
                menuLevel: menuLevel,
                webIndex: webIndex,
                menuCoin: menuCoin,
                parentMenuNum: parentMenuNum
            }
            await SystemMenuMysqlDao.updateOne({id : id } ,info );
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`修改菜单异常 :${error.stack || error}`);
            return { code: 500, info: '修改菜单异常' };
        }
    }

    /**
     * 删除菜单
     * @param money
     */
    async deleteSystemMenu(id : number ): Promise<any> {
        try {


            const menu = await SystemMenuMysqlDao.findOne({ id });
            if (!menu) {
                return Promise.reject('该菜单不存在');
            }
            const menusList = await SystemMenuMysqlDao.findList({parentMenuNum : menu.menuNum});
            if(menusList.length > 0){
                return Promise.reject('请将该菜单栏下面的子菜单移除才能删除');
            }
            await SystemMenuMysqlDao.delete({id : id }  );
            return true;
        } catch (error) {
            ManagerErrorLogger.error(`删除菜单异常 :${error.stack || error}`);
            return { code: 500, info: '删除菜单异常' };
        }
    }


    /**
     * 创建角色
     * @param money
     * roleName, sort, roleMenu
     */
    async createSystemRole(roleName : string , sort : number , roleMenu: any , roleLevel : number): Promise<any> {
        try {


            const role = await SystemRoleMysqlDao.findOne({ roleName });
            if (role) {
                return Promise.reject('该角色名已存在');
            }
            const roleLevelForUser = await SystemRoleMysqlDao.findOne({ roleLevel });
            if (roleLevelForUser) {
                return Promise.reject('该角色等级已经存在');
            }
            const info  = {
                roleName : roleName,
                sort : sort ,
                roleLevel : roleLevel ,
                roleMenu : roleMenu,
                role : Utils.id()
            }
            await SystemRoleMysqlDao.insertOne( info );
            return { code: 200, msg: "创建角色成功" };
        } catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }


    /**
     * 获取角色
     * @param money
     * roleName, sort, roleMenu
     */
    async getSystemRole(manager : string): Promise<any> {
        try {
            const user = await ManagerInfoMysqlDao.findOne({userName : manager});
            const role = user.role;
            const rolesList = await SystemRoleMysqlDao.findList({});
            const roleUser = rolesList.find(x=>x.role == role);
            let list = null;
            if(roleUser.roleLevel <= 2){
                 list = rolesList.filter(x=>x.roleLevel >= roleUser.roleLevel)
            }else {
                list = rolesList.filter(x=>x.roleLevel > roleUser.roleLevel)
            }
            list.sort((a,b)=> a.sort - b.sort);
            return list;
        } catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }

    /**
     * 获取角色菜单
     * @param money
     * roleName, sort, roleMenu
     */
    async getSystemRoleForMenu(role : string): Promise<any> {
        try {

            const roleUser = await SystemRoleMysqlDao.findOne({role});
            if(!roleUser){
                return Promise.reject('该角色不存在');
            }
            let roleMenu = roleUser.roleMenu;
            const menusList = await SystemMenuMysqlDao.findList({});
            const levelToOneList = menusList.filter(x=>x.menuLevel == 1);
            const list = levelToOneList.map((info) => {
                const levelToTwoList = menusList.filter(x=> x.parentMenuNum == info.menuNum);
                levelToTwoList.sort((a,b)=>a.sort - b.sort);
                return { lastMenuList:levelToTwoList ,...info };
            });
            //一个是所有的菜单信息，一个是角色拥有的菜单
            return { list, roleMenu } ;
        } catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }

    /**
     * 获取角色菜单
     * @param money
     * roleName, sort, roleMenu
     */
    async getLoginSystemRoleForMenu(role : string): Promise<any> {
        try {

            const roleUser = await SystemRoleMysqlDao.findOne({role});
            if(!roleUser){
                return Promise.reject('该角色不存在');
            }
            let roleMenu = roleUser.roleMenu;
            const menusList = await SystemMenuMysqlDao.findListForRole(roleMenu);
            const levelToOneList = menusList.filter(x=>x.menuLevel == 1);
            const list = levelToOneList.map((info) => {
                const levelToTwoList = menusList.filter(x=> x.parentMenuNum == info.menuNum);
                levelToTwoList.sort((a,b)=>a.sort - b.sort);
                return { lastMenuList:levelToTwoList ,...info };
            });
            //一个是所有的菜单信息，一个是角色拥有的菜单
            return list ;
        } catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }

    /**
     * 修改角色
     * @param money
     * roleName, sort, roleMenu
     */
    async updateSystemRole(id : number , roleName : string , sort : number , roleMenu: any ,roleLevel : number): Promise<any> {
        try {

            const role = await SystemRoleMysqlDao.findOne({ id });
            if (!role) {
                return Promise.reject('该角色不存在');
            }
            const info  = {
                roleName : roleName,
                sort : sort ,
                roleLevel : roleLevel,
                roleMenu : roleMenu,
            }
            await SystemRoleMysqlDao.updateOne( {id}, info );
            return { code: 200, msg: "修改角色成功" };
        } catch (error) {
            ManagerErrorLogger.error(`修改角色异常 :${error.stack || error}`);
            return { code: 500, info: '修改角色异常' };
        }
    }


    /**
     * 删除角色
     * @param money
     * roleName, sort, roleMenu
     */
    async deleteSystemRole(id : number  ): Promise<any> {
        try {

            const role = await SystemRoleMysqlDao.findOne({ id });
            if (!role) {
                return Promise.reject('该角色不存在');
            }

            await SystemRoleMysqlDao.delete( {id} );
            return { code: 200, msg: "删除角色成功" };
        } catch (error) {
            ManagerErrorLogger.error(`删除角色异常 :${error.stack || error}`);
            return { code: 500, info: '删除角色异常' };
        }
    }

    /**
     * 创建后台服务器列表
     * @param money
     * roleName, sort, roleMenu
     */
    async createManagerServersList(serverName : string  , serverHttp : string ): Promise<any> {
        try {
            await ServerListRedisDao.insertOne({serverName,serverHttp})
            return { code: 200, msg: "创建后台服务器列表成功" };
        } catch (error) {
            ManagerErrorLogger.error(`创建后台服务器列表异常 :${error.stack || error}`);
            return { code: 500, info: '创建后台服务器列表异常' };
        }
    }

    /**
     * 获取后台服务器列表
     * @param money
     * roleName, sort, roleMenu
     */
    async getManagerServersList(): Promise<any> {
        try {
            await ServerListRedisDao.findList({})
            return { code: 200, msg: "创建后台服务器列表成功" };
        } catch (error) {
            ManagerErrorLogger.error(`删除角色异常 :${error.stack || error}`);
            return { code: 500, info: '删除角色异常' };
        }
    }

    /**
     * 更新后台服务器列表
     * @param money
     * roleName, sort, roleMenu
     */
    async updateManagerServersList(serverName : string  , serverHttp : string ): Promise<any> {
        try {
            await ServerListRedisDao.updateOne({serverName},{serverName,serverHttp});
            return { code: 200, msg: "更新后台服务器列表" };
        } catch (error) {
            ManagerErrorLogger.error(`更新后台服务器列表异常 :${error.stack || error}`);
            return { code: 500, info: '更新后台服务器列表异常' };
        }
    }

    /**
     * 删除后台服务器列表
     * @param money
     * roleName, sort, roleMenu
     */
    async deleteManagerServersList(serverName : string   ): Promise<any> {
        try {
            await ServerListRedisDao.delete({serverName});
            return { code: 200, msg: "删除后台服务器列表" };
        } catch (error) {
            ManagerErrorLogger.error(`删除后台服务器列表异常 :${error.stack || error}`);
            return { code: 500, info: '删除后台服务器列表异常' };
        }
    }




    /**
     * 设置后台所有的请求路由和角色的路由
     */
    async setManagerRoute(id : number ,routeList : string []): Promise<any> {
        try {
            const role = await SystemRoleMysqlDao.findOne({ id });
            if(!role){
                return Promise.reject('该角色不存在');
            }
            await SystemRoleMysqlDao.updateOne({id}, {roleRoute : routeList })
            return true ;
        } catch (error) {
            ManagerErrorLogger.error(`设置后台所有的请求路由和角色的路由 :${error.stack || error}`);
            return { code: 500, info: '设置后台所有的请求路由和角色的路由' };
        }
    }
}

