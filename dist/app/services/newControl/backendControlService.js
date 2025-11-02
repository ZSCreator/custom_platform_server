"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendControlService = void 0;
const sceneControl_1 = require("./impl/sceneControl");
const pinus_1 = require("pinus");
const commonUtil_1 = require("../../utils/lottery/commonUtil");
const totalPersonalControl_1 = require("./impl/totalPersonalControl");
const personalControl_1 = require("./impl/personalControl");
const PlatformControl_manager_1 = require("../../common/dao/daoManager/PlatformControl.manager");
const BaseRedisManager_1 = require("../../common/dao/redis/lib/BaseRedisManager");
const DBCfg_enum_1 = require("../../common/dao/redis/config/DBCfg.enum");
const utils_1 = require("./lib/utils");
const controlRecordDAO = require("./DAO/controlRecordDAO");
const JsonConfig_1 = require("../../pojo/JsonConfig");
const constants_1 = require("./constants");
const PlatformControlState_manager_1 = require("../../common/dao/daoManager/PlatformControlState.manager");
const PLATFORM_DATA_PREFIX = 'data:platform:';
function randomServerRpcId() {
    const serverList = pinus_1.pinus.app.getServersByType('control');
    return serverList[(0, commonUtil_1.randomFromRange)(0, serverList.length - 1)].id;
}
class BackendControlService {
    static async lockPool(nid, sceneId, lock) {
        await sceneControl_1.SceneControl.lockPool(nid, sceneId, lock);
        pinus_1.pinus.app.rpc.control.mainRemote.lockBonusPool.toServer(randomServerRpcId(), {
            nid,
            sceneId,
            lock
        });
        return true;
    }
    static clearAllPoolsAmount() {
        return pinus_1.pinus.app.rpc.control.mainRemote.clearPoolsAmount.toServer(randomServerRpcId());
    }
    static updateClearPoolsAmountTimeConfig({ start, period }) {
        return pinus_1.pinus.app.rpc.control.mainRemote.updateClearPoolsAmountTimeConfig.toServer(randomServerRpcId(), {
            start,
            period
        });
    }
    ;
    static removeTotalPersonalControlPlayer(uid) {
        return totalPersonalControl_1.TotalPersonalControl.removePlayer(uid);
    }
    static addTotalPersonalControlPlayer({ uid, remark, managerId, probability, killCondition = 0 }) {
        return totalPersonalControl_1.TotalPersonalControl.addPlayer({ uid, remark, managerId, probability, killCondition });
    }
    static async isTotalControlPlayer(uid) {
        return !!(await totalPersonalControl_1.TotalPersonalControl.findPlayer(uid));
    }
    static addOnlinePlayer(uid) {
        return totalPersonalControl_1.TotalPersonalControl.addOnlinePlayer(uid);
    }
    static removeOnlineControlPlayer(uid) {
        return totalPersonalControl_1.TotalPersonalControl.removeOnlinePlayer(uid);
    }
    static removeControlPlayers() {
        return totalPersonalControl_1.TotalPersonalControl.removeControlPlayers();
    }
    static getSceneControlPlayers({ nid, sceneId }) {
        return personalControl_1.PersonalControl.getControlPlayers({ nid, id: sceneId });
    }
    static setKillDescription({ nid, sceneId, description }) {
        return personalControl_1.PersonalControl.setConditionDescription({ nid, sceneId, description });
    }
    static setBankerKill({ nid, sceneId, bankerKillProbability }) {
        return sceneControl_1.SceneControl.setBankerKill({ nid, sceneId, bankerKillProbability });
    }
    static addSceneControlPlayer(scene, player) {
        return personalControl_1.PersonalControl.addPlayer(scene, player);
    }
    ;
    static removeSceneControlPlayer(scene, uid) {
        return personalControl_1.PersonalControl.removePlayer(scene, uid);
    }
    ;
    static setSceneControlWeight(scene, weights) {
        return sceneControl_1.SceneControl.setSceneControlWeight(scene, weights);
    }
    static async getAllSceneControl() {
        const allSceneControl = await sceneControl_1.SceneControl.getAllSceneControl();
        let temps = {};
        allSceneControl.forEach(s => {
            if (!temps[s.nid]) {
                temps[s.nid] = [];
            }
            temps[s.nid].push(s);
        });
        Object.keys(temps).forEach(nid => temps[nid].sort((a, b) => a.sceneId - b.sceneId));
        let finds = {};
        Object.keys(temps).map(nid => finds[nid] = temps[nid].map(sceneControl => sceneControl.sceneId));
        const pools = await this.getPoolsAmountAndCorrectedValue(finds);
        return Object.keys(temps).sort(nid => parseInt(nid) - parseInt(nid))
            .reduce((total, nid) => {
            const temp = temps[nid].map((scene, index) => {
                if (pools && pools[nid] && pools[nid][index]) {
                    scene.poolCorrectedValue = pools[nid][index].correctedValue;
                    scene.poolAmount = pools[nid][index].amount;
                    return scene;
                }
                return null;
            });
            return total.concat(temp);
        }, []);
    }
    static async getPoolsAmountAndCorrectedValue(finds) {
        return await pinus_1.pinus.app.rpc.control.mainRemote.getPoolsAmountAndCorrectedValue.toServer(randomServerRpcId(), finds);
    }
    static async getAllTotalControlPlayersUidList() {
        return totalPersonalControl_1.TotalPersonalControl.getAllPlayersUidList();
    }
    static async getControlPlayers() {
        return totalPersonalControl_1.TotalPersonalControl.getControlPlayers();
    }
    static async getTotalControlPlayer(uid) {
        return totalPersonalControl_1.TotalPersonalControl.findPlayer(uid);
    }
    static getTotalControlPlayersRange(where, start, end) {
        return totalPersonalControl_1.TotalPersonalControl.getPlayersRange(where, start, end);
    }
    static getTotalControlPlayersCount(where) {
        return totalPersonalControl_1.TotalPersonalControl.getPlayersCount(where);
    }
    static getOnlineTotalControlPlayersCount() {
        return totalPersonalControl_1.TotalPersonalControl.getOnlinePlayersCount();
    }
    static getOnlineTotalControlPlayersRange(start, end) {
        return totalPersonalControl_1.TotalPersonalControl.getOnlinePlayersUidRange(start, end);
    }
    static clearOnlineTotalControlPlayer() {
        return totalPersonalControl_1.TotalPersonalControl.clearOnlineSet();
    }
    static async getPoolsOddsOfWinning(finds) {
        return await pinus_1.pinus.app.rpc.control.mainRemote.getPoolsOddsOfWinning.toServer(randomServerRpcId(), finds);
    }
    static async getOneSceneControlWeight(nid, sceneId) {
        return sceneControl_1.SceneControl.getOneSceneWight(nid, sceneId);
    }
    static async getOneGameSceneControlList(nid) {
        return sceneControl_1.SceneControl.getOneGameSceneControl(nid);
    }
    static async getOnePersonalControlPlayer(scene, uid) {
        return personalControl_1.PersonalControl.getOneControlPlayer(scene, uid);
    }
    static async getOneGameSceneControlInfo(scene) {
        return sceneControl_1.SceneControl.getOneSceneControlInfo(scene.nid, scene.id);
    }
    static async getAllPlatformData(month) {
        if (month) {
            const data = await PlatformControl_manager_1.default.getTotalPlatformDuringTheMonth(month);
            if (!data) {
                return null;
            }
            data.betPlayersSet = data.betPlayersSet.length;
            return data;
        }
        return pinus_1.pinus.app.rpc.control.mainRemote.getAllPlatformData.toServer(randomServerRpcId(), { month });
    }
    static async getPlatformData(platformId, startTime, endTime) {
        if (startTime && endTime) {
            const data = await getPlatformData(platformId, startTime, endTime);
            if (!data) {
                return pinus_1.pinus.app.rpc.control.mainRemote.getPlatformData.toServer(randomServerRpcId(), {
                    platformId
                });
            }
            const games = data.games.map(g => g.nid);
            const result = await getPlatformGamesKillRateConfig(platformId, games);
            data.killRateConfig = result.platformKillRateConfig;
            data.games.map(g => {
                g.killRateConfig = result.gameList[g.nid];
                Reflect.deleteProperty(g, 'details');
            });
            return data;
        }
        return pinus_1.pinus.app.rpc.control.mainRemote.getPlatformData.toServer(randomServerRpcId(), {
            platformId
        });
    }
    static async getPlatformTenantData(platformId, tenantId, startTime, endTime) {
        if (startTime && endTime) {
            const data = await getPlatformTenantData(platformId, tenantId, startTime, endTime);
            if (!data) {
                return null;
            }
            return data;
        }
        return null;
    }
    static async getPlatformGameData(platformId, nid, startTime, endTime) {
        if (startTime && endTime) {
            const data = await getPlatformData(platformId, startTime, endTime);
            if (!data) {
                return data;
            }
            const game = data.games.find(g => g.nid === nid);
            if (!game) {
                return null;
            }
            const result = await getPlatformGamesKillRateConfig(platformId, [nid]);
            game.killRateConfig = result.gameList[nid];
            return game;
        }
        return null;
    }
    static async getTenantGameData(platformId, tenantId, nid, startTime, endTime) {
        if (startTime && endTime) {
            const data = await getPlatformTenantData(platformId, tenantId, startTime, endTime);
            if (!data) {
                return data;
            }
            const game = data.games.find(g => g.nid === nid);
            if (!game) {
                return null;
            }
            return game;
        }
        return null;
    }
    static async setPlatformControl(platformId, killRate, managerId, nid) {
        let gameName = '';
        if (nid) {
            const game = (0, JsonConfig_1.get_games)(nid);
            if (game) {
                gameName = game.zname;
            }
        }
        await controlRecordDAO.addRecord({
            name: managerId || '',
            type: controlRecordDAO.ControlRecordType.CHANGE_PLATFORM_KILL_RATE,
            remark: '',
            data: {
                platformId,
                killRate,
                nid: nid || '',
                gameName,
            }
        });
        return pinus_1.pinus.app.rpc.control.mainRemote.setPlatformControl.toServer(randomServerRpcId(), { platformId, killRate, nid });
    }
    static async setTenantControl(platformId, tenantId, killRate, managerId, nid) {
        let gameName = '';
        if (nid) {
            const game = (0, JsonConfig_1.get_games)(nid);
            if (game) {
                gameName = game.zname;
            }
        }
        await controlRecordDAO.addRecord({
            name: managerId || '',
            type: controlRecordDAO.ControlRecordType.CHANGE_TENANT_KILL_RATE,
            remark: '',
            data: {
                platformId,
                killRate,
                nid: nid || '',
                gameName,
                tenantId,
            }
        });
        const result = await pinus_1.pinus.app.rpc.control.mainRemote.setTenantControl.toServer(randomServerRpcId(), { platformId, killRate, tenantId, nid });
        if (!!result && result.success) {
            await deleteTenantRedisKey(platformId, tenantId);
        }
        return result;
    }
}
exports.BackendControlService = BackendControlService;
async function getPlatformGamesKillRateConfig(platformId, games) {
    return pinus_1.pinus.app.rpc.control.mainRemote.getPlatformGamesKillRateConfig.toServer(randomServerRpcId(), {
        platformId,
        games
    });
}
async function getPlatformData(platformId, startTime, endTime) {
    const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
    const key = `${PLATFORM_DATA_PREFIX}${platformId}:${startTime.toString()}${endTime.toString()}`;
    let data = await conn.get(key);
    if (!!data) {
        return JSON.parse(data);
    }
    const list = await PlatformControl_manager_1.default.getPlatformDataList(constants_1.RecordTypes.SCENE, platformId, startTime, endTime);
    if (list.length === 0) {
        return null;
    }
    const result = (0, utils_1.summaryList)(list);
    result.betPlayersSet = result.betPlayersSet.length;
    const nidSet = new Set();
    list.forEach(row => nidSet.add(row.nid));
    const nidList = [...nidSet.values()];
    nidList.sort((x, y) => Number(x) - Number(y));
    result.games = nidList.map(nid => {
        const gameData = list.filter(row => row.nid === nid);
        const comprehensive = (0, utils_1.summaryList)(gameData);
        comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;
        const sceneIdSet = new Set();
        gameData.forEach(row => sceneIdSet.add(row.sceneId));
        const sceneIdList = [...sceneIdSet.values()];
        sceneIdList.sort((x, y) => Number(x) - Number(y));
        const details = sceneIdList.map(sceneId => {
            const data = gameData.filter(row => row.sceneId === sceneId);
            const comprehensive = (0, utils_1.summaryList)(data);
            comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;
            comprehensive.sceneId = sceneId;
            return comprehensive;
        });
        return {
            nid,
            details,
            comprehensive
        };
    });
    await conn.set(key, JSON.stringify(result));
    await conn.expire(key, 60);
    return result;
}
async function getPlatformTenantData(platformId, tenantId, startTime, endTime) {
    const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
    const key = tenantRedisKey(platformId, tenantId, startTime, endTime);
    let data = await conn.get(key);
    if (!!data) {
        return JSON.parse(data);
    }
    const list = await PlatformControl_manager_1.default.getTenantDataList(platformId, tenantId, startTime, endTime);
    if (list.length === 0) {
        return null;
    }
    const result = (0, utils_1.summaryList)(list);
    result.betPlayersSet = result.betPlayersSet.length;
    const nidSet = new Set();
    list.forEach(row => nidSet.add(row.nid));
    const nidList = [...nidSet.values()];
    nidList.sort((x, y) => Number(x) - Number(y));
    result.games = nidList.map(nid => {
        const gameData = list.filter(row => row.nid === nid);
        const comprehensive = (0, utils_1.summaryList)(gameData);
        comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;
        const sceneIdSet = new Set();
        gameData.forEach(row => sceneIdSet.add(row.sceneId));
        const sceneIdList = [...sceneIdSet.values()];
        sceneIdList.sort((x, y) => Number(x) - Number(y));
        const details = sceneIdList.map(sceneId => {
            const data = gameData.filter(row => row.sceneId === sceneId);
            const comprehensive = (0, utils_1.summaryList)(data);
            comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;
            comprehensive.sceneId = sceneId;
            return comprehensive;
        });
        return {
            nid,
            details,
            comprehensive
        };
    });
    const tenantResult = await PlatformControlState_manager_1.default.findOne({ platformId, tenantId, type: constants_1.PlatformControlType.TENANT });
    result.killRateConfig = !!tenantResult ? tenantResult.killRate : null;
    const games = result.games.map(g => g.nid);
    const tenantGameResult = await PlatformControlState_manager_1.default.findManyByNidList({ platformId, tenantId, type: constants_1.PlatformControlType.TENANT_GAME, nidList: games });
    result.games.map(g => {
        const r = tenantGameResult.find(res => res.nid === g.nid);
        g.killRateConfig = !!r ? r.killRate : null;
    });
    await conn.set(key, JSON.stringify(result));
    await conn.expire(key, 60);
    return result;
}
async function deleteTenantRedisKey(platformId, tenantId) {
    const conn = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
    const keys = await conn.keys(`${PLATFORM_DATA_PREFIX}${platformId}:${tenantId}:*`);
    if (keys.length) {
        await conn.del(...keys);
    }
}
function tenantRedisKey(platformId, tenantId, startTime, endTime) {
    return `${PLATFORM_DATA_PREFIX}${platformId}:${tenantId}:${startTime.toString()}${endTime.toString()}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZENvbnRyb2xTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvYmFja2VuZENvbnRyb2xTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHNEQUFpRDtBQUNqRCxpQ0FBNEI7QUFDNUIsK0RBQStEO0FBRS9ELHNFQUFpRTtBQUVqRSw0REFBdUQ7QUFDdkQsaUdBQXFGO0FBQ3JGLGtGQUF1RTtBQUN2RSx5RUFBaUU7QUFDakUsdUNBQXdDO0FBQ3hDLDJEQUEyRDtBQUMzRCxzREFBZ0Q7QUFDaEQsMkNBQTZEO0FBQzdELDJHQUF1RjtBQUV2RixNQUFNLG9CQUFvQixHQUFHLGdCQUFnQixDQUFBO0FBRTdDLFNBQVMsaUJBQWlCO0lBQ3RCLE1BQU0sVUFBVSxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekQsT0FBTyxVQUFVLENBQUMsSUFBQSw0QkFBZSxFQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3BFLENBQUM7QUFLRCxNQUFhLHFCQUFxQjtJQU85QixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFnQixFQUFFLE9BQWUsRUFBRSxJQUFhO1FBRWxFLE1BQU0sMkJBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVoRCxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtZQUN6RSxHQUFHO1lBQ0gsT0FBTztZQUNQLElBQUk7U0FDUCxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS0QsTUFBTSxDQUFDLG1CQUFtQjtR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QUFHLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTlDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNyRCxNQUFNLGFBQWEsR0FBUSxJQUFBLG1CQUFXLEVBQUMsUUFBUSxDQUFDLENBQUM7UUFDakQsYUFBYSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUVqRSxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM3QyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxELE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDLENBQUM7WUFDN0QsTUFBTSxhQUFhLEdBQVEsSUFBQSxtQkFBVyxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLGFBQWEsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7WUFDakUsYUFBYSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFFaEMsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPO1lBQ0gsR0FBRztZQUNILE9BQU87WUFDUCxhQUFhO1NBQ2hCLENBQUE7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFM0IsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQVNELEtBQUssVUFBVSxxQkFBcUIsQ0FBQyxVQUFrQixFQUFFLFFBQWdCLEVBQUUsU0FBZ0IsRUFBRSxPQUFlO0lBQ3hHLE1BQU0sSUFBSSxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNuRSxNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckUsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRS9CLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtRQUNSLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjtJQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0saUNBQWtCLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFbEcsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsTUFBTSxNQUFNLEdBQVEsSUFBQSxtQkFBVyxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sQ0FBQyxhQUFhLEdBQUksTUFBTSxDQUFDLGFBQXFCLENBQUMsTUFBTSxDQUFDO0lBRTVELE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFekMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUMsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzdCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sYUFBYSxHQUFRLElBQUEsbUJBQVcsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxhQUFhLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDO1FBRWpFLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDckQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEQsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsQ0FBQztZQUM3RCxNQUFNLGFBQWEsR0FBUSxJQUFBLG1CQUFXLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsYUFBYSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNqRSxhQUFhLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUVoQyxPQUFPLGFBQWEsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQTtRQUVGLE9BQU87WUFDSCxHQUFHO1lBQ0gsT0FBTztZQUNQLGFBQWE7U0FDaEIsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBR0gsTUFBTSxZQUFZLEdBQUcsTUFBTSxzQ0FBZSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLCtCQUFtQixDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDN0csTUFBTSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDdEUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0MsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLHNDQUFlLENBQUMsaUJBQWlCLENBQzVELEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsK0JBQW1CLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0lBRW5GLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2pCLE1BQU0sQ0FBQyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFELENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRS9DLENBQUMsQ0FBQyxDQUFBO0lBRUYsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDNUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUUzQixPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBT0QsS0FBSyxVQUFVLG9CQUFvQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0I7SUFDcEUsTUFBTSxJQUFJLEdBQUcsTUFBTSwwQkFBWSxDQUFDLGFBQWEsQ0FBQyxvQkFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25FLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQixHQUFHLFVBQVUsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDO0lBRW5GLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNiLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzNCO0FBQ0wsQ0FBQztBQVNELFNBQVMsY0FBYyxDQUFDLFVBQWtCLEVBQUUsUUFBZSxFQUFFLFNBQWlCLEVBQUUsT0FBZTtJQUMzRixPQUFPLEdBQUcsb0JBQW9CLEdBQUcsVUFBVSxJQUFJLFFBQVEsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7QUFDM0csQ0FBQyJ9