import {GameNidEnum} from "../../common/constant/game/GameNidEnum";
import {SceneControl} from "./impl/sceneControl";
import {pinus} from "pinus";
import {randomFromRange} from "../../utils/lottery/commonUtil";
import {triggerOpts} from "../bonusPools/schedule";
import {TotalPersonalControl} from "./impl/totalPersonalControl";
import {BackendDisplaySceneControl, PersonalControlPlayer, Scene, SceneControlInfo} from "./interfaces/simple";
import {PersonalControl} from "./impl/personalControl";
import PlatformControlDao from "../../common/dao/daoManager/PlatformControl.manager";
import redisManager from "../../common/dao/redis/lib/BaseRedisManager";
import {RedisDB} from "../../common/dao/redis/config/DBCfg.enum";
import {summaryList} from "./lib/utils";
import * as controlRecordDAO from "./DAO/controlRecordDAO";
import {get_games} from "../../pojo/JsonConfig";
import {PlatformControlType, RecordTypes} from "./constants";
import controlStateDao from '../../common/dao/daoManager/PlatformControlState.manager';

const PLATFORM_DATA_PREFIX = 'data:platform:'

function randomServerRpcId() {
    const serverList = pinus.app.getServersByType('control');
    return serverList[randomFromRange(0, serverList.length - 1)].id;
}

/**
 * 后台调控服务
 */
export class BackendControlService {
    /**
     * 设置锁死奖池
     * @param nid
     * @param sceneId
     * @param lock
     */
    static async lockPool(nid: GameNidEnum, sceneId: number, lock: boolean): Promise<boolean> {
        // 现设置场控
        await SceneControl.lockPool(nid, sceneId, lock);
        // 再通知奖池锁定
        pinus.app.rpc.control.mainRemote.lockBonusPool.toServer(randomServerRpcId(), {
            nid,
            sceneId,
            lock
        });

        return true;
    }

    /**
     * 清空所有奖池
     */
    static clearAllPoolsAmount(): Promise<any> {
        return pinus.app.rpc.control.mainRemote.clearPoolsAmount.toServer(randomServerRpcId());
    }

    /**
     * 更新清空奖池时间配置
     * @param start
     * @param period
     */
    static updateClearPoolsAmountTimeConfig({ start, period }: triggerOpts): Promise<void> {
        return pinus.app.rpc.control.mainRemote.updateClearPoolsAmountTimeConfig.toServer(randomServerRpcId(), {
            start,
            period
        });
    };

    /**
     * 删除个人总控调控玩家
     * @param uid
     */
    static removeTotalPersonalControlPlayer(uid: string): Promise<void> {
        return TotalPersonalControl.removePlayer(uid);
    }

    /**
     * 添加个人总控玩家
     * @param uid  玩家唯一uid
     * @param remark 备注
     * @param managerId 添加人
     * @param probability 调控概率 -100 <-> 100;
     * @param killCondition 必杀调控 默认为0
     */
    static addTotalPersonalControlPlayer({
        uid,
        remark,
        managerId,
        probability,
        killCondition = 0
    }: PersonalControlPlayer): Promise<void> {
        return TotalPersonalControl.addPlayer({ uid, remark, managerId, probability, killCondition });
    }

    /**
     * 是否是总控玩家
     * @param uid
     */
    static async isTotalControlPlayer(uid: string): Promise<boolean> {
        return !!(await TotalPersonalControl.findPlayer(uid));
    }

    /**
     * 添加在线总调控玩家集合
     * @param uid
     */
    static addOnlinePlayer(uid: string): Promise<any> {
        return TotalPersonalControl.addOnlinePlayer(uid);
    }

    /**
     * 移除在线调控玩家
     * @param uid
     */
    static removeOnlineControlPlayer(uid: string): Promise<any> {
        return TotalPersonalControl.removeOnlinePlayer(uid);
    }

    /**
     * 移除在线调控玩家
     */
    static removeControlPlayers(): Promise<any> {
        return TotalPersonalControl.removeControlPlayers();
    }

    /**
     * 获取场控玩家
     * @param nid
     * @param sceneId
     */
    static getSceneControlPlayers({ nid, sceneId }: { nid: GameNidEnum, sceneId: number }): Promise<any> {
        return PersonalControl.getControlPlayers({ nid, id: sceneId });
    }

    /**
     * 设置必杀条件描述
     * @param nid
     * @param sceneId
     * @param description
     */
    static setKillDescription({ nid, sceneId, description }: {
        nid: GameNidEnum, sceneId: number, description: string
    }): Promise<any> {
        return PersonalControl.setConditionDescription({ nid, sceneId, description });
    }

