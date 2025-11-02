import { Application, BackendSession, RemoterClass } from 'pinus';
import { PoolFactory } from '../../../services/bonusPools/PoolFactory';
import { getLogger } from 'pinus-logger';
import { clearBonusPoolJob, runScheduleJob, triggerOpts, updateTimeConfig } from "../../../services/bonusPools/schedule";
import PlatformControlManager from "../../../services/newControl/lib/platformControlManager";
import {SheetDTO} from "../../../services/newControl/lib/controlScene";
import {ControlState} from "../../../services/newControl/constants";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

const logger = getLogger('server_out', __filename);

interface BaseValue {
    nid: string;
    sceneId: number;
    roomId?: string;
}


interface lockBonusParams extends BaseValue{
    lock: boolean;
}

interface AddPoolAmount extends BaseValue{
    amount: number;
}

/**
 * 改变奖池金币参数
 * @param amount 金币数量
 * @param betAmount 下注累积
 * @param changeStatus 1 增加 2 减少
 */
interface ChangePoolAmount extends BaseValue {
    amount: number;
    betAmount: number
    changeStatus: 1 | 2;
}


// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        control: {
            // 一次性定义一个类自动合并到UserRpc中
            mainRemote: RemoterClass<BackendSession, MainRemote>;
        };
    }
}

export default function (app: Application) {
    return new MainRemote(app);
};

export class MainRemote {
    HEAD: string;

    constructor(private app: Application) {
        this.app = app;
        this.HEAD = 'control.mainRemote.';
    }

    errTag(functionName, e) {
        console.error(`${this.HEAD}${functionName}`, JSON.stringify(e));
    }

    /**
     * 获取奖池信息
     * @param poolConfig
     * @returns {object}
     */
    async getPool(poolConfig: BaseValue): Promise<any> {
        try {
            const instance = await PoolFactory.getInstance(poolConfig.nid, poolConfig.sceneId, poolConfig.roomId);
            let result = {};
            for (const [poolName, poolInstance] of Object.entries(instance)) {
                for (const [key, value] of Object.entries(poolInstance)) {
                    switch (poolName) {
                        case 'bonusPool':
                            if (typeof value === 'number')
                                result[`bonus_${key}`] = value;
                            break;
                        case 'controlPool':
                            if (typeof value === 'number')
                                result[`control_${key}`] = value;
                            break;
                        case 'profitPool':
                            if (typeof value === 'number')
                                result[`profit_${key}`] = value;
                            break;
                    }
                }
            }
            return result;
        } catch (e) {
            this.errTag('getPool', e.stack || e);
            return e;
        }
    }

    /**
     * 获取奖池是否锁定
     * @param params
     */
    async getCorrectedValueAndLockJackpot(params: BaseValue) {
        try {
            const { nid, sceneId, roomId } = params;
            const pool = await PoolFactory.getInstance(nid, sceneId, roomId);
            return pool.getCorrectedValueAndLockJackpot();
        } catch (e) {
            this.errTag('getCorrectedValueAndLockJackpot', e.stack || e);
            return 1;
        }
    }

    /**
     * 设置奖池锁定或者解锁
     * @param params
     */
    async lockBonusPool(params: lockBonusParams) {
        const { nid, sceneId, lock } = params;
        const pool = await PoolFactory.getInstance(nid, sceneId);
        return pool.bonusPool.setLockJackpot(lock);
    }

    /**
     * 添加盈利池
     * @param cf
     */
    async addProfitPoolAmount(cf: AddPoolAmount): Promise<boolean> {
        try {
            const pool = await PoolFactory.getInstance(cf.nid, cf.sceneId, cf.roomId);
            pool.profitPool.addProfitPoolAmount(cf.amount);
            return true;
        } catch (e) {
            this.errTag('addProfitPoolAmount', e.stack || e);
            return false;
        }
    }

