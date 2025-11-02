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
exports.LoginController = void 0;
const common_1 = require("@nestjs/common");
const login_service_1 = require("./login.service");
const Utils = require("../../../../../../utils/index");
const token_guard_1 = require("../../main/token.guard");
const swagger_1 = require("@nestjs/swagger");
let LoginController = class LoginController {
    constructor(loginService) {
        this.loginService = loginService;
    }
    async managerCreate(str, req, session) {
        try {
            const param = str;
            const { userName, passWord, agent, ip, role, rootAgent, managerRole, manager, managerIp } = param;
            if (!role.toString() || !ip || !userName || !passWord || !managerRole) {
                return { code: 500, error: "输入参数不完整" };
            }
            const result = await this.loginService.managerCreate(userName, passWord, agent, ip, role, rootAgent, managerRole, manager, managerIp);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async platformCreateMangerUser(str, session) {
        console.log("platformCreateMangerUser", str);
        try {
            const param = str;
            const { managerAgent, userName, passWord, agent, ip, role, manager, managerIp } = param;
            if (!managerAgent || !role || !ip || !userName || !passWord) {
                return { code: 500, error: "输入参数不完整" };
            }
            if (!agent) {
                return { code: 500, error: "请输入该后台账号的代理号" };
            }
            const result = await this.loginService.platformCreateMangerUser(managerAgent, userName, passWord, agent, ip, role, manager, managerIp);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "创建失败" };
        }
    }
    async managerLogin({ userName, passWord }, req) {
        try {
            if (!userName || !passWord) {
                return { code: 500, error: "输入后台账号和密码" };
            }
            const ip = Utils.getClientIp(req);
            const result = await this.loginService.managerLogin(userName, passWord, ip);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "账号登陆失败" };
        }
    }
    async changePassWord(str, req) {
        console.log("changePassWord", str);
        try {
            const param = str;
            const { manager, userName, passWord, agent, ip, role, managerRole, managerIp } = param;
            if (!userName) {
                return { code: 500, error: "请输入账号和密码,以及ip" };
            }
            if (!manager || !managerRole) {
                return { code: 500, error: "修改失败" };
            }
            const loginIp = Utils.getClientIp(req);
            const result = await this.loginService.changePassWord(manager, userName, passWord, agent, ip, role, loginIp, managerRole, managerIp);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async platformChangePassWord(str, req) {
        console.log("changePassWord", str);
        try {
            const param = str;
            const { manager, userName, passWord, agent, ip, role, managerRole, managerIp } = param;
            if (!userName) {
                return { code: 500, error: "请输入账号" };
            }
            const loginIp = Utils.getClientIp(req);
            const result = await this.loginService.platformChangePassWord(manager, userName, passWord, agent, ip, role, loginIp, managerRole, managerIp);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async getAllManagerUser(str) {
        console.log("getAllManagerUser", str);
        try {
            const param = str;
            let { page, pageSize, userName } = param;
            if (!page) {
                page = 1;
            }
            if (!pageSize) {
                pageSize = 20;
            }
            if (userName) {
                const result = await this.loginService.getOneManagerUser(userName);
                return result;
            }
            const result = await this.loginService.getAllManagerUser(page, pageSize);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "获取失败" };
        }
    }
    async getPlatformManagerUser(str) {
        try {
            const param = str;
            let { page, pageSize, manager } = param;
            let userName = manager;
            if (!page) {
                page = 1;
            }
            if (!pageSize) {
                pageSize = 20;
            }
            if (!userName) {
                return { code: 500, error: "缺少账号信息" };
            }
            const result = await this.loginService.getPlatformManagerUser(page, pageSize, userName);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async deleteUserName(str) {
        console.log("deleteUserName", str);
        try {
            const param = str;
            const { id, manager, managerRole } = param;
            if (!id) {
                return { code: 500, error: "id不存在" };
            }
            const result = await this.loginService.deleteUserName(id, manager, managerRole);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "删除失败" };
        }
    }
    async updateManagerSelfUser(str, req) {
        console.log("updateManagerSelfUser", str);
        try {
            const param = str;
            const { manager, passWord, oldPassWord } = param;
            let userName = manager;
            const ip = Utils.getClientIp(req);
            if (!userName) {
                return { code: 500, error: "玩家信息已过期" };
            }
            if (!passWord || !oldPassWord) {
                return { code: 500, error: "请输入密码" };
            }
            const result = await this.loginService.updateManagerSelfUser(userName, passWord, oldPassWord, ip);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async sendMessage({ userName }, req) {
        try {
            const ip = Utils.getClientIp(req);
            if (!userName) {
                return { code: 500, error: "玩家信息已过期" };
            }
            const result = await this.loginService.sendMessage(userName, ip);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async checkAuthCode({ userName, auth_code }, req) {
        try {
            const ip = Utils.getClientIp(req);
            if (!userName) {
                return { code: 500, error: "玩家信息已过期" };
            }
            const result = await this.loginService.checkAuthCode(userName, auth_code, ip);
            return result;
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async getThirdGameResultById(str) {
        console.log("getThirdGameResultById", str);
        try {
            const { gameOrder, createTimeDate, groupRemark } = str;
            if (!gameOrder && !createTimeDate) {
                return { code: 500, error: '请输入订单号和时间' };
            }
            const record = await this.loginService.getThirdGameResultById(gameOrder, createTimeDate, groupRemark);
            return { code: 200, record };
        }
        catch (error) {
            return { code: 500, error: error ? error : "修改失败" };
        }
    }
    async getCustomerUrl() {
        try {
            const customer = await this.loginService.getCustomerUrl();
            return { code: 200, customer: customer };
        }
        catch (error) {
            return { code: 500, error: error ? error : "获取失败" };
        }
    }
};
__decorate([
    (0, common_1.Post)('Create'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "managerCreate", null);
__decorate([
    (0, common_1.Post)('platformCreateMangerUser'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "platformCreateMangerUser", null);
__decorate([
    (0, common_1.Post)('Login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "managerLogin", null);
__decorate([
    (0, common_1.Post)('changePassWord'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "changePassWord", null);
__decorate([
    (0, common_1.Post)('platformChangePassWord'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "platformChangePassWord", null);
__decorate([
    (0, common_1.Post)('getAllManagerUser'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "getAllManagerUser", null);
__decorate([
    (0, common_1.Post)('getPlatformManagerUser'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "getPlatformManagerUser", null);
__decorate([
    (0, common_1.Post)('deleteUserName'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "deleteUserName", null);
__decorate([
    (0, common_1.Post)('updateManagerSelfUser'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "updateManagerSelfUser", null);
__decorate([
    (0, common_1.Post)('sendMessage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('checkAuthCode'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "checkAuthCode", null);
__decorate([
    (0, common_1.Post)('getThirdGameResultById'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "getThirdGameResultById", null);
__decorate([
    (0, common_1.Post)('getCustomerUrl'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "getCustomerUrl", null);
LoginController = __decorate([
    (0, common_1.Controller)('manager'),
    (0, swagger_1.ApiTags)("后台管理账户和权限管理"),
    __metadata("design:paramtypes", [login_service_1.LoginService])
], LoginController);
exports.LoginController = LoginController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9sb2dpbi9sb2dpbi5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFpRztBQUNqRyxtREFBK0M7QUFDL0MsdURBQXdEO0FBQ3hELHdEQUFvRDtBQUNwRCw2Q0FBMEM7QUFPMUMsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUV4QixZQUE2QixZQUEwQjtRQUExQixpQkFBWSxHQUFaLFlBQVksQ0FBYztJQUN2RCxDQUFDO0lBUUQsS0FBSyxDQUFDLGFBQWEsQ0FBUyxHQUFRLEVBQWEsR0FBUSxFQUFhLE9BQVk7UUFDOUUsSUFBSTtZQUNBLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNsQixNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRyxTQUFTLEVBQUUsV0FBVyxFQUFHLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDcEcsSUFBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDcEUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFBO2FBQ3pDO1lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUcsSUFBSSxFQUFHLFNBQVMsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3hJLE9B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