    /**
     * 设置庄杀
     * @param nid 游戏nid
     * @param sceneId 场id
     * @param bankerKill 是否装杀
     * @param bankerKillProbability 庄杀概率
     */
    static setBankerKill({ nid, sceneId, bankerKillProbability }: {
        nid: GameNidEnum,
        sceneId: number,
        bankerKillProbability: number
    }): Promise<any> {
        return SceneControl.setBankerKill({ nid, sceneId, bankerKillProbability });
    }

    /**
     * 添加调控玩家
     * @param scene 场
     * @param player 调控玩家
     */
    static addSceneControlPlayer(scene: Scene, player: PersonalControlPlayer): Promise<any> {
        return PersonalControl.addPlayer(scene, player);
    };

    /**
     * 移除这个场个控玩家
     * @param scene 场信息
     * @param uid 玩家uid
     */
    static removeSceneControlPlayer(scene: Scene, uid: string): Promise<any> {
        return PersonalControl.removePlayer(scene, uid);
    };

    /**
     * 设置场控权重
     * @param scene
     * @param weights 权重值
     */
    static setSceneControlWeight(scene: Scene, weights: number): Promise<void> {
        return SceneControl.setSceneControlWeight(scene, weights);
    }

    /**
     * 获取后台调控界面显示信息
     */
    static async getAllSceneControl(): Promise<BackendDisplaySceneControl[]> {
        const allSceneControl = await SceneControl.getAllSceneControl();

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

        // 查询奖池信息
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

    /**
     * 获取奖池修正值以及bonus奖池值
     * @param finds
     */
    static async getPoolsAmountAndCorrectedValue(finds: { [nid: string]: number[] }) {
        return await pinus.app.rpc.control.mainRemote.getPoolsAmountAndCorrectedValue.toServer(randomServerRpcId(), finds);
    }

    /**
     * 获取所有总控玩家uid
     */
    static async getAllTotalControlPlayersUidList(): Promise<string[]> {
        return TotalPersonalControl.getAllPlayersUidList();
    }

    /**
     * 获取所有总控玩家uid
     */
    static async getControlPlayers(): Promise<any[]> {
        return TotalPersonalControl.getControlPlayers();
    }

    /**
     * 根据uid获取一个总控玩家
     * @param uid
     */
    static async getTotalControlPlayer(uid: string): Promise<any> {
        return TotalPersonalControl.findPlayer(uid);
    }

    /**
     * 获取一部分总控玩家
     * @param where 查询条件
     * @param start 开始下标
     * @param end 结束下标
     */
    static getTotalControlPlayersRange(where: any, start: number, end: number): Promise<any> {
        return TotalPersonalControl.getPlayersRange(where, start, end);
    }

    /**
     * 获取特定条件总控玩家数量
     * @param where 查询条件
     */
    static getTotalControlPlayersCount(where: object): Promise<number> {
        return TotalPersonalControl.getPlayersCount(where);
    }

    /**
     * 获取在线总控玩家数量
     */
    static getOnlineTotalControlPlayersCount(): Promise<number> {
        return TotalPersonalControl.getOnlinePlayersCount();
    }

    /**
     * 获取在线总调控玩家区间
     * @param start 开始
     * @param end 结束
     */
    static getOnlineTotalControlPlayersRange(start: number, end: number): Promise<any[]> {
        return TotalPersonalControl.getOnlinePlayersUidRange(start, end);
    }

    /**
     * 情况在线调控的玩家
     */
    static clearOnlineTotalControlPlayer(): Promise<void> {
        return TotalPersonalControl.clearOnlineSet();
    }

    /**
     * 获取指定奖池的返奖率
     * @param finds 指定游戏的返奖率
     * eg: {'12': [0, 1 ,2]}; 获取的就是 nid 为 12 0, 1, 2场的返奖率
     */
    static async getPoolsOddsOfWinning(finds: { [nid: string]: number[] }) {
        return await pinus.app.rpc.control.mainRemote.getPoolsOddsOfWinning.toServer(randomServerRpcId(), finds);
    }

    /**
     * 获取单个的场控权重
     * @param nid 游戏id
     * @param sceneId 场id
     */
    static async getOneSceneControlWeight(nid: GameNidEnum, sceneId: number): Promise<{sceneId: number, weights: number} | undefined> {
        return SceneControl.getOneSceneWight(nid, sceneId);
    }

    /**
     * 获取单个游戏的场控数据
     * @param nid
     */
    static async getOneGameSceneControlList(nid: GameNidEnum): Promise<any[]> {
        return SceneControl.getOneGameSceneControl(nid);
    }

    /**
     * 获取场控个人玩家数据
     * @param scene
     * @param uid
     */
    static async getOnePersonalControlPlayer(scene: Scene, uid: string): Promise<PersonalControlPlayer> {
        return PersonalControl.getOneControlPlayer(scene, uid);
    }

    /**
     * 获取一个场的调控的调控信息
     * @param scene
     */
    static async getOneGameSceneControlInfo(scene: Scene): Promise<SceneControlInfo> {
        return SceneControl.getOneSceneControlInfo(scene.nid, scene.id);
    }

    /**
     * 获取当月所有平台数据
     */
    static async getAllPlatformData(month: number) {
        if (month) {
            const data = await PlatformControlDao.getTotalPlatformDuringTheMonth(month);

            if (!data) {
                return null;
            }

            data.betPlayersSet = data.betPlayersSet.length;
            return data;
        }

        return pinus.app.rpc.control.mainRemote.getAllPlatformData.toServer(randomServerRpcId(), {month});
    }

    /**
     * 获取单个平台数据
     * @param platformId
     * @param startTime 开始时间
     * @param endTime 结束时间
     */
    static async getPlatformData(platformId: string, startTime,  endTime) {
        if (startTime && endTime) {
            const data = await getPlatformData(platformId, startTime, endTime);

            if (!data) {
                return pinus.app.rpc.control.mainRemote.getPlatformData.toServer(randomServerRpcId(), {
                    platformId
                })
            }

            const games = data.games.map(g => g.nid);
            const result = await getPlatformGamesKillRateConfig(platformId, games);

            data.killRateConfig = result.platformKillRateConfig;
            data.games.map(g => {
                g.killRateConfig = result.gameList[g.nid];
                Reflect.deleteProperty(g, 'details');
            })


            return data;
        }


        return pinus.app.rpc.control.mainRemote.getPlatformData.toServer(randomServerRpcId(), {
            platformId
        });
    }

    /**
     * 获取单个平台租户的数据
     * @param platformId
     * @param tenantId 租户id
     * @param startTime 开始时间
     * @param endTime 结束时间
     */
    static async getPlatformTenantData(platformId: string, tenantId: string, startTime,  endTime) {
        if (startTime && endTime) {
            const data = await getPlatformTenantData(platformId, tenantId, startTime, endTime);

            if (!data) {
                return null;
            }

            return data;
        }

        return null;
    }

    /**
     * 获取单个平台游戏数据
     * @param platformId 平台id
     * @param nid 游戏nid
     * @param startTime 开始时间
     * @param endTime 结束时间
     */
    static async getPlatformGameData(platformId: string, nid: string, startTime, endTime) {
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

    /**
     * 获取单个平台游戏数据
     * @param platformId 平台id
     * @param tenantId 租户id
     * @param nid 游戏nid
     * @param startTime 开始时间
     * @param endTime 结束时间
     */
    static async getTenantGameData(platformId: string, tenantId: string, nid: string, startTime,  endTime) {
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

    /**
     * 设置单个平台调控
     * @param platformId
     * @param killRate
     * @param nid
     * @param managerId 添加人
     */
    static async setPlatformControl(platformId: string, killRate: number, managerId: string, nid?: string) {
        let gameName = '';

        if (nid) {
            const game = get_games(nid);

            if (game) {
                gameName = game.zname;
            }
        }

        // 添加记录
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

        return pinus.app.rpc.control.mainRemote.setPlatformControl.toServer(randomServerRpcId(), {platformId, killRate, nid});
    }

    /**
     * 设置单个租户调控
     * @param platformId 平台id
     * @param tenantId 租户id
     * @param killRate
     * @param nid
     * @param managerId 添加人
     */
    static async setTenantControl(platformId: string, tenantId: string, killRate: number, managerId: string, nid?: string) {
        let gameName = '';

        if (nid) {
            const game = get_games(nid);

            if (game) {
                gameName = game.zname;
            }
        }

        // 添加记录
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

        const result = await pinus.app.rpc.control.mainRemote.setTenantControl.toServer(randomServerRpcId(),
            {platformId, killRate, tenantId, nid});

        if (!!result && result.success) {
            await deleteTenantRedisKey(platformId, tenantId);
        }

        return result;
    }
}


/**
 * 获取平台杀率
 * @param platformId
 * @param games nid 列表
 */
async function getPlatformGamesKillRateConfig(platformId: string, games: string[]):
    Promise<{platformKillRateConfig: number | null, gameList: any}>{
    return pinus.app.rpc.control.mainRemote.getPlatformGamesKillRateConfig.toServer(randomServerRpcId(), {
        platformId,
        games
    });
}

/**
 * 获取平台数据
 * @param platformId 平台号
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
async function getPlatformData(platformId: string, startTime:number, endTime: number) {
    const conn = await redisManager.getConnection(RedisDB.RuntimeData);
    const key = `${PLATFORM_DATA_PREFIX}${platformId}:${startTime.toString()}${endTime.toString()}`;
    let data = await conn.get(key);

    if (!!data) {
        return JSON.parse(data);
    }

    const list = await PlatformControlDao.getPlatformDataList(RecordTypes.SCENE, platformId, startTime, endTime);

    if (list.length === 0) {
        return null;
    }

    const result: any = summaryList(list);
    result.betPlayersSet = (result.betPlayersSet as any).length;

    const nidSet = new Set();
    list.forEach(row => nidSet.add(row.nid));

    const nidList = [...nidSet.values()];
    nidList.sort((x, y) => Number(x) - Number(y));

    result.games = nidList.map(nid => {
        const gameData = list.filter(row => row.nid === nid);
        const comprehensive: any = summaryList(gameData);
        comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;

        const sceneIdSet = new Set();
        gameData.forEach(row => sceneIdSet.add(row.sceneId));
        const sceneIdList = [...sceneIdSet.values()];
        sceneIdList.sort((x, y) => Number(x) - Number(y));

        const details = sceneIdList.map(sceneId => {
            const data = gameData.filter(row => row.sceneId === sceneId);
            const comprehensive: any = summaryList(data);
            comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;
            comprehensive.sceneId = sceneId;

            return comprehensive;
        })

        return {
            nid,
            details,
            comprehensive
        }
    });

    await conn.set(key, JSON.stringify(result));
    await conn.expire(key, 60);

    return result;
}

/**
 * 获取租户数据
 * @param platformId 平台号
 * @param tenantId 租户号
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
async function getPlatformTenantData(platformId: string, tenantId: string, startTime:number, endTime: number) {
    const conn = await redisManager.getConnection(RedisDB.RuntimeData);
    const key = tenantRedisKey(platformId, tenantId, startTime, endTime);
    let data = await conn.get(key);

    if (!!data) {
        return JSON.parse(data);
    }

    const list = await PlatformControlDao.getTenantDataList(platformId, tenantId, startTime, endTime);

    if (list.length === 0) {
        return null;
    }

    const result: any = summaryList(list);
    result.betPlayersSet = (result.betPlayersSet as any).length;

    const nidSet = new Set();
    list.forEach(row => nidSet.add(row.nid));

    const nidList = [...nidSet.values()];
    nidList.sort((x, y) => Number(x) - Number(y));

    result.games = nidList.map(nid => {
        const gameData = list.filter(row => row.nid === nid);
        const comprehensive: any = summaryList(gameData);
        comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;

        const sceneIdSet = new Set();
        gameData.forEach(row => sceneIdSet.add(row.sceneId));
        const sceneIdList = [...sceneIdSet.values()];
        sceneIdList.sort((x, y) => Number(x) - Number(y));

        const details = sceneIdList.map(sceneId => {
            const data = gameData.filter(row => row.sceneId === sceneId);
            const comprehensive: any = summaryList(data);
            comprehensive.betPlayersSet = comprehensive.betPlayersSet.length;
            comprehensive.sceneId = sceneId;

            return comprehensive;
        })

        return {
            nid,
            details,
            comprehensive
        }
    });

    // 查询租户id
    const tenantResult = await controlStateDao.findOne({platformId, tenantId, type: PlatformControlType.TENANT});
    result.killRateConfig = !!tenantResult ? tenantResult.killRate : null;
    const games = result.games.map(g => g.nid);
    const tenantGameResult = await controlStateDao.findManyByNidList(
        {platformId, tenantId, type: PlatformControlType.TENANT_GAME, nidList: games});

    result.games.map(g => {
        const r = tenantGameResult.find(res => res.nid === g.nid);
        g.killRateConfig = !!r ? r.killRate : null;
        // Reflect.deleteProperty(g, 'details');
    })

    await conn.set(key, JSON.stringify(result));
    await conn.expire(key, 60);

    return result;
}

/**
 * 删除key
 * @param platformId
 * @param tenantId
 */
async function deleteTenantRedisKey(platformId: string, tenantId: string) {
    const conn = await redisManager.getConnection(RedisDB.RuntimeData);
    const keys = await conn.keys(`${PLATFORM_DATA_PREFIX}${platformId}:${tenantId}:*`);

    if (keys.length) {
        await conn.del(...keys);
    }
}

/**
 * 租户key
 * @param platformId
 * @param tenantId
 * @param startTime
 * @param endTime
 */
function tenantRedisKey(platformId: string, tenantId:string, startTime: number, endTime: number) {
    return `${PLATFORM_DATA_PREFIX}${platformId}:${tenantId}:${startTime.toString()}${endTime.toString()}`;
}