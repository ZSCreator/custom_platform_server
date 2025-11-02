"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMenuService = void 0;
const common_1 = require("@nestjs/common");
const SystemMenu_mysql_dao_1 = require("../../../../../../common/dao/mysql/SystemMenu.mysql.dao");
const SystemRole_mysql_dao_1 = require("../../../../../../common/dao/mysql/SystemRole.mysql.dao");
const ServerList_redis_dao_1 = require("../../../../../../common/dao/redis/ServerList.redis.dao");
const ManagerInfo_mysql_dao_1 = require("../../../../../../common/dao/mysql/ManagerInfo.mysql.dao");
const Utils = require("../../../../../../utils/index");
const pinus_logger_1 = require("pinus-logger");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
let SystemMenuService = class SystemMenuService {
    async createMenu(menuName, sort, menuLevel, parentMenuNum, webIndex, menuCoin) {
        try {
            if (menuLevel == 1) {
                const menu = await SystemMenu_mysql_dao_1.default.findOne({ sort, menuLevel });
                if (menu) {
                    return Promise.reject('该菜单排序已经存在，请重新修改排序');
                }
            }
            let menuNum = Utils.id();
            const info = {
                menuName: menuName,
                menuNum: menuNum,
                sort: sort,
                menuLevel: menuLevel,
                parentMenuNum: parentMenuNum,
                webIndex: webIndex,
                menuCoin: menuCoin,
            };
            await SystemMenu_mysql_dao_1.default.insertOne(info);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`创建菜单异常 :${error.stack || error}`);
            return { code: 500, info: '创建菜单异常' };
        }
    }
    async getSystemMenu() {
        try {
            const menusList = await SystemMenu_mysql_dao_1.default.findList({});
            const levelToOneList = menusList.filter(x => x.menuLevel == 1);
            const list = levelToOneList.map((info) => {
                const levelToTwoList = menusList.filter(x => x.parentMenuNum == info.menuNum);
                levelToTwoList.sort((a, b) => a.sort - b.sort);
                return Object.assign({ lastMenuList: levelToTwoList }, info);
            });
            list.sort((a, b) => a.sort - b.sort);
            return list;
        }
        catch (error) {
            ManagerErrorLogger.error(`创建菜单异常 :${error.stack || error}`);
            return { code: 500, info: '创建菜单异常' };
        }
    }
    async updateMenu(id, menuName, sort, menuLevel, parentMenuNum, webIndex, menuCoin) {
        try {
            const info = {
                menuName: menuName,
                sort: sort,
                menuLevel: menuLevel,
                webIndex: webIndex,
                menuCoin: menuCoin,
                parentMenuNum: parentMenuNum
            };
            await SystemMenu_mysql_dao_1.default.updateOne({ id: id }, info);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`修改菜单异常 :${error.stack || error}`);
            return { code: 500, info: '修改菜单异常' };
        }
    }
    async deleteSystemMenu(id) {
        try {
            const menu = await SystemMenu_mysql_dao_1.default.findOne({ id });
            if (!menu) {
                return Promise.reject('该菜单不存在');
            }
            const menusList = await SystemMenu_mysql_dao_1.default.findList({ parentMenuNum: menu.menuNum });
            if (menusList.length > 0) {
                return Promise.reject('请将该菜单栏下面的子菜单移除才能删除');
            }
            await SystemMenu_mysql_dao_1.default.delete({ id: id });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`删除菜单异常 :${error.stack || error}`);
            return { code: 500, info: '删除菜单异常' };
        }
    }
    async createSystemRole(roleName, sort, roleMenu, roleLevel) {
        try {
            const role = await SystemRole_mysql_dao_1.default.findOne({ roleName });
            if (role) {
                return Promise.reject('该角色名已存在');
            }
            const roleLevelForUser = await SystemRole_mysql_dao_1.default.findOne({ roleLevel });
            if (roleLevelForUser) {
                return Promise.reject('该角色等级已经存在');
            }
            const info = {
                roleName: roleName,
                sort: sort,
                roleLevel: roleLevel,
                roleMenu: roleMenu,
                role: Utils.id()
            };
            await SystemRole_mysql_dao_1.default.insertOne(info);
            return { code: 200, msg: "创建角色成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }
    async getSystemRole(manager) {
        try {
            const user = await ManagerInfo_mysql_dao_1.default.findOne({ userName: manager });
            const role = user.role;
            const rolesList = await SystemRole_mysql_dao_1.default.findList({});
            const roleUser = rolesList.find(x => x.role == role);
            let list = null;
            if (roleUser.roleLevel <= 2) {
                list = rolesList.filter(x => x.roleLevel >= roleUser.roleLevel);
            }
            else {
                list = rolesList.filter(x => x.roleLevel > roleUser.roleLevel);
            }
            list.sort((a, b) => a.sort - b.sort);
            return list;
        }
        catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }
    async getSystemRoleForMenu(role) {
        try {
            const roleUser = await SystemRole_mysql_dao_1.default.findOne({ role });
            if (!roleUser) {
                return Promise.reject('该角色不存在');
            }
            let roleMenu = roleUser.roleMenu;
            const menusList = await SystemMenu_mysql_dao_1.default.findList({});
            const levelToOneList = menusList.filter(x => x.menuLevel == 1);
            const list = levelToOneList.map((info) => {
                const levelToTwoList = menusList.filter(x => x.parentMenuNum == info.menuNum);
                levelToTwoList.sort((a, b) => a.sort - b.sort);
                return Object.assign({ lastMenuList: levelToTwoList }, info);
            });
            return { list, roleMenu };
        }
        catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }
    async getLoginSystemRoleForMenu(role) {
        try {
            const roleUser = await SystemRole_mysql_dao_1.default.findOne({ role });
            if (!roleUser) {
                return Promise.reject('该角色不存在');
            }
            let roleMenu = roleUser.roleMenu;
            const menusList = await SystemMenu_mysql_dao_1.default.findListForRole(roleMenu);
            const levelToOneList = menusList.filter(x => x.menuLevel == 1);
            const list = levelToOneList.map((info) => {
                const levelToTwoList = menusList.filter(x => x.parentMenuNum == info.menuNum);
                levelToTwoList.sort((a, b) => a.sort - b.sort);
                return Object.assign({ lastMenuList: levelToTwoList }, info);
            });
            return list;
        }
        catch (error) {
            ManagerErrorLogger.error(`创建角色异常 :${error.stack || error}`);
            return { code: 500, info: '创建角色异常' };
        }
    }
    async updateSystemRole(id, roleName, sort, roleMenu, roleLevel) {
        try {
            const role = await SystemRole_mysql_dao_1.default.findOne({ id });
            if (!role) {
                return Promise.reject('该角色不存在');
            }
            const info = {
                roleName: roleName,
                sort: sort,
                roleLevel: roleLevel,
                roleMenu: roleMenu,
            };
            await SystemRole_mysql_dao_1.default.updateOne({ id }, info);
            return { code: 200, msg: "修改角色成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`修改角色异常 :${error.stack || error}`);
            return { code: 500, info: '修改角色异常' };
        }
    }
    async deleteSystemRole(id) {
        try {
            const role = await SystemRole_mysql_dao_1.default.findOne({ id });
            if (!role) {
                return Promise.reject('该角色不存在');
            }
            await SystemRole_mysql_dao_1.default.delete({ id });
            return { code: 200, msg: "删除角色成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`删除角色异常 :${error.stack || error}`);
            return { code: 500, info: '删除角色异常' };
        }
    }
    async createManagerServersList(serverName, serverHttp) {
        try {
            await ServerList_redis_dao_1.default.insertOne({ serverName, serverHttp });
            return { code: 200, msg: "创建后台服务器列表成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`创建后台服务器列表异常 :${error.stack || error}`);
            return { code: 500, info: '创建后台服务器列表异常' };
        }
    }
    async getManagerServersList() {
        try {
            await ServerList_redis_dao_1.default.findList({});
            return { code: 200, msg: "创建后台服务器列表成功" };
        }
        catch (error) {
            ManagerErrorLogger.error(`删除角色异常 :${error.stack || error}`);
            return { code: 500, info: '删除角色异常' };
        }
    }
    async updateManagerServersList(serverName, serverHttp) {
        try {
            await ServerList_redis_dao_1.default.updateOne({ serverName }, { serverName, serverHttp });
            return { code: 200, msg: "更新后台服务器列表" };
        }
        catch (error) {
            ManagerErrorLogger.error(`更新后台服务器列表异常 :${error.stack || error}`);
            return { code: 500, info: '更新后台服务器列表异常' };
        }
    }
    async deleteManagerServersList(serverName) {
        try {
            await ServerList_redis_dao_1.default.delete({ serverName });
            return { code: 200, msg: "删除后台服务器列表" };
        }
        catch (error) {
            ManagerErrorLogger.error(`删除后台服务器列表异常 :${error.stack || error}`);
            return { code: 500, info: '删除后台服务器列表异常' };
        }
    }
    async setManagerRoute(id, routeList) {
        try {
            const role = await SystemRole_mysql_dao_1.default.findOne({ id });
            if (!role) {
                return Promise.reject('该角色不存在');
            }
            await SystemRole_mysql_dao_1.default.updateOne({ id }, { roleRoute: routeList });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`设置后台所有的请求路由和角色的路由 :${error.stack || error}`);
            return { code: 500, info: '设置后台所有的请求路由和角色的路由' };
        }
    }
};
SystemMenuService = __decorate([
    (0, common_1.Injectable)()
], SystemMenuService);
exports.SystemMenuService = SystemMenuService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtTWVudS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL2xvZ2luL3N5c3RlbU1lbnUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSwyQ0FBNEM7QUFDNUMsa0dBQXlGO0FBQ3pGLGtHQUF5RjtBQUN6RixrR0FBeUY7QUFDekYsb0dBQTJGO0FBQzNGLHVEQUF3RDtBQUN4RCwrQ0FBeUM7QUFDekMsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBSXpELElBQWEsaUJBQWlCLEdBQTlCLE1BQWEsaUJBQWlCO0lBTTFCLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsU0FBaUIsRUFBRyxhQUFzQixFQUFHLFFBQWlCLEVBQUcsUUFBaUI7UUFDL0gsSUFBSTtZQUVBLElBQUcsU0FBUyxJQUFJLENBQUMsRUFBQztnQkFDZCxNQUFNLElBQUksR0FBRyxNQUFNLDhCQUFrQixDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRyxTQUFTLEVBQUcsQ0FBQyxDQUFDO2dCQUNyRSxJQUFJLElBQUksRUFBRTtvQkFDTixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztpQkFDOUM7YUFDSjtZQUVELElBQUksT0FBTyxHQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMxQixNQUFNLElBQUksR0FBRztnQkFDVCxRQUFRLEVBQUUsUUFBUTtnQkFDbEIsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLElBQUksRUFBRSxJQUFJO2dCQUNWLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixhQUFhLEVBQUUsYUFBYTtnQkFDNUIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFB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