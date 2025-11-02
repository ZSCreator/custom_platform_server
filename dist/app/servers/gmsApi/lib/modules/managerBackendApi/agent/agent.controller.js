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
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const agent_service_1 = require("./agent.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../../main/token.guard");
const HttpCode_enum_1 = require("../../../support/code/HttpCode.enum");
const createPlatform_dto_1 = require("./createPlatform.dto");
const GmsApiResult_vo_1 = require("../../../const/GmsApiResult.vo");
const AgentList_dto_1 = require("./AgentList.dto");
const UpdateGoldForPlatform_dto_1 = require("./UpdateGoldForPlatform.dto");
const UpdateAgentGoldFromPlatform_dto_1 = require("./UpdateAgentGoldFromPlatform.dto");
const TenantGameOperationalData_1 = require("./TenantGameOperationalData");
const moment = require("moment");
let AgentController = class AgentController {
    constructor(AgentService) {
        this.AgentService = AgentService;
        this.logger = (0, pinus_logger_1.getLogger)('http', __filename);
    }
    async createPlatform({ manager, platform, gold, language }) {
        try {
            const result = await this.AgentService.createPlatform(manager, platform, gold, language);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(result, "创建平台信息成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`创建平台信息出错 :${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "创建平台信息出错");
        }
    }
    async deletePlatform({ platform }) {
        try {
            await this.AgentService.deletePlatform(platform);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(null, "删除平台信息成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`删除平台信息出错 :${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "删除平台信息出错");
        }
    }
    async platformList({ currentPage, pageSize, managerUid }) {
        try {
            const result = await this.AgentService.platformList(currentPage, pageSize, managerUid);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(result, "获取平台信息列表成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取平台列表 :${e}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取平台信息列表出错");
        }
    }
    async createAgentForPlatform({ manager, managerUid, platform, gold, language }) {
        try {
            if (!managerUid) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "后台账户信息过期");
            }
            await this.AgentService.createAgentForPlatform(manager, managerUid, platform, gold, language);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(null, "创建代理成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取玩家列表 :${e}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "创建代理出错");
        }
    }
    async deleteAgentForPlatform({ managerUid, agentUid, }) {
        try {
            await this.AgentService.deleteAgentForPlatform(managerUid, agentUid);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(null, "删除代理成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取玩家列表 :${e}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "删除代理出错");
        }
    }
    async agentList({ currentPage, pageSize, platfromUid, rootAgent }) {
        try {
            const result = await this.AgentService.agentListFromPlatform(platfromUid, rootAgent, currentPage, pageSize);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(result, "获取代理列表成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`大区下面的玩家列表 :${e}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取代理列表出错");
        }
    }
    async bingManagerAgentList({ platfromUid }) {
        try {
            const result = await this.AgentService.bingManagerAgentList(platfromUid);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(result, "获取代理列表成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`大区下面的玩家列表 :${e}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取代理列表出错");
        }
    }
    async updateGoldForPlatform({ manager, platfromUid, gold }) {
        try {
            await this.AgentService.updateGoldForPlatform(manager, gold, platfromUid);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(null, "修改平台金币成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "修改平台金币出错");
        }
    }
    async updateAgentGoldFromPlatform({ manager, gold, plateform, uid }) {
        try {
            await this.AgentService.addPlatformAgentGold(manager, plateform, gold, uid);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(null, "修改代理金币成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`修改代理金币出错: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "修改代理金币出错");
        }
    }
    async getPlatformToAgentGoldRecordList({ currentPage, pageSize, managerAgent, agentSearch }) {
        try {
            const result = await this.AgentService.getPlatformToAgentGoldRecordList(managerAgent, agentSearch, currentPage, pageSize);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`查看平台和给平台添加金币的记录 :${error}`);
            return { code: 500, error };
        }
    }
    async getAgentForPlayerGoldRecordList({ page, pageSize, uid, startTime, endTime, managerAgent }) {
        try {
            const result = await this.AgentService.getAgentForPlayerGoldRecordList(managerAgent, page, pageSize, startTime, endTime, uid);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`查看平台和给平台添加金币的记录 :${error}`);
            return { code: 500, error };
        }
    }
    async tenantOperationalData({ platformUid, currentPage, pageSize, groupRemark }) {
        try {
            let requestStartTime = Date.now();
            if (!platformUid) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "请选择平台再进行操作");
            }
            if (groupRemark) {
                const result = await this.AgentService.selectTenantData(groupRemark);
                let responseEndTime = Date.now();
                return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(Object.assign({ requestStartTime, responseEndTime }, result), "查询租户运营数据成功");
            }
            const result = await this.AgentService.getTenantOperationalDataList(platformUid, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(Object.assign({ requestStartTime, responseEndTime }, result), "获取租户运营数据成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取租户运营数据出错: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取租户运营数据出错");
        }
    }
    async tenantGameData({ platformUid, groupRemark, currentPage, pageSize }) {
        try {
            let requestStartTime = Date.now();
            if (!platformUid) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "请选择平台再进行操作");
            }
            const result = await this.AgentService.getTenantGameData(platformUid, groupRemark, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(Object.assign({ requestStartTime, responseEndTime }, result), "获取租户运营数据成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取租户游戏运营数据出错");
        }
    }
    async platformProfitAndLossData({ startTimestamp, endTimestamp, managerAgent, currentPage, pageSize }) {
        try {
            let requestStartTime = Date.now();
            if (moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") > moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss")) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "时间范围选择错误");
            }
            const startTime = moment(startTimestamp).format("YYYYMM");
            const endTime = moment(endTimestamp).format("YYYYMM");
            if (startTime != endTime) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "时间请不要跨月查询数据报表");
            }
            if (moment(endTimestamp).format("YYYY-MM-DD 23:59:59") > moment().format("YYYY-MM-DD 23:59:59")) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "结束时间大于了当前时间，请重新选择");
            }
            const result = await this.AgentService.platformProfitAndLossData(managerAgent, startTimestamp, endTimestamp, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(Object.assign({ requestStartTime, responseEndTime }, result), "获取代理盈亏报表成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取代理盈亏报表数据出错");
        }
    }
    async agentProfitAndLossData({ managerAgent, startTimestamp, endTimestamp, groupRemark, currentPage, pageSize }) {
        try {
            let requestStartTime = Date.now();
            if (moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss") > moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss")) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "时间范围选择错误");
            }
            const startTime = moment(startTimestamp).format("YYYYMM");
            const endTime = moment(endTimestamp).format("YYYYMM");
            if (startTime != endTime) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "时间请不要跨月查询数据报表");
            }
            if (!groupRemark) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "查询数据请传代理号");
            }
            const result = await this.AgentService.agentProfitAndLossData(managerAgent, groupRemark, startTimestamp, endTimestamp, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(Object.assign({ requestStartTime, responseEndTime }, result), "获取代理盈亏报表成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取代理盈亏报表数据出错");
        }
    }
    async agentGameRecordData({ startTimestamp, endTimestamp, groupRemark, currentPage, pageSize }) {
        try {
            let requestStartTime = Date.now();
            const num = Math.ceil((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24));
            if (num > 31) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "时间请不要超过一个月");
            }
            if (!groupRemark) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "代理号不存在");
            }
            const result = await this.AgentService.agentGameRecordData(groupRemark, startTimestamp, endTimestamp, currentPage, pageSize);
            let responseEndTime = Date.now();
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(Object.assign({ requestStartTime, responseEndTime }, result), "历史数据汇总根据代理获取游戏数据数据成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取租户游戏运营数据出错: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "历史数据汇总根据代理获取游戏数据");
        }
    }
    async getPlatformUidList({}) {
        try {
            const platformUidList = await this.AgentService.getPlatformUidList();
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(platformUidList, "获取所有平台对应的uid成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的uid: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取所有平台对应的uid");
        }
    }
    async getPlatformForAgent({ managerAgent, platformName }) {
        try {
            if (!managerAgent && !platformName) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "请传平台的相关参数");
            }
            let name = null;
            if (managerAgent) {
                name = managerAgent;
            }
            else {
                name = platformName;
            }
            const agentList = await this.AgentService.getPlatformForAgent(name);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(agentList, "获取所有平台对应的分代号成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的分代号成功uid: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取所有平台对应的分代号失败");
        }
    }
    async getPlatformGameList({ managerAgent, platformName }) {
        try {
            if (!managerAgent && !platformName) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "请传平台的相关参数");
            }
            let name = null;
            if (managerAgent) {
                name = managerAgent;
            }
            else {
                name = platformName;
            }
            const result = await this.AgentService.getPlatformGameList(name);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(result, "获取所有平台对应的uid成功");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的uid: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "获取所有平台对应的uid");
        }
    }
    async setPlatformCloseGame({ managerAgent, platformName, closeGameList }) {
        try {
            if (!managerAgent && !platformName && !closeGameList) {
                return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "请传平台的相关参数");
            }
            let name = null;
            if (managerAgent) {
                name = managerAgent;
            }
            else {
                name = platformName;
            }
            const result = await this.AgentService.setPlatformCloseGame(name, closeGameList);
            return GmsApiResult_vo_1.GmsApiResultVO.SUCCESS(result, "设置平台的游戏开关");
        }
        catch (e) {
            if (e instanceof GmsApiResult_vo_1.GmsApiResultVO)
                return e;
            this.logger.error(`获取所有平台对应的uid: ${e.stack}`);
            return GmsApiResult_vo_1.GmsApiResultVO.ERROR(null, "设置平台的游戏开关");
        }
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "创建平台信息", description: "创建新的平台基本信息接口" }),
    (0, common_1.Post)('createPlatform'),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "创建平台信息成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "创建平台信息出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Platform_Existence, description: "平台已存在" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createPlatform_dto_1.CreatePlatform]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "createPlatform", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "删除平台信息", description: "删除平台信息基本信息接口" }),
    (0, common_1.Post)('deletePlatform'),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "删除平台信息成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "删除平台信息出错" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "deletePlatform", null);