    /**
     * 改变奖池池金币
     * @param cf
     */
    async changeBonusPoolAmount(cf: ChangePoolAmount): Promise<boolean | any> {
        try {

            const pool = await PoolFactory.getInstance(cf.nid, cf.sceneId, cf.roomId);

            logger.info(`获取奖池实例|nid: ${cf.nid}, sceneId: ${cf.sceneId}`);
            logger.info(`奖池金额:${pool.bonusPool.amount}|金额下限:${pool.bonusPool.minAmount}|金额上限:${pool.bonusPool.maxAmount}|吃水系数:${pool.bonusPool.minParameter}|放水系数:${pool.bonusPool.maxParameter}`);
            logger.info(`当前修正值:${pool.getBonusPoolCorrectedValue()}|修正值下限:${pool.bonusPool.minBonusPoolCorrectedValue}|修正值上限:${pool.bonusPool.maxBonusPoolCorrectedValue}`);

            // 改变奖池金币
            await pool.changeBonusPoolAmount(cf.amount, cf.changeStatus);

            // 改变押注金币以及返奖金币
            pool.changeAwardAmountAndBetAmount(cf.amount, cf.betAmount, cf.changeStatus);

            logger.info(`奖池${cf.changeStatus === 1 ? '增加' : '减少'}:${cf.amount}`);

            logger.info(`变化后的修正值:${pool.getBonusPoolCorrectedValue()}|修正值下限:${pool.bonusPool.minBonusPoolCorrectedValue}|修正值上限:${pool.bonusPool.maxBonusPoolCorrectedValue}`)
            return true;
        } catch (e) {
            this.errTag('changeBonusPoolAmount', e.stack || e);
            return false;
        }
    }

    /**
     * 改变奖池数据
     * @param sheet
     */
    async changeControlData(sheet: SheetDTO): Promise<boolean | any> {
        try {

            const pool = await PoolFactory.getInstance(sheet.nid, sheet.sceneId);

            const changeStatus = sheet.profit > 0 ? 2 : 1;
            const amount = Math.abs(sheet.profit);

            // 改变奖池金币
            await pool.changeBonusPoolAmount(amount, changeStatus);

            // 改变押注金币以及返奖金币
            pool.changeAwardAmountAndBetAmount(amount, sheet.betGold, changeStatus);

            // 改变调控数据库
            PlatformControlManager.change(sheet);

            return true;
        } catch (e) {
            this.errTag('changeControlData', e.stack || e);
            return false;
        }
    }

    /**
     * 获取奖池公共修正参数
     * @param params {BaseValue}
     * @returns number
     */
    async getBonusPoolCorrectedValueByParams(params: BaseValue): Promise<number> {
        try {
            const { nid, sceneId, roomId } = params;
            const pool = await PoolFactory.getInstance(nid, sceneId, roomId);
            return pool.getBonusPoolCorrectedValue();
        } catch (e) {
            this.errTag('getBonusPoolCorrectedValueByParams', e.stack || e);
            return 1;
        }
    }

    /**
     * 变更实例奖池的配置信息
     * @param params {BaseValue}
     * @param changeParam
     */
    async changePoolConfig(params: BaseValue, changeParam: any): Promise<boolean> {
        try {
            const { nid, sceneId, roomId } = params;
            const pool = await PoolFactory.getInstance(nid, sceneId, roomId);
            pool.bonusPool.minAmount = changeParam['minAmount'];
            pool.bonusPool.minParameter = changeParam['minParameter'];
            pool.bonusPool.maxAmount = changeParam['maxAmount'];
            pool.bonusPool.maxParameter = changeParam['maxParameter'];
            pool.bonusPool.maxAmountInStore = changeParam['maxAmountInStore'];
            pool.bonusPool.maxAmountInStoreSwitch = changeParam['maxAmountInStoreSwitch'];
            pool.bonusPool.setMinBonusPoolCorrectedValue(changeParam['minBonusPoolCorrectedValue']);
            pool.bonusPool.setMaxBonusPoolCorrectedValue(changeParam['maxBonusPoolCorrectedValue']);
            pool.bonusPool.personalReferenceValue = changeParam['personalReferenceValue'];

            pool.bonusPool.changeCorrectedValueAfterAdd();
            pool.bonusPool.changeCorrectedValueAfterReduce();

            return true;
        } catch (e) {
            this.errTag('getBonusPoolCorrectedValueByParams', e.stack || e);
            return false;
        }
    }


    /**
     * 更新清空奖池配置
     * @param params
     */
    async updateClearPoolsAmountTimeConfig(params: triggerOpts) {
        await updateTimeConfig(params);
        runScheduleJob();
    }

    /**
     *
     * @param platformId 平台id
     * @param tenantId  租户id
     * @param nid
     * @param betGold
     */
    getPlatformControl({platformId, tenantId, nid, betGold}): ControlState {
        return PlatformControlManager.needKill(platformId, tenantId, nid, betGold);
    }

    /**
     * 立即清空奖池
     */
    async clearPoolsAmount() {
        await clearBonusPoolJob();
    }

