"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
const GatePlayerService_1 = require("../../../../../gate/lib/services/GatePlayerService");
const PlayerAgent_mysql_dao_1 = require("../../../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const GmsApiResult_vo_1 = require("../../../const/GmsApiResult.vo");
const HttpCode_enum_1 = require("../../../support/code/HttpCode.enum");
const PlayerAgent_entity_1 = require("../../../../../../common/dao/mysql/entity/PlayerAgent.entity");
const ThirdGoldRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const PlatformNameAgentList_mysql_dao_1 = require("../../../../../../common/dao/mysql/PlatformNameAgentList.mysql.dao");
const hallConst_1 = require("../../../../../../consts/hallConst");
const moment = require("moment");
const TenantGameData_redis_dao_1 = require("../../../../../../common/dao/redis/TenantGameData.redis.dao");
const PlatformProfitAndLossData_redis_dao_1 = require("../../../../../../common/dao/redis/PlatformProfitAndLossData.redis.dao");
const AgentProfitAndLossData_redis_dao_1 = require("../../../../../../common/dao/redis/AgentProfitAndLossData.redis.dao");
const TenantGameData_mysql_dao_1 = require("../../../../../../common/dao/mysql/TenantGameData.mysql.dao");
const DateTime2GameRecord_service_1 = require("./DateTime2GameRecord.service");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const PlayerAgent_redis_dao_1 = require("../../../../../../common/dao/redis/PlayerAgent.redis.dao");
const connectionManager_1 = require("../../../../../../common/dao/mysql/lib/connectionManager");
const GameRecordDateTable_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const SystemConfig_manager_1 = require("../../../../../../common/dao/daoManager/SystemConfig.manager");
const Game_manager_1 = require("../../../../../../common/dao/daoManager/Game.manager");
const agent_name = require('../../../../../../../config/data/agent_name.json');
const logger = (0, pinus_logger_1.getLogger)('http', __filename);
const possible = "ABCDEFGHJKLMNPQRSTUVWXY23456789";
function generateRandomStr(num) {
    let text = "";
    if (!num) {
        num = 4;
    }
    for (let i = 0; i < num; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
let AgentService = class AgentService {
    async createPlatform(manager, platform, gold, language) {
        try {
            if (gold < 0) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platform_Existence, null, "金币不能为负数"));
            }
            const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platform });
            if (platformInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platform_Existence, null, "平台已存在"));
            }
            const { uid } = await GatePlayerService_1.default.createPlayer();
            const agentInfo = connectionManager_1.default.getRepository(PlayerAgent_entity_1.PlayerAgent).create({
                uid,
                rootUid: uid,
                parentUid: uid,
                platformName: platform,
                platformGold: gold || 0,
                deepLevel: 1,
                roleType: 2,
                status: 1,
                language: hallConst_1.LANGUAGE_LIST.includes(language) ? language : 'english'
            });
            await PlayerAgent_mysql_dao_1.default.insertOne(agentInfo);
            const info = {
                userName: manager,
                platformName: platform,
                agentName: platform,
                goldChangeBefore: 0,
                gold,
                goldChangeAfter: gold,
            };
            await PlatformNameAgentList_mysql_dao_1.default.insertOne(info);
            await PlatformNameAgentList_redis_dao_1.default.insertPlatformUid({ platformName: platform, platformUid: uid });
            await PlatformNameAgentList_redis_dao_1.default.addAgent(platform, uid);
            const timeTableName = moment().format("YYYYMM");
            let tableName = `${uid}_${timeTableName}`;
            const isExists = await GameRecordDateTable_mysql_dao_1.default.tableBeExists(tableName);
            if (!isExists) {
                await GameRecordDateTable_mysql_dao_1.default.createTable(tableName);
            }
            const nextMonthTime = moment().add(1, 'month').format("YYYYMM");
            let nextMonthTableName = `${uid}_${nextMonthTime}`;
            const nextMonthisExists = await GameRecordDateTable_mysql_dao_1.default.tableBeExists(nextMonthTableName);
            if (!nextMonthisExists) {
                await GameRecordDateTable_mysql_dao_1.default.createTable(nextMonthTableName);
            }
            return { uid, platform };
        }
        catch (error) {
            logger.warn(`createPlatform ==>error: ${error}`);
            console.info(`createPlatform ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async deletePlatform(platform) {
        try {
            const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platform });
            if (!platformInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platform_Existence, null, "平台不存在"));
            }
            const sqlForPlayer = `DELETE   FROM Sp_Player 
						where  
						Sp_Player.pk_uid  in ( select Sp_Player_Agent.fk_uid  from Sp_Player_Agent 
						WHERE   Sp_Player_Agent.root_uid   = "${platformInfo.uid}" )`;
            await connectionManager_1.default.getConnection().query(sqlForPlayer);
            const sqlForPlayerAgent = `DELETE  FROM Sp_Player_Agent 
						WHERE   Sp_Player_Agent.root_uid   = "${platformInfo.uid}" `;
            await connectionManager_1.default.getConnection().query(sqlForPlayerAgent);
            const playerAgentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: platformInfo.platformName });
            for (let agent of playerAgentList) {
                await PlayerAgent_redis_dao_1.default.delete({ platformName: agent });
            }
            await PlatformNameAgentList_redis_dao_1.default.deletePlatformUidOne({ platformName: platformInfo.platformName });
            await PlatformNameAgentList_redis_dao_1.default.deleteOne({ platformName: platformInfo.platformName });
            return true;
        }
        catch (error) {
            logger.warn(`deletePlatform ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async platformList(currentPage, pageSize, platformUid) {
        try {
            const [recordList, totalCount] = await PlayerAgent_mysql_dao_1.default.findManyAndCountForPlatform(platformUid, currentPage, pageSize);
            return { recordList, totalCount };
        }
        catch (e) {
            logger.error(`获取平台信息列表出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }
    async createAgentForPlatform(manager, agentUid, platform, gold, language) {
        try {
            if (gold < 0) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platform_Existence, null, "金币不能为负数"));
            }
            const agentInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platform });
            if (agentInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Agent_Existence, null, "租户已存在"));
            }
            const platfromInfo = await PlayerAgent_mysql_dao_1.default.findOne({ uid: agentUid });
            if (!platfromInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, null, "平台不存在"));
            }
            if (platfromInfo.platformGold < gold) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.PlatformGold_Not_Enough, null, "平台金币不足"));
            }
            const { uid } = await GatePlayerService_1.default.createPlayer(null, agentUid, agentUid, null, platform, null);
            const playerAgentInfo = {
                uid,
                parentUid: platfromInfo.uid,
                rootUid: platfromInfo.rootUid,
                platformName: platform,
                platformGold: gold || 0,
                deepLevel: platfromInfo.deepLevel + 1,
                roleType: 3,
                status: 1,
                language: hallConst_1.LANGUAGE_LIST.includes(language) ? language : 'english'
            };
            const info = {
                userName: manager,
                platformName: platfromInfo.platformName,
                agentName: platform,
                goldChangeBefore: 0,
                gold,
                goldChangeAfter: gold,
            };
            await Promise.all([
                PlayerAgent_mysql_dao_1.default.insertOne(playerAgentInfo),
                PlayerAgent_mysql_dao_1.default.updateOne({ uid: platfromInfo.uid }, { platformGold: Math.floor(platfromInfo.platformGold - gold) }),
                PlatformNameAgentList_mysql_dao_1.default.insertOne(info)
            ]);
            await PlatformNameAgentList_redis_dao_1.default.addAgent(platfromInfo.platformName, platfromInfo.uid);
            return true;
        }
        catch (e) {
            logger.error(`创建平台代理出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }
    async deleteAgentForPlatform(platformUid, agentUid) {
        try {
            const agentInfo = await PlayerAgent_mysql_dao_1.default.findOne({ uid: agentUid });
            if (!agentInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Agent_Existence, null, "代理不存在"));
            }
            const sqlForPlayer = `DELETE   from Sp_Player 
						where  
						Sp_Player.groupRemark = "${agentInfo.platformName}"`;
            await connectionManager_1.default.getConnection().query(sqlForPlayer);
            const sqlForPlayerAgent = `DELETE	 from Sp_Player_Agent 
						WHERE   Sp_Player_Agent.parent_uid   = "${agentInfo.uid}" `;
            await connectionManager_1.default.getConnection().query(sqlForPlayerAgent);
            const sqlForPlayerToAgent = `DELETE   from Sp_Player 
						where  
						Sp_Player.pk_uid = "${agentInfo.uid}"`;
            await connectionManager_1.default.getConnection().query(sqlForPlayerToAgent);
            const sqlForPlayerAgentToAgent = `DELETE   from Sp_Player_Agent 
						where  
						Sp_Player_Agent.fk_uid = "${agentInfo.uid}"`;
            await connectionManager_1.default.getConnection().query(sqlForPlayerAgentToAgent);
            await PlayerAgent_redis_dao_1.default.delete({ platformName: agentInfo.platformName });
            return true;
        }
        catch (e) {
            logger.error(`删除平台代理出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }
    async agentListFromPlatform(platfromUid, rootAgent, currentPage, pageSize) {
        try {
            const [recordList, totalCount] = await PlayerAgent_mysql_dao_1.default.findManyAndCountForAgentFromPlatform(platfromUid, currentPage, pageSize);
            const systemConfig = await SystemConfig_manager_1.default.findOne({});
            const url = systemConfig.gameResultUrl ? systemConfig.gameResultUrl : null;
            const list = recordList.map((info) => {
                info.platformName = this.agentForChangeName(info.platformName);
                info['url'] = url ? `${url}?PlatformCode=${info.platformName}` : null;
                return info;
            });
            return { recordList: list, totalCount };
        }
        catch (e) {
            logger.error(`查询平台下的代理列表出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }
    async bingManagerAgentList(platfromUid) {
        try {
            const recordList = await PlayerAgent_mysql_dao_1.default.bingManagerAgentList(platfromUid);
            const list = recordList.map((info) => {
                return this.agentForChangeName(info.platformName);
            });
            return { list: list };
        }
        catch (e) {
            logger.error(`查询平台下的代理列表出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }
    async updateGoldForPlatform(manager, gold, platfromUid) {
        try {
            const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ uid: platfromUid });
            if (!platformInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, null, "平台不存在"));
            }
            if (gold < 0 && Math.abs(gold) > Math.abs(platformInfo.platformGold)) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.PlatformGold_Not_Enough, null, "扣除金币超过平台拥有金币"));
            }
            await PlayerAgent_mysql_dao_1.default.updateOne({ uid: platfromUid }, { platformGold: Math.floor(platformInfo.platformGold + gold) });
            const info = {
                userName: manager,
                platformName: platformInfo.platformName,
                agentName: null,
                goldChangeBefore: platformInfo.platformGold,
                gold,
                goldChangeAfter: Math.floor(platformInfo.platformGold + gold),
            };
            await PlatformNameAgentList_mysql_dao_1.default.insertOne(info);
            return true;
        }
        catch (e) {
            logger.error(`修改平台金币出错: ${e.stack}`);
            return Promise.reject(e);
        }
    }
    async addPlatformAgentGold(manager, platform, gold, uid) {
        try {
            const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platform });
            if (!platformInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, null, "平台不存在"));
            }
            if (gold > 0 && platformInfo.platformGold < gold) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.PlatformGold_Not_Enough, null, "平台金币不足"));
            }
            const agentInfo = await PlayerAgent_mysql_dao_1.default.findOne({ uid });
            if (!agentInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.Platfrom_Nonexistence, null, "代理不存在"));
            }
            if (gold < 0 && Math.abs(gold) > Math.abs(agentInfo.platformGold)) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.PlatformGold_Not_Enough, null, "扣除金币超过代理拥有金币"));
            }
            await PlayerAgent_mysql_dao_1.default.updateOne({ uid: platformInfo.uid }, { platformGold: Math.floor(platformInfo.platformGold - gold) });
            if (gold > 0) {
                await PlayerAgent_mysql_dao_1.default.updateAddForThirdApi(agentInfo.platformName, { gold: Math.abs(gold) });
            }
            else {
                await PlayerAgent_mysql_dao_1.default.updateDeleForThirdApi(agentInfo.platformName, { gold: Math.abs(gold) });
            }
            const info = {
                userName: manager,
                platformName: platformInfo.platformName,
                agentName: agentInfo.platformName,
                goldChangeBefore: agentInfo.platformGold,
                gold,
                goldChangeAfter: Math.floor(agentInfo.platformGold + gold),
            };
            await PlatformNameAgentList_mysql_dao_1.default.insertOne(info);
            return true;
        }
        catch (e) {
            logger.error(`修改代理金币出错: ${e}`);
            return Promise.reject(e);
        }
    }
    async getPlatformToAgentGoldRecordList(managerAgent = null, agentSearch = null, currentPage, pageSize = 20) {
        try {
            if (agentSearch) {
                const { list, totalCount } = await PlatformNameAgentList_mysql_dao_1.default.searchPlatformToAgentGoldRecordList(managerAgent, agentSearch, currentPage, pageSize);
                return { list, totalCount };
            }
            if (managerAgent) {
                const { list, totalCount } = await PlatformNameAgentList_mysql_dao_1.default.getPlatformToAgentGoldRecordList(managerAgent, currentPage, pageSize);
                if (list && list.length !== 0) {
                    if (managerAgent == '459pt') {
                        const recordList = list.map((info) => {
                            info.agentName = this.agentForChangeName(info.agentName);
                            return info;
                        });
                        return { list: recordList, totalCount: totalCount };
                    }
                    ;
                }
                return { list, totalCount };
            }
            else {
                const { list, totalCount } = await PlatformNameAgentList_mysql_dao_1.default.findListToLimitNoTime(currentPage, pageSize);
                return { list, totalCount };
            }
        }
        catch (error) {
            logger.warn(`addPlatformGold ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getAgentForPlayerGoldRecordList(managerAgent = null, page = 1, pageSize = 20, startTime, endTime, uid) {
        try {
            if (managerAgent) {
                const agentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: managerAgent }, false);
                let where = null;
                if (startTime && startTime) {
                    where = `ThirdGoldRecord.createDateTime > "${startTime}"
                             AND ThirdGoldRecord.createDateTime < "${endTime}"`;
                }
                if (uid) {
                    if (where) {
                        where = where + ` AND ThirdGoldRecord.fk_uid = "${uid}"`;
                    }
                    else {
                        where = `ThirdGoldRecord.uid = ${uid}`;
                    }
                }
                if (!agentList || agentList.length == 0) {
                    if (where) {
                        where = where + ` AND ThirdGoldRecord.agentRemark = "${managerAgent}"`;
                    }
                    else {
                        where = `ThirdGoldRecord.agentRemark = "${managerAgent}"`;
                    }
                }
                else {
                    const list = [];
                    agentList.forEach(x => {
                        list.push(`"${x}"`);
                    });
                    if (where) {
                        where = where + ` AND ThirdGoldRecord.agentRemark in (${list})`;
                    }
                    else {
                        where = `ThirdGoldRecord.agentRemark in (${list})`;
                    }
                }
                const { list, count } = await ThirdGoldRecord_mysql_dao_1.default.getAgentForPlayerGoldRecordList(where, page, pageSize);
                if (list && list.length !== 0) {
                    if (managerAgent == '459pt') {
                        const recordList = list.map((info) => {
                            info.agentRemark = this.agentForChangeName(info.agentRemark);
                            return info;
                        });
                        return { record: recordList, allLength: count };
                    }
                    ;
                }
                return { record: list, allLength: count };
            }
            else {
                return { record: [], allLength: 0 };
            }
        }
        catch (error) {
            logger.warn(`addPlatformGold ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getTenantOperationalDataList(platformUid, currentPage, pageSize) {
        try {
            let startTimestamp = null;
            let endTimestamp = null;
            const dyadicArray = await DateTime2GameRecord_service_1.default.breakUpDate(startTimestamp, endTimestamp);
            const [dayBeforeYesterdayDate, todayDate] = dyadicArray;
            const [startDateTime, endDateTime] = todayDate;
            let tableName = moment().format("YYYYMM");
            let total = await TenantGameData_mysql_dao_1.default.getTenantOperationalDataListForToday(platformUid, startDateTime, endDateTime, tableName);
            if (total.length == 0) {
                return { totalSize: 1, list: [] };
            }
            const res = total.map((info) => {
                const { winCount, recordCount, profitTotal, validBetTotal } = info;
                const winRate1 = winCount > 0 ? (winCount / recordCount).toFixed(4) : 0;
                const winRate2 = validBetTotal > 0 ? (((-Number(profitTotal))) / validBetTotal).toFixed(4) : 0;
                info.profitTotal = Math.floor(-Number(profitTotal));
                return Object.assign({ winRate1, winRate2, loseCount: recordCount - winCount }, info);
            });
            res.sort((a, b) => Number(b.validBetTotal) - Number(a.validBetTotal));
            return { totalSize: 1, list: res };
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async selectTenantData(groupRemark) {
        try {
            const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: groupRemark });
            if (!platformInfo) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.FAIL, null, "代理不存在"));
            }
            let list = [];
            const info = {
                winRate1: 0,
                winRate2: 0,
                loseCount: 0,
                recordCount: 0,
                groupRemark: platformInfo.platformName,
                parent_uid: platformInfo.parentUid,
                uid: platformInfo.uid,
                validBetTotal: 0,
                winCount: 0,
                winTotal: 0,
                loseTotal: 0,
                profitTotal: 0,
                bet_commissionTotal: 0,
                win_commissionTotal: 0,
                settle_commissionTotal: 0,
            };
            list.push(info);
            return { totalSize: 1, list: list };
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getTenantGameData(platformUid, groupRemark, currentPage, pageSize) {
        try {
            let startTimestamp = null;
            let endTimestamp = null;
            const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${groupRemark}`;
            const beExistence = await TenantGameData_redis_dao_1.default.exits(uniqueDateTime);
            if (beExistence) {
                return await TenantGameData_redis_dao_1.default.findOne(uniqueDateTime);
            }
            const dyadicArray = await DateTime2GameRecord_service_1.default.breakUpDate(startTimestamp, endTimestamp);
            const [dayBeforeYesterdayDate, todayDate] = dyadicArray;
            let tableName = moment().format("YYYYMM");
            const total = await TenantGameData_mysql_dao_1.default.getTenantGameData(platformUid, groupRemark, todayDate[0], todayDate[1], tableName);
            const res = total.map((info) => {
                const { winCount, recordCount, profitTotal, validBetTotal } = info;
                const winRate1 = winCount > 0 ? (winCount / recordCount).toFixed(4) : 0;
                const winRate2 = validBetTotal > 0 ? ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                info.profitTotal = Math.floor(-Number(profitTotal));
                return Object.assign({ winRate1, winRate2, loseCount: recordCount - winCount }, info);
            });
            if (total.length > 0) {
                await TenantGameData_redis_dao_1.default.insertOne(uniqueDateTime, { totalSize: 1, list: res });
            }
            return { totalSize: 1, list: res };
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async platformProfitAndLossData(platform = null, startTimestamp = null, endTimestamp = null, currentPage = 1, pageSize) {
        try {
            platform = platform ? platform : null;
            const platformNameList = await PlatformNameAgentList_redis_dao_1.default.findList(false);
            if (platform) {
                const key = platformNameList.find(x => x.platformName == platform);
                if (!key) {
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    const result = await PlatformProfitAndLossData_redis_dao_1.default.findOne(uniqueDateTime);
                    if (result) {
                        const list = result.list.map((info) => {
                            info.groupRemark = this.agentForChangeName(info.groupRemark);
                            return info;
                        });
                        return { totalSize: 1, list: list };
                    }
                }
                else {
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    const result = await PlatformProfitAndLossData_redis_dao_1.default.findOne(uniqueDateTime);
                    let resultList = [];
                    if (result) {
                        let list = key.list;
                        let info = {
                            recordCount: 0,
                            validBetTotal: 0,
                            winCount: 0,
                            winTotal: 0,
                            loseTotal: 0,
                            loseCount: 0,
                            profitTotal: 0,
                            commission: 0,
                            winRate2: 0,
                            groupRemark: key.platformName,
                            parentUid: null,
                            startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                            endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                        };
                        for (let m of list) {
                            const item = result.list.find(x => x.groupRemark == m);
                            if (item) {
                                info.recordCount += Number(item.recordCount);
                                info.validBetTotal += Number(item.validBetTotal);
                                info.winCount += Number(item.winCount);
                                info.winTotal += Number(item.winTotal);
                                info.loseTotal += Number(item.loseTotal);
                                info.loseCount += Number(item.loseCount);
                                info.profitTotal += Number(item.profitTotal);
                                info.commission += Number(item.commission);
                            }
                        }
                        info.winRate2 = Number(info.validBetTotal > 0 ? (info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                        resultList.push(info);
                        return { totalSize: 1, list: resultList };
                    }
                }
            }
            else {
                let redisResult = [];
                for (let platformRedis of platformNameList) {
                    const platformName = platformRedis.platformName;
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platformName}`;
                    const result = await PlatformProfitAndLossData_redis_dao_1.default.findOne(uniqueDateTime);
                    if (result) {
                        redisResult.push({ platformName: platformName, list: result });
                    }
                }
                if (redisResult.length == platformNameList.length) {
                    let resultList = [];
                    for (let key of platformNameList) {
                        const list = key.list;
                        const platformName = key.platformName;
                        const result = redisResult.find(x => x.platformName == platformName);
                        if (result) {
                            let info = {
                                recordCount: 0,
                                validBetTotal: 0,
                                winCount: 0,
                                winTotal: 0,
                                loseTotal: 0,
                                loseCount: 0,
                                profitTotal: 0,
                                commission: 0,
                                winRate2: 0,
                                groupRemark: key.platformName,
                                parentUid: null,
                                startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                                endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                            };
                            for (let m of list) {
                                const item = result.list.list.find(x => x.groupRemark == m);
                                if (item) {
                                    info.recordCount += Number(item.recordCount);
                                    info.validBetTotal += Number(item.validBetTotal);
                                    info.winCount += Number(item.winCount);
                                    info.winTotal += Number(item.winTotal);
                                    info.loseTotal += Number(item.loseTotal);
                                    info.loseCount += Number(item.loseCount);
                                    info.profitTotal += Number(item.profitTotal);
                                    info.commission += Number(item.commission);
                                }
                            }
                            info.winRate2 = Number(info.validBetTotal > 0 ? (info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                            resultList.push(info);
                        }
                    }
                    if (resultList.length > 0) {
                        return { totalSize: 1, list: resultList };
                    }
                }
            }
            const dyadicArray = await DateTime2GameRecord_service_1.default.newBreakUpDate(startTimestamp, endTimestamp);
            let total = [];
            let tableName = moment(startTimestamp).format("YYYYMM");
            if (!platform) {
                let platformUidList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(false);
                if (platformUidList.length == 0) {
                    return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.FAIL, null, "平台号获取参数失败"));
                }
                total = await TenantGameData_mysql_dao_1.default.getAllPlatformGameData(platformUidList, dyadicArray, null, tableName);
            }
            else {
                const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platform });
                if (!platformInfo) {
                    return { totalSize: 0, list: [] };
                }
                const { roleType, platformGold, platformName } = platformInfo;
                if (roleType === 2) {
                    const agentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: platformName });
                    const list = [];
                    agentList.forEach(x => {
                        list.push(`"${x}"`);
                    });
                    let platformUid = platformInfo.uid;
                    total = await TenantGameData_mysql_dao_1.default.getPlatformGameData(dyadicArray, platformUid, tableName, list);
                }
                else {
                    let platformUid = platformInfo.rootUid;
                    total = await TenantGameData_mysql_dao_1.default.getOnePlatformGameData(dyadicArray, platformName, tableName, platformUid);
                }
            }
            if (!total || total.length == 0) {
                return { totalSize: 1, list: [] };
            }
            let list = [];
            for (let key of total) {
                let item = list.find(x => x.groupRemark == key.groupRemark);
                if (!item) {
                    list.push(key);
                }
                else {
                    item.recordCount = Number(item.recordCount) + Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) + Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) + Number(key.winCount);
                    item.winTotal = Number(item.winTotal) + Number(key.winTotal);
                    item.loseTotal = Number(item.loseTotal) + Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) + Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) + Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) + Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) + Number(key.settle_commissionTotal);
                    const index = list.findIndex(x => x.groupRemark == key.groupRemark);
                    list.splice(index, 1);
                    list.push(item);
                }
            }
            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                const winRate2 = validBetTotal > 0 ? ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal = Math.floor(-Number(profitTotal));
                return Object.assign({ winRate2, loseCount: recordCount - winCount, commission }, info);
            });
            let resultList = [];
            if (platform) {
                const key = platformNameList.find(x => x.platformName == platform);
                if (!key) {
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    await PlatformProfitAndLossData_redis_dao_1.default.insertOne(uniqueDateTime, { list: res });
                    const list = res.map((info) => {
                        info.groupRemark = this.agentForChangeName(info.groupRemark);
                        return info;
                    });
                    return { totalSize: 1, list: list };
                }
                else {
                    let list = key.list;
                    let info = {
                        recordCount: 0,
                        validBetTotal: 0,
                        winCount: 0,
                        winTotal: 0,
                        loseTotal: 0,
                        loseCount: 0,
                        profitTotal: 0,
                        commission: 0,
                        winRate2: 0,
                        groupRemark: key.platformName,
                        parentUid: null,
                        startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                        endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                    };
                    let platformOneResultList = [];
                    for (let m of list) {
                        const item = res.find(x => x.groupRemark == m);
                        if (item) {
                            info.recordCount += Number(item.recordCount);
                            info.validBetTotal += Number(item.validBetTotal);
                            info.winCount += Number(item.winCount);
                            info.winTotal += Number(item.winTotal);
                            info.loseTotal += Number(item.loseTotal);
                            info.loseCount += Number(item.loseCount);
                            info.profitTotal += Number(item.profitTotal);
                            info.commission += Number(item.commission);
                            platformOneResultList.push(item);
                        }
                    }
                    info.winRate2 = Number(info.validBetTotal > 0 ? (info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                    resultList.push(info);
                    if (platformOneResultList.length > 0) {
                        const platform = key.platformName;
                        const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                        await PlatformProfitAndLossData_redis_dao_1.default.insertOne(uniqueDateTime, { list: platformOneResultList });
                    }
                    return { totalSize: 1, list: resultList };
                }
            }
            for (let key of platformNameList) {
                const list = key.list;
                let info = {
                    recordCount: 0,
                    validBetTotal: 0,
                    winCount: 0,
                    winTotal: 0,
                    loseTotal: 0,
                    loseCount: 0,
                    profitTotal: 0,
                    commission: 0,
                    winRate2: 0,
                    groupRemark: key.platformName,
                    parentUid: null,
                    startTime: moment(startTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                    endTime: moment(endTimestamp).format("YYYY-MM-DD HH:mm:ss"),
                };
                let platformResultList = [];
                for (let m of list) {
                    const item = res.find(x => x.groupRemark == m);
                    if (item) {
                        info.recordCount += Number(item.recordCount);
                        info.validBetTotal += Number(item.validBetTotal);
                        info.winCount += Number(item.winCount);
                        info.winTotal += Number(item.winTotal);
                        info.loseTotal += Number(item.loseTotal);
                        info.loseCount += Number(item.loseCount);
                        info.profitTotal += Number(item.profitTotal);
                        info.commission += Number(item.commission);
                        platformResultList.push(item);
                    }
                }
                info.winRate2 = Number(info.validBetTotal > 0 ? (info.profitTotal / info.validBetTotal).toFixed(4) : 0);
                resultList.push(info);
                if (platformResultList.length > 0) {
                    const platform = key.platformName;
                    const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platform}`;
                    await PlatformProfitAndLossData_redis_dao_1.default.insertOne(uniqueDateTime, { list: platformResultList });
                }
            }
            return { totalSize: 1, list: resultList };
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async agentProfitAndLossData(platform = null, groupRemark, startTimestamp = null, endTimestamp = null, currentPage = 1, pageSize = 100) {
        try {
            platform = platform ? platform : null;
            const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${groupRemark}`;
            const beExistence = await PlatformProfitAndLossData_redis_dao_1.default.exits(uniqueDateTime);
            if (beExistence) {
                const res1 = await PlatformProfitAndLossData_redis_dao_1.default.findOne(uniqueDateTime);
                if (platform && platform == '459pt') {
                    const list = res1.list.map((info) => {
                        info.groupRemark = this.agentForChangeName(info.groupRemark);
                        return info;
                    });
                    return { totalSize: 1, list: list };
                }
                else {
                    return { totalSize: 1, list: res1.list };
                }
            }
            const dyadicArray = await DateTime2GameRecord_service_1.default.newBreakUpDate(startTimestamp, endTimestamp);
            let total = [];
            let tableName = moment(startTimestamp).format("YYYYMM");
            const platformInfo = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: groupRemark });
            if (!platformInfo) {
                return { totalSize: 0, list: [] };
            }
            const { roleType, platformGold, platformName, rootUid } = platformInfo;
            if (roleType === 2) {
                const agentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: platformName });
                const list = [];
                agentList.forEach(x => {
                    list.push(`"${x}"`);
                });
                let platformUid = rootUid;
                total = await TenantGameData_mysql_dao_1.default.getPlatformGameData(dyadicArray, platformUid, tableName, list);
            }
            else {
                let platformUid = rootUid;
                total = await TenantGameData_mysql_dao_1.default.getOnePlatformGameData(dyadicArray, platformName, tableName, platformUid);
            }
            if (total.length == 0) {
                return { totalSize: 1, list: [] };
            }
            let list = [];
            for (let key of total) {
                let item = list.find(x => x.groupRemark == key.groupRemark);
                if (!item) {
                    list.push(key);
                }
                else {
                    item.recordCount = Number(item.recordCount) + Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) + Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) + Number(key.winCount);
                    item.winTotal = Number(item.winTotal) + Number(key.winTotal);
                    item.loseTotal = Number(item.loseTotal) + Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) + Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) + Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) + Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) + Number(key.settle_commissionTotal);
                    const index = list.findIndex(x => x.groupRemark == key.groupRemark);
                    list.splice(index, 1);
                    list.push(item);
                }
            }
            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                const winRate2 = validBetTotal > 0 ? ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal = Math.floor(-Number(profitTotal));
                if (platform && platform == '459pt') {
                    info.groupRemark = this.agentForChangeName(info.groupRemark);
                }
                return Object.assign({ winRate2, loseCount: recordCount - winCount, commission }, info);
            });
            if (res.length > 0) {
                const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${platformName}`;
                await PlatformProfitAndLossData_redis_dao_1.default.insertOne(uniqueDateTime, { list: res });
            }
            return { totalSize: 1, list: res };
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async agentGameRecordData(groupRemark, startTimestamp = null, endTimestamp = null, currentPage = 1, pageSize = 20) {
        try {
            const uniqueDateTime = `${moment(startTimestamp).format("YYYYMMDDHHmmss")}|${moment(endTimestamp).format("YYYYMMDDHHmmss")}|${currentPage}|${pageSize}|${groupRemark}`;
            const beExistence = await AgentProfitAndLossData_redis_dao_1.default.exits(uniqueDateTime);
            if (beExistence) {
                return await AgentProfitAndLossData_redis_dao_1.default.findOne(uniqueDateTime);
            }
            const platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUidForAgent({ agent: groupRemark });
            if (!platformUid) {
                return Promise.reject(new GmsApiResult_vo_1.GmsApiResultVO(HttpCode_enum_1.HttpCode.FAIL, null, "该代理的平台号不存在"));
            }
            const dyadicArray = await DateTime2GameRecord_service_1.default.breakUpDate(startTimestamp, endTimestamp);
            const [dayBeforeYesterdayDate, todayDate] = dyadicArray;
            let total = [];
            if (dayBeforeYesterdayDate.length > 0 && todayDate.length > 0) {
                total = await TenantGameData_mysql_dao_1.default.getTenantGameYesterDayData(platformUid, groupRemark, dyadicArray);
            }
            else if (todayDate.length > 0) {
                const [startDateTime, endDateTime] = todayDate;
                const tableName = moment().format("YYYYMM");
                total = await TenantGameData_mysql_dao_1.default.getTenantGameData(platformUid, groupRemark, startDateTime, endDateTime, tableName);
            }
            else if (dayBeforeYesterdayDate.length > 0) {
                total = await TenantGameData_mysql_dao_1.default.getTenantGameYesterDayData(platformUid, groupRemark, dyadicArray);
            }
            if (total.length == 0) {
                return { totalSize: 1, list: [] };
            }
            let list = [];
            for (let key of total) {
                let item = list.find(x => x.gameName == key.gameName);
                if (!item) {
                    list.push(key);
                }
                else {
                    item.recordCount = Number(item.recordCount) + Number(key.recordCount);
                    item.validBetTotal = Number(item.validBetTotal) + Number(key.validBetTotal);
                    item.winCount = Number(item.winCount) + Number(key.winCount);
                    item.winTotal = Number(item.winTotal) + Number(key.winTotal);
                    item.loseTotal = Number(item.loseTotal) + Number(key.loseTotal);
                    item.profitTotal = Number(item.profitTotal) + Number(key.profitTotal);
                    item.bet_commissionTotal = Number(item.bet_commissionTotal) + Number(key.bet_commissionTotal);
                    item.win_commissionTotal = Number(item.win_commissionTotal) + Number(key.win_commissionTotal);
                    item.settle_commissionTotal = Number(item.settle_commissionTotal) + Number(key.settle_commissionTotal);
                    const index = list.findIndex(x => x.gameName == key.gameName);
                    list.splice(index, 1);
                    list.push(item);
                }
            }
            const res = list.map((info) => {
                const { recordCount, winCount, profitTotal, validBetTotal, bet_commissionTotal, win_commissionTotal, settle_commissionTotal } = info;
                const commission = Math.floor(Number(bet_commissionTotal) + Number(win_commissionTotal) + Number(settle_commissionTotal));
                const winRate2 = validBetTotal > 0 ? ((-Number(profitTotal)) / validBetTotal).toFixed(4) : 0;
                delete info.bet_commissionTotal;
                delete info.win_commissionTotal;
                delete info.settle_commissionTotal;
                info.profitTotal = Math.floor(-Number(profitTotal));
                return Object.assign({ winRate2, loseCount: recordCount - winCount, commission }, info);
            });
            if (list.length > 0) {
                await AgentProfitAndLossData_redis_dao_1.default.insertOne(uniqueDateTime, { totalSize: 1, list: res });
            }
            return { totalSize: 1, list: res };
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getPlatformUidList() {
        try {
            const platformUidList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(false);
            return platformUidList;
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getPlatformForAgent(platformName) {
        try {
            const agentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: platformName }, false);
            if (platformName == '459pt') {
                let list = agentList.map(m => {
                    return this.agentForChangeName(m);
                });
                return list;
            }
            else {
                return agentList;
            }
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    async getPlatformGameList(platformName) {
        try {
            let gameList = [];
            const allGames = await Game_manager_1.default.findList({});
            const openGames = allGames.filter(x => x.opened == true);
            const platform = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platformName });
            if (!platform) {
                return null;
            }
            let closeGameList = [];
            if (platform.closeGameList) {
                closeGameList = platform.closeGameList.split(',');
            }
            for (let game of openGames) {
                const key = closeGameList.find(x => x == game.nid);
                let opened = true;
                if (key) {
                    opened = false;
                }
                gameList.push({
                    zname: game.zname,
                    nid: game.nid,
                    sort: game.sort,
                    opened: opened
                });
            }
            return gameList;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async setPlatformCloseGame(platformName, closeGameList) {
        try {
            let platform = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: platformName });
            if (!platform) {
                return Promise.reject("该平台不存在");
            }
            if (closeGameList && closeGameList.length > 0) {
                let closeGameString = closeGameList.toString();
                await PlayerAgent_mysql_dao_1.default.updateOne({ platformName: platformName }, { closeGameList: closeGameString });
                await PlatformNameAgentList_redis_dao_1.default.insertPlatformCloseGame({ platformName: platformName, closeGameList: closeGameList });
            }
            else {
                await PlayerAgent_mysql_dao_1.default.updateOne({ platformName: platformName }, { closeGameList: null });
                await PlatformNameAgentList_redis_dao_1.default.insertPlatformCloseGame({ platformName: platformName, closeGameList: [] });
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    agentForChangeName(agent) {
        const agentName = agent_name.find(x => x.old == agent);
        if (agentName) {
            return agentName.new;
        }
        else {
            return agent;
        }
    }
};
AgentService = __decorate([
    (0, common_1.Injectable)()
], AgentService);
exports.AgentService = AgentService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnQuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS9hZ2VudC9hZ2VudC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUE2QztBQUM3QywrQ0FBeUM7QUFDekMsMEZBQW1GO0FBQ25GLG9HQUEyRjtBQUMzRixvRUFBZ0U7QUFDaEUsdUVBQStEO0FBQy9ELHFHQUEyRjtBQUUzRiw0R0FBbUc7QUFDbkcsd0hBQStHO0FBQy9HLGtFQUFtRTtBQUNuRSxpQ0FBaUM7QUFDakMsMEdBQWlHO0FBQ2pHLGdJQUF1SDtBQUN2SCwwSEFBaUg7QUFDakgsMEdBQTRGO0FBQzVGLCtFQUF1RTtBQUN2RSx3SEFBK0c7QUFDL0csb0dBQTJGO0FBQzNGLGdHQUF5RjtBQUN6RixvSEFBc0c7QUFDdEcsdUdBQStGO0FBQy9GLHVGQUErRTtBQUMvRSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsa0RBQWtELENBQUMsQ0FBQztBQUUvRSxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRzdDLE1BQU0sUUFBUSxHQUFHLGlDQUFpQyxDQUFDO0FBR25ELFNBQVMsaUJBQWlCLENBQUMsR0FBVztJQUNsQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFFZCxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sR0FBRyxHQUFHLENBQUMsQ0FBQztLQUNYO0lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQixJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMs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