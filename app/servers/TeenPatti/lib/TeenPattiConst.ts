'use strict';
export const CHANNEL_NAME = 'zhajinhua';
export const RESULT_NUM = 17;// 开奖结果次数

/**
 * 牌型概率
 */
export const TYPE_PROBABILITY = {
    5: 24,                  // 豹子
    4: 122,                 // 同花顺
    3: 1776,                // 同花
    2: 1246,                // 顺子
    1: 3639,                // 对子
    0: 3194               // 单牌
};

/**
 * 调控情况下牌型概率
 */
export const CONTROL_TYPE_PROBABILITY = {
    5: 24,                  // 豹子
    4: 22,                  // 同花顺
    3: 2476,                // 同花
    2: 1546,                // 顺子
    1: 3544,                // 对子
    0: 2389                 // 单牌
};


export interface Irecord_history {
    info: {
        uid: string;
        isRobot: number;
        seat: number;
        nickname: string;
        gold: number;
        totalBet: number;
        hold: number[];
        cardType: number;
        holdStatus: number;
        profit: number;
    }[],
    oper: { uid: string, oper_type: string, update_time: string, msg: any }[]
}