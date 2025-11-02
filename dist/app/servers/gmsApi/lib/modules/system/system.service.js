"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const ActivityMongoManager = require("../../../../../common/dao/mongoDB/ActivityInfoDao");
const MailService = require("../../../../../services/MailService");
const pinus_logger_1 = require("pinus-logger");
const GameCommission_manager_1 = require("../../../../../common/dao/daoManager/GameCommission.manager");
const Game_manager_1 = require("../../../../../common/dao/daoManager/Game.manager");
const Player_manager_1 = require("../../../../../common/dao/daoManager/Player.manager");
const OnlinePlayer_redis_dao_1 = require("../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const DayCreatePlayer_redis_dao_1 = require("../../../../../common/dao/redis/DayCreatePlayer.redis.dao");
const DayLoginPlayer_redis_dao_1 = require("../../../../../common/dao/redis/DayLoginPlayer.redis.dao");
const SystemConfig_manager_1 = require("../../../../../common/dao/daoManager/SystemConfig.manager");
const AlarmEventThing_mysql_dao_1 = require("../../../../../common/dao/mysql/AlarmEventThing.mysql.dao");
const AlarmEventThing_redis_dao_1 = require("../../../../../common/dao/redis/AlarmEventThing.redis.dao");
const WhiteIpRecord_mysql_dao_1 = require("../../../../../common/dao/mysql/WhiteIpRecord.mysql.dao");
const Announcement_mysql_dao_1 = require("../../../../../common/dao/mysql/Announcement.mysql.dao");
const ThirdGoldRecord_mysql_dao_1 = require("../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const ThirdGoldRecord_redis_dao_1 = require("../../../../../common/dao/redis/ThirdGoldRecord.redis.dao");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const BlackIp_redis_dao_1 = require("../../../../../common/dao/redis/BlackIp.redis.dao");
const fileUtils = require("../../../../../utils/fileData/fileUtils");
const Utils = require("../../../../../utils/index");
const DayApiData_mysql_dao_1 = require("../../../../../common/dao/mysql/DayApiData.mysql.dao");
const ManagerLogs_mysql_dao_1 = require("../../../../../common/dao/mysql/ManagerLogs.mysql.dao");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
const moment = require("moment");
const MessageService = require("../../../../../services/MessageService");
const pinus_1 = require("pinus");
let SystemService = class SystemService {
    async getSystemConfig() {
        try {
            const platformList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList();
            const systemConfig = await SystemConfig_manager_1.default.findOne({}, true);
            return { code: 200, data: systemConfig, platformList };
        }
        catch (error) {
            ManagerErrorLogger.warn(`getSystemConfig ==>error: ${error}`);
            console.info(`getSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async changeSystemConfig(data) {
        try {
            await SystemConfig_manager_1.default.updateOne({ id: data.id }, data);
            return { code: 200, msg: '修改成功' };
        }
        catch (error) {
            ManagerErrorLogger.warn(`changeSystemConfig ==>error: ${error}`);
            console.info(`changeSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getUnlimitedList() {
        try {
            const systemConfig = await await SystemConfig_manager_1.default.findOne({}, true);
            let openUnlimited = false;
            let unlimitedList = [];
            let id = 1;
            let iplRebate = 0;
            if (systemConfig) {
                openUnlimited = systemConfig.openUnlimited ? true : false;
                unlimitedList = systemConfig.unlimitedList ? systemConfig.unlimitedList : [];
                id = systemConfig.id;
                iplRebate = systemConfig.iplRebate;
            }
            return { code: 200, id, openUnlimited, unlimitedList, iplRebate };
        }
        catch (error) {
            ManagerErrorLogger.warn(`changeSystemConfig ==>error: ${error}`);
            console.info(`changeSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async setUnlimitedList(id, openUnlimited, unlimitedList, iplRebate) {
        try {
            await SystemConfig_manager_1.default.updateOne({ id: id }, { openUnlimited, unlimitedList, iplRebate });
            return { code: 200, msg: "设置成功" };
        }
        catch (error) {
            ManagerErrorLogger.warn(`changeSystemConfig ==>error: ${error}`);
            console.info(`changeSystemConfig ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async PostMails(uid, mail, sender) {
        try {
            mail.sender = sender;
            await MailService.generatorMail(mail, uid);
            return { code: 200, msg: "发送成功" };
        }
        catch (error) {
            ManagerErrorLogger.warn(`PostMails ==>error: ${error}`);
            console.info(`PostMails ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async selectPlayerMails(uid, page) {
        try {
            const { list, count } = await MailService.selectPlayerMails(uid, page);
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.warn(`PostMails ==>error: ${error}`);
            console.info(`PostMails ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getSystemAnnouncement() {
        try {
            const { list, count } = await Announcement_mysql_dao_1.default.findListToLimit();
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.warn(`getSystemAnnouncement ==>error: ${error}`);
            console.info(`getSystemAnnouncement ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async changeAndSaveAnnouncement(id, content, openType, sort, title) {
        try {
            if (id) {
                const info = {
                    content: content,
                    openType: openType,
                    title: title,
                    sort: sort,
                };
                await Announcement_mysql_dao_1.default.updateOne({ id }, info);
            }
            else {
                const info = {
                    content: content,
                    openType: openType,
                    title: title,
                    sort: sort,
                };
                await Announcement_mysql_dao_1.default.insertOne(info);
            }
            return true;
        }
        catch (error) {
            ManagerErrorLogger.warn(`changeAndSaveAnnouncement ==>error: ${error}`);
            console.info(`changeAndSaveAnnouncement ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async deleteUpdateAnnouncement(id) {
        try {
            await Announcement_mysql_dao_1.default.delete({ id });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`deleteUpdateAnnouncement ==>error: ${error}`);
            console.info(`deleteUpdateAnnouncement==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getAllActivityInfo() {
        return await ActivityMongoManager.findAllActivityInfos();
    }
    ;
    async getOpenActivityInfo() {
        return await ActivityMongoManager.findOpenActivityInfos();
    }
    ;
    async saveOrUpdateActivityInfo(type, remark, title, sort, contentImg, isLeading, isOpen, _id) {
        try {
            let list = [];
            list.push(contentImg);
            const activityInfo = {
                _id,
                type,
                remark,
                title,
                sort,
                isLeading,
                contentImg: list,
                isOpen,
                updateTime: Date.now()
            };
            await ActivityMongoManager.saveOrUpdateActivityInfo(activityInfo);
            return true;
        }
        catch (e) {
            ManagerErrorLogger.error(`ActivityService.saveOrUpdateActivityInfo exception : ${e.stack | e}`);
            return false;
        }
    }
    ;
    async deleteActivityInfo(_id) {
        try {
            if (!_id) {
                return false;
            }
            await ActivityMongoManager.deleteActivityInfo(_id);
            return true;
        }
        catch (e) {
            ManagerErrorLogger.error(`ActivityService.deleteActivityInfo exception : ${e.stack | e}`);
            return false;
        }
    }
    ;
    async setAlarmEventThing(inputGoldThan, winGoldThan, winAddRmb) {
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            systemConfig.inputGoldThan = inputGoldThan;
            systemConfig.winGoldThan = winGoldThan;
            systemConfig.winAddRmb = winAddRmb;
            await SystemConfig_manager_1.default.updateOne({ id: systemConfig.id }, systemConfig);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThing ==>error: ${error}`);
            console.info(`setAlarmEventThing ==>error: ${error}`);
            return Promise.reject(false);
        }
    }
    async getAlarmEventThing() {
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            const inputGoldThan = systemConfig.inputGoldThan ? systemConfig.inputGoldThan : 0;
            const winGoldThan = systemConfig.winGoldThan ? systemConfig.winGoldThan : 0;
            const winAddRmb = systemConfig.winAddRmb ? systemConfig.winAddRmb : 0;
            return { inputGoldThan, winGoldThan, winAddRmb };
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`getAlarmEventThing ==>error: ${error}`);
            console.info(`getAlarmEventThing ==>error: ${error}`);
            return Promise.reject(false);
        }
    }
    async getAlarmEventThingRecord(page, status, startTime, endTime, pageSize) {
        try {
            let { list, count } = await AlarmEventThing_mysql_dao_1.default.findListToLimitNoTime(page, pageSize, status);
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.info(`getAlarmEventThingRecord ==>error: ${error}`);
            console.info(`getAlarmEventThingRecord ==>error: ${error}`);
            return Promise.reject(false);
        }
    }
    async setAlarmEventThingRecord(id, status, managerId) {
        try {
            if (!managerId) {
                return Promise.reject("处理失败");
            }
            await AlarmEventThing_mysql_dao_1.default.updateOne({ id }, { status: status, managerId: managerId });
            await AlarmEventThing_redis_dao_1.default.delLength({ length: 1 });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThingRecord ==>error: ${error}`);
            console.info(`setAlarmEventThingRecord ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async setAlarmEventThingList(managerId) {
        try {
            if (!managerId) {
                return Promise.reject("处理失败");
            }
            await AlarmEventThing_mysql_dao_1.default.updateOne({ status: 0 }, { status: 1, managerId: managerId });
            await AlarmEventThing_redis_dao_1.default.init({ length: 0 });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThingList ==>error: ${error}`);
            console.info(`setAlarmEventThingList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async remindOnlineAndAlarm() {
        try {
            const [allOnlineUid, length, waitingForReview] = await Promise.all([
                OnlinePlayer_redis_dao_1.default.getPlayerLength({}),
                AlarmEventThing_redis_dao_1.default.getPlayerLength({}),
                ThirdGoldRecord_redis_dao_1.default.getPlayerLength({})
            ]);
            return { allOnlineUid: allOnlineUid, length, waitingForReview };
        }
        catch (error) {
            ManagerErrorLogger.info(`setAlarmEventThingRecord ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async getGameCommissionList() {
        try {
            const games = await Game_manager_1.default.findList({});
            const GameCommissionList = await GameCommission_manager_1.default.findList({});
            if (GameCommissionList.length == 0) {
                await GameCommission_manager_1.default.deleteAllInRedis({});
            }
            return { games, GameCommissionList };
        }
        catch (error) {
            ManagerErrorLogger.info(`getGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async addOneGameCommissionList(nid, way, targetCharacter, bet, win, settle, open) {
        try {
            const record = await GameCommission_manager_1.default.findOne({ nid });
            if (record) {
                return Promise.reject("该游戏的抽水设置已经存在");
            }
            await GameCommission_manager_1.default.insertOne({ nid, way, targetCharacter, bet, win, settle, open });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`addOneGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async deleteOneGameCommissionList(nid) {
        try {
            await GameCommission_manager_1.default.delete({ nid });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`deleteOneGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async updateOneGameCommissionList(nid, way, targetCharacter, bet, win, settle, open) {
        try {
            await GameCommission_manager_1.default.updateOne({ nid }, { nid, way, targetCharacter, bet, win, settle, open });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`updateOneGameCommissionList ==>error: ${error}`);
            return Promise.reject("处理失败");
        }
    }
    async getWebLogs(scene, uid, createTime, level, page) {
        try {
            const address = `/data/logs/client._${createTime}.log`;
            let data = await fileUtils.readLogs(address);
            if (!data) {
                return { list: [], length: 0 };
            }
            let ss = data.toString();
            let ll = ss.split("|");
            let list = [];
            for (let key of ll) {
                if (key) {
                    let item = JSON.parse(key.toString());
                    if (scene && !uid && !level) {
                        if (item.scene == scene) {
                            list.push(item);
                        }
                    }
                    else if (!scene && uid && !level) {
                        if (item.uid == uid) {
                            list.push(item);
                        }
                    }
                    else if (!scene && !uid && level) {
                        if (item.uid == uid) {
                            list.push(item);
                        }
                    }
                    else if (scene && uid && !level) {
                        if (item.uid == uid && item.scene == scene) {
                            list.push(item);
                        }
                    }
                    else if (scene && level && !uid) {
                        if (item.scene == scene && item.level == level) {
                            list.push(item);
                        }
                    }
                    else if (!scene && level && uid) {
                        if (item.uid == uid && item.level == level) {
                            list.push(item);
                        }
                    }
                    else if (scene && level && uid) {
                        if (item.uid == uid && item.level == level && item.uid == uid) {
                            list.push(item);
                        }
                    }
                    else {
                        list.push(item);
                    }
                }
            }
            const count = 20;
            const length = list.length;
            const start = (page - 1) * count;
            const end = (page ? page : 1) * count + 1;
            list = list.slice(start, end);
            return { list, length };
        }
        catch (error) {
            ManagerErrorLogger.info(`getWebLogs ==>error: ${error}`);
            return Promise.reject("获取失败");
        }
    }
    async getWhiteIpFromUserName(page, pageSize, manager) {
        try {
            const { list, count } = await WhiteIpRecord_mysql_dao_1.default.findListToLimitFromUserName(page, pageSize, manager);
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.info(`getAllWhiteIp ==>error: ${error}`);
            return Promise.reject("获取所有的白名单失败");
        }
    }
    async getAllWhiteIp(page, pageSize) {
        try {
            const { list, count } = await WhiteIpRecord_mysql_dao_1.default.findListToLimitNoTime(page, pageSize);
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.info(`getAllWhiteIp ==>error: ${error}`);
            return Promise.reject("获取所有的白名单失败");
        }
    }
    async selectWhiteIp(account) {
        try {
            const { list, count } = await WhiteIpRecord_mysql_dao_1.default.findListToLimitFromAccount(account);
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.info(`selectWhiteIp ==>error: ${error}`);
            return Promise.reject("根据所属人查询白名单失败");
        }
    }
    async addWhiteIp(ip, account, message, userName) {
        try {
            await WhiteIpRecord_mysql_dao_1.default.insertOne({ ip, account, message, createUser: userName });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`addWhiteIp ==>error: ${error}`);
            return Promise.reject("新增一个白名单失败");
        }
    }
    async updateWhiteIp(id, ip, account, message) {
        try {
            await WhiteIpRecord_mysql_dao_1.default.updateOne({ id }, { ip, account, message });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`addWhiteIp ==>error: ${error}`);
            return Promise.reject("新增一个白名单失败");
        }
    }
    async deleteWhiteIp(id) {
        try {
            await WhiteIpRecord_mysql_dao_1.default.delete({ id });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`deleteWhiteIp ==>error: ${error}`);
            return Promise.reject("删除一个白名单失败");
        }
    }
    async gameLoginData() {
        try {
            const [result, createLength, loginLength, onlineLength, maxOnline] = await Promise.all([
                Player_manager_1.default.findPlayerDayLoginData(),
                DayCreatePlayer_redis_dao_1.default.getPlayerLength({}),
                DayLoginPlayer_redis_dao_1.default.getPlayerLength({}),
                OnlinePlayer_redis_dao_1.default.getPlayerLength({}),
                OnlinePlayer_redis_dao_1.default.getOnlineMax({}),
            ]);
            return { result, createLength, loginLength, onlineLength, maxOnline };
        }
        catch (error) {
            ManagerErrorLogger.info(`gameLoginData ==>error: ${error}`);
            return Promise.reject("游戏登陆报表");
        }
    }
    async playerLoginHourData() {
        try {
            const [result, Onlinelist] = await Promise.all([
                ThirdGoldRecord_mysql_dao_1.default.PlayerLoginHourData(),
                DayCreatePlayer_redis_dao_1.default.findList({})
            ]);
            let listData = [];
            let oneHour = 60 * 60 * 1000;
            for (let i = 0; i < 24; i++) {
                const item = result.find(key => Number(key.hour) == i);
                const length = Onlinelist.filter(key => key.createTime > Utils.zerotime() + i * oneHour && key.createTime < Utils.zerotime() + (i + 1) * oneHour);
                const info = {
                    time: i + '--' + (i + 1),
                    entryCount: item ? Number(item.id) : 0,
                    entryGold: item ? item.loginGold : 0,
                    createPlayer: length.length,
                };
                listData.push(info);
            }
            return listData;
        }
        catch (error) {
            ManagerErrorLogger.info(`playerLoginHourData ==>error: ${error}`);
            return Promise.reject("playerLoginHourData");
        }
    }
    async dayApiData(startTime, endTime) {
        try {
            const startTimeDate = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
            const endTimeDate = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
            const { list, count } = await DayApiData_mysql_dao_1.default.findListToLimit(startTimeDate, endTimeDate);
            return { list, count };
        }
        catch (error) {
            ManagerErrorLogger.info(`dayApiData ==>error: ${error}`);
            return Promise.reject("dayApiData");
        }
    }
    async postSystemNotice(content) {
        try {
            content = content ? content : "我们将在30分钟后停服务器";
            await MessageService.notice({ route: 'system', content: content });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async closeApiLogin(isCloseApi, id, apiTestAgent) {
        try {
            await SystemConfig_manager_1.default.updateOne({ id }, { isCloseApi, apiTestAgent });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async closeGameApi(nidList, id) {
        try {
            await SystemConfig_manager_1.default.updateOne({ id }, { closeNid: nidList });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async getCloseApiData() {
        try {
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            const games = await Game_manager_1.default.findList({});
            const gameList = games.map((info) => {
                return { nid: info.nid, zname: info.zname };
            });
            const { id, closeNid, isCloseApi, apiTestAgent } = systemConfig;
            return { gameList, id, closeNid: closeNid ? closeNid : [], isCloseApi: isCloseApi ? isCloseApi : false, apiTestAgent };
        }
        catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async kickAllPlayer() {
        try {
            const onlinePlayers = await OnlinePlayer_redis_dao_1.default.findList();
            for (let player of onlinePlayers) {
                const { frontendServerId, uid } = player;
                await pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
            }
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`修改成功 :${error.stack || error}`);
            return { code: 500, info: '系统异常' };
        }
    }
    async setBlackIp(manager, ip) {
        try {
            await BlackIp_redis_dao_1.default.insertOne({ ip, time: new Date(), creator: manager });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`设置黑名单IP :${error.stack || error}`);
            return { code: 500, info: '设置黑名单IP异常' };
        }
    }
    async getAllBlackIp() {
        try {
            const list = await BlackIp_redis_dao_1.default.findList();
            return list;
        }
        catch (error) {
            ManagerErrorLogger.error(`获取黑名单IP :${error.stack || error}`);
            return { code: 500, info: '获取黑名单IP异常' };
        }
    }
    async deleteAllBlackIp() {
        try {
            await BlackIp_redis_dao_1.default.delete({});
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`删除所有黑名单IP :${error.stack || error}`);
            return { code: 500, info: '删除所有黑名单IP' };
        }
    }
    async deleteBlackIp(ip) {
        try {
            await BlackIp_redis_dao_1.default.deleteOne({ ip });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.error(`删除单个黑名单IP :${error.stack || error}`);
            return { code: 500, info: '删除单个黑名单IP' };
        }
    }
    async getSystemManagerLogs(ip, userName, startTime, endTime, page) {
        try {
            if (!ip && !userName && !startTime && !endTime) {
                let result = await ManagerLogs_mysql_dao_1.default.findListToLimit();
                return result;
            }
            else {
                let where = null;
                if (startTime || endTime) {
                    where = `Sp_ManagerLogs.createDate > "${startTime}"  AND Sp_ManagerLogs.createDate <= "${endTime}"`;
                }
                if (ip) {
                    if (where) {
                        where = where + `AND Sp_ManagerLogs.requestIp = "${ip}"`;
                    }
                    else {
                        where = `Sp_ManagerLogs.requestIp = "${ip}"`;
                    }
                }
                if (userName) {
                    if (where) {
                        where = where + `AND Sp_ManagerLogs.mangerUserName = "${userName}"`;
                    }
                    else {
                        where = `Sp_ManagerLogs.mangerUserName = "${userName}"`;
                    }
                }
                let result = await ManagerLogs_mysql_dao_1.default.getSelectWhereForLogs(where, page);
                return result;
            }
        }
        catch (error) {
            ManagerErrorLogger.error(`getSystemManagerLogs :${error.stack || error}`);
            return { code: 500, info: '获取服务器日志失败' };
        }
    }
};
SystemService = __decorate([
    (0, common_1.Injectable)()
], SystemService);
exports.SystemService = SystemService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvc3lzdGVtL3N5c3RlbS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUEwRDtBQUMxRCwwRkFBMkY7QUFDM0YsbUVBQW1FO0FBQ25FLCtDQUF5QztBQUN6Qyx3R0FBZ0c7QUFDaEcsb0ZBQTRFO0FBQzVFLHdGQUFnRjtBQUNoRixtR0FBMEY7QUFDMUYseUdBQWdHO0FBQ2hHLHVHQUE4RjtBQUM5RixvR0FBK0Y7QUFDL0YseUdBQWdHO0FBQ2hHLHlHQUFnRztBQUNoRyxxR0FBNEY7QUFDNUYsbUdBQTBGO0FBQzFGLHlHQUFnRztBQUNoRyx5R0FBZ0c7QUFDaEcscUhBQTRHO0FBQzVHLHlGQUFnRjtBQUNoRixxRUFBc0U7QUFDdEUsb0RBQXFEO0FBQ3JELCtGQUFzRjtBQUN0RixpR0FBd0Y7QUFDeEYsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELGlDQUFpQztBQUNqQyx5RUFBeUU7QUFHekUsaUNBQTRCO0FBRzVCLElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7SUFLdEIsS0FBSyxDQUFDLGVBQWU7UUFDakIsSUFBSTtZQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0seUNBQTZCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztZQUNsRixNQUFNLFlBQVksR0FBRyxNQUFNLDhCQUFzQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRyxZQUFZLEVBQUUsQ0FBQztTQUMzRDtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osa0JBQWtCLENBQUMsSUFBSSxDQUFDLDZCQUE2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