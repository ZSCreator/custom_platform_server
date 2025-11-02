"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdApiService = void 0;
const common_1 = require("@nestjs/common");
const pinus_logger_1 = require("pinus-logger");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
const ThirdApiWarnGold_redis_dao_1 = require("../../../../../../common/dao/redis/ThirdApiWarnGold.redis.dao");
const OnlinePlayer_redis_dao_1 = require("../../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const DayCreatePlayer_redis_dao_1 = require("../../../../../../common/dao/redis/DayCreatePlayer.redis.dao");
const DayLoginPlayer_redis_dao_1 = require("../../../../../../common/dao/redis/DayLoginPlayer.redis.dao");
const Player_manager_1 = require("../../../../../../common/dao/daoManager/Player.manager");
const Game_manager_1 = require("../../../../../../common/dao/daoManager/Game.manager");
const GameRecordDateTable_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const GameRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecord.mysql.dao");
const ThirdGoldRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/ThirdGoldRecord.mysql.dao");
const PlayerAgent_mysql_dao_1 = require("../../../../../../common/dao/mysql/PlayerAgent.mysql.dao");
const ThirdGoldRecord_redis_dao_1 = require("../../../../../../common/dao/redis/ThirdGoldRecord.redis.dao");
const game_scenes = require('../../../../../../../config/data/game_scenes.json');
const utils_1 = require("../../../../../../utils");
const moment = require("moment");
const PlatformNameAgentList_redis_dao_1 = require("../../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const agent_name = require('../../../../../../../config/data/agent_name.json');
let ThirdApiService = class ThirdApiService {
    async getGameRecrodApiForMoreTable(managerUid, rootAgent, page, startTime, endTime, managerAgent, thirdUid, nid, pageSize, gameOrder, roundId) {
        try {
            if (!managerAgent) {
                return Promise.reject('该后台账号不存在代理');
            }
            const agent = await PlayerAgent_mysql_dao_1.default.findOne({ platformName: managerAgent });
            if (!agent) {
                return Promise.reject('该后台账号的代理不存在');
            }
            if (thirdUid) {
                const player = await Player_manager_1.default.findOne({ thirdUid: thirdUid }, false);
                if (!player) {
                    return Promise.reject("该账号不存在");
                }
                if (rootAgent !== managerAgent) {
                    if (player.groupRemark !== agent.platformName) {
                        return Promise.reject("该第三方账号id不属于该代理");
                    }
                }
                else {
                    if (player.group_id !== managerUid) {
                        return Promise.reject("该第三方账号id不属于该平台");
                    }
                }
            }
            let platformUid = agent.rootUid;
            if (!platformUid) {
                return Promise.reject("该代理的数据错误，查询失败");
            }
            let table1 = null;
            let table2 = null;
            if (startTime && endTime) {
                const start = moment(startTime).format("YYYYMM");
                const end = moment(endTime).format("YYYYMM");
                if (start != end) {
                    table1 = start;
                    table2 = end;
                }
                else {
                    table1 = start;
                }
            }
            else {
                let today = moment().format("YYYYMM");
                table1 = today;
            }
            let where = null;
            if (startTime && endTime) {
                where = `Sp_GameRecord.createTimeDate > "${startTime}"  AND Sp_GameRecord.createTimeDate <= "${endTime}"`;
            }
            else {
                let start = moment().format("YYYY-MM-DD 00:00:00");
                let end = moment().format("YYYY-MM-DD 23:59:59.999");
                where = `Sp_GameRecord.createTimeDate > "${start}"  AND Sp_GameRecord.createTimeDate <= "${end}"`;
            }
            if (managerAgent) {
                if (agent.roleType == 2) {
                    const agentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: agent.platformName });
                    const list = [];
                    agentList.forEach(x => {
                        list.push(`"${x}"`);
                    });
                    if (where) {
                        where = where + ` AND Sp_GameRecord.groupRemark IN (${list})`;
                    }
                    else {
                        where = `Sp_GameRecord.groupRemark IN (${list}) `;
                    }
                }
                else {
                    if (where) {
                        where = where + ` AND Sp_GameRecord.groupRemark = "${agent.platformName}" `;
                    }
                    else {
                        where = `Sp_GameRecord.groupRemark = "${agent.platformName}" `;
                    }
                }
            }
            if (gameOrder) {
                if (where) {
                    where = where + ` AND Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }
                else {
                    where = `Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }
            }
            else if (roundId) {
                if (where) {
                    where = where + ` AND Sp_GameRecord.round_id = "${roundId}"`;
                }
                else {
                    where = `Sp_GameRecord.round_id = "${roundId}"`;
                }
            }
            if (thirdUid) {
                if (where) {
                    where = where + ` AND Sp_GameRecord.thirdUid = "${thirdUid}"`;
                }
                else {
                    where = `Sp_GameRecord.thirdUid = "${thirdUid}"`;
                }
            }
            if (nid) {
                if (where) {
                    where = where + ` AND Sp_GameRecord.game_id = "${nid}"`;
                }
                else {
                    where = `Sp_GameRecord.game_id = "${nid}"`;
                }
            }
            if (where) {
                const { list, count } = await GameRecord_mysql_dao_1.default.findListToLimitForWhereForMoreTable(platformUid, table1, table2, where, page, pageSize);
                const res = list.map((info) => {
                    info.groupRemark = this.agentForChangeName(info.groupRemark);
                    let sceneName = null;
                    const games = game_scenes.find(x => x.nid == info.nid);
                    if (games) {
                        let scene = games.scenes.find(x => x.scene == info.sceneId);
                        if (scene) {
                            sceneName = scene.name;
                        }
                        else {
                            sceneName = info.sceneId;
                        }
                    }
                    return Object.assign({ sceneName }, info);
                });
                return { gameRecords: res, allLength: count };
            }
            else {
                return { gameRecords: [], allLength: 0 };
            }
        }
        catch (error) {
            ManagerErrorLogger.error(` 第三方 API 的相关功能， 获取游戏记录 :${error.stack || error}`);
            return { code: 500, error: error };
        }
    }
    async queryPlayer(uid, managerUid, rootAgent, managerAgent, thirdUid, page, pageSize, ip) {
        try {
            if (!uid && !thirdUid && !ip) {
                return Promise.reject("请输入id");
            }
            let resultList = [];
            if (uid) {
                let player = await Player_manager_1.default.findOne({ uid }, false);
                if (!player) {
                    return Promise.reject("玩家不存在");
                }
                if (rootAgent == managerAgent) {
                    if (player.group_id != managerUid) {
                        return Promise.reject("该玩家不属于该平台");
                    }
                }
                else if (rootAgent !== managerAgent) {
                    if (player.groupRemark != managerAgent) {
                        return Promise.reject("该玩家不属于该代理");
                    }
                }
                const info = {
                    uid: player.uid,
                    thirdUid: player.thirdUid,
                    groupRemark: player.groupRemark,
                    gold: player.gold,
                    ip: player.ip ? player.ip : '',
                    loginTime: player.loginTime,
                    createTime: player.createTime,
                    walletGold: player.walletGold,
                    cellPhone: player ? player.cellPhone.substr(0, 6) + "****" + player.cellPhone.substr(7) : '',
                    superior: player ? player.superior : '',
                    addRmb: player.addRmb,
                    addTixian: player.addTixian ? player.addTixian : 0,
                    closeTime: player.closeTime,
                    flowCount: player.flowCount,
                    dailyFlow: player.dailyFlow,
                    rom_type: player.rom_type,
                    instantNetProfit: player.instantNetProfit,
                };
                resultList.push(info);
            }
            else {
                let playerList = [];
                if (thirdUid) {
                    playerList = await Player_manager_1.default.findList({ thirdUid });
                }
                else if (ip) {
                    playerList = await Player_manager_1.default.findList({ ip });
                }
                if (playerList.length == 0) {
                    return Promise.reject("玩家不存在");
                }
                let player1 = playerList[0];
                if (rootAgent == managerAgent) {
                    if (player1.group_id != managerUid) {
                        return Promise.reject("该玩家不属于该平台");
                    }
                }
                else if (rootAgent !== managerAgent) {
                    if (player1.groupRemark != managerAgent) {
                        return Promise.reject("该玩家不属于该代理");
                    }
                }
                for (let player of playerList) {
                    const info = {
                        uid: player.uid,
                        thirdUid: player.thirdUid,
                        groupRemark: player.groupRemark,
                        gold: player.gold,
                        ip: player.ip ? player.ip : '',
                        loginTime: player.loginTime,
                        createTime: player.createTime,
                        walletGold: player.walletGold,
                        cellPhone: player ? player.cellPhone.substr(0, 6) + "****" + player.cellPhone.substr(7) : '',
                        superior: player ? player.superior : '',
                        addRmb: player.addRmb,
                        addTixian: player.addTixian ? player.addTixian : 0,
                        closeTime: player.closeTime,
                        flowCount: player.flowCount,
                        dailyFlow: player.dailyFlow,
                        rom_type: player.rom_type,
                        instantNetProfit: player.instantNetProfit,
                    };
                    resultList.push(info);
                }
            }
            return { code: 200, data: { resultList, allPlayersLength: 1 } };
        }
        catch (e) {
            ManagerErrorLogger.error(`玩家每日上下分的记录 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async getAgentPlayers(uid, managerUid, rootAgent, managerAgent, thirdUid, page, pageSize, ip) {
        try {
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.thirdUid", "Player.gold", "Player.loginTime", "Player.ip", "Player.closeTime", "Player.instantNetProfit",
                "Player.rom_type", "Player.createTime", "Player.walletGold", "Player.addTixian", "Player.addRmb", "Player.flowCount", "Player.dailyFlow"];
            let where = null;
            if (managerAgent == rootAgent) {
                where = `Player.group_id = "${managerUid}"`;
                const { list, count } = await Player_manager_1.default.findListForManager(where, page, pageSize, selectFile);
                if (list && list.length !== 0) {
                    if (rootAgent == '459pt') {
                        const playerList = list.map((info) => {
                            info.groupRemark = this.agentForChangeName(info.groupRemark);
                            return info;
                        });
                        return { code: 200, data: { resultList: playerList, allPlayersLength: count } };
                    }
                    ;
                }
                return { code: 200, data: { resultList: list, allPlayersLength: count } };
            }
            else if (managerAgent != rootAgent) {
                where = `Player.groupRemark = "${managerAgent}"`;
                const { list, count } = await Player_manager_1.default.findListForManager(where, page, pageSize, selectFile);
                if (list && list.length !== 0) {
                    if (rootAgent == '459pt') {
                        const playerList = list.map((info) => {
                            info.groupRemark = this.agentForChangeName(info.groupRemark);
                            return info;
                        });
                        return { code: 200, data: { resultList: playerList, allPlayersLength: count } };
                    }
                    ;
                }
                return { code: 200, data: { resultList: list, allPlayersLength: count } };
            }
            else {
                return { code: 200, data: { resultList: [], allPlayersLength: 0 } };
            }
        }
        catch (e) {
            ManagerErrorLogger.error(`玩家每日上下分的记录 exception : ${e.stack | e}`);
            return { code: 500, data: { resultList: [], allPlayersLength: 0 } };
            ;
        }
    }
    ;
    async getWarnGoldCfg() {
        try {
            const data = await ThirdApiWarnGold_redis_dao_1.default.findWarnGoldCfg();
            return data;
        }
        catch (e) {
            ManagerErrorLogger.error(`获取第三方上下分警告设置 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async setWarnGoldCfg(warnGoldCfg) {
        try {
            await ThirdApiWarnGold_redis_dao_1.default.updateWarnGoldCfg(warnGoldCfg);
            return true;
        }
        catch (e) {
            ManagerErrorLogger.error(`获取第三方上下分警告设置 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async getThirdGoldRecord(page, uid, pageSize, startTime, endTime) {
        try {
            if (uid) {
                const { list, count } = await ThirdGoldRecord_mysql_dao_1.default.findListForUid(uid, page, pageSize);
                return { record: list, allLength: count };
            }
            const { list, count } = await ThirdGoldRecord_mysql_dao_1.default.findListToLimitNoTime(startTime, endTime, page, pageSize);
            return { record: list, allLength: count };
        }
        catch (e) {
            ManagerErrorLogger.error(`查看平台和给平台添加金币的记录 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async setPlayerWarnGold(orderId, uid, remark) {
        try {
            const player = await Player_manager_1.default.findOne({ uid }, true);
            let updateGold = player.earlyWarningGold;
            const updateAttr = [];
            switch (remark) {
                case 1:
                    player.gold += updateGold;
                    await Player_manager_1.default.updateOne({ uid: player.uid }, { gold: player.gold, earlyWarningGold: 0, earlyWarningFlag: true, entryGold: 0 });
                    await ThirdGoldRecord_mysql_dao_1.default.updateOne({ orderId }, { status: 4, remark: "手动通过" });
                    await ThirdGoldRecord_redis_dao_1.default.delLength({ length: 1 });
                    ManagerErrorLogger.warn(`预警下分 | 通过操作 | 玩家: ${uid} | 订单: ${orderId} | 暂扣金币 ${updateGold} | 通过后金币 ${player.gold}`);
                    return true;
                case 2:
                    const gameRecord = {
                        uid: player.uid,
                        nickname: player.nickname,
                        nid: 't2',
                        gname: "平台下分",
                        superior: player.superior ? player.superior : '',
                        groupRemark: player.groupRemark,
                        group_id: player.group_id ? player.group_id : null,
                        thirdUid: player.thirdUid,
                        createTime: new Date(),
                        input: player.earlyWarningGold,
                        win: player.entryGold,
                        bet_commission: 0,
                        win_commission: 0,
                        settle_commission: 0,
                        profit: player.entryGold - player.earlyWarningGold,
                        gold: player.entryGold,
                        playStatus: 1,
                        sceneId: -1,
                        roomId: '-1',
                        addRmb: player.addRmb,
                        addTixian: player.addTixian,
                        gameOrder: orderId,
                        playerCreateTime: player.createTime,
                    };
                    await Promise.all([
                        Player_manager_1.default.updateOne({ uid: player.uid }, { gold: player.entryGold, earlyWarningGold: 0, entryGold: 0 }),
                        ThirdGoldRecord_mysql_dao_1.default.updateOne({ orderId }, { status: 2, remark: "拒绝" })
                    ]);
                    const nidList = ["81", "19", "42", "8"];
                    const gameNameList = ["红包扫雷", "红黑大战", "龙虎斗", "百家乐"];
                    const idx = (0, utils_1.random)(0, 4);
                    const nid = nidList[idx];
                    const gameName = gameNameList[idx];
                    const reproduceGameRecord = Object.assign({}, gameRecord);
                    reproduceGameRecord.nid = nid;
                    reproduceGameRecord.gname = gameName;
                    await GameRecordDateTable_mysql_dao_1.default.insertOne(reproduceGameRecord);
                    await ThirdGoldRecord_redis_dao_1.default.delLength({ length: 1 });
                    return true;
                default:
                    return true;
            }
        }
        catch (e) {
            ManagerErrorLogger.error(`查看平台和给平台添加金币的记录 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async onlinePlayers(page, pageSize) {
        try {
            let onlineList = await OnlinePlayer_redis_dao_1.default.findList();
            let uidList = onlineList.sort((a, b) => a.entryGameTime < b.entryGameTime ? 1 : -1);
            const count = pageSize ? pageSize : 20;
            const start = (page - 1) * count;
            const end = page * count + 1;
            let length = uidList.length;
            uidList = uidList.slice(start, end);
            const uids = uidList.map(x => x.uid);
            let selectFile = ["Player.uid", "Player.addDayRmb", "Player.addDayTixian", "Player.gold", "Player.loginCount", "Player.dailyFlow", "Player.loginTime", "Player.addRmb"];
            const resultList = await Player_manager_1.default.findListToLimitInUids(selectFile, uids);
            let gameList = await Game_manager_1.default.findList({});
            let games = [];
            gameList.forEach(game => {
                if (game.opened) {
                    games.push({
                        name: game.zname,
                        nid: game.nid,
                    });
                }
            });
            const playerList = resultList
                .reduce((res, player) => {
                if (!player) {
                    return res;
                }
                let info = {
                    uid: '',
                    nid: '',
                    sceneId: -1,
                    addDayRmb: 0,
                    addDayTixian: 0,
                    loginTime: '',
                    addRmb: 0,
                    dailyFlow: 0,
                    createTime: 0,
                    profit: 0,
                    gold: 0,
                    allProfit: 0,
                };
                const online = onlineList.find(x => x.uid == player.uid);
                if (!online) {
                    return res;
                }
                info.uid = player.uid;
                info.nid = online.nid;
                info.sceneId = online.sceneId;
                info.addDayRmb = player.addDayRmb;
                info.addDayTixian = player.addDayTixian;
                info.loginTime = player.loginTime;
                info.gold = player.gold;
                info.addRmb = player.addRmb;
                info.dailyFlow = player.dailyFlow;
                info.allProfit = player.instantNetProfit;
                info.profit = player.addDayTixian + player.gold - player.addDayRmb;
                res.push(info);
                return res;
            }, []);
            return { games, playerList, length };
        }
        catch (e) {
            ManagerErrorLogger.error(`获取当天在线人数 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async loginPlayers(page, pageSize) {
        try {
            let loginList = await DayLoginPlayer_redis_dao_1.default.findList({});
            let uidList = loginList.sort((a, b) => a.loginTime < b.loginTime ? 1 : -1);
            const count = pageSize ? pageSize : 20;
            const start = (page - 1) * count;
            const end = page * count + 1;
            let length = uidList.length;
            uidList = uidList.slice(start, end);
            const uids = uidList.map(x => x.uid);
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.addDayRmb", "Player.addDayTixian", "Player.gold", "Player.loginCount", "Player.dailyFlow", "Player.loginTime", "Player.addRmb"];
            const resultList = await Player_manager_1.default.findListToLimitInUids(selectFile, uids);
            const playerList = resultList
                .reduce((res, player) => {
                if (!player) {
                    return res;
                }
                let info = {
                    uid: '',
                    addDayRmb: 0,
                    addDayTixian: 0,
                    groupRemark: '',
                    loginTime: '',
                    addRmb: 0,
                    dailyFlow: 0,
                    createTime: 0,
                    profit: 0,
                    gold: 0,
                    allProfit: 0,
                };
                info.uid = player.uid;
                info.addDayRmb = player.addDayRmb;
                info.groupRemark = player.groupRemark;
                info.addDayTixian = player.addDayTixian;
                info.loginTime = player.loginTime;
                info.gold = player.gold;
                info.addRmb = player.addRmb;
                info.dailyFlow = player.dailyFlow;
                info.allProfit = player.instantNetProfit;
                info.profit = player.addDayTixian + player.gold - player.addDayRmb;
                res.push(info);
                return res;
            }, []);
            return { playerList, length };
        }
        catch (e) {
            ManagerErrorLogger.error(`综合报表 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async createPlayers(page, pageSize) {
        try {
            let loginList = await DayCreatePlayer_redis_dao_1.default.findList({});
            let uidList = loginList.sort((a, b) => a.createTime < b.createTime ? 1 : -1);
            const count = pageSize ? pageSize : 20;
            const start = (page - 1) * count;
            const end = page * count + 1;
            let length = uidList.length;
            uidList = uidList.slice(start, end);
            const uids = uidList.map(x => x.uid);
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.addDayRmb", "Player.addDayTixian", "Player.gold", "Player.loginCount", "Player.dailyFlow", "Player.loginTime", "Player.addRmb"];
            const resultList = await Player_manager_1.default.findListToLimitInUids(selectFile, uids);
            const playerList = resultList
                .reduce((res, player) => {
                if (!player) {
                    return res;
                }
                let info = {
                    uid: '',
                    addDayRmb: 0,
                    addDayTixian: 0,
                    groupRemark: '',
                    loginTime: '',
                    addRmb: 0,
                    dailyFlow: 0,
                    createTime: 0,
                    profit: 0,
                    gold: 0,
                    allProfit: 0,
                };
                info.uid = player.uid;
                info.addDayRmb = player.addDayRmb;
                info.groupRemark = player.groupRemark;
                info.addDayTixian = player.addDayTixian;
                info.loginTime = player.loginTime;
                info.gold = player.gold;
                info.addRmb = player.addRmb;
                info.dailyFlow = player.dailyFlow;
                info.allProfit = player.instantNetProfit;
                info.profit = player.addDayTixian + player.gold - player.addDayRmb;
                res.push(info);
                return res;
            }, []);
            return { playerList, length };
        }
        catch (e) {
            ManagerErrorLogger.error(`综合报表 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async agentPlayerGameRecord(managerAgent, rootAgent, startTime, endTime, thirdUid, nid) {
        try {
            const startTable = moment(startTime).format("YYYYMM");
            if (Number(startTable) < 202106) {
                return Promise.reject("请输入正确的时间范围");
            }
            const endTable = moment(endTime).format("YYYYMM");
            const nowTable = moment().format("YYYYMM");
            if (Number(endTable) > Number(nowTable)) {
                return Promise.reject("请输入正确的时间范围");
            }
            const startTimeDate = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
            const endTimeData = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
            let table1 = null;
            let table2 = null;
            let platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUid({ platformName: rootAgent });
            if (startTable == endTable) {
                table1 = startTable;
            }
            else {
                table1 = startTable;
                table2 = endTable;
            }
            let where = `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND  gr.game_id not in ('t1','t2')`;
            if (thirdUid) {
                where = `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND gr.thirdUid = "${thirdUid}"
                            AND  gr.game_id not in ('t1','t2')`;
            }
            if (nid) {
                where = `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND  gr.game_id = "${nid}" `;
            }
            if (nid && thirdUid) {
                where = `gr.createTimeDate >= "${startTimeDate}"
                            AND gr.createTimeDate < "${endTimeData}"
                            AND gr.groupRemark = "${managerAgent}"
                            AND gr.thirdUid = "${thirdUid}"
                            AND  gr.game_id = "${nid}" `;
            }
            const total = await GameRecord_mysql_dao_1.default.getTenantGameData(platformUid, where, table1, table2);
            return total;
        }
        catch (e) {
            ManagerErrorLogger.error(`综合报表 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
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
ThirdApiService = __decorate([
    (0, common_1.Injectable)()
], ThirdApiService);
exports.ThirdApiService = ThirdApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmRBcGkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbW9kdWxlcy9tYW5hZ2VyQmFja2VuZEFwaS90aGlyZEFwaS90aGlyZEFwaS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUE0QztBQUM1QywrQ0FBeUM7QUFDekMsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3pELDhHQUFxRztBQUNyRyxzR0FBNkY7QUFDN0YsNEdBQW1HO0FBQ25HLDBHQUFpRztBQUNqRywyRkFBc0Y7QUFDdEYsdUZBQStFO0FBQy9FLG9IQUEyRztBQUMzRyxrR0FBeUY7QUFDekYsNEdBQW1HO0FBRW5HLG9HQUEyRjtBQUMzRiw0R0FBbUc7QUFDbkcsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7QUFDakYsbURBQWlEO0FBQ2pELGlDQUFpQztBQUNqQyx3SEFBK0c7QUFDL0csTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7QUFHL0UsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUt4QixLQUFLLENBQUMsNEJBQTRCLENBQUMsVUFBa0IsRUFBRSxTQUFrQixFQUFFLElBQVksRUFBRSxTQUFpQixFQUFFLE9BQWUsRUFBRSxZQUFvQixFQUFFLFFBQWdCLEVBQUUsR0FBVyxFQUFFLFFBQWdCLEVBQUUsU0FBa0IsRUFBRSxPQUFnQjtRQUNwTyxJQUFJO1lBQ0EsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDZixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDdkM7WUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLCtCQUFtQixDQUFDLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRSxZQUFZ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