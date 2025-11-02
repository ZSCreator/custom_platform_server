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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const system_service_1 = require("./system.service");
const pinus_logger_1 = require("pinus-logger");
const token_guard_1 = require("../main/token.guard");
const moment = require("moment");
let SystemController = class SystemController {
    constructor(SystemService) {
        this.SystemService = SystemService;
        this.logger = (0, pinus_logger_1.getLogger)('thirdHttp', __filename);
    }
    async getSystemConfig(str) {
        console.log("getSystemConfig", str);
        try {
            const result = await this.SystemService.getSystemConfig();
            return result;
        }
        catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async changeSystemConfig(str) {
        console.log("getSystemConfig", str);
        try {
            const data = str.data;
            const result = await this.SystemService.changeSystemConfig(data);
            return result;
        }
        catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getUnlimitedList(str) {
        console.log("getUnlimitedList", str);
        try {
            const result = await this.SystemService.getUnlimitedList();
            return result;
        }
        catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setUnlimitedList(str) {
        console.log("setUnlimitedList", str);
        try {
            let { id, openUnlimited, iplRebate, unlimitedList } = str;
            if (!id) {
                return { code: 500, error: "id 不存在" };
            }
            if (openUnlimited == true && unlimitedList.length == 0) {
                return { code: 500, error: "无线代不能为空" };
            }
            if (!iplRebate) {
                return { code: 500, error: " IPL参数不存在" };
            }
            const result = await this.SystemService.setUnlimitedList(id, openUnlimited, unlimitedList, iplRebate);
            return result;
        }
        catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async PostMails(str) {
        try {
            const param = str;
            const uid = param.uid;
            const mail = param.mail;
            const sender = param.sender ? param.sender : 'system';
            if (!uid) {
                return { code: 500, error: "请输入玩家id" };
            }
            const result = await this.SystemService.PostMails(uid, mail, sender);
            return result;
        }
        catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async selectPlayerMails(str) {
        try {
            const param = str;
            const uid = param.uid;
            let page = param.page;
            if (!uid) {
                return { code: 500, error: "请输入玩家id进行查询" };
            }
            page = page ? page : 1;
            const { list, count } = await this.SystemService.selectPlayerMails(uid, page);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`获取系统设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getSystemAnnouncement(str) {
        console.log("getSystemConfig", str);
        try {
            const { list, count } = await this.SystemService.getSystemAnnouncement();
            return { code: 200, list, length: count };
        }
        catch (error) {
            this.logger.error(`获取网站活动的内容 :${error}`);
            return { code: 500, error: error };
        }
    }
    async updateAnnouncement(str) {
        try {
            console.log('updateAnnouncement', str.param);
            const param = str;
            const content = param.content;
            const sort = param.sort;
            const title = param.title;
            const openType = param.openType;
            const id = param.id;
            await this.SystemService.changeAndSaveAnnouncement(id, content, openType, sort, title);
            return { code: 200, msg: "网站活动设置成功" };
        }
        catch (error) {
            this.logger.error(`获取网站活动的内容 :${error}`);
            return { code: 500, error: error };
        }
    }
    async deleteUpdateAnnouncement(str) {
        try {
            console.log('deleteUpdateAnnouncement', str);
            const param = str;
            const id = param.id;
            await this.SystemService.deleteUpdateAnnouncement(id);
            return { code: 200, msg: "删除公告" };
        }
        catch (error) {
            this.logger.error(`删除公告 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getAllActivityInfo(str) {
        try {
            console.log('getAllActivityInfo', str.param);
            const result = await this.SystemService.getAllActivityInfo();
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`获取所有的功能性活动 :${error}`);
            return { code: 500, error: error };
        }
    }
    async saveOrUpdateActivityInfo(str) {
        try {
            console.log('saveOrUpdateActivityInfo', str.param);
            const param = str.param;
            const type = param.type;
            const remark = param.remark;
            const title = param.title;
            const sort = param.sort;
            const contentImg = param.contentImg;
            const isLeading = param.isLeading;
            const isOpen = param.isOpen;
            const _id = param._id;
            const result = await this.SystemService.saveOrUpdateActivityInfo(type, remark, title, sort, contentImg, isLeading, isOpen, _id);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`添加或更新一条活动配置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async deleteActivityInfo(str) {
        try {
            console.log('deleteActivityInfo', str.param);
            const param = str.param;
            const _id = param._id;
            await this.SystemService.deleteActivityInfo(_id);
            return { code: 200, msg: "删除成功" };
        }
        catch (error) {
            this.logger.error(`删除一条活动配置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setAlarmEventThing(str) {
        try {
            console.warn('getPlatformAgentDatDayRecord', str);
            const { inputGoldThan, winGoldThan, winAddRmb } = str;
            await this.SystemService.setAlarmEventThing(inputGoldThan, winGoldThan, winAddRmb);
            return { code: 200, msg: '保存成功' };
        }
        catch (error) {
            this.logger.error(`设置报警事件的设置 :${error}`);
            return { code: 500, error: "保存失败" };
        }
    }
    async getAlarmEventThing(str) {
        try {
            console.log('getAlarmEventThing', str.param);
            const param = str;
            const { inputGoldThan, winGoldThan, winAddRmb } = await this.SystemService.getAlarmEventThing();
            return { code: 200, inputGoldThan, winGoldThan, winAddRmb };
        }
        catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async getAlarmEventThingRecord(str) {
        try {
            console.log('getAlarmEventThingRecord', str);
            let { status, page, startTime, endTime, pageSize } = str;
            if (!status.toString() || !pageSize || !page) {
                return { code: 500, error: "参数不完整" };
            }
            const result = await this.SystemService.getAlarmEventThingRecord(page, status, startTime, endTime, pageSize);
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: error };
        }
    }
    async setAlarmEventThingRecord(str, session) {
        try {
            console.log('setAlarmEventThingRecord', str.param);
            let { id, status, managerId } = str;
            await this.SystemService.setAlarmEventThingRecord(id, status, managerId);
            return { code: 200, msg: '处理成功' };
        }
        catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: '处理失败' };
        }
    }
    async setAlarmEventThingList(str, session) {
        try {
            console.log('setAlarmEventThingRecord', str.param);
            let { managerId } = str;
            await this.SystemService.setAlarmEventThingList(managerId);
            return { code: 200, msg: '处理成功' };
        }
        catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: '处理失败' };
        }
    }
    async remindOnlineAndAlarm(str, session) {
        try {
            console.log('remindOnlineAndAlarm', str.param);
            const { allOnlineUid, length, waitingForReview } = await this.SystemService.remindOnlineAndAlarm();
            return { code: 200, allOnlineUid, length, waitingForReview };
        }
        catch (error) {
            this.logger.error(`获取报警事件的设置 :${error}`);
            return { code: 500, error: '处理成功' };
        }
    }
    async getGameCommissionList(str, session) {
        try {
            console.log('getGameCommissionList', str.param);
            const { games, GameCommissionList } = await this.SystemService.getGameCommissionList();
            return { code: 200, games, GameCommissionList };
        }
        catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理成功' };
        }
    }
    async addOneGameCommissionList(str, session) {
        try {
            console.log('getGameCommissionList', str);
            let { nid, way, targetCharacter, bet, win, settle, open } = str;
            if (!nid) {
                return { code: 500, error: 'nid 数据传入错误' };
            }
            open = open ? true : false;
            await this.SystemService.addOneGameCommissionList(nid, way, targetCharacter, bet, win, settle, open);
            return { code: 200, msg: "添加成功" };
        }
        catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理失败' };
        }
    }
    async updateOneGameCommissionList(str, session) {
        try {
            console.log('updateOneGameCommissionList', str);
            let { nid, way, targetCharacter, bet, win, settle, open } = str;
            if (!nid) {
                return { code: 500, error: 'nid 数据传入错误' };
            }
            await this.SystemService.updateOneGameCommissionList(nid, way, targetCharacter, bet, win, settle, open);
            return { code: 200, msg: "处理成功" };
        }
        catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理失败' };
        }
    }
    async deleteOneGameCommissionList(str, session) {
        try {
            console.log('deleteOneGameCommissionList', str);
            let { nid } = str;
            if (!nid) {
                return { code: 500, error: 'nid 数据传入错误' };
            }
            await this.SystemService.deleteOneGameCommissionList(nid);
            return { code: 200, msg: "处理成功" };
        }
        catch (error) {
            this.logger.error(`获取抽水设置 :${error}`);
            return { code: 500, error: '处理失败' };
        }
    }
    async getWebLogs(str, session) {
        try {
            console.log('getWebLogs', str);
            let { uid, scene, createTime, page, level } = str;
            const { list, length } = await this.SystemService.getWebLogs(scene, uid, createTime, level, page);
            return { code: 200, list, length };
        }
        catch (error) {
            this.logger.error(`获取前端的系统日志 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async getAllWhiteIp(str, session) {
        try {
            console.log('getAllWhiteIp', str);
            let { page, pageSize, account } = str;
            page = page ? page : 1;
            pageSize = pageSize ? pageSize : 20;
            if (account) {
                const { list, count } = await this.SystemService.selectWhiteIp(account);
                return { code: 200, list, length: count };
            }
            else {
                const { list, count } = await this.SystemService.getAllWhiteIp(page, pageSize);
                return { code: 200, list, length: count };
            }
        }
        catch (error) {
            this.logger.error(`获取所有的白名单 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async getWhiteIpFromUserName(str, session) {
        try {
            console.log('getAllWhiteIp', str);
            let { page, pageSize, manager } = str;
            if (!manager) {
                return { code: 500, error: '后台账户信息错误' };
            }
            page = page ? page : 1;
            pageSize = pageSize ? pageSize : 20;
            const { list, count } = await this.SystemService.getWhiteIpFromUserName(page, pageSize, manager);
            return { code: 200, list, length: count };
        }
        catch (error) {
            this.logger.error(`获取所有的白名单 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async addWhiteIp(str, session) {
        try {
            console.log('addWhiteIp', str);
            let { ip, account, message, manager } = str;
            if (!ip || !account) {
                return { code: 500, error: '请输入ip和账号' };
            }
            await this.SystemService.addWhiteIp(ip, account, message, manager);
            return { code: 200, };
        }
        catch (error) {
            this.logger.error(`新增一个白名单 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async updateWhiteIp(str, session) {
        try {
            console.log('addWhiteIp', str);
            let { id, ip, account, message, } = str;
            if (!id) {
                return { code: 500, error: '请输入ip和账号' };
            }
            await this.SystemService.updateWhiteIp(id, ip, account, message);
            return { code: 200, };
        }
        catch (error) {
            this.logger.error(`新增一个白名单 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async deleteWhiteIp(str, session) {
        try {
            console.log('deleteWhiteIp', str);
            let { id } = str;
            if (!id) {
                return { code: 500, error: '请输入ip' };
            }
            await this.SystemService.deleteWhiteIp(id);
            return { code: 200, };
        }
        catch (error) {
            this.logger.error(`删除一个白名单 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async gameLoginData(str, session) {
        try {
            console.log('gameLoginData', str);
            const { result, createLength, loginLength, onlineLength, maxOnline } = await this.SystemService.gameLoginData();
            const data = {
                gold: result ? result.gold : 0,
                entryGold: result ? result.addDayRmb : 0,
                leaveGold: result ? result.addDayTixian : 0,
                createLength,
                loginLength,
                onlineLength,
                maxOnline,
            };
            return { code: 200, data };
        }
        catch (error) {
            this.logger.error(`游戏登陆报表 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async playerLoginHourData(str, session) {
        try {
            console.log('playerLoginHourData', str);
            const result = await this.SystemService.playerLoginHourData();
            return { code: 200, result };
        }
        catch (error) {
            this.logger.error(`游戏登陆报表 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async dayApiData(str, session) {
        try {
            console.log('dayApiData', str);
            const { startTime, endTime } = str;
            if (!startTime || !endTime) {
                const { result, createLength, loginLength, maxOnline } = await this.SystemService.gameLoginData();
                const data = {
                    selfGold: result ? Number(result.gold) : 0,
                    entryGold: result ? Number(result.addDayRmb) : 0,
                    leaveGold: result ? Number(result.addDayTixian) : 0,
                    createLength,
                    loginLength,
                    maxOnline: Number(maxOnline),
                    entryAndLeave: Number(result.addDayRmb) - Number(result.addDayTixian),
                    createDate: moment().format("YYYY-MM-DD HH:mm:ss")
                };
                let list = [];
                list.push(data);
                return { code: 200, list, count: 1 };
            }
            const { list, count } = await this.SystemService.dayApiData(startTime, endTime);
            return { code: 200, list, count };
        }
        catch (error) {
            this.logger.error(`获取平台相关数据 :${error}`);
            return { code: 500, error: '获取失败' };
        }
    }
    async postSystemNotice({ content, postNum, postTime }) {
        try {
            let time = postTime * 1000;
            for (let num = 0; num < postNum; num++) {
                setTimeout(() => {
                    this.SystemService.postSystemNotice(content);
                }, time);
            }
            return { code: 200, msg: "发送成功" };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async closeApiLogin({ isCloseApi, id, apiTestAgent }) {
        try {
            await this.SystemService.closeApiLogin(isCloseApi, id, apiTestAgent);
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async closeGameApi({ nidList, id }) {
        try {
            await this.SystemService.closeGameApi(nidList, id);
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async getCloseApiData() {
        try {
            const { gameList, id, closeNid, isCloseApi, apiTestAgent } = await this.SystemService.getCloseApiData();
            return { code: 200, gameList, id, closeNid, isCloseApi, apiTestAgent };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async kickAllPlayer() {
        try {
            await this.SystemService.kickAllPlayer();
            return { code: 200 };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async setBlackIp(str) {
        try {
            const { manager, ip } = str;
            await this.SystemService.setBlackIp(manager, ip);
            return { code: 200 };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async getAllBlackIp(str) {
        try {
            const list = await this.SystemService.getAllBlackIp();
            return { code: 200, list };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async deleteBlackIp(str) {
        try {
            const { ip } = str;
            if (!ip) {
                await this.SystemService.deleteAllBlackIp();
            }
            else {
                await this.SystemService.deleteBlackIp(ip);
            }
            return { code: 200 };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
    async getSystemManagerLogs(str) {
        try {
            const { ip, userName, startTime, endTime, page } = str;
            const result = await this.SystemService.getSystemManagerLogs(ip, userName, startTime, endTime, page);
            return { code: 200, result };
        }
        catch (error) {
            return { code: 500, error };
        }
    }
};
__decorate([
    (0, common_1.Post)('getSystemConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemConfig", null);
__decorate([
    (0, common_1.Post)('changeSystemConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "changeSystemConfig", null);
__decorate([
    (0, common_1.Post)('getUnlimitedList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getUnlimitedList", null);
__decorate([
    (0, common_1.Post)('setUnlimitedList'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "setUnlimitedList", null);
__decorate([
    (0, common_1.Post)('PostMails'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "PostMails", null);
__decorate([
    (0, common_1.Post)('selectPlayerMails'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "selectPlayerMails", null);
__decorate([
    (0, common_1.Post)('getSystemAnnouncement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemAnnouncement", null);
__decorate([
    (0, common_1.Post)('updateAnnouncement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateAnnouncement", null);
__decorate([
    (0, common_1.Post)('deleteUpdateAnnouncement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "deleteUpdateAnnouncement", null);
__decorate([
    (0, common_1.Post)('getAllActivityInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getAllActivityInfo", null);
__decorate([
    (0, common_1.Post)('saveOrUpdateActivityInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "saveOrUpdateActivityInfo", null);
__decorate([
    (0, common_1.Post)('deleteActivityInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "deleteActivityInfo", null);
__decorate([
    (0, common_1.Post)('setAlarmEventThing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "setAlarmEventThing", null);
__decorate([
    (0, common_1.Post)('getAlarmEventThing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getAlarmEventThing", null);
__decorate([
    (0, common_1.Post)('getAlarmEventThingRecord'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getAlarmEventThingRecord", null);
__decorate([
    (0, common_1.Post)('setAlarmEventThingRecord'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "setAlarmEventThingRecord", null);
__decorate([
    (0, common_1.Post)('setAlarmEventThingList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "setAlarmEventThingList", null);
__decorate([
    (0, common_1.Post)('remindOnlineAndAlarm'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "remindOnlineAndAlarm", null);
__decorate([
    (0, common_1.Post)('getGameCommissionList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getGameCommissionList", null);
__decorate([
    (0, common_1.Post)('addOneGameCommissionList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "addOneGameCommissionList", null);
__decorate([
    (0, common_1.Post)('updateOneGameCommissionList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateOneGameCommissionList", null);
__decorate([
    (0, common_1.Post)('deleteOneGameCommissionList'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "deleteOneGameCommissionList", null);
__decorate([
    (0, common_1.Post)('getWebLogs'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getWebLogs", null);
__decorate([
    (0, common_1.Post)('getAllWhiteIp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getAllWhiteIp", null);
__decorate([
    (0, common_1.Post)('getWhiteIpFromUserName'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getWhiteIpFromUserName", null);
__decorate([
    (0, common_1.Post)('addWhiteIp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "addWhiteIp", null);
__decorate([
    (0, common_1.Post)('updateWhiteIp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "updateWhiteIp", null);
__decorate([
    (0, common_1.Post)('deleteWhiteIp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "deleteWhiteIp", null);
__decorate([
    (0, common_1.Post)('gameLoginData'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "gameLoginData", null);
__decorate([
    (0, common_1.Post)('playerLoginHourData'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "playerLoginHourData", null);
__decorate([
    (0, common_1.Post)('dayApiData'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Session)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "dayApiData", null);
__decorate([
    (0, common_1.Post)('postSystemNotice'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "postSystemNotice", null);
__decorate([
    (0, common_1.Post)('closeApiLogin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "closeApiLogin", null);
__decorate([
    (0, common_1.Post)('closeGameApi'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "closeGameApi", null);
__decorate([
    (0, common_1.Post)('getCloseApiData'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getCloseApiData", null);
__decorate([
    (0, common_1.Post)('kickAllPlayer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "kickAllPlayer", null);
__decorate([
    (0, common_1.Post)('setBlackIp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "setBlackIp", null);
__decorate([
    (0, common_1.Post)('getAllBlackIp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getAllBlackIp", null);
__decorate([
    (0, common_1.Post)('deleteBlackIp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "deleteBlackIp", null);
__decorate([
    (0, common_1.Post)('getSystemManagerLogs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "getSystemManagerLogs", null);
SystemController = __decorate([
    (0, common_1.Controller)('system'),
    (0, common_1.UseGuards)(token_guard_1.TokenGuard),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
exports.SystemController = SystemController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvc3lzdGVtL3N5c3RlbS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDJDQUFpRjtBQUNqRixxREFBaUQ7QUFDakQsK0NBQXlDO0FBRXpDLHFEQUFpRDtBQUNqRCxpQ0FBaUM7QUFPakMsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFFekIsWUFBNkIsYUFBNEI7UUFBNUIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFPRCxLQUFLLENBQUMsZUFBZSxDQUFTLEdBQVE7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNuQyxJQUFJO1lBQ0EsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzFELE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFBO1NBQ3JDO0lBRUwsQ0FBQztJQVFELEtBQUssQ0FBQyxrQkFBa0IsQ0FBUyxHQUFRO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbkMsSUFBSTtZQUVBLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDdEIsTUFBTSxN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