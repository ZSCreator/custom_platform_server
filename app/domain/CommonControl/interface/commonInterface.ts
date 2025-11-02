import {LIMIT_TYPE_ENUM} from "../config/slotsBaseConst";

/**
 * 电玩游戏兜底配置
 */
export interface WinLimitConfig {
    lowTopUp: number;               // 最低充值
    highTopUp: number;              // 最高充值
    type: LIMIT_TYPE_ENUM;          // 兜底类型
    coefficient: number;            // 计算系数
    minimum: number;                // 保底值
}