    /**
     * 获取奖池数据以及修正值
     * @param finds
     */
    async getPoolsAmountAndCorrectedValue(finds: { [nid: string]: number[] }) {
        const results: any = {};

        for (let nid in finds) {
            const sceneIds = finds[nid];
            results[nid] = await Promise.all(sceneIds.map(async sceneId => {
                const pool = await PoolFactory.getInstance(nid, sceneId);
                if (pool) {
                    return pool.getBonusAmountAndCorrectedValue();
                }
                return null;
            }));
        }

        return results;
    }

    /**
     * 获取指定奖池的返奖率
     * @param finds 指定游戏的返奖率
     * eg: {'12': [0, 1 ,2]}; 获取的就是 nid 为 12 0, 1, 2场的返奖率
     */
    async getPoolsOddsOfWinning(finds: { [nid: string]: number[] }) {
        const results: any = {};

        for (let nid in finds) {
            const sceneIds = finds[nid];
            results[nid] = await Promise.all(sceneIds.map(async sceneId => {
                const pool = await PoolFactory.getInstance(nid, sceneId);
                if (pool) {
                    return pool.getOddsOfWinning();
                }
                return null;
            }));
        }

        return results;
    }

    /**
     * 获取当月所有平台数据
     * @
     */
    async getAllPlatformData() {
        return PlatformControlManager.getData(true);
    }

    /**
     * 获取单个平台数据
     * @param platformId 平台号
     */
    async getPlatformData({platformId}) {
        const result = PlatformControlManager.getPlatformData(platformId, true);

        if (!result) {
            return null;
        }

        return {
            platformId: '',
            betGoldAmount: result.comprehensive.betGoldAmount,
            profit: result.comprehensive.profit,
            betPlayersSet: result.comprehensive.betPlayersSet.length,
            playerWinCount: result.comprehensive.playerWinCount,
            systemWinCount: result.comprehensive.systemWinCount,
            equalityCount: result.comprehensive.equalityCount,
            systemWinRate: result.comprehensive.systemWinRate,
            killRate: result.comprehensive.killRate,
            controlWinCount: result.comprehensive.controlWinCount,
            controlLossCount: result.comprehensive.controlLossCount,
            controlEquality: result.comprehensive.controlEquality,
            betRoundCount: result.comprehensive.betRoundCount,
            serviceCharge: result.comprehensive.serviceCharge,
            controlStateStatistical: result.comprehensive.controlStateStatistical,
            killRateConfig: result.killRateConfig,
            games: result.games.map(g => {
                return {
                    nid: g.nid,
                    comprehensive: g.comprehensive,
                    killRateConfig: g.killRateConfig,
                }
            })
        }
    }

    /**
     * 获取单个平台数据
     * @param platformId 平台号
     * @param nid 游戏nid
     */
    async getPlatformGameData({platformId, nid}) {
        const result = PlatformControlManager.getPlatformData(platformId, true);

        if (!result) {
            return null;
        }

        return result.games.find(g => g.nid === nid);
    }

    /**
     * 获取平台游戏的杀率配置
     * @param games 游戏nid
     * @param platformId 平台id
     */
    getPlatformGamesKillRateConfig({platformId, games}): {platformKillRateConfig: number | null, gameList: any} {
        const gameList: any = {};

        games.forEach(nid => gameList[nid] = PlatformControlManager.getPlatformKillRateConfig(platformId, nid));

        return {
            platformKillRateConfig: PlatformControlManager.getPlatformKillRateConfig(platformId),
            gameList
        }
    }

    /**
     * 设置平台或者平台的单个游戏
     * @param platformId
     * @param killRate
     * @param nid
     */
    async setPlatformControl({platformId, killRate, nid}): Promise<{success: boolean, killRate?: number}> {
        return await PlatformControlManager.addPlatformControl(platformId, killRate, nid);
    }

    /**
     * 设置平台或者平台的单个游戏
     * @param platformId 平台id
     * @param tenantId 租户id
     * @param killRate 杀率
     * @param nid 游戏nid
     */
    async setTenantControl({platformId, tenantId, killRate, nid}): Promise<{success: boolean, killRate?: number}> {
        return await PlatformControlManager.addTenantControl(platformId, tenantId,  killRate, nid);
    }

    /**
     * 玩家进入场通知建立租户调控
     * @param platformId
     * @param tenantId
     * @param nid
     * @param sceneId
     */
    async addTenantGameScene({platformId, tenantId, nid, sceneId}:
                                 {platformId: string, tenantId: string, nid: GameNidEnum, sceneId: number})  {
        return PlatformControlManager.addTenantGameScene(platformId, tenantId, nid, sceneId);
    }

}

