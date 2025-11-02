"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOnePlayer = exports.lockPlayer = exports.getAllBufferPlayer = exports.updateSomePlayer = exports.updateAllBufferPlayerInstant = exports.updateOnePlayer = exports.updateOnePlayerEx = exports.randomChoseMatchPlayers = exports.findPlayerList = exports.getPlayer = exports.createPlayer = exports.resetAllPlayers = void 0;
const pinus_1 = require("pinus");
const HallConst = require("../../consts/hallConst");
const LogConst = require("../../consts/logConst");
const DatabaseConst = require("../../consts/databaseConst");
const PlayerInfo_1 = require("../pojo/entity/PlayerInfo");
const RedisManager = require("./redis/lib/redisManager");
const RedisLuaManager = require("./redis/lib/redisLuaManager");
const MongoManager = require("./mongoDB/lib/mongoManager");
const BufferUtil = require("../../utils/bufferUtil");
const Utils = require("../../utils/general/index");
const LogService = require("../../services/common/logService");
const pinus_logger_1 = require("pinus-logger");
const RoleEnum_1 = require("../constant/player/RoleEnum");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const playerTableName = 'player_info';
const REAL_PLAYER_BUFFER_PREFIX = `real_${playerTableName}:`;
const ROBOT_PLAYER_BUFFER_PREFIX = `robot_${playerTableName}:`;
const ALL_REAL_PLAYER_BUFFER_KEY_PATTERN = `${REAL_PLAYER_BUFFER_PREFIX}*`;
const ALL_PLAYER_BUFFER_KEY_PATTERN = `*_${playerTableName}:*`;
const PLAYER_INFO_DAO = MongoManager[playerTableName];
const resetAllPlayers = async () => {
    console.warn(`--------------------  初始化玩家状态  --------------------`);
    try {
        const where = { $or: [{ abnormalOffline: true }, { kickedOutRoom: true }, { position: { $ne: HallConst.PLAYER_POSITIONS.HALL } }] };
        const filterFunc = player => {
            return player.abnormalOffline || player.kickedOutRoom || player.position !== HallConst.PLAYER_POSITIONS.HALL;
        };
        await updateSomePlayer(where, filterFunc, {
            abnormalOffline: false,
            kickedOutRoom: false,
            position: HallConst.PLAYER_POSITIONS.HALL
        });
    }
    catch (error) {
        Logger.error('export const resetAllPlayers ==>', error);
    }
    return Promise.resolve();
};
exports.resetAllPlayers = resetAllPlayers;
function getUIDPromise(uidPrefix) {
    return new Promise(resolve => {
        let uid;
        const generateUID = () => {
            uid = (Utils.getNumStr(8));
            PLAYER_INFO_DAO.findOne({ uid }, (error, user) => {
                return user ? generateUID() : resolve(uid);
            });
        };
        generateUID();
    });
}
const createPlayer = async function (createArgs) {
    let errorMessage = 'export const createPlayer ==>';
    try {
        const uidPrefix = null;
        createArgs.uid = await getUIDPromise(uidPrefix);
        createArgs.guestid = Utils.generateID();
        const player = new PlayerInfo_1.PlayerInfo(createArgs);
        await PLAYER_INFO_DAO.create(player);
        await setPlayerIntoBuffer(player);
        return Promise.resolve(player);
    }
    catch (error) {
        errorMessage += '创建出错' + error;
        return Promise.reject(errorMessage);
    }
};
exports.createPlayer = createPlayer;
async function getPlayer(where, needLock = false, needCache = true) {
    let playerAndLock = { player: null, lock: null };
    try {
        let playerInfo;
        if (!where) {
            return playerAndLock;
        }
        if (where.uid) {
            playerAndLock = await getBufferPlayerAndLock(needLock, where.uid, where.isRobot);
        }
        else {
            const player = await PLAYER_INFO_DAO.findOne(where, 'uid isRobot', { lean: true });
            if (!player) {
                return playerAndLock;
            }
            playerAndLock = await getBufferPlayerAndLock(needLock, player.uid, player.isRobot);
        }
        if (playerAndLock.player) {
            return playerAndLock;
        }
        playerInfo = await PLAYER_INFO_DAO.findOne(where, '-_id -__v', { lean: true });
        if (!playerInfo) {
            await RedisManager.unlock(playerAndLock.lock);
            playerAndLock.lock = null;
            return playerAndLock;
        }
        if (!where.uid) {
            playerAndLock = await getBufferPlayerAndLock(needLock, playerInfo.uid, playerInfo.isRobot);
        }
        if (!playerAndLock.player) {
            needCache && await setPlayerIntoBuffer(playerInfo);
            playerAndLock.player = playerInfo;
        }
        if (!playerAndLock.player && needLock) {
            playerAndLock.lock = null;
            await RedisManager.unlock(playerAndLock.lock);
        }
        return Promise.resolve(playerAndLock);
    }
    catch (error) {
        Logger.error('playerManager.getPlayer ==>获取玩家信息出错：', error);
        await RedisManager.unlock(playerAndLock.lock);
        playerAndLock.lock = null;
        return playerAndLock;
    }
}
exports.getPlayer = getPlayer;
;
const findPlayerList = async (where, filterFunc, fields, callback) => {
    const { matchPlayers } = await getMatchPlayerUIDDist(where, filterFunc, fields);
    callback && callback(matchPlayers);
    return matchPlayers;
};
exports.findPlayerList = findPlayerList;
const randomChoseMatchPlayers = async (aggregateCond, filterFunc, fields, num) => {
    const matchedPlayers = [];
    try {
        let fromBuffer = Utils.randomFromRange(0, num);
        let fromDB = num - fromBuffer;
        const bufferPlayers = await (0, exports.getAllBufferPlayer)();
        const bufferMatchPlayer = filterFunc ? bufferPlayers.filter(filterFunc) : [...bufferPlayers];
        if (bufferMatchPlayer.length < fromBuffer) {
            fromDB += (fromBuffer - bufferMatchPlayer.length);
        }
        if (fromDB) {
            const bufferUID = bufferPlayers.map(player => player.uid);
            let index = aggregateCond.findIndex(ele => ele['$match'] !== undefined);
            if (index < 0) {
                aggregateCond.push({ '$match': { uid: { $nin: bufferUID } } });
            }
            else {
                const matchCond = aggregateCond[index];
                let matchUIDCond = matchCond['$match']['uid'];
                if (!matchUIDCond) {
                    matchCond['$match']['uid'] = { $nin: bufferUID };
                }
                else {
                    if (matchUIDCond['$nin']) {
                        matchUIDCond['$nin'].push(...bufferUID);
                        matchUIDCond['$nin'] = Array.from(new Set(matchUIDCond['$nin']));
                    }
                    else {
                        matchUIDCond['$nin'] = bufferUID;
                    }
                }
            }
            aggregateCond.push({ $sample: { size: fromDB } });
            const dbMatchedPlayers = await PLAYER_INFO_DAO.aggregate(aggregateCond);
            matchedPlayers.push(...dbMatchedPlayers);
            if (matchedPlayers.length < fromDB) {
                fromBuffer += fromDB - dbMatchedPlayers.length;
            }
        }
        matchedPlayers.push(...Utils.randomChoseFromArray(bufferMatchPlayer, fromBuffer));
        const fieldsInArray = fields ? fields.split(' ') : null;
        return matchedPlayers.map(player => {
            fieldsInArray && deletePlayerAttrs(fieldsInArray, player);
            return player;
        });
    }
    catch (error) {
        Logger.error('export const randomChoseMatchPlayers ==>', error);
        return matchedPlayers;
    }
};
exports.randomChoseMatchPlayers = randomChoseMatchPlayers;
async function updateOnePlayerEx(uid, isRobot, updateAttrs, callback) {
    let errorMessage = 'playerManager.updateOnePlayer ==>';
    try {
        LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.PARAM, uid, updateAttrs);
        if (!uid) {
            errorMessage += `玩家ID错误: ${uid}`;
            Logger.error(errorMessage);
            callback && callback('需要更新的玩家uid错误');
            return Promise.reject('需要更新的玩家uid错误');
        }
        const bufferKey = getBufferKey(uid, isRobot);
        if (!updateAttrs || !updateAttrs.length) {
            callback && callback(null);
            return Promise.resolve(null);
        }
        let bufferData = await getBufferPlayer(uid, isRobot, true);
        let updatedPlayer;
        if (bufferData) {
            let rs = await RedisLuaManager.luaRun('luaScript', bufferKey, JSON.stringify(updateAttrs));
            if (rs > 0) {
                updatedPlayer = await getBufferPlayer(uid, isRobot);
            }
        }
        if (updatedPlayer) {
            LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.UPDATED, updatedPlayer, updateAttrs);
        }
        callback && callback(null);
        return Promise.resolve();
    }
    catch (error) {
        errorMessage += error;
        Logger.error(errorMessage, error);
        callback && callback('更新玩家信息出错');
        return Promise.reject('更新玩家信息出错');
    }
}
exports.updateOnePlayerEx = updateOnePlayerEx;
;
async function updateOnePlayer(player, updateAttrs = [], lock) {
    let errorMessage = 'playerManager.updateOnePlayer ==>';
    try {
        LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.PARAM, player, updateAttrs);
        if (!player || !player.uid) {
            errorMessage += `需要更新的玩家信息错误: ${JSON.stringify(player)}`;
            Logger.error(errorMessage);
            return Promise.reject('需要更新的玩家信息错误');
        }
        const bufferKey = getBufferKey(player.uid, player.isRobot);
        if (player.isRobot !== RoleEnum_1.RoleEnum.ROBOT && !(await RedisManager.isLockValid(lock, bufferKey))) {
            errorMessage += `锁不合法, 需要更新的玩家信息为: ${JSON.stringify(player)}`;
            Logger.error(errorMessage);
            return Promise.reject('锁不合法');
        }
        if (!updateAttrs || !updateAttrs.length) {
            return Promise.resolve(null);
        }
        let bufferData = await getBufferPlayer(player.uid, player.isRobot, true);
        const { needToStoreData, allUpdateAttrs, needAddTask } = BufferUtil.getNeedStoreBufferData(bufferData, player, updateAttrs);
        LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.TO_BE_UPDATE, needToStoreData, updateAttrs);
        let updatedPlayer;
        if (!bufferData) {
            const updateFiledObj = BufferUtil.getUpdateFiledObjFromArray(needToStoreData, allUpdateAttrs);
            updatedPlayer = await updatePlayerInternal({ uid: player.uid }, updateFiledObj);
        }
        else {
            await setPlayerIntoBuffer(needToStoreData);
            updatedPlayer = await getBufferPlayer(player.uid, needToStoreData.isRobot);
        }
        if (updatedPlayer) {
            LogService.UpdateAttrLog(LogConst.PLAYER_VALUE_TYPE.UPDATED, updatedPlayer, updateAttrs);
        }
        lock && await RedisManager.unlock(lock);
        lock = null;
        if (Object.prototype.toString.call(player.yesterdayPlayCommissionRatio) === HallConst.BASE_TYPE.OBJ) {
            Logger.error('恭喜你报错了');
            throw '恭喜你报错了';
        }
        return Promise.resolve();
    }
    catch (error) {
        errorMessage += error;
        Logger.error(errorMessage, error);
        lock && await RedisManager.unlock(lock);
        console.log("更新玩家信息出错", error);
        return Promise.reject('更新玩家信息出错');
    }
    finally {
        await RedisManager.unlock(lock);
    }
}
exports.updateOnePlayer = updateOnePlayer;
;
const updateAllBufferPlayerInstant = async () => {
    let errorMessage = 'export const updateAllBufferPlayerInstant ==>';
    try {
        const allRealPlayers = await (0, exports.getAllBufferPlayer)(true);
        await Promise.all(allRealPlayers.map(player => {
            return player.uid ? updatePlayerInternal({ uid: player.uid }, player) : null;
        }));
        return Promise.resolve(allRealPlayers.map(player => player.uid));
    }
    catch (error) {
        errorMessage += ' 更新出错:';
        Logger.error(errorMessage, error);
        return Promise.resolve(errorMessage);
    }
};
exports.updateAllBufferPlayerInstant = updateAllBufferPlayerInstant;
async function updatePlayerInternal(where, updateFields) {
    try {
        const updatedPlayer = await PLAYER_INFO_DAO.findOneAndUpdate(where, updateFields, {
            new: true,
            upsert: false,
            fields: '-_id'
        });
        return Promise.resolve(updatedPlayer);
    }
    catch (error) {
        let errorMessage = 'export const updatePlayerInternal ==> 更新玩家信息失败';
        Logger.error(errorMessage, error, `, 需要更新的值是：${JSON.stringify(updateFields)}`);
        return Promise.resolve(errorMessage);
    }
}
async function updateSomePlayer(where, filterFunc, updateFields) {
    let errorMessage = 'playerManager.updateAllPlayer ==>';
    try {
        const { bufferUID, dbUID } = await getMatchPlayerUIDDist(where, filterFunc);
        if (!bufferUID.length && !dbUID.length) {
            return;
        }
        await PLAYER_INFO_DAO.updateOne({ uid: { $in: dbUID } }, updateFields, { multi: true });
        const attrKeys = Object.keys(updateFields);
        let playerAndLock;
        for (let uid of bufferUID) {
            playerAndLock = await getBufferPlayerAndLock(true, uid);
            if (!playerAndLock || !playerAndLock.player) {
                continue;
            }
            try {
                changePlayerAttrs(playerAndLock.player, updateFields, attrKeys);
                await updateOnePlayer(playerAndLock.player, attrKeys, playerAndLock.lock);
            }
            catch (error) {
                Logger.error(errorMessage + `uid: ${playerAndLock.player.uid} `, error);
                await RedisManager.unlock(playerAndLock.lock);
            }
        }
    }
    catch (error) {
        Logger.error(errorMessage, error);
        return Promise.reject(errorMessage + JSON.stringify(error));
    }
}
exports.updateSomePlayer = updateSomePlayer;
;
async function getMatchPlayerUIDDist(where, filterFunc, fields) {
    const matchPlayerAndBufferUID = { matchPlayers: [], bufferUID: [], dbUID: [] };
    try {
        const dbMatchPlayers = await PLAYER_INFO_DAO.find(where, fields, { lean: true });
        const bufferPlayers = await (0, exports.getAllBufferPlayer)();
        const bufferMatchPlayer = filterFunc ? bufferPlayers.filter(filterFunc) : [...bufferPlayers];
        matchPlayerAndBufferUID.matchPlayers.push(...bufferMatchPlayer);
        matchPlayerAndBufferUID.bufferUID = bufferMatchPlayer.map(player => player.uid);
        dbMatchPlayers.forEach(player => {
            if (!Utils.getArrayMember(bufferPlayers, 'uid', player.uid)) {
                matchPlayerAndBufferUID.matchPlayers.push(player);
                matchPlayerAndBufferUID.dbUID.push(player.uid);
            }
        });
        const fieldsInArray = fields ? fields.split(' ') : null;
        matchPlayerAndBufferUID.matchPlayers = matchPlayerAndBufferUID.matchPlayers.map(player => {
            fieldsInArray && deletePlayerAttrs(fieldsInArray, player);
            return player;
        });
    }
    catch (error) {
        Logger.error(pinus_1.pinus.app.getServerType(), 'playerManager.getMatchPlayerUIDDist ==>', error);
    }
    return Promise.resolve(matchPlayerAndBufferUID);
}
const getAllBufferPlayer = async (onlyReal) => {
    try {
        const keysPattern = onlyReal ? ALL_REAL_PLAYER_BUFFER_KEY_PATTERN : ALL_PLAYER_BUFFER_KEY_PATTERN;
        const allPlayerBufferData = await RedisManager.getAllValuesSatisfyPattern(keysPattern);
        const playerList = allPlayerBufferData ? allPlayerBufferData.map(buffer => buffer.data) : [];
        return Promise.resolve(playerList);
    }
    catch (error) {
        Logger.error('export const getAllBufferPlayer ==>', error);
        return Promise.resolve([]);
    }
};
exports.getAllBufferPlayer = getAllBufferPlayer;
function changePlayerAttrs(player, updateFields, attrKeys) {
    for (let attr of attrKeys) {
        if (Object.prototype.toString.call(updateFields[attr]) === '[object Object]' && Utils.isNullOrUndefined(player[attr])) {
            player[attr] = {};
        }
        else {
            player[attr] = updateFields[attr];
        }
    }
}
function getBufferKey(uid, isRobot) {
    return (isRobot === RoleEnum_1.RoleEnum.ROBOT ? ROBOT_PLAYER_BUFFER_PREFIX : REAL_PLAYER_BUFFER_PREFIX) + uid;
}
async function getBufferPlayerAndLock(needLock, uid, isRobot) {
    const playerAndLock = { player: null, lock: null };
    if (!uid) {
        return Promise.resolve(playerAndLock);
    }
    try {
        if (needLock) {
            playerAndLock.lock = await (0, exports.lockPlayer)(uid, isRobot);
        }
        playerAndLock.player = await getBufferPlayer(uid, isRobot);
        return Promise.resolve(playerAndLock);
    }
    catch (error) {
        Logger.error('getPlayerFromBuffer ==>', error);
        return Promise.resolve(playerAndLock);
    }
}
const lockPlayer = async (uid, isRobot) => {
    try {
        const bufferKey = getBufferKey(uid, isRobot);
        return Promise.resolve(await RedisManager.lock(bufferKey));
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.lockPlayer = lockPlayer;
function deletePlayerAttrs(fieldsInArray, player) {
    for (let attribute in player) {
        if (!fieldsInArray.includes(attribute)) {
            delete player[attribute];
        }
    }
}
async function getBufferPlayer(uid, isRobot, original) {
    try {
        if (!uid) {
            return;
        }
        let bufferData = await RedisManager.getObjectFromRedis(getBufferKey(uid, isRobot));
        if (Utils.isNullOrUndefined(isRobot) && !bufferData) {
            bufferData = await RedisManager.getObjectFromRedis(getBufferKey(uid, RoleEnum_1.RoleEnum.ROBOT));
        }
        if (!bufferData) {
            return;
        }
        return original ? bufferData : bufferData.data;
    }
    catch (error) {
        Logger.error('getBufferPlayer ==>', error);
        return null;
    }
}
async function setPlayerIntoBuffer(player, updateFields = []) {
    try {
        if (!player || !player.uid) {
            Logger.error(`setPlayerIntoBuffer ==> player数据有误: ${player}`);
            return Promise.resolve();
        }
        const bufferKey = getBufferKey(player.uid, player.isRobot);
        await RedisManager.setObjectIntoRedisHasExpiration(bufferKey, {
            updateFields,
            data: player
        }, DatabaseConst.BUFFER_EXPIRATION.ONE_HOUR);
        return Promise.resolve();
    }
    catch (error) {
        Logger.error(`setPlayerIntoBuffer ==> 玩家数据存入 redis 出错: `, error);
        return Promise.resolve();
    }
}
const deleteOnePlayer = async (player) => {
    try {
        await deleteCachePlayer(player);
        await PLAYER_INFO_DAO.deleteOne({ uid: player.uid });
        return true;
    }
    catch (e) {
        Logger.error(`deleteOnePlayer ==> error: ${JSON.stringify(e)}`);
        return false;
    }
};
exports.deleteOnePlayer = deleteOnePlayer;
async function deleteCachePlayer(player) {
    const key = getBufferKey(player.uid, player.isRobot);
    await RedisManager.deleteKeyFromRedis(key);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVySW5mb01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9QbGF5ZXJJbmZvTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxpQ0FBOEI7QUFDOUIsb0RBQXFEO0FBQ3JELGtEQUFtRDtBQUNuRCw0REFBNkQ7QUFDN0QsMERBQXVEO0FBQ3ZELHlEQUEwRDtBQUMxRCwrREFBZ0U7QUFDaEUsMkRBQTREO0FBQzVELHFEQUFzRDtBQUN0RCxtREFBb0Q7QUFDcEQsK0RBQWdFO0FBQ2hFLCtDQUF5QztBQUN6QywwREFBdUQ7QUFDdkQsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUluRCxNQUFNLGVBQWUsR0FBRyxhQUFhLENBQUM7QUFFdEMsTUFBTSx5QkFBeUIsR0FBRyxRQUFRLGVBQWUsR0FBRyxDQUFDO0FBRTdELE1BQU0sMEJBQTBCLEdBQUcsU0FBUyxlQUFlLEdBQUcsQ0FBQztBQUUvRCxNQUFNLGtDQUFrQyxHQUFHLEdBQUcseUJBQXlCLEdBQUcsQ0FBQztBQUUzRSxNQUFNLDZCQUE2QixHQUFHLEtBQUssZUFBZSxJQUFJLENBQUM7QUFFL0QsTUFBTSxlQUFlLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRy9DLE1BQU0sZUFBZSxHQUFHLEtBQUssSUFBSSxFQUFFO0lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsQ0FBQztJQUVwRSxJQUFJO1FBQ0EsTUFBTSxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7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