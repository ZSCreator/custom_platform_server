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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../main/token.guard");
const hallConst_1 = require("../../../../../consts/hallConst");
const TenantControl_manager_1 = require("../../../../../common/dao/daoManager/TenantControl.manager");
const Scene_manager_1 = require("../../../../../common/dao/daoManager/Scene.manager");
const Game_manager_1 = require("../../../../../common/dao/daoManager/Game.manager");
const PlayerAgent_mysql_dao_1 = require("../../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const FileExportData_redis_dao_1 = require("../../../../../common/dao/redis/FileExportData.redis.dao");
const fs = require("fs");
const backendControlService_1 = require("../../../../../services/newControl/backendControlService");
const pinus_1 = require("pinus");
let GameController = class GameController {
    constructor(GameService) {
        this.GameService = GameService;
        this.logger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
    }
    async getAllGames(str) {
        console.log("getAllGames", str);
        try {
            return await this.GameService.getAllGames();
        }
        catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getOpenGameAndClose(str) {
        console.log("getOpenGameAndClose", str);
        try {
            return await this.GameService.getCloseGamesAndOpen();
        }
        catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setOneGameClose(str) {
        console.log("setOneGameClose", str);
        try {
            const { nid, opened } = str;
            if (!nid) {
                return { code: 500, error: "缺少游戏nid" };
            }
            await this.GameService.setOneGameClose(nid, opened);
            return { code: 200 };
        }
        catch (error) {
            this.logger.error(`设置某个游戏关闭 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setSystemTypeForNid(str) {
        console.log("setSystemTypeForNid", str);
        try {
            const param = str;
            const typeId = Number(param.typeId);
            const sort = Number(param.sort);
            const open = param.open;
            const nidList = param.nidList;
            const gameType1 = await this.GameService.getSystemTypeForGameTypeId(typeId);
            if (!gameType1) {
                return { code: 500, error: "游戏类型参数不对" };
            }
            let gameType = {};
            if (sort.toString()) {
                gameType.sort = sort;
            }
            if (open.toString()) {
                gameType.open = open;
            }
            let nids = [];
            let ss = nidList.sort((a, b) => a.sort - b.sort);
            let sshot = nidList.filter(x => x.ishot == true);
            sshot = sshot.sort((a, b) => a.hsort - b.hsort);
            let hotNids = [];
            for (let key of sshot) {
                hotNids.push(key.nid);
            }
            for (let key of ss) {
                nids.push(key.nid);
            }
            gameType.nidList = nids.toString();
            gameType.typeId = typeId;
            gameType.name = gameType1.name;
            gameType.hotNidList = hotNids.toString();
            await this.GameService.setSystemTypeForNid(gameType);
            return { code: 200, msg: "修改成功" };
        }
        catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getSystemType(str) {
        console.log("getSystemType", str);
        try {
            const record = await this.GameService.getSystemType();
            return { code: 200, record };
        }
        catch (error) {
            this.logger.error(`获取所有开放的游戏 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getGameRecords(str) {
        console.log("getGameRecords", str);
        try {
            let { platformUid, page, thirdUid, pageSize, nid, uid, startTime, endTime, gameOrder, roundId } = str;
            if (!page) {
                page = 1;
            }
            const startTimetemp = Date.now();
            const { list, count } = await this.GameService.getGameRecordsForOtherTable(platformUid, page, pageSize, thirdUid, nid, uid, gameOrder, roundId, startTime, endTime);
            const endTimetemp = Date.now();
            return { code: 200, allLength: count, result: list, startTimetemp, endTimetemp };
        }
        catch (error) {
            this.logger.error(`查询游戏的游戏记录 :${error}`);
            return { code: 500, error: error };
        }
    }
    async findGameResultById(str) {
        console.log("findGameResultById", str);
        try {
            const { platformUid, rootAgent, gameOrder, createTimeDate, groupRemark } = str;
            if (!gameOrder && !createTimeDate) {
                return { code: 500, error: '请输入订单号和时间' };
            }
            const record = await this.GameService.findGameResultById(platformUid, rootAgent, gameOrder, createTimeDate, groupRemark);
            return { code: 200, record };
        }
        catch (error) {
            this.logger.error(`通过id查询游戏纪录信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async get_nid_scene(str) {
        console.log("get_nid_scene", str);
        try {
            const gamesList = await this.GameService.get_nid_scene();
            return { code: 200, gamesList };
        }
        catch (error) {
            this.logger.error(`获取游戏房间信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async update_nid_scene(str) {
        console.log("update_nid_scene", str);
        try {
            const data = str.data;
            const gamesList = await this.GameService.update_nid_scene(data);
            return { code: 200, gamesList };
        }
        catch (error) {
            this.logger.error(`修改游戏房间信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getControlPlanTwoInfo(str) {
        console.log("getControlPlanTwoInfo", str);
        try {
            const controlInfo = await this.GameService.getControlPlanTwoInfo();
            return { code: 200, controlInfo: controlInfo };
        }
        catch (error) {
            this.logger.error(`获取调控信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async updateControlPlanState(str) {
        console.log("updateControlPlanState", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const state = param.state;
            await this.GameService.updateControlPlanState(nid, sceneId, state);
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            this.logger.error(`更新调控信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getPersonalInfo(str) {
        console.log("getPersonalInfo", str);
        try {
            const personalInfo = await this.GameService.getPersonalInfo();
            return { code: 200, personalInfo };
        }
        catch (error) {
            this.logger.error(`获取个控信息 :${JSON.stringify(error)}`);
            return { code: 500, error: error };
        }
    }
    async setControlWeightValue(str) {
        console.log("setControlWeightValue", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const weights = param.weights;
            const managerId = param.managerId;
            const remark = param.remark;
            if (!nid || typeof sceneId !== 'number' || typeof weights !== 'number') {
                return { code: 500, error: '参数错误' };
            }
            await this.GameService.setControlWeightValue(nid, sceneId, weights, managerId, remark);
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            this.logger.error(`设置调控权重 :${error}`);
            return { code: 500, error: error };
        }
    }
    async addControlPlayer(str) {
        console.log("addControlPlayer", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const uid = param.uid;
            const probability = param.probability;
            const killCondition = param.killCondition;
            const managerId = param.managerId;
            const remark = param.remark;
            if (!nid || typeof sceneId !== 'number') {
                return { code: 500, error: '参数不正确' };
            }
            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }
            if (typeof probability !== 'number') {
                return { code: 500, error: '调控概率参数错误' };
            }
            if (typeof killCondition !== 'number') {
                return { code: 500, error: '必杀参数错误' };
            }
            await this.GameService.addControlPlayer(nid, sceneId, uid, probability, killCondition, managerId, remark);
            return { code: 200, msg: "添加调控玩家成功" };
        }
        catch (error) {
            this.logger.error(`添加调控玩家 :${error}`);
            return { code: 500, error: error };
        }
    }
    async removeControlPlayer(str) {
        console.log("removeControlPlayer", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const uid = param.uid;
            if (!nid || typeof sceneId !== 'number') {
                return { code: 500, error: '参数不正确' };
            }
            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }
            await this.GameService.removeControlPlayer(nid, sceneId, uid, str.manager);
            return { code: 200, msg: "移除调控玩家成功" };
        }
        catch (error) {
            this.logger.error(`移除调控玩家 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setBankerKill(str) {
        console.log("setBankerKill", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const managerId = param.managerId;
            const remark = param.remark;
            const bankerKillProbability = param.bankerKillProbability;
            if (!nid || typeof sceneId !== 'number') {
                this.logger.error('setBankerKill ==>', nid, sceneId);
                return { code: 500, error: '参数不正确' };
            }
            if (typeof bankerKillProbability !== 'number') {
                this.logger.error('setBankerKill ==>', bankerKillProbability);
                return { code: 500, error: '参数不正确' };
            }
            await this.GameService.setBankerKill(nid, sceneId, bankerKillProbability, managerId, remark);
            return { code: 200, msg: "设置庄杀成功" };
        }
        catch (error) {
            this.logger.error(`设置庄杀 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getControlPlayers(str) {
        console.log("getControlPlayers", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const controlPlayers = await this.GameService.getControlPlayers(nid, sceneId);
            return { code: 200, controlPlayers };
        }
        catch (error) {
            this.logger.error(`获取调控玩家 :${error}`);
            return { code: 500, error: error };
        }
    }
    async deleteAllControlPlayers(str) {
        console.log("deleteAllControlPlayers", str);
        try {
            await this.GameService.deleteAllControlPlayers(str.manager);
            return { code: 200, msg: '删除小黑屋' };
        }
        catch (error) {
            this.logger.error(`获取调控玩家 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getSlotWinLimitGamesList(str) {
        console.log("getSlotWinLimitConfig", str);
        try {
            const result = await this.GameService.getSlotWinLimitGamesList();
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`获取slot游戏兜底配置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getSlotWinLimitConfig(str) {
        console.log("getSlotWinLimitConfig", str);
        try {
            const nid = str.nid;
            const result = await this.GameService.getSlotWinLimitConfig(nid);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`获取slot游戏兜底配置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async updateSlotWinLimitConfig(str) {
        console.log("updateSlotWinLimitConfig", str);
        try {
            const param = str;
            const nid = param.nid;
            const updateFields = param.updateFields;
            if (!nid || Object.prototype.toString.call(updateFields) !== hallConst_1.BASE_TYPE.ARR) {
                return { code: 500, error: '参数错误' };
            }
            await this.GameService.updateSlotWinLimitConfig(nid, updateFields);
            return { code: 200, msg: '更新成功' };
        }
        catch (error) {
            this.logger.error(`更新兜底配成功 :${error}`);
            return { code: 500, error: error };
        }
    }
    async clear_bonus_pools_job_info(str) {
        console.log("clear_bonus_pools_job_info", str);
        try {
            const result = await this.GameService.clearBonusPoolsJobInfo();
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`获取清空奖池定时任务信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async set_clear_bonus_pools_job_info(str) {
        console.log("set_clear_bonus_pools_job_info", str);
        try {
            const param = str;
            const period = param.period;
            const start = param.start;
            const result = await this.GameService.setClearBonusPoolsJobInfo(period, start);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`设置清空奖池定时任务 :${error}`);
            return { code: 500, error: error };
        }
    }
    async clear_bonus_pools(str) {
        console.log("clear_bonus_pools", str);
        try {
            await this.GameService.clearBonusPools();
            return { code: 200, msg: "清空奖池成功" };
        }
        catch (error) {
            this.logger.error(`清空奖池 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setLockJackpot(str) {
        console.log("setLockJackpot", str);
        try {
            const param = str;
            const nid = param.nid;
            const sceneId = param.sceneId;
            const lockJackpot = param.lockJackpot;
            const remark = param.remark;
            await this.GameService.setLockJackpot(nid, sceneId, lockJackpot, param.manager, remark);
            return { code: 200, msg: "锁定奖池成功" };
        }
        catch (error) {
            this.logger.error(`锁定奖池 :${error}`);
            return { code: 500, error: error };
        }
    }
    async get_bonusPools_config_info(str) {
        console.log("get_bonusPools_config_info", str);
        try {
            const recordList = await this.GameService.getBonusPoolsConfigInfo();
            return { code: 200, recordList };
        }
        catch (error) {
            this.logger.error(`获取奖池配置信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async set_bonusPools_config_info(str) {
        console.log("set_bonusPools_config_info", str);
        try {
            const data = str;
            if (!data.hasOwnProperty('id'))
                return { code: 500, msg: '缺少id' };
            await this.GameService.setBonusPoolsConfigInfo(data);
            return { code: 200, msg: "修改成功" };
        }
        catch (error) {
            this.logger.error(`获取奖池配置信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getBlackHousePlayers(str) {
        console.log("getBlackHousePlayers", str);
        try {
            let page = str.page;
            const uid = str.uid;
            if (!page) {
                page = 1;
            }
            const { finaliyList, allLength } = await this.GameService.getBlackHousePlayers(uid, page);
            return { code: 200, finaliyList, allLength };
        }
        catch (error) {
            this.logger.error(`获取奖池配置信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getBlackPlayerControl(str) {
        console.log("getBlackPlayerControl", str);
        try {
            const uid = str.uid;
            const personalTotalControl = await this.GameService.getBlackPlayerControl(uid);
            return { code: 200, personalTotalControl };
        }
        catch (error) {
            this.logger.error(`根据传入的uid 来获取玩家的个控信息 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getNidRoom(str) {
        console.log("getNidRoom", str);
        try {
            const gamesList = await this.GameService.getNidRoom();
            return { code: 200, gamesList };
        }
        catch (error) {
            this.logger.error(`获取游戏房间信息:${error}`);
            return { code: 500, error: error };
        }
    }
    async getOneSceneControlWeight(str) {
        console.log("getOneSceneControlWeight", str);
        try {
            const { nid, sceneId } = str;
            if (!nid || typeof sceneId !== 'number') {
                return { code: 500, error: '参数不正确' };
            }
            const data = await this.GameService.getOneSceneControlWeight(nid, sceneId);
            return { code: 200, data };
        }
        catch (error) {
            this.logger.error(`获取游戏房间信息:${error}`);
            return { code: 500, error: error };
        }
    }
    async getOneGameControlInfo(str) {
        console.log("getOneGameControlInfo", str);
        try {
            const { nid } = str;
            if (!nid) {
                return { code: 500, error: '参数不正确' };
            }
            const oneGameSceneControlInfo = await this.GameService.getOneGameControlInfo(nid);
            return { code: 200, oneGameSceneControlInfo };
        }
        catch (error) {
            this.logger.error(`获取游戏房间信息:${error}`);
            return { code: 500, error: error };
        }
    }
    async getControlRecords(str) {
        console.log("getOneGameControlInfo", str);
        try {
            let { page, uid, nid, limit } = str;
            page = Number(page);
            limit = Number(limit);
            if (typeof page !== 'number' || typeof limit !== 'number') {
                return { code: 500, error: '参数错误' };
            }
            const where = {};
            if (uid) {
                where.uid = uid;
            }
            if (nid) {
                where.nid = nid;
            }
            const [records, count] = await this.GameService.getControlRecords(where, page, limit);
            return { code: 200, records, count };
        }
        catch (error) {
            this.logger.error(`获取调控记录:${error}`);
            return { code: 500, error: error };
        }
    }
    async addTotalControlPlayer(str) {
        console.log("addTotalControlPlayer", str);
        try {
            let { uid, probability, managerId, remark, killCondition } = str;
            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }
            if (!probability) {
                return { code: 500, error: '调控概率不能为零' };
            }
            if (!managerId && !remark) {
                return { code: 500, error: '备注不能为空' };
            }
            await this.GameService.addTotalControlPlayer(uid, probability, managerId, remark, killCondition);
            return { code: 200, msg: "添加成功" };
        }
        catch (error) {
            this.logger.error(`添加总控玩家:${error}`);
            return { code: 500, error: error };
        }
    }
    async deleteTotalControlPlayer(str) {
        console.log("deleteTotalControlPlayer", str);
        try {
            let { uid } = str;
            if (!uid) {
                return { code: 500, error: 'uid不能为空' };
            }
            await this.GameService.deleteTotalControlPlayer(uid, str.manager);
            return { code: 200, msg: "删除成功" };
        }
        catch (error) {
            this.logger.error(`删除总控玩家:${error}`);
            return { code: 500, error: error };
        }
    }
    async tenantControlBetKill(str) {
        try {
            let { tenant, bet } = str;
            if (!tenant || !bet) {
                return { code: 500, error: '数值不能为空' };
            }
            if (typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: 'bet必须为整数且大于零' };
            }
            if (!(await PlayerAgent_mysql_dao_1.default.findOne({ platformName: tenant }))) {
                return { code: 500, error: '平台不存在, 请输入正确的平台号' };
            }
            await TenantControl_manager_1.default.setBetKill(tenant, bet);
            const { list, count } = await TenantControl_manager_1.default.getBetKillList(1, 40);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`添加租户押注必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async tenantControlTotalBetKill(str) {
        try {
            let { tenant, odds } = str;
            if (!tenant || !odds) {
                return { code: 500, error: '数值不能为空' };
            }
            if (typeof odds !== 'number' || odds <= 0) {
                return { code: 500, error: 'oddsBet必须为整数且大于零' };
            }
            if (!(await PlayerAgent_mysql_dao_1.default.findOne({ platformName: tenant }))) {
                return { code: 500, error: '平台不存在, 请输入正确的平台号' };
            }
            await TenantControl_manager_1.default.setTotalBetKill(tenant, odds);
            const { list, count } = await TenantControl_manager_1.default.getTotalBetKillList(1, 40);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`添加租户打码必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async tenantControlAwardKill(str) {
        try {
            let { tenant, rate } = str;
            if (!tenant || !rate) {
                return { code: 500, error: '数值不能为空' };
            }
            if (typeof rate !== 'number' || rate <= 0) {
                return { code: 500, error: 'oddsBet必须为整数且大于零' };
            }
            if (!(await PlayerAgent_mysql_dao_1.default.findOne({ platformName: tenant }))) {
                return { code: 500, error: '平台不存在, 请输入正确的平台号' };
            }
            await TenantControl_manager_1.default.setAwardKill(tenant, rate);
            const { list, count } = await TenantControl_manager_1.default.getAwardKillList(1, 40);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`添加租户返奖率必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async removeTenantControlAwardKill(str) {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }
            await TenantControl_manager_1.default.removeAwardKill(tenant);
            const { count, list } = await TenantControl_manager_1.default.getAwardKillList(1, 40);
            return { code: 200, count, list };
        }
        catch (error) {
            this.logger.error(`删除租户返奖率必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async removeTenantControlTotalBetKill(str) {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }
            await TenantControl_manager_1.default.removeTotalBetKill(tenant);
            const { count, list } = await TenantControl_manager_1.default.getTotalBetKillList(1, 40);
            return { code: 200, count, list };
        }
        catch (error) {
            this.logger.error(`删除租户打码必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async removeTenantControlBetKill(str) {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }
            await TenantControl_manager_1.default.removeBetKill(tenant);
            const { count, list } = await TenantControl_manager_1.default.getBetKillList(1, 40);
            return { code: 200, count, list };
        }
        catch (error) {
            this.logger.error(`删除租户押注必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async getTenantControlBetKillList(str) {
        try {
            let { page, pageSize } = str;
            if (!page) {
                return { code: 500, error: '数值不能为空' };
            }
            if (typeof page !== 'number' || Math.floor(page) < 1) {
                return { code: 500, error: 'page数值不正确' };
            }
            const { count, list } = await TenantControl_manager_1.default.getBetKillList(Math.floor(page), pageSize);
            return { code: 200, count, list };
        }
        catch (error) {
            this.logger.error(`获取一页租户押注必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async getTenantControlTotalBetKillList(str) {
        try {
            let { page, pageSize } = str;
            if (!page) {
                return { code: 500, error: '数值不能为空' };
            }
            if (typeof page !== 'number' || Math.floor(page) < 1) {
                return { code: 500, error: 'page数值不正确' };
            }
            const { count, list } = await TenantControl_manager_1.default.getTotalBetKillList(Math.floor(page), pageSize);
            return { code: 200, count, list };
        }
        catch (error) {
            this.logger.error(`获取一页租户打码必杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async getTenantControlAwardKillList(str) {
        try {
            let { page, pageSize } = str;
            if (!page) {
                return { code: 500, error: '数值不能为空' };
            }
            if (typeof page !== 'number' || Math.floor(page) < 1) {
                return { code: 500, error: 'page数值不正确' };
            }
            const { count, list } = await TenantControl_manager_1.default.getAwardKillList(Math.floor(page), pageSize);
            return { code: 200, count, list };
        }
        catch (error) {
            this.logger.error(`获取一页租户返奖率杀失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async playerLoginHourData(str, session, response) {
        try {
            let { platformName, agentName, startTime, endTime, uid, thirdUid, managerAgent } = str;
            if (!startTime || !endTime) {
                return response.send({ code: 500, error: '时间按不存在' });
            }
            if (!platformName && !managerAgent) {
                return response.send({ code: 500, error: '请选择平台号' });
            }
            if (!platformName && managerAgent) {
                platformName = managerAgent;
            }
            const oneDay = 24 * 60 * 60 * 1000;
            const num = Math.ceil((endTime - startTime) / oneDay);
            if (num > 32) {
                return response.send({ code: 500, error: '导出时间请限制在一个月' });
            }
            const fileTime = await FileExportData_redis_dao_1.default.findOne({});
            if (fileTime) {
                return response.send({ code: 500, error: '系统正在导出文件，请稍后在进行导出操作' });
            }
            await FileExportData_redis_dao_1.default.insertOne({});
            const { address } = await this.GameService.gameRecordFileExprotData(platformName, agentName, startTime, endTime, uid, thirdUid);
            return response.download(address, (err) => {
                fs.unlinkSync(address);
                setTimeout(() => {
                    console.warn('删除导出时间键值', Date.now());
                    FileExportData_redis_dao_1.default.delete({});
                }, 1000 * 60);
            });
        }
        catch (error) {
            setTimeout(() => {
                FileExportData_redis_dao_1.default.delete({});
                console.warn('删除导出时间键值', Date.now());
            }, 1000 * 60);
            this.logger.error(`游戏数据导出功能 :${error}`);
            return response.send({ code: 500, error: error ? error : '获取失败' });
        }
    }
    async getTenantControlGame(str) {
        try {
            let { tenant } = str;
            if (!tenant) {
                return { code: 500, error: '数值不能为空' };
            }
            return { code: 200, result: await TenantControl_manager_1.default.findGameByTenantId(tenant) };
        }
        catch (error) {
            this.logger.error(`获取一个租户游戏场调控记录失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async removeTenantControlGameBySceneInfo(str) {
        try {
            let { tenant, nid, sceneId, manager } = str;
            if (!tenant || !nid || typeof sceneId !== "number") {
                return { code: 500, error: '数值不能为空' };
            }
            return { code: 200, result: await TenantControl_manager_1.default.removeGameBySceneInfo(tenant, nid, sceneId, manager) };
        }
        catch (error) {
            this.logger.error(`删除一个租户游戏场调控失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async SetTenantControlGameBySceneInfo(str) {
        try {
            let { tenant, nid, sceneId, probability, manager } = str;
            if (!tenant || !nid || typeof sceneId !== "number" || typeof probability !== "number") {
                return { code: 500, error: '数值不能为空' };
            }
            if (probability > 100 || probability < -100) {
                return { code: 500, error: 'probability的取值范围为 -100 - 100' };
            }
            return { code: 200, result: await TenantControl_manager_1.default.setGameBySceneInfo(tenant, nid, sceneId, probability, manager) };
        }
        catch (error) {
            this.logger.error(`设置一个租户游戏场调控失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async getTenantControlGameByNid(str) {
        try {
            let { tenant, nid } = str;
            if (!tenant || !nid) {
                return { code: 500, error: '数值不能为空' };
            }
            return { code: 200, result: await TenantControl_manager_1.default.findGameByNid(tenant, nid) };
        }
        catch (error) {
            this.logger.error(`获取租户游戏调控单个游戏的所有场调控失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async getSceneByNid(str) {
        try {
            let { nid } = str;
            if (!nid) {
                return { code: 500, error: '数值不能为空' };
            }
            return { code: 200, result: await Scene_manager_1.default.findList({ nid }) };
        }
        catch (error) {
            this.logger.error(`获取该游戏下所有的场失败: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async GameLoginStatistics(str) {
        try {
            let { startTime, endTime } = str;
            if (!startTime || !endTime) {
                return { code: 500, error: '时间不能为空' };
            }
            if (endTime < startTime) {
                return { code: 500, error: '结束时间不能小于开始时间' };
            }
            const oneDay = 24 * 60 * 60 * 1000;
            const num = Math.ceil((endTime - startTime) / oneDay);
            if (num > 31) {
                return { code: 500, error: '查询时间范围请不要超过一个月' };
            }
            const result = await this.GameService.GameLoginStatistics(startTime, endTime);
            return { code: 200, result: result };
        }
        catch (error) {
            this.logger.error(`获取进入游戏统计: ${error.stack}`);
            return { code: 500, error: error };
        }
    }
    async getAllPlatformData(str) {
        const { month } = str;
        if (!!month) {
            if (month.toString().includes('.')) {
                return { code: 500, error: '月份不能为小数点' };
            }
            if (month < 1 || month > 12) {
                return { code: 500, error: '月份传入错误' };
            }
        }
        try {
            const result = await backendControlService_1.BackendControlService.getAllPlatformData(month - 1);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`获取所有平台数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async getPlatformData(str) {
        const { platformId, startTime, endTime, tenantId } = str;
        if (!platformId || typeof platformId !== 'string') {
            return { code: 500, error: '请输入正确的平台id' };
        }
        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }
        try {
            const result = !tenantId ? await backendControlService_1.BackendControlService.getPlatformData(platformId, startTime, endTime) :
                await backendControlService_1.BackendControlService.getPlatformTenantData(platformId, tenantId, startTime, endTime);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`获取单个平台数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async getTenantData(str) {
        const { platformId, startTime, endTime, tenantId } = str;
        if (!platformId || typeof platformId !== 'string' || !tenantId || typeof tenantId !== 'string') {
            return { code: 500, error: '请输入正确的id' };
        }
        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }
        try {
            const result = await backendControlService_1.BackendControlService.getPlatformTenantData(platformId, tenantId, startTime, endTime);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`获取单个租户数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async getPlatformGameData(str) {
        const { platformId, nid, startTime, endTime, tenantId } = str;
        if (!platformId || typeof platformId !== 'string') {
            return { code: 500, error: '请输入正确的平台id' };
        }
        if (!nid || typeof nid !== 'string') {
            return { code: 500, error: '请输入正确的游戏nid' };
        }
        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }
        try {
            const result = !tenantId ? await backendControlService_1.BackendControlService.getPlatformGameData(platformId, nid, startTime, endTime) :
                await backendControlService_1.BackendControlService.getTenantGameData(platformId, tenantId, nid, startTime, endTime);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`获取单个平台数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async getTenantGameData(str) {
        const { platformId, tenantId, nid, startTime, endTime } = str;
        if (!platformId || typeof platformId !== 'string' || !tenantId || typeof tenantId !== 'string') {
            return { code: 500, error: '请输入正确的id' };
        }
        if (!nid || typeof nid !== 'string') {
            return { code: 500, error: '请输入正确的游戏nid' };
        }
        if ((!!startTime && !!endTime) && (typeof startTime !== 'number' || typeof endTime !== "number")) {
            return { code: 500, error: '请输入正确的时间区间' };
        }
        try {
            const result = await backendControlService_1.BackendControlService.getTenantGameData(platformId, tenantId, nid, startTime, endTime);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`获取单个租户游戏数据出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async setPlatformControl(str) {
        const { platformId, nid, killRate, manager, tenantId } = str;
        if (typeof killRate !== 'number' || typeof platformId !== 'string') {
            return { code: 500, error: '数值不正确' };
        }
        if (!!nid && !(await Game_manager_1.default.findOne({ nid }))) {
            return { code: 500, error: '没有改nid的游戏' };
        }
        if (killRate < 0) {
            return { code: 500, error: '杀率不能小于0' };
        }
        if (killRate > 50) {
            return { code: 500, error: '杀率不能大于50' };
        }
        try {
            const result = !tenantId ? await backendControlService_1.BackendControlService.setPlatformControl(platformId, Number(killRate.toFixed(2)), manager, nid) :
                await backendControlService_1.BackendControlService.setTenantControl(platformId, tenantId, Number(killRate.toFixed(2)), manager, nid);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`设置平台调控出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async setTenantControl(str) {
        const { platformId, tenantId, nid, killRate, manager } = str;
        if (typeof killRate !== 'number' || typeof platformId !== 'string' || typeof tenantId !== 'string') {
            return { code: 500, error: '数值不正确' };
        }
        if (!!nid && !(await Game_manager_1.default.findOne({ nid }))) {
            return { code: 500, error: '没有改nid的游戏' };
        }
        if (killRate < 0) {
            return { code: 500, error: '杀率不能小于0' };
        }
        if (killRate > 50) {
            return { code: 500, error: '杀率不能大于50' };
        }
        try {
            const result = await backendControlService_1.BackendControlService.setTenantControl(platformId, tenantId, Number(killRate.toFixed(2)), manager, nid);
            return { code: 200, result };
        }
        catch (e) {
            this.logger.error(`设置平台调控出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async getTenantRoomSituation(str) {
        try {
            const result = await this.GameService.getTenantRoomSituation();
            const data = await pinus_1.pinus.app.rpc.robot.mainRemote.NpcStatus.toServer('*');
            return { code: 200, result, data };
        }
        catch (e) {
            this.logger.error(`获取平台调控出错: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async setPlatformNPC(str) {
        try {
            const { nidList, twoStrategy } = str;
            const data = await pinus_1.pinus.app.rpc.robot.mainRemote.NpcStart.toServer('*', nidList, twoStrategy);
            return { code: 200, data };
        }
        catch (e) {
            this.logger.error(`setPlatformNPC: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
    async getSessionCount(str) {
        try {
            const gateServers = pinus_1.pinus.app.getServersByType('gate');
            const connectorServers = pinus_1.pinus.app.getServersByType('connector');
            const gate = {};
            const connector = {};
            await Promise.all(gateServers.map(async (s) => {
                gate[s.id] = await pinus_1.pinus.app.rpc.gate.chatRemote.getSessionsCount.toServer(s.id, {});
            }));
            await Promise.all(connectorServers.map(async (s) => {
                connector[s.id] = await pinus_1.pinus.app.rpc.connector.enterRemote.getSessionsCount.toServer(s.id, {});
            }));
            return { code: 200, data: { gate, connector } };
        }
        catch (e) {
            this.logger.error(`getSessionCount: ${e.stack}`);
            return { code: 500, error: e };
        }
    }
};
__decorate([
    (0, common_1.Post)('getAllGames'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getAllGames", null);
__decorate([
    (0, common_1.Post)('getCloseGamesAndOpen'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getOpenGameAndClose", null);
__decorate([
    (0, common_1.Post)('setOneGameClose'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setOneGameClose", null);
__decorate([
    (0, common_1.Post)('setSystemTypeForNid'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setSystemTypeForNid", null);
__decorate([
    (0, common_1.Post)('getSystemType'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getSystemType", null);
__decorate([
    (0, common_1.Post)('getGameRecords'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameRecords", null);
__decorate([
    (0, common_1.Post)('findGameResultById'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "findGameResultById", null);
__decorate([
    (0, common_1.Post)('get_nid_scene'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "get_nid_scene", null);
__decorate([
    (0, common_1.Post)('update_nid_scene'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "update_nid_scene", null);
__decorate([
    (0, common_1.Post)('getControlPlanTwoInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getControlPlanTwoInfo", null);
__decorate([
    (0, common_1.Post)('updateControlPlanState'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "updateControlPlanState", null);
__decorate([
    (0, common_1.Post)('getPersonalInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPersonalInfo", null);
__decorate([
    (0, common_1.Post)('setControlWeightValue'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setControlWeightValue", null);
__decorate([
    (0, common_1.Post)('addControlPlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "addControlPlayer", null);
__decorate([
    (0, common_1.Post)('removeControlPlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "removeControlPlayer", null);
__decorate([
    (0, common_1.Post)('setBankerKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setBankerKill", null);
__decorate([
    (0, common_1.Post)('getControlPlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getControlPlayers", null);
__decorate([
    (0, common_1.Post)('deleteAllControlPlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "deleteAllControlPlayers", null);
__decorate([
    (0, common_1.Post)('getSlotWinLimitGamesList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getSlotWinLimitGamesList", null);
__decorate([
    (0, common_1.Post)('getSlotWinLimitConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getSlotWinLimitConfig", null);
__decorate([
    (0, common_1.Post)('updateSlotWinLimitConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "updateSlotWinLimitConfig", null);
__decorate([
    (0, common_1.Post)('clear_bonus_pools_job_info'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "clear_bonus_pools_job_info", null);
__decorate([
    (0, common_1.Post)('set_clear_bonus_pools_job_info'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "set_clear_bonus_pools_job_info", null);
__decorate([
    (0, common_1.Post)('clear_bonus_pools'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "clear_bonus_pools", null);
__decorate([
    (0, common_1.Post)('setLockJackpot'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setLockJackpot", null);
__decorate([
    (0, common_1.Post)('get_bonusPools_config_info'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "get_bonusPools_config_info", null);
__decorate([
    (0, common_1.Post)('set_bonusPools_config_info'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "set_bonusPools_config_info", null);
__decorate([
    (0, common_1.Post)('getBlackHousePlayers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getBlackHousePlayers", null);
__decorate([
    (0, common_1.Post)('getBlackPlayerControl'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getBlackPlayerControl", null);
__decorate([
    (0, common_1.Post)('getNidRoom'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getNidRoom", null);
__decorate([
    (0, common_1.Post)('getOneSceneControlWeight'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getOneSceneControlWeight", null);
__decorate([
    (0, common_1.Post)('getOneGameControlInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getOneGameControlInfo", null);
__decorate([
    (0, common_1.Post)('getControlRecords'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getControlRecords", null);
__decorate([
    (0, common_1.Post)('addTotalControlPlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "addTotalControlPlayer", null);
__decorate([
    (0, common_1.Post)('deleteTotalControlPlayer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "deleteTotalControlPlayer", null);
__decorate([
    (0, common_1.Post)('addTenantControlBetKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "tenantControlBetKill", null);
__decorate([
    (0, common_1.Post)('addTenantControlTotalBetKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "tenantControlTotalBetKill", null);
__decorate([
    (0, common_1.Post)('addTenantControlAwardKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "tenantControlAwardKill", null);
__decorate([
    (0, common_1.Post)('removeTenantControlAwardKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "removeTenantControlAwardKill", null);
__decorate([
    (0, common_1.Post)('removeTenantControlTotalBetKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "removeTenantControlTotalBetKill", null);
__decorate([
    (0, common_1.Post)('removeTenantControlBetKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "removeTenantControlBetKill", null);
__decorate([
    (0, common_1.Post)('TenantControlBetKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantControlBetKillList", null);
__decorate([
    (0, common_1.Post)('TenantControlTotalBetKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantControlTotalBetKillList", null);
__decorate([
    (0, common_1.Post)('TenantControlAwardKill'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantControlAwardKillList", null);
__decorate([
    (0, common_1.Post)('gameRecordFileExprotData'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "playerLoginHourData", null);
__decorate([
    (0, common_1.Post)('TenantControlGame'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantControlGame", null);
__decorate([
    (0, common_1.Post)('removeTenantControlGameBySceneInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "removeTenantControlGameBySceneInfo", null);
__decorate([
    (0, common_1.Post)('setTenantControlGameBySceneInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "SetTenantControlGameBySceneInfo", null);
__decorate([
    (0, common_1.Post)('getTenantControlGameByNid'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantControlGameByNid", null);
__decorate([
    (0, common_1.Post)('scenesByNid'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getSceneByNid", null);
__decorate([
    (0, common_1.Post)('GameLoginStatistics'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "GameLoginStatistics", null);
__decorate([
    (0, common_1.Post)('getAllPlatformData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getAllPlatformData", null);
__decorate([
    (0, common_1.Post)('getPlatformData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPlatformData", null);
__decorate([
    (0, common_1.Post)('getTenantData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantData", null);
__decorate([
    (0, common_1.Post)('getPlatformGameData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPlatformGameData", null);
__decorate([
    (0, common_1.Post)('getTenantGameData'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantGameData", null);
__decorate([
    (0, common_1.Post)('setPlatformControl'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setPlatformControl", null);
__decorate([
    (0, common_1.Post)('setTenantControl'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setTenantControl", null);
__decorate([
    (0, common_1.Post)('getTenantRoomSituation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getTenantRoomSituation", null);
__decorate([
    (0, common_1.Post)('setPlatformNPC'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "setPlatformNPC", null);
__decorate([
    (0, common_1.Post)('getSessionCount'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getSessionCount", null);
GameController = __decorate([
    (0, common_1.Controller)('game'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
exports.GameController = GameController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL3N5c3RlbS9nYW1lLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQWlGO0FBRWpGLGlEQUE2QztBQUM3QywrQ0FBeUM7QUFDekMscURBQWlEO0FBQ2pELCtEQUE0RDtBQUM1RCxzR0FBOEY7QUFDOUYsc0ZBQWlGO0FBQ2pGLG9GQUErRTtBQUMvRSxpR0FBd0Y7QUFDeEYsdUdBQWdHO0FBQ2hHLHlCQUF5QjtBQUN6QixvR0FBaUc7QUFDakcsaUNBQThCO0FBTzlCLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUFFdkIsWUFBNkIsV0FBd0I7UUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFPRCxLQUFLLENBQUMsV0FBVyxDQUFTLEdBQVE7UUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDL0IsSUFBSTtZQUNBLE9BQU8sTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQy9DO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDekMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFBO1NBQ3JDO0lBQ0wsQ0FBQztJQVFELEtBQUssQ0FBQyxtQkFBbUIsQ0FBUyxHQUFRO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUE7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