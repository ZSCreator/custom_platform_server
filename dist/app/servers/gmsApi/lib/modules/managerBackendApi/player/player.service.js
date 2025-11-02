"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const Utils = require("../../../../../../utils/index");
const PlayerEnum = require("../../../const/playerEnum");
const pinus_logger_1 = require("pinus-logger");
const RedisManager = require("../../../../../../common/dao/redis/lib/redisManager");
const pinus_1 = require("pinus");
const PositionEnum_1 = require("../../../../../../common/constant/player/PositionEnum");
const Player_manager_1 = require("../../../../../../common/dao/daoManager/Player.manager");
const Player_redis_dao_1 = require("../../../../../../common/dao/redis/Player.redis.dao");
const GameRecordDateTable_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecordDateTable.mysql.dao");
const OnlinePlayer_redis_dao_1 = require("../../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const platfomMonthKillRate_redis_dao_1 = require("../../../../../../common/dao/redis/platfomMonthKillRate.redis.dao");
const backendControlService_1 = require("../../../../../../services/newControl/backendControlService");
const GameRecord_mysql_dao_1 = require("../../../../../../common/dao/mysql/GameRecord.mysql.dao");
const game_scenes = require('../../../../../../../config/data/game_scenes.json');
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
let CacheData = {
    getPlayers: { time: 0, dataKey: 0, result: { allPage: 0, playerList: [] } },
};
let PlayerService = class PlayerService {
    async getPlayers(page, pageSize) {
        try {
            let count = PlayerEnum.PLAYER_LIST_COUNT.COUNT;
            let selectFile = ["Player.uid", "Player.groupRemark", "Player.thirdUid", "Player.gold", "Player.loginTime", "Player.ip", "Player.closeTime", "Player.instantNetProfit",
                "Player.rom_type", "Player.createTime", "Player.walletGold", "Player.addTixian", "Player.addRmb", "Player.flowCount", "Player.dailyFlow", "Player.position"];
            const playerResult = await Player_manager_1.default.findListToLimitForManager(page, count, selectFile);
            const playerList = playerResult.list;
            const allPlayersLength = playerResult.count;
            return { code: 200, data: { resultList: playerList, allPlayersLength } };
        }
        catch (error) {
            ManagerErrorLogger.warn(`getAllPlayers ==>error: ${error}`);
            console.info(`getAllPlayers ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getCacheData(page, key, count) {
        const data = CacheData[key];
        const queryTime = Date.now();
        if (!data) {
            return false;
        }
        if (queryTime - data.time > PlayerEnum.GET_CACHE_DATA.TIME) {
            return false;
        }
        let dataKey = "dataKey" + Math.floor(((page + 1) / 2));
        if (data.dataKey != dataKey) {
            return false;
        }
        if (!!data.result) {
            const playerList = data.result.playerList;
            let resultList;
            let num = page % 2;
            if (num == 1) {
                resultList = playerList.slice(0, count);
            }
            else {
                resultList = playerList.slice(-count);
            }
            return { allPlayersLength: data.result.allPlayersLength, resultList };
        }
        return false;
    }
    async queryPlayer(uid, thirdUid, ip) {
        if (!uid && !thirdUid && !ip) {
            return Promise.reject("请输入id");
        }
        let resultList = [];
        if (uid) {
            let player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return Promise.reject("玩家不存在");
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
                position: player.position,
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
                    position: player.position,
                    instantNetProfit: player.instantNetProfit,
                };
                resultList.push(info);
            }
        }
        return { code: 200, data: { resultList, allPlayersLength: 1 } };
    }
    async getOnePlayerMessage(uid) {
        try {
            if (!uid) {
                return Promise.reject("请输入uid");
            }
            const player = await Player_manager_1.default.findOne({ uid }, false);
            let info = {
                uid: player.uid,
                thirdUid: player.thirdUid,
                nickname: player.nickname,
                gold: player.gold,
                ip: player.ip,
                loginTime: player.loginTime,
                createTime: player.createTime,
                walletGold: player.walletGold,
                cellPhone: player ? (player.cellPhone ? player.cellPhone.substr(0, 6) + "****" + player.cellPhone.substr(7) : '') : '',
                superior: player.superior ? player.superior : '',
                profits: 0,
                yuzhiProfits: 0,
                closeReason: player.closeReason,
                closeTime: player.closeTime,
                group_id: player.group_id,
            };
            return { code: 200, player: info };
        }
        catch (error) {
            return Promise.reject("搜索玩家失败");
        }
    }
    async changePlayerPassWord(uid, passWord) {
        try {
            if (!uid) {
                return Promise.reject("请输入uid");
            }
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                return Promise.reject("玩家不存在");
            }
            if (!player.cellPhone) {
                return Promise.reject("玩家没有绑定手机号,不能修改密码");
            }
            passWord = Utils.signature(passWord, false, false);
            await Player_manager_1.default.updateOne({ uid: uid }, { passWord: passWord });
            return { code: 200, msg: "修改成功" };
        }
        catch (error) {
            return Promise.reject("修改密码失败");
        }
    }
    async closeTimeAndReason(uid, closeReason, closeTime) {
        let lockRef;
        try {
            await pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer('*', uid);
            const player = await Player_manager_1.default.findOne({ uid }, false);
            let num = Date.now() + closeTime * 1000 * 60;
            player.closeTime = new Date(num);
            player.closeReason = closeReason;
            if (player.gold > player.oneAddRmb) {
                let profit = player.oneAddRmb - player.gold;
                player.gold = player.oneAddRmb;
                const gameRecord = {
                    uid: player.uid,
                    nid: 't2',
                    gameName: '冻结异常所得',
                    groupRemark: player.groupRemark ? player.groupRemark : null,
                    group_id: player.group_id ? player.group_id : null,
                    thirdUid: player.thirdUid,
                    input: 0,
                    validBet: 0,
                    bet_commission: 0,
                    win_commission: 0,
                    settle_commission: 0,
                    profit: -Math.floor(profit),
                    gold: player.gold,
                    playStatus: 1,
                    addRmb: player.addRmb,
                    addTixian: player.addTixian,
                    gameOrder: Utils.id(),
                    sceneId: -1,
                    way: 0,
                    roomId: '-1',
                    isDealer: false,
                    playersNumber: 0,
                };
                await GameRecordDateTable_mysql_dao_1.default.insertOne(gameRecord);
            }
            await Player_manager_1.default.updateOne({ uid }, { gold: player.gold, closeTime: player.closeTime, closeReason: player.closeReason });
            return { code: 200, msg: "封禁成功" };
        }
        catch (error) {
            lockRef && await RedisManager.unlock(lockRef);
            ManagerErrorLogger.warn(`closeTimeAndReason ==>error: ${error}`);
            console.info(`closeTimeAndReason ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async changePlayerPosition(uid) {
        try {
            await Player_manager_1.default.updateOne({ uid }, { position: PositionEnum_1.PositionEnum.HALL });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.warn(`changePlayerPosition ==>error: ${error}`);
            console.info(`changePlayerPosition ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async deleteOnlinePlayer(uid) {
        try {
            await Promise.all([
                OnlinePlayer_redis_dao_1.default.deleteOne({ uid }),
                Player_manager_1.default.updateOne({ uid }, { position: PositionEnum_1.PositionEnum.HALL })
            ]);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.warn(`deleteOnlinePlayer ==>error: ${error}`);
            console.info(`deleteOnlinePlayer ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getPlayerGameRecordForUidAndGroupId(uid, group_id, page) {
        try {
            const { list, count } = await GameRecord_mysql_dao_1.default.findForUidAndGroupId(uid, group_id, page);
            if (list.length !== 0) {
                const res = list.map((info) => {
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
                return { list: res, count: count };
            }
            else {
                return { list: [], count: 0 };
            }
        }
        catch (error) {
            ManagerErrorLogger.warn(`getPlayerGameRecordForUidAndGroupId ==>error: ${error}`);
            console.info(`getPlayerGameRecordForUidAndGroupId ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async kickOnePlayer(uid) {
        try {
            const OnlinePlayer = await OnlinePlayer_redis_dao_1.default.findOne({ uid });
            if (OnlinePlayer) {
                let frontendServerId = OnlinePlayer.frontendServerId;
                await pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
            }
            else {
                await pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer('*', uid);
            }
            return true;
        }
        catch (error) {
            ManagerErrorLogger.warn(`kickOnePlayer ==>error: ${error}`);
            console.info(`kickOnePlayer ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async kickOneGamePlayers(nid) {
        try {
            const OnlinePlayers = await OnlinePlayer_redis_dao_1.default.findList();
            const players = OnlinePlayers.filter(x => x.nid == nid);
            if (players.length > 0) {
                for (let player of players) {
                    let frontendServerId = player.frontendServerId;
                    let uid = player.uid;
                    await pinus_1.pinus.app.rpc.connector.enterRemote.kickOnePlayer.toServer(frontendServerId, uid);
                }
            }
            return true;
        }
        catch (error) {
            ManagerErrorLogger.warn(`kickOneGamePlayers ==>error: ${error}`);
            console.info(`kickOneGamePlayers ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async managerFentkongForSinglePlayer(uid, thirdUid) {
        try {
            if (thirdUid && !uid) {
                const player = await Player_manager_1.default.findOne({ thirdUid }, true);
                if (!player) {
                    return { playerList: [], length: 0 };
                }
                uid = player.uid;
            }
            const online = await OnlinePlayer_redis_dao_1.default.findOne({ uid });
            if (!online) {
                return { playerList: [], length: 0 };
            }
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { playerList: [], length: 0 };
            }
            const { nid, sceneId, roomId } = online;
            let sceneName = null;
            let gameName = null;
            const games = game_scenes.find(x => x.nid == nid);
            if (games) {
                gameName = games.name;
                let scene = games.scenes.find(x => x.scene == sceneId);
                if (scene) {
                    sceneName = scene.name;
                }
                else {
                    sceneName = "选场";
                }
            }
            const control = await backendControlService_1.BackendControlService.getTotalControlPlayer(player.uid);
            const agentKillRateList = await platfomMonthKillRate_redis_dao_1.default.findOne({});
            let agentRate = 0;
            if (agentKillRateList && agentKillRateList.length != 0) {
                if (player.groupRemark) {
                    let item = agentKillRateList.find(x => x.groupRemark == player.groupRemark);
                    agentRate = item ? item.winRate : 0;
                }
            }
            const { addDayRmb, addDayTixian, loginCount, ip, gold, createTime, addRmb, dailyFlow, maxBetGold, flowCount, instantNetProfit, } = player;
            const profit = player.addDayTixian + player.gold - player.addDayRmb;
            return {
                playerList: [{
                        uid,
                        superior: player.groupRemark + "_" + player.lineCode,
                        addDayRmb,
                        addDayTixian,
                        loginCount,
                        agentRate: agentRate,
                        ip,
                        gold,
                        createTime,
                        addRmb,
                        dailyFlow,
                        flowCount,
                        maxBetGold,
                        nid,
                        gameName: gameName ? gameName : '大厅' + online.nid,
                        sceneId: sceneId ? sceneId : -1,
                        sceneName: sceneName,
                        profit,
                        instantNetProfit: instantNetProfit,
                        control: control ? control.probability : 0,
                        roomId: roomId ? roomId : '无'
                    }],
                length: 1
            };
        }
        catch (e) {
            ManagerErrorLogger.error(`查询在线玩家的相关信息,单个玩家uid exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
    async managerPlayerFengkongForPlayerList(platformUid, nidList, queryIp, dayProfit, maxBetGold, addRmb, page, pageSize) {
        try {
            page = page ? page : 1;
            pageSize = pageSize ? pageSize : 20;
            let onlineList = await OnlinePlayer_redis_dao_1.default.findList();
            let uidList;
            if (nidList.length !== 0) {
                let nid = nidList[0];
                uidList = onlineList.filter(m => m.nid == nid);
            }
            else {
                uidList = onlineList;
            }
            if (uidList.length == 0) {
                return { playerList: [], length: 0 };
            }
            let length = uidList.length;
            uidList = uidList.sort(function (a, b) {
                return a.time < b.time ? 1 : -1;
            });
            uidList = uidList.splice((page - 1) * pageSize, pageSize);
            const uids = uidList.map(x => x.uid);
            const resultList = await Player_redis_dao_1.default.findListInUids(uids);
            let playerList = [];
            const controlUidList = await backendControlService_1.BackendControlService.getControlPlayers();
            const agentKillRateList = await platfomMonthKillRate_redis_dao_1.default.findOne({});
            for (let uid of uids) {
                let player = resultList.find(pl => pl.uid == uid);
                if (!player) {
                    continue;
                }
                if (platformUid && player.group_id !== platformUid) {
                    continue;
                }
                if (queryIp && queryIp != player.ip) {
                    continue;
                }
                const online = uidList.find(x => x.uid == player.uid);
                if (!online) {
                    continue;
                }
                let control = 0;
                const isControl = await controlUidList.find(x => x.uid == player.uid);
                if (isControl) {
                    control = isControl.probability;
                }
                let sceneName = null;
                let gameName = null;
                const games = game_scenes.find(x => x.nid == online.nid);
                if (games) {
                    gameName = games.name;
                    let scene = games.scenes.find(x => x.scene == online.sceneId);
                    if (scene) {
                        sceneName = scene.name;
                    }
                    else {
                        sceneName = "选场";
                    }
                }
                let agentRate = 0;
                if (agentKillRateList && agentKillRateList.length != 0) {
                    if (player.groupRemark) {
                        let item = agentKillRateList.find(x => x.groupRemark == player.groupRemark);
                        agentRate = item ? item.winRate : 0;
                    }
                }
                let info = {
                    uid: player.uid,
                    superior: player.groupRemark + "_" + player.lineCode,
                    nid: online.nid,
                    gameName: gameName ? gameName : '大厅' + online.nid,
                    sceneId: online.sceneId ? online.sceneId : -1,
                    sceneName: sceneName,
                    addDayRmb: player.addDayRmb,
                    addDayTixian: player.addDayTixian,
                    loginCount: player.loginCount,
                    ip: player.ip,
                    addRmb: player.addRmb,
                    dailyFlow: player.dailyFlow,
                    maxBetGold: player.maxBetGold,
                    createTime: player.createTime,
                    profit: player.addDayTixian + player.gold - player.addDayRmb,
                    gold: player.gold,
                    group_id: player.group_id,
                    instantNetProfit: player.instantNetProfit,
                    flowCount: player.flowCount,
                    control: control,
                    agentRate: agentRate,
                    roomId: online.roomId ? online.roomId : '-1'
                };
                playerList.push(info);
            }
            playerList.sort((a, b) => b.dailyFlow - a.dailyFlow);
            return { playerList, length };
        }
        catch (e) {
            ManagerErrorLogger.error(`查询在线玩家的相关信息 exception : ${e.stack | e}`);
            return {};
        }
    }
    ;
};
PlayerService = __decorate([
    (0, common_1.Injectable)()
], PlayerService);
exports.PlayerService = PlayerService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL21vZHVsZXMvbWFuYWdlckJhY2tlbmRBcGkvcGxheWVyL3BsYXllci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDJDQUE2QztBQUM3Qyx1REFBd0Q7QUFDeEQsd0RBQXlEO0FBQ3pELCtDQUF5QztBQUN6QyxvRkFBb0Y7QUFDcEYsaUNBQThCO0FBQzlCLHdGQUFxRjtBQUNyRiwyRkFBc0Y7QUFDdEYsMEZBQW1GO0FBQ25GLG9IQUEyRztBQUMzRyxzR0FBNkY7QUFDN0Ysc0hBQXFHO0FBRXJHLHVHQUFvRztBQUNwRyxrR0FBeUY7QUFDekYsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7QUFDakYsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLHdCQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBUXpELElBQUksU0FBUyxHQUFRO0lBQ2pCLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRTtDQUU5RSxDQUFDO0FBSUYsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtJQUt0QixLQUFLLENBQUMsVUFBVSxDQUFDLElBQVksRUFBRSxRQUFnQjtRQUMzQyxJQUFJO1lBQ0EsSUFBSyxLQUFLLEdBQUcsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQVNoRCxJQUFJLFVBQVUsR0FBRyxDQUFDLFlBQVksRUFBRSxvQkFBb0IsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLHlCQUF5QjtnQkFDakss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