__decorate([
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取平台信息列表成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取平台信息列表出错" }),
    (0, swagger_1.ApiOperation)({ summary: "平台列表", description: "获取平台信息列表" }),
    (0, common_1.Post)('platformList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "platformList", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "创建代理", description: "为平台创建代理" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "创建代理成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "创建代理出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Agent_Existence, description: "租户已存在" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, description: "平台不存在" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.PlatformGold_Not_Enough, description: "平台金币不足" }),
    (0, common_1.Post)('createAgentForPlatform'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "createAgentForPlatform", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "删除代理", description: "为平台删除代理" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "删除代理成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "删除代理出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Agent_Existence, description: "租户已存在" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, description: "平台不存在" }),
    (0, common_1.Post)('deleteAgentForPlatform'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "deleteAgentForPlatform", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "代理列表", description: "获取指定平台下的代理列表信息" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取代理列表成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取代理列表出错" }),
    (0, common_1.Post)('agentListFromPlatform'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AgentList_dto_1.AgentList]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "agentList", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "创建后台账号给代理绑定获取代理列表", description: "获取指定平台下的代理列表信息" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取代理列表成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取代理列表出错" }),
    (0, common_1.Post)('bingManagerAgentList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AgentList_dto_1.AgentList]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "bingManagerAgentList", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "修改平台金币", description: "修改平台金币" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "修改平台金币成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "修改平台金币出错" }),
    (0, common_1.Post)('updateGoldForPlatform'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateGoldForPlatform_dto_1.UpdateGoldForPlatform]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateGoldForPlatform", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "修改代理金币", description: "修改指定平台下代理的金币" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "修改代理金币成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "修改代理金币出错" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, description: "平台不存在" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.PlatformGold_Not_Enough, description: "平台金币不足" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, description: "平台不存在" }),
    (0, common_1.Post)('updateAgentGoldFromPlatform'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateAgentGoldFromPlatform_dto_1.UpdateAgentGoldFromPlatform]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateAgentGoldFromPlatform", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "查看平台给代理上分记录", description: "获取上下分记录" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取上下分记录成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取上下分记录出错" }),
    (0, common_1.Post)('getPlatformToAgentGoldRecordList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getPlatformToAgentGoldRecordList", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "查看平台给代理上分记录", description: "获取上下分记录" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取上下分记录成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取上下分记录出错" }),
    (0, common_1.Post)('getAgentForPlayerGoldRecordList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAgentForPlayerGoldRecordList", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "租户运营数据", description: "租户运营数据" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取租户运营数据成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取租户运营数据出错" }),
    (0, common_1.Post)('tenantOperationalData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "tenantOperationalData", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "租户游戏运营数据", description: "租户游戏运营数据" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取租户游戏运营数据成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取租户游戏运营数据出错" }),
    (0, common_1.Post)('tenantGameData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TenantGameOperationalData_1.TenantGameOperationalData]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "tenantGameData", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "平台盈亏报表", description: "代理盈亏报表数据" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取代理盈亏报表数据成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取代理盈亏报表数据出错" }),
    (0, common_1.Post)('platformProfitAndLossData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "platformProfitAndLossData", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "代理盈亏报表", description: "代理盈亏报表数据" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "获取代理盈亏报表数据成功" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "获取代理盈亏报表数据出错" }),
    (0, common_1.Post)('agentProfitAndLossData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "agentProfitAndLossData", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "历史数据汇总根据代理获取游戏数据", description: "历史数据汇总根据代理获取游戏数据" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.SUCCESS, description: "历史数据汇总根据代理获取游戏数据" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.BAD_REQUEST, description: "参数错误" }),
    (0, swagger_1.ApiResponse)({ status: HttpCode_enum_1.HttpCode.FAIL, description: "历史数据汇总根据代理获取游戏数据出错" }),
    (0, common_1.Post)('agentGameRecordData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "agentGameRecordData", null);
__decorate([
    (0, common_1.Post)('getPlatformUidList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getPlatformUidList", null);
__decorate([
    (0, common_1.Post)('getPlatformForAgent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getPlatformForAgent", null);
__decorate([
    (0, common_1.Post)('getPlatformGameList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getPlatformGameList", null);
__decorate([
    (0, common_1.Post)('setPlatformCloseGame'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "setPlatformCloseGame", null);
AgentController = __decorate([
    (0, swagger_1.ApiTags)("平台、代理业务相关"),
    (0, common_1.Controller)('agent'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
exports.AgentController = AgentController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9hZ2VudC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFtRTtBQUNuRSw2Q0FBcUU7QUFDckUsbURBQStDO0FBQy9DLCtDQUF5QztBQUN6Qyx3REFBb0Q7QUFDcEQsdUVBQStEO0FBQy9ELDZEQUFzRDtBQUN0RCxvRUFBZ0U7QUFDaEUsbURBQTRDO0FBQzVDLDJFQUFvRTtBQUNwRSx1RkFBZ0Y7QUFDaEYsMkVBQXdFO0FBQ3hFLGlDQUFpQztBQU9qQyxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBRXhCLFlBQTZCLFlBQTBCO1FBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQ25ELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBUUQsS0FBSyxDQUFDLGNBQWMsQ0FBUyxFQUFFLE9BQU8sRUFBRyxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBa0I7UUFDL0UsSUFBSTtZQUNBLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFMUYsT0FBTyxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDckQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUVSLElBQUksQ0FBQyxZQUFZLGdDQUFjO2dCQUMzQixPQUFPLENBQUMsQ0FBQztZQUViLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUss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