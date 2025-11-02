import {ControlState as ControlStateEnum, PlatformControlType} from "../constants";
import PlatformControlStateDao from '../../../common/dao/daoManager/PlatformControlState.manager';
import { getLogger } from 'pinus-logger';
const logger = getLogger('server_out', __filename);

interface IControlState {
    /** 平台号 */
    platformId: string;

    /** 杀率 */
    killRate: number;

    /** 租户号 */
    tenantId?: string;

    /** 游戏id 如果没有则为平台 */
    nid?: string;
}

/** 平台调控触发需要的押注金币 单位为分 */
const PLATFORM_TRIGGER_GOLD = 10000000;

/** 平台调控子游戏触发需要的押注金币 单位为分*/
const PLATFORM_GAME_TRIGGER_GOLD = 1000000;

/** 平台调控租户触发需要的押注金币 单位为分*/
const TENANT_TRIGGER_GOLD = 5000000;

/** 平台调控租户游戏触发需要的押注金币 单位为分*/
const TENANT_GAME_TRIGGER_GOLD = 2000000;

/**
 * 调控阶段概率
 */
enum StageProbability {
    base = 0.25,
    second = 0.50,
    third = 0.7,
}

/**
 * 调控阶段时长
 */
enum StageBurningTime {
    base = 1.5 * 60 * 1000,
    second  = 2 * 60 * 1000,
    third = 3 * 60 * 1000
}

/** 调控间隔时间 */
const TIME_INTERVAL = 60 * 1000;

/** 杀率允许阈值区间 */
const SECTION_NUM = 0.015;

/** 平衡值 */
const BALANCE_VALUE = 0.01;

/**
 * 构建调控状态
 * @param platform
 * @param type
 */
export function buildControlState(platform: IControlState, type: PlatformControlType) {
    return new ControlState(platform, type);
}

export class ControlState implements IControlState{
    platformId: string;
    nid: string;
    killRate: number;

    /** 下注金额 */
    private betGoldAmount: number;

    /** 系统收益 */
    private profit: number;

    /** 当前杀率 */
    private currentKillRate: number = 0;

    /** 租户号 */
    tenantId: string;

    /** 调控触发金币 */
    triggerGold: number;

    /** 触发时间 */
    triggerTime: number;

    /** 结束时间 */
    endTime: number;

    /** 调控阶段 */
    stage: number = 0;

    /** 调控概率 */
    probability: StageProbability = StageProbability.base;

    /** state类型  */
    type: PlatformControlType;

    constructor(platform: IControlState, type: PlatformControlType) {
        this.platformId = platform.platformId;
        this.nid = platform.nid;
        this.killRate = platform.killRate;
        this.type = type;
        this.tenantId = platform.tenantId || '';
        this.triggerGold = trigger(type);
        const now = Date.now();
        this.triggerTime = now;
        this.endTime = now;
    }

    /**
     * 初始化
     * @param betGoldAmount 这月的下注
     * @param profit 这月系统的收益
     */
    init(betGoldAmount: number, profit: number) {
        this.betGoldAmount = betGoldAmount;
        this.profit = profit;

        if (betGoldAmount !== 0) {
            this.currentKillRate = this.profit / this.betGoldAmount;
        }

        const now = Date.now();
        this.triggerTime = now;
        this.endTime = now;
    }

    /**
     * 创建
     */
    async createToDB() {
        await PlatformControlStateDao.createOne({
            platformId: this.platformId,
            killRate: this.killRate,
            nid: this.nid,
            type: this.type,
            tenantId: this.tenantId,
        });
    }


    /**
     * 状态内部数据改变
     * @param betGold 下注金币
     * @param profit 玩家收益
     */
    change(betGold: number, profit: number) {
        this.betGoldAmount += betGold;
        this.profit -= profit;

        if (this.betGoldAmount !== 0) {
            this.currentKillRate = this.profit / this.betGoldAmount;
            const now = Date.now();
            const intervalTime = now - this.endTime;

            // 如果调控未结束 段落调控结束在时间段内不再进行调控
            if (now < this.endTime || (intervalTime < TIME_INTERVAL)) {
                return;
            }

            const diffValue = Math.abs(this.killRate - this.currentKillRate);

            // 允许范围内可以进行适当调整
            if (diffValue < SECTION_NUM) {

                // 靠近临界值进行轻微调控
                if (diffValue > BALANCE_VALUE) {
                    this.triggerTime = now;

                    this.probability = StageProbability.base;
                    this.endTime = this.triggerTime + StageBurningTime.base;
                }

                return;
            }

            this.triggerTime = now;

            if (this.killRate > this.currentKillRate) {
                this.probability = StageProbability.third;
                this.endTime = this.triggerTime + StageBurningTime.third;
            } else {
                this.probability = StageProbability.second;
                this.endTime = this.triggerTime + StageBurningTime.second;
            }
        }
    }

    /**
     * 获取当前系统设置的杀率
     */
    getKillRate(): number {
        return this.killRate;
    }

    /**
     * 修改杀率
     * @param rate
     */
    async changeKillRate(rate: number) {
        rate /= 100;

        const where:any = {platformId: this.platformId, tenantId: this.tenantId, type: this.type};
        switch (this.type) {
            case PlatformControlType.GAME:
            case PlatformControlType.TENANT_GAME: {
                where.nid = this.nid;
                break;
            }
            default: break;
        }

        await PlatformControlStateDao.updateOne(where,{killRate: rate});

        this.killRate = rate;
    }

    /**
     * 是否需要做出杀率调控
     * @param betGold
     */
    needKill(betGold: number): ControlStateEnum  {
        const now = Date.now();
        const intervalTime = now - this.endTime;

        logger.warn('变化数据', this.killRate, this.currentKillRate,
            this.probability,
            this.profit,
            this.betGoldAmount,
            intervalTime)

        if (this.betGoldAmount < this.triggerGold ||
            this.killRate <= 0 ||
            (intervalTime > 0 && intervalTime < TIME_INTERVAL) ||
            (Math.abs(this.killRate - this.currentKillRate) < SECTION_NUM)) {
            return ControlStateEnum.NONE;
        }


        if (this.killRate > this.currentKillRate && Math.random() < this.probability) {
            return ControlStateEnum.SYSTEM_WIN;
        }

        if (this.killRate < this.currentKillRate && Math.random() > this.probability) {
            return  ControlStateEnum.PLAYER_WIN;
        }

        return ControlStateEnum.NONE;
    }
}

function trigger(type: PlatformControlType): number {
    switch (type) {
        case PlatformControlType.GAME: return PLATFORM_GAME_TRIGGER_GOLD;
        case PlatformControlType.PLATFORM: return PLATFORM_TRIGGER_GOLD;
        case PlatformControlType.TENANT: return TENANT_TRIGGER_GOLD;
        case PlatformControlType.TENANT_GAME: return TENANT_GAME_TRIGGER_GOLD;
        default: return 0;
    }
}