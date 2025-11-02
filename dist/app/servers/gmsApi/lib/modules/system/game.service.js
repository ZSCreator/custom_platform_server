"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const GameController = require("../../../../../services/hall/gameController");
const pinus_logger_1 = require("pinus-logger");
const gameControlService_1 = require("../../../../../services/newControl/gameControlService");
const backendControlService_1 = require("../../../../../services/newControl/backendControlService");
const hallConst_1 = require("../../../../../consts/hallConst");
const winLimitConfigDAOImpl_1 = require("../../../../../domain/CommonControl/DAO/winLimitConfigDAOImpl");
const slotLimitConfigObserver_1 = require("../../../../../domain/CommonControl/slotLimitConfigObserver");
const schedule_1 = require("../../../../../services/bonusPools/schedule");
const BonusPool_mysql_dao_1 = require("../../../../../common/dao/mysql/BonusPool.mysql.dao");
const Player_manager_1 = require("../../../../../common/dao/daoManager/Player.manager");
const controlRecordDAO = require("../../../../../services/newControl/DAO/controlRecordDAO");
const SystemGameType_manager_1 = require("../../../../../common/dao/daoManager/SystemGameType.manager");
const Game_manager_1 = require("../../../../../common/dao/daoManager/Game.manager");
const Scene_manager_1 = require("../../../../../common/dao/daoManager/Scene.manager");
const Room_manager_1 = require("../../../../../common/dao/daoManager/Room.manager");
const GameRecord_mysql_dao_1 = require("../../../../../common/dao/mysql/GameRecord.mysql.dao");
const HotGameData_mysql_dao_1 = require("../../../../../common/dao/mysql/HotGameData.mysql.dao");
const mjConst_1 = require("../../../../MJ/lib/mjConst");
const OnlinePlayer_redis_dao_1 = require("../../../../../common/dao/redis/OnlinePlayer.redis.dao");
const FileExprotData = require("../../../../../services/manager/fileData/FileExprotData");
const game_scenes = require('../../../../../../config/data/game_scenes.json');
const PlatformNameAgentList_redis_dao_1 = require("../../../../../common/dao/redis/PlatformNameAgentList.redis.dao");
const moment = require("moment");
const ShareTenantRoomSituation_redis_dao_1 = require("../../../../../common/dao/redis/ShareTenantRoomSituation.redis.dao");
const JsonConfig_1 = require("../../../../../pojo/JsonConfig");
const ManagerErrorLogger = (0, pinus_logger_1.getLogger)('http', __filename);
let GameService = class GameService {
    async getAllGames() {
        try {
            const allGames = await Game_manager_1.default.findList({}, true);
            const list = allGames.map(m => {
                return {
                    zname: m.zname,
                    nid: m.nid,
                    opened: m.opened,
                };
            });
            return { code: 200, data: { list } };
        }
        catch (error) {
            ManagerErrorLogger.warn(`getAllGames ==>error: ${error}`);
            console.info(`getAllGames ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getCloseGamesAndOpen() {
        try {
            const allGames = await Game_manager_1.default.findList({});
            let colseList = [];
            const openList = allGames.map(m => {
                if (m.opened) {
                    return {
                        zname: m.zname,
                        nid: m.nid,
                        opened: m.opened,
                    };
                }
                else {
                    colseList.push({
                        zname: m.zname,
                        nid: m.nid,
                        opened: m.opened,
                    });
                }
            });
            return { code: 200, data: { openList, colseList } };
        }
        catch (error) {
            ManagerErrorLogger.warn(`getCloseGamesAndOpen ==>error: ${error}`);
            console.info(`getCloseGamesAndOpen ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async setOneGameClose(nid, opened) {
        try {
            await Game_manager_1.default.updateOne({ nid }, { opened: opened });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.warn(`setOneGameClose ==>error: ${error}`);
            console.info(`setOneGameClose ==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async setSystemTypeForNid(gameType) {
        try {
            await SystemGameType_manager_1.default.updateOne({ typeId: gameType.typeId }, gameType);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setSystemTypeForNid ==>error: ${error}`);
            console.info(`setSystemTypeForNid==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getSystemType() {
        try {
            const record = await SystemGameType_manager_1.default.findList({});
            console.log("getSystemType", record);
            return record;
        }
        catch (error) {
            ManagerErrorLogger.info(`setSystemTypeForNid ==>error: ${error}`);
            console.info(`setSystemTypeForNid==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getSystemTypeForGameTypeId(typeId) {
        try {
            const game = await SystemGameType_manager_1.default.findOne({ typeId: typeId });
            return game;
        }
        catch (error) {
            ManagerErrorLogger.info(`getSystemTypeForGameTypeId ==>error: ${error}`);
            console.info(`getSystemTypeForGameTypeId==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async getGameRecordsForOtherTable(platformUid, page, pageSize, thirdUid, nid, uid, gameOrder, roundId, startTime, endTime) {
        try {
            let table1 = null;
            let table2 = null;
            if (startTime && endTime) {
                const day = moment(endTime).diff(moment(startTime), 'day');
                if (day + 1 > 10) {
                    return Promise.reject("查询范围请不要超过10天");
                }
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
            else if (!roundId && !gameOrder) {
                let start = moment().format("YYYY-MM-DD 00:00:00");
                let end = moment().format("YYYY-MM-DD 23:59:59.999");
                where = `Sp_GameRecord.createTimeDate > "${start}"  AND Sp_GameRecord.createTimeDate <= "${end}"`;
            }
            if (roundId) {
                where = `Sp_GameRecord.round_id = "${roundId}"`;
                let platformUidList = await PlatformNameAgentList_redis_dao_1.default.findAllPlatformUidList(false);
                const { list, count } = await GameRecord_mysql_dao_1.default.findListToLimitForRoundId(platformUidList, table1, where, page, pageSize);
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
            if (gameOrder) {
                if (where) {
                    where = where + ` AND Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }
                else {
                    where = `Sp_GameRecord.game_order_id = "${gameOrder}"`;
                }
                const list = gameOrder.split('-');
                if (list[0]) {
                    platformUid = list[0];
                }
                if (list[2] && list[2].length == 13) {
                    table1 = moment(parseInt(list[2])).format("YYYYMM");
                }
                else {
                    table1 = list[2].substring(0, 6);
                    ;
                }
            }
            if (uid) {
                const player = await Player_manager_1.default.findOneForUid(uid);
                if (player) {
                    platformUid = player.group_id ? player.group_id : null;
                }
                if (where) {
                    where = where + ` AND Sp_GameRecord.uid = "${uid}"`;
                }
                else {
                    where = `Sp_GameRecord.uid = "${uid}"`;
                }
            }
            if (thirdUid) {
                const player = await Player_manager_1.default.findOneForthirdUid(thirdUid);
                if (player) {
                    platformUid = player.group_id ? player.group_id : null;
                }
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
            else {
                return { list: [], count: 0 };
            }
        }
        catch (error) {
            ManagerErrorLogger.info(`getGameRecords ==>error: ${error}`);
            console.info(`getGameRecords==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async findGameResultById(platformUid = null, rootAgent, gameOrder, createTimeDate, groupRemark) {
        try {
            let platformTableName = platformUid;
            if (!platformUid && rootAgent) {
                platformTableName = await PlatformNameAgentList_redis_dao_1.default.findPlatformUid({ platformName: rootAgent });
            }
            if (!platformUid && !rootAgent) {
                if (groupRemark) {
                    platformTableName = await PlatformNameAgentList_redis_dao_1.default.findPlatformUidForAgent({ agent: groupRemark });
                }
            }
            let createTimeTable = moment(createTimeDate).format("YYYYMM");
            let table = `Sp_GameRecord_${createTimeTable}`;
            if (platformTableName) {
                table = `Sp_GameRecord_${platformTableName}_${createTimeTable}`;
            }
            let endTime = moment(createTimeDate).add(10, 'm').format("YYYY-MM-DD HH:mm:ss");
            let startTime = moment(createTimeDate).subtract(1, 'm').format("YYYY-MM-DD HH:mm:ss");
            const record = await GameRecord_mysql_dao_1.default.findForGameOrder(table, gameOrder, startTime, endTime);
            if (record) {
                let result = [];
                result.push(JSON.parse(record.result));
                return {
                    result: result,
                    id: record.id,
                    nid: record.nid,
                    gameName: record.gameName,
                    createTime: record.createTimeDate,
                    uid: record.uid,
                    status: record.status
                };
            }
            else {
                return null;
            }
        }
        catch (error) {
            ManagerErrorLogger.info(`findGameResultById ==>error: ${error}`);
            console.info(`findGameResultById==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async get_nid_scene() {
        let gamesList = [];
        try {
            const games = await Game_manager_1.default.findList({});
            const nidList = games.map(m => m.nid);
            for (const nid of nidList) {
                let res = await SceneManager.findList({ nid });
                res = res.map(m => {
                    return {
                        nid: m.nid,
                        sceneId: m.sceneId,
                        name: m.name,
                        entryCond: m.entryCond,
                        room_count: m.room_count
                    };
                });
                let game = await Game_manager_1.default.findOne({ nid });
                gamesList.push({ res, name: game ? game.zname : "" });
            }
            return gamesList;
        }
        catch (error) {
            ManagerErrorLogger.info(`get_nid_scene ==>error: ${error}`);
            console.info(`get_nid_scene==>error: ${error}`);
            return Promise.reject(error);
        }
    }
    async update_nid_scene(data) {
        try {
            for (const game of data) {
                let res = game.res;
                for (const res_one of res) {
                    await Scene_manager_1.default.updateOne({ nid: res_one.nid, sceneId: res_one.sceneId }, res_one);
                }
            }
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`update_nid_scene: ${error}`);
            console.info(`update_nid_scene: ${error}`);
            return Promise.reject(error);
        }
    }
    async getControlPlanTwoInfo() {
        try {
            return [];
        }
        catch (error) {
            ManagerErrorLogger.info(`getControlPlanTwoInfo: ${error}`);
            console.info(`getControlPlanTwoInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async updateControlPlanState(nid, sceneId, state) {
        try {
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`updateControlPlanState: ${error}`);
            console.info(`updateControlPlanState: ${error}`);
            return Promise.reject(error);
        }
    }
    async getPersonalInfo() {
        try {
            const personalInfo = await backendControlService_1.BackendControlService.getAllSceneControl();
            return personalInfo;
        }
        catch (error) {
            ManagerErrorLogger.info(`getPersonalInfo: ${error}`);
            console.info(`getPersonalInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async setControlWeightValue(nid, sceneId, weights, managerId, remark) {
        try {
            const game = await Game_manager_1.default.findOne({ nid });
            if (!game) {
                return Promise.reject(`没有nid为 ${nid}的游戏`);
            }
            const scene = await Scene_manager_1.default.findOne({ nid, sceneId });
            if (!scene) {
                return Promise.reject(`没有sceneId为 ${sceneId}的场`);
            }
            const { weights: beforeWeights } = await backendControlService_1.BackendControlService.getOneSceneControlWeight(nid, sceneId);
            await backendControlService_1.BackendControlService.setSceneControlWeight({ nid, id: sceneId }, weights);
            await controlRecordDAO.addRecord({
                name: managerId || '',
                remark: remark || '',
                type: controlRecordDAO.ControlRecordType.SCENE,
                nid,
                data: {
                    sceneId,
                    gameName: game.zname,
                    sceneName: scene.name,
                    beforeWeights,
                    weights,
                }
            });
            await backendControlService_1.BackendControlService.setSceneControlWeight({ nid, id: sceneId }, weights);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setControlWeightValue: ${error}`);
            console.info(`setControlWeightValue: ${error}`);
            return Promise.reject(error);
        }
    }
    async addControlPlayer(nid, sceneId, uid, probability, killCondition, managerId, remark) {
        try {
            const game = await Game_manager_1.default.findOne({ nid });
            if (!game) {
                return Promise.reject(`没有nid为 ${nid}的游戏`);
            }
            const scene = await Scene_manager_1.default.findOne({ nid, sceneId });
            if (!scene) {
                return Promise.reject(`没有sceneId为 ${sceneId}的场`);
            }
            const player = await Player_manager_1.default.findOne({ uid });
            if (!player) {
                return Promise.reject(`没有uid为 ${uid}的玩家`);
            }
            const controlPlayer = await backendControlService_1.BackendControlService.getOnePersonalControlPlayer({ nid, id: sceneId }, uid);
            let beforeProbability = 0, beforeKillCondition = 0;
            if (!!controlPlayer) {
                beforeKillCondition = controlPlayer.killCondition;
                beforeProbability = controlPlayer.probability;
            }
            await backendControlService_1.BackendControlService.addSceneControlPlayer({ nid, id: sceneId }, { uid, probability, killCondition });
            await controlRecordDAO.addRecord({
                name: managerId,
                remark: remark || '',
                type: controlRecordDAO.ControlRecordType.PERSONAL,
                uid,
                nid,
                data: {
                    sceneId,
                    gameName: game.zname,
                    sceneName: scene.name,
                    probability,
                    killCondition,
                    beforeProbability,
                    beforeKillCondition
                }
            });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`addControlPlayer: ${error}`);
            console.info(`addControlPlayer: ${error}`);
            return Promise.reject(error);
        }
    }
    async removeControlPlayer(nid, sceneId, uid, managerId) {
        try {
            const game = (0, JsonConfig_1.get_games)(nid);
            const scenes = (0, JsonConfig_1.getScenes)(game.name).datas;
            const scene = scenes.find(s => s.id === sceneId);
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.REMOVE_PERSONAL,
                remark: '',
                uid,
                data: {
                    nid,
                    sceneId,
                    sceneName: scene.name,
                }
            });
            await backendControlService_1.BackendControlService.removeSceneControlPlayer({ nid, id: sceneId }, uid);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`removeControlPlayer: ${error}`);
            console.info(`removeControlPlayer: ${error}`);
            return Promise.reject(error);
        }
    }
    async setBankerKill(nid, sceneId, bankerKillProbability, managerId, remark) {
        try {
            const game = await Game_manager_1.default.findOne({ nid });
            if (!game) {
                return Promise.reject(`没有nid为 ${nid}的游戏`);
            }
            const scene = await Scene_manager_1.default.findOne({ nid, sceneId });
            if (!scene) {
                return Promise.reject(`没有sceneId为 ${sceneId}的场`);
            }
            const sceneControlInfo = await backendControlService_1.BackendControlService.getOneGameSceneControlInfo({ nid, id: sceneId });
            if (!sceneControlInfo) {
                return Promise.reject(`未找到 nid为:${nid}, sceneId 为 ${sceneId}的场控信息， 请确认数据正确性`);
            }
            await backendControlService_1.BackendControlService.setBankerKill({ nid, sceneId, bankerKillProbability });
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.BANKER,
                remark: remark,
                nid,
                data: {
                    sceneId,
                    gameName: game.zname,
                    sceneName: scene.name,
                    bankerKillProbability,
                    beforeBankerKillProbability: sceneControlInfo.bankerKillProbability,
                }
            });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setBankerKill: ${error}`);
            console.info(`setBankerKill: ${error}`);
            return Promise.reject(error);
        }
    }
    async getControlPlayers(nid, sceneId) {
        try {
            const controlPlayers = await backendControlService_1.BackendControlService.getSceneControlPlayers({ nid, sceneId });
            return controlPlayers;
        }
        catch (error) {
            ManagerErrorLogger.info(`getControlPlayers: ${error}`);
            console.info(`getControlPlayers: ${error}`);
            return Promise.reject(error);
        }
    }
    async deleteAllControlPlayers(managerId) {
        try {
            const blackPlayersUidList = await backendControlService_1.BackendControlService.getAllTotalControlPlayersUidList();
            await backendControlService_1.BackendControlService.removeControlPlayers();
            await Promise.all(blackPlayersUidList.map(uid => {
                return controlRecordDAO.addRecord({
                    name: managerId,
                    type: controlRecordDAO.ControlRecordType.REMOVE_TOTAL_PERSONAL,
                    remark: '',
                    uid,
                    data: {}
                });
            }));
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`deleteAllControlPlayers: ${error}`);
            console.info(`deleteAllControlPlayers: ${error}`);
            return Promise.reject(error);
        }
    }
    async getSlotWinLimitGamesList() {
        try {
            const games = await Game_manager_1.default.findList({}, false);
            let result = [];
            for (let key of hallConst_1.SLOT_WIN_LIMIT_NID_LIST) {
                const item = games.find(m => m.nid == key);
                if (item) {
                    result.push({
                        zname: item.zname,
                        nid: item.nid,
                    });
                }
            }
            return result;
        }
        catch (error) {
            ManagerErrorLogger.info(`获取slot游戏兜底列表: ${error}`);
            console.info(`获取slot游戏兜底列表: ${error}`);
            return Promise.reject(error);
        }
    }
    async getSlotWinLimitConfig(nid) {
        try {
            if (!nid || !hallConst_1.SLOT_WIN_LIMIT_NID_LIST.includes(nid)) {
                return Promise.reject("该游戏无兜底配置");
            }
            const result = await winLimitConfigDAOImpl_1.default.getInstance().findOneConfig(nid);
            if (!result) {
                return Promise.reject(`未查找到游戏id ${nid} 的限押配置`);
            }
            return result;
        }
        catch (error) {
            ManagerErrorLogger.info(`getSlotWinLimitConfig: ${error}`);
            console.info(`getSlotWinLimitConfig: ${error}`);
            return Promise.reject(error);
        }
    }
    async updateSlotWinLimitConfig(nid, updateFields) {
        try {
            const limitConfigObserver = await (0, slotLimitConfigObserver_1.createSlotLimitConfigObserver)(nid);
            await limitConfigObserver.updateOneGameConfig(nid, updateFields);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`getSlotWinLimitConfig: ${error}`);
            console.info(`getSlotWinLimitConfig: ${error}`);
            return Promise.reject(error);
        }
    }
    async clearBonusPoolsJobInfo() {
        try {
            const result = await (0, schedule_1.getTriggerOpts)();
            return result;
        }
        catch (error) {
            ManagerErrorLogger.info(`clearBonusPoolsJobInfo: ${error}`);
            console.info(`clearBonusPoolsJobInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async setClearBonusPoolsJobInfo(period, start) {
        try {
            await backendControlService_1.BackendControlService.updateClearPoolsAmountTimeConfig({ period, start });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setClearBonusPoolsJobInfo: ${error}`);
            console.info(`setClearBonusPoolsJobInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async clearBonusPools() {
        try {
            await backendControlService_1.BackendControlService.clearAllPoolsAmount();
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`clearBonusPools: ${error}`);
            console.info(`clearBonusPools: ${error}`);
            return Promise.reject(error);
        }
    }
    async setLockJackpot(nid, sceneId, lockJackpot, managerId, remark) {
        try {
            const game = (0, JsonConfig_1.get_games)(nid);
            console.warn('666', game);
            const scenes = (0, JsonConfig_1.getScenes)(game.name).datas;
            console.warn('666', scenes);
            const scene = scenes.find(s => s.id === sceneId);
            await backendControlService_1.BackendControlService.lockPool(nid, sceneId, lockJackpot);
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.LOCK_JACKPOT,
                remark: remark ? remark : "",
                nid,
                data: {
                    sceneId,
                    lockJackpot,
                    sceneName: scene.name,
                    beforeLockJackpot: !lockJackpot,
                }
            });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`clearBonusPools: ${error}`);
            console.info(`clearBonusPools: ${error}`);
            return Promise.reject(error);
        }
    }
    async getBonusPoolsConfigInfo() {
        try {
            const recordList = await BonusPool_mysql_dao_1.default.findList({});
            return recordList;
        }
        catch (error) {
            ManagerErrorLogger.info(`getBonusPoolsConfigInfo: ${error}`);
            console.info(`getBonusPoolsConfigInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async setBonusPoolsConfigInfo(data) {
        try {
            const { id, nid, sceneId } = data;
            if (data['bonus_minAmount'] >= data['bonus_maxAmount']) {
                return Promise.reject("金额下限不应高于上限");
            }
            let changeFlag = await (0, gameControlService_1.changePoolConfig)({ nid, sceneId }, {
                initAmount: data['bonus_initAmount'],
                minAmount: data['bonus_minAmount'],
                minParameter: data['bonus_minParameter'],
                maxAmount: data['bonus_maxAmount'],
                maxParameter: data['bonus_maxParameter'],
                maxAmountInStore: data['bonus_maxAmountInStore'],
                maxAmountInStoreSwitch: data['bonus_maxAmountInStoreSwitch'],
                minBonusPoolCorrectedValue: data['bonus_minBonusPoolCorrectedValue'],
                maxBonusPoolCorrectedValue: data['bonus_maxBonusPoolCorrectedValue'],
                personalReferenceValue: data['bonus_personalReferenceValue']
            });
            ManagerErrorLogger.debug(`设置奖池配置信息|修改结果:${changeFlag}`);
            if (!changeFlag) {
                return Promise.reject("修改出错");
            }
            delete data['id'];
            delete data['nid'];
            delete data['sceneId'];
            delete data['gameName'];
            delete data['sceneName'];
            delete data['bonus_amount'];
            delete data['control_amount'];
            delete data['profit_amount'];
            ManagerErrorLogger.debug(`待修改参数 id:${id}|修改列 :${JSON.stringify(data)}`);
            await BonusPool_mysql_dao_1.default.updateOne({ id: id }, data);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`setBonusPoolsConfigInfo: ${error}`);
            console.info(`setBonusPoolsConfigInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async getBlackHousePlayers(uid, page) {
        try {
            let start = 0;
            let count = 20;
            if (page) {
                start = count * (page - 1);
            }
            let end = start + count;
            let uidList = [];
            let allLength = 0;
            if (uid) {
                const personalTotalControl = await backendControlService_1.BackendControlService.getTotalControlPlayer(uid);
                if (personalTotalControl) {
                    uidList.push(personalTotalControl.uid);
                }
            }
            else {
                const blackPlayersUidList = await backendControlService_1.BackendControlService.getAllTotalControlPlayersUidList();
                allLength = blackPlayersUidList.length;
                blackPlayersUidList.sort();
                uidList = blackPlayersUidList.slice(start, end);
            }
            const selectFile = ["Player.uid", "Player.thirdUid", "Player.groupRemark", "Player.gold", "Player.addTixian", "Player.addDayRmb", "Player.addDayTixian", "Player.ip", "Player.createTime"];
            const list = await Player_manager_1.default.findListToLimitInUids(selectFile, uidList);
            const onlineList = await OnlinePlayer_redis_dao_1.default.findList();
            let finaliyList = [];
            for (let player of list) {
                const key = onlineList.find(x => x.uid == player.uid);
                let online = false;
                if (key) {
                    online = true;
                }
                player.online = online;
                finaliyList.push(player);
            }
            return { finaliyList: finaliyList, allLength: allLength };
        }
        catch (error) {
            ManagerErrorLogger.info(`getBlackHousePlayers: ${error}`);
            console.info(`getBlackHousePlayers: ${error}`);
            return Promise.reject(error);
        }
    }
    async getBlackPlayerControl(uid) {
        try {
            const personalTotalControl = await backendControlService_1.BackendControlService.getTotalControlPlayer(uid);
            return personalTotalControl;
        }
        catch (error) {
            ManagerErrorLogger.info(`getBlackPlayerControl: ${error}`);
            console.info(`getBlackPlayerControl: ${error}`);
            return Promise.reject(error);
        }
    }
    async getNidRoom() {
        try {
            let gamesList = [];
            const games = await GameController.getAllGames(false);
            for (const game of games) {
                const rooms = await Room_manager_1.default.findList({ nid: mjConst_1.nid }, false);
                rooms.sort((a, b) => parseInt(a.roomId) - parseInt(b.roomId));
                let total_pl = 0;
                let robot_pl = 0;
                let room_info = [];
                for (const room of rooms) {
                    let total1 = 0;
                    let total2 = 0;
                    let sceneId = room.sceneId;
                    let roomId = room.roomId;
                    let open = room.open;
                    if (!room_info[sceneId])
                        room_info[sceneId] = [];
                    room_info[sceneId].push({ total1, total2, sceneId, roomId, open });
                    total_pl = total_pl + total2;
                    robot_pl += total2;
                }
                gamesList.push({
                    nid: game.nid,
                    zname: game.zname,
                    room_info,
                    total_room: rooms.length,
                    total_pl,
                    robot_pl: robot_pl
                });
            }
            return gamesList;
        }
        catch (error) {
            ManagerErrorLogger.info(`getBlackPlayerControl: ${error}`);
            console.info(`getBlackPlayerControl: ${error}`);
            return Promise.reject(error);
        }
    }
    async getOneSceneControlWeight(nid, sceneId) {
        try {
            const data = await backendControlService_1.BackendControlService.getOneSceneControlWeight(nid, sceneId);
            if (!data) {
                return Promise.reject('未查询到数据');
            }
            return data;
        }
        catch (error) {
            ManagerErrorLogger.info(`getOneSceneControlWeight: ${error}`);
            console.info(`getOneSceneControlWeight: ${error}`);
            return Promise.reject(error);
        }
    }
    async getOneGameControlInfo(nid) {
        try {
            const oneGameSceneControlInfo = await backendControlService_1.BackendControlService.getOneGameSceneControlList(nid);
            if (oneGameSceneControlInfo.length > 0) {
                const sceneIdList = oneGameSceneControlInfo.map(sceneControl => sceneControl.sceneId);
                const oddsOfWinningList = await backendControlService_1.BackendControlService.getPoolsOddsOfWinning({ [nid]: sceneIdList });
                oneGameSceneControlInfo.forEach((sceneControl, index) => {
                    sceneControl.oddsOfWinning = oddsOfWinningList[nid][index].oddsOfWinning;
                });
            }
            return oneGameSceneControlInfo;
        }
        catch (error) {
            ManagerErrorLogger.info(`getOneGameControlInfo: ${error}`);
            console.info(`getOneGameControlInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async getControlRecords(where, page, limit) {
        try {
            return await controlRecordDAO.getRecords(where, page - 1, limit);
        }
        catch (error) {
            ManagerErrorLogger.info(`getOneGameControlInfo: ${error}`);
            console.info(`getOneGameControlInfo: ${error}`);
            return Promise.reject(error);
        }
    }
    async addTotalControlPlayer(uid, probability, managerId, remark, killCondition) {
        try {
            const controlPlayer = await backendControlService_1.BackendControlService.getTotalControlPlayer(uid);
            let beforeProbability = 0, beforeKillCondition = 0;
            if (!!controlPlayer) {
                beforeKillCondition = controlPlayer.killCondition;
                beforeProbability = controlPlayer.probability;
            }
            await backendControlService_1.BackendControlService.addTotalPersonalControlPlayer({
                uid,
                probability,
                managerId,
                remark,
                killCondition
            });
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.TOTAL_PERSONAL,
                remark: remark,
                uid,
                data: {
                    beforeProbability,
                    beforeKillCondition,
                    probability,
                    killCondition
                }
            });
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`addTotalControlPlayer: ${error}`);
            console.info(`addTotalControlPlayer: ${error}`);
            return Promise.reject(error);
        }
    }
    async deleteTotalControlPlayer(uid, managerId) {
        try {
            await controlRecordDAO.addRecord({
                name: managerId || '',
                type: controlRecordDAO.ControlRecordType.REMOVE_TOTAL_PERSONAL,
                remark: '',
                uid,
                data: {}
            });
            await backendControlService_1.BackendControlService.removeTotalPersonalControlPlayer(uid);
            return true;
        }
        catch (error) {
            ManagerErrorLogger.info(`getOneGameControlRecords: ${error}`);
            console.info(`getOneGameControlRecords: ${error}`);
            return Promise.reject(error);
        }
    }
    async gameRecordFileExprotData(platformName, agentName, startTime, endTime, uid, thirdUid) {
        const agentList = await PlatformNameAgentList_redis_dao_1.default.findOne({ platformName: platformName }, false);
        if (!agentList || agentList.length == 0) {
            return Promise.reject("该平台号下面没有代理");
        }
        let platformUid = await PlatformNameAgentList_redis_dao_1.default.findPlatformUid({ platformName: platformName });
        if (agentName) {
            let item = agentList.find(x => x == agentName);
            if (!item) {
                return Promise.reject("该平台号下面不存在该代理");
            }
            return await FileExprotData.downGameRecordDataForAgent(platformUid, agentName, startTime, endTime, uid, thirdUid);
        }
        return await FileExprotData.downGameRecordDataForPlatformName(platformUid, startTime, endTime, uid, thirdUid);
    }
    async GameLoginStatistics(startTime, endTime) {
        const sceneList = await Scene_manager_1.default.getAllSceneData();
        const start = moment(startTime).format("YYYY-MM-DD HH:mm:ss");
        const end = moment(endTime).format("YYYY-MM-DD HH:mm:ss");
        const result = await HotGameData_mysql_dao_1.default.findListToLimit(start, end);
        if (!result) {
            return [];
        }
        const oneDay = 24 * 60 * 60 * 1000;
        const num = Math.ceil((endTime - startTime) / oneDay);
        let resultArr = [];
        for (const sceneInfo of sceneList) {
            let sceneName = null;
            let gameName = null;
            const games = game_scenes.find(x => x.nid == sceneInfo.nid);
            if (games) {
                gameName = games.name;
                let scene = games.scenes.find(x => x.scene == sceneInfo.sceneId);
                if (scene) {
                    sceneName = scene.name;
                }
                else {
                    sceneName = sceneInfo.sceneId;
                }
            }
            for (let day = 0; day < num; day++) {
                const start1 = moment(startTime + (day * oneDay)).format("YYYY-MM-DD");
                const end1 = moment(start1).add(1, 'day').format("YYYY-MM-DD");
                const oneResult = result.find(x => x.nid == sceneInfo.nid && x.sceneId == sceneInfo.sceneId && x.createTime > start1 && x.createTime < end1);
                if (oneResult) {
                    resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, game_name: gameName, scene_name: sceneName, day: start1, num: oneResult.playerNum });
                }
                else {
                    resultArr.push({ nid: sceneInfo.nid, sceneId: sceneInfo.sceneId, game_name: gameName, scene_name: sceneName, day: start1, num: 0 });
                }
            }
        }
        return resultArr;
    }
    async getTenantRoomSituation() {
        const result = await ShareTenantRoomSituation_redis_dao_1.default.findAll();
        return result;
    }
};
GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
exports.GameService = GameService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZ21zQXBpL2xpYi9tb2R1bGVzL3N5c3RlbS9nYW1lLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsMkNBQTRDO0FBQzVDLDhFQUE4RTtBQUM5RSwrQ0FBeUM7QUFDekMsOEZBQXlGO0FBQ3pGLG9HQUFpRztBQUNqRywrREFBMEU7QUFFMUUseUdBQWdHO0FBQ2hHLHlHQUE0RztBQUM1RywwRUFBNkU7QUFDN0UsNkZBQW9GO0FBQ3BGLHdGQUFtRjtBQUNuRiw0RkFBNEY7QUFDNUYsd0dBQWdHO0FBQ2hHLG9GQUE0RTtBQUM1RSxzRkFBaUY7QUFDakYsb0ZBQTRFO0FBRTVFLCtGQUFzRjtBQUN0RixpR0FBd0Y7QUFDeEYsd0RBQWlEO0FBQ2pELG1HQUEwRjtBQUMxRiwwRkFBMEY7QUFDMUYsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7QUFDOUUscUhBQTRHO0FBQzVHLGlDQUFpQztBQUNqQywySEFBa0g7QUFDbEgsK0RBQW9FO0FBRXBFLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx3QkFBUyxFQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztBQVd6RCxJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFXO0lBS3BCLEtBQUssQ0FBQyxXQUFXO1FBQ2IsSUFBSTtZQUNBLE1BQU0sUUFBUSxHQUFHLE1BQU0sc0JBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFCLE9BQU87b0JBQ0gsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO29CQUNkLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRztvQkFDVixNQUFNLEVBQUUsQ0FBQyxDQUFD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