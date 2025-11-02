"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMenuController = void 0;
const common_1 = require("@nestjs/common");
const systemMenu_service_1 = require("./systemMenu.service");
const token_guard_1 = require("../../main/token.guard");
const swagger_1 = require("@nestjs/swagger");
let SystemMenuController = class SystemMenuController {
    constructor(systemMenuService) {
        this.systemMenuService = systemMenuService;
    }
    async createSystemMenu(str, req, session) {
        console.log("createSystemMenu", str);
        try {
            const { menuName, sort, menuLevel, parentMenuNum, webIndex, menuCoin } = str;
            if (!menuName || !sort || !menuLevel) {
                return { code: 500, error: "输入参数不完整" };
            }
            await this.systemMenuService.createMenu(menuName, sort, menuLevel, parentMenuNum, webIndex, menuCoin);
            return { code: 200, msg: "创建菜单成功" };
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async getSystemMenu(str, req, session) {
        console.log("getSystemMenu", str);
        try {
            const menusList = await this.systemMenuService.getSystemMenu();
            return { code: 200, menusList };
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async updateSystemMenu(str, req) {
        try {
            const { menuName, sort, parentMenuNum, menuLevel, id, webIndex, menuCoin } = str;
            if (!id) {
                return { code: 500, error: "id不存在" };
            }
            if (!menuName || !sort) {
                return { code: 500, error: "输入参数不完整" };
            }
            await this.systemMenuService.updateMenu(id, menuName, sort, menuLevel, parentMenuNum, webIndex, menuCoin);
            return { code: 200, msg: "修改菜单成功" };
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改菜单失败" };
        }
    }
    async deleteSystemMenu(str, req) {
        try {
            const { id } = str;
            if (!id) {
                return { code: 500, error: "id不存在" };
            }
            await this.systemMenuService.deleteSystemMenu(id);
            return { code: 200, msg: "删除菜单成功" };
        }
        catch (error) {
            return { code: 500, error: error ? error : "删除菜单失败" };
        }
    }
    async createSystemRole(str, req, session) {
        console.log("createSystemRole", str);
        try {
            const { manager, roleName, sort, roleMenu, roleLevel } = str;
            if (!manager || manager != "xiaolaobaoban") {
                return { code: 500, error: "没权限" };
            }
            if (!roleName || !sort.toString() || roleMenu.length == 0 || !roleLevel.toString()) {
                return { code: 500, error: "输入参数不完整" };
            }
            if (roleLevel < 1) {
                return { code: 500, error: "角色等级不对" };
            }
            const result = await this.systemMenuService.createSystemRole(roleName, sort, roleMenu, roleLevel);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async getSystemRole(str, req, session) {
        console.log("getSystemRole", str);
        try {
            const param = str;
            let { manager } = param;
            if (!manager) {
                return { code: 500, error: "获取角色列表失败" };
            }
            const rolesList = await this.systemMenuService.getSystemRole(manager);
            return { code: 200, rolesList };
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async getSystemRoleForMenu(str, req, session) {
        console.log("getSystemRoleForMenu", str);
        try {
            const { role } = str;
            if (!role) {
                return { code: 500, error: "输入角色编号" };
            }
            const { list, roleMenu } = await this.systemMenuService.getSystemRoleForMenu(role);
            return { code: 200, list: list, roleMenu };
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async getLoginSystemRoleForMenu(str, req, session) {
        console.log("getSystemRoleForMenu", str);
        try {
            const { role } = str;
            if (!role) {
                return { code: 500, error: "输入角色编号" };
            }
            const list = await this.systemMenuService.getLoginSystemRoleForMenu(role);
            return { code: 200, list: list };
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async updateSystemRole(str, req, session) {
        console.log("updateSystemRole", str);
        try {
            const { roleName, sort, manager, roleMenu, id, roleLevel } = str;
            if (!manager || manager != "xiaolaobaoban") {
                return { code: 500, error: "没权限" };
            }
            if (!id.toString()) {
                return { code: 500, error: "id不存在" };
            }
            if (!roleName || !sort || !roleMenu) {
                return { code: 500, error: "输入参数不完整" };
            }
            if (roleLevel < 1) {
                return { code: 500, error: "角色等级不对" };
            }
            const result = await this.systemMenuService.updateSystemRole(id, roleName, sort, roleMenu, roleLevel);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" };
        }
    }
    async deleteSystemRole(str, req, session) {
        console.log("deleteSystemRole", str);
        try {
            const { id } = str;
            if (!id) {
                return { code: 500, error: "id不存在" };
            }
            const result = await this.systemMenuService.deleteSystemRole(id);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" };
        }
    }
    async managerServersList(str, req, session) {
        console.log("managerCreate", str);
        try {
            const { serverName, serverHttp } = str;
            if (!serverName || !serverHttp) {
                return { code: 500, error: "缺少参数" };
            }
            const result = await this.systemMenuService.createManagerServersList(serverName, serverHttp);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" };
        }
    }
    async getManagerServersList(str, req, session) {
        console.log("managerCreate", str);
        try {
            const result = await this.systemMenuService.getManagerServersList();
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" };
        }
    }
    async updateManagerServersList(str, req, session) {
        console.log("managerCreate", str);
        try {
            const { serverName, serverHttp } = str;
            if (!serverName || !serverHttp) {
                return { code: 500, error: "缺少参数" };
            }
            const result = await this.systemMenuService.updateManagerServersList(serverName, serverHttp);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" };
        }
    }
    async deleteManagerServersList(str, req, session) {
        console.log("managerCreate", str);
        try {
            const { serverName, serverHttp } = str;
            if (!serverName) {
                return { code: 500, error: "缺少参数" };
            }
            const result = await this.systemMenuService.deleteManagerServersList(serverName);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改角色失败" };
        }
    }
    async setManagerRoute(str) {
        try {
            const { id, routeList, manager } = str;
            if (!manager || manager != "xiaolaobaoban") {
                return { code: 500, error: "没权限" };
            }
            if (!id || !routeList || routeList.length == 0) {
                return { code: 500, error: "缺少参数" };
            }
            await this.systemMenuService.setManagerRoute(id, routeList);
            return { code: 200 };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
};
__decorate([
    (0, common_1.Post)('createSystemMenu'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "createSystemMenu", null);
__decorate([
    (0, common_1.Post)('getSystemMenu'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "getSystemMenu", null);
__decorate([
    (0, common_1.Post)('updateSystemMenu'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "updateSystemMenu", null);
__decorate([
    (0, common_1.Post)('deleteSystemMenu'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "deleteSystemMenu", null);
__decorate([
    (0, common_1.Post)('createSystemRole'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "createSystemRole", null);
__decorate([
    (0, common_1.Post)('getSystemRole'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "getSystemRole", null);
__decorate([
    (0, common_1.Post)('getSystemRoleForMenu'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "getSystemRoleForMenu", null);
__decorate([
    (0, common_1.Post)('getLoginSystemRoleForMenu'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "getLoginSystemRoleForMenu", null);
__decorate([
    (0, common_1.Post)('updateSystemRole'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "updateSystemRole", null);
__decorate([
    (0, common_1.Post)('deleteSystemRole'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "deleteSystemRole", null);
__decorate([
    (0, common_1.Post)('createManagerServersList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "managerServersList", null);
__decorate([
    (0, common_1.Post)('getManagerServersList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "getManagerServersList", null);
__decorate([
    (0, common_1.Post)('updateManagerServersList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "updateManagerServersList", null);
__decorate([
    (0, common_1.Post)('deleteManagerServersList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "deleteManagerServersList", null);
__decorate([
    (0, common_1.Post)('setManagerRoute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemMenuController.prototype, "setManagerRoute", null);
SystemMenuController = __decorate([
    (0, common_1.Controller)('systemMenu'),
    (0, swagger_1.ApiTags)("后台管理账户和权限管理"),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [systemMenu_service_1.SystemMenuService])
], SystemMenuController);
exports.SystemMenuController = SystemMenuController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtTWVudS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL21hbmFnZXJCYWNrZW5kQXBpL2xvZ2luL3N5c3RlbU1lbnUuY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBaUc7QUFDakcsNkRBQXlEO0FBQ3pELHdEQUFvRDtBQUNwRCw2Q0FBMEM7QUFRMUMsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7SUFFN0IsWUFBNkIsaUJBQW9DO1FBQXBDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7SUFDakUsQ0FBQztJQU9ELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBUyxHQUFRLEVBQWEsR0FBUSxFQUFhLE9BQVk7UUFDakYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNwQyxJQUFJO1lBRUEsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFHLGFBQWEsRUFBRSxRQUFRLEVBQUcsUUFBUSxFQUFDLEdBQUcsR0FBRyxDQUFDO1lBQzlFLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUk7Z0JBQ3BDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQTthQUN6QztZQUNBLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRyxhQUFhLEVBQUcsUUFBUSxFQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQzFHLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQztTQUN2QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FB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