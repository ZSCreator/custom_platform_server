'use strict';
export const CHANNEL_NAME = 'zhajinhua';
export const RESULT_NUM = 17;// 开奖结果次数

/**
 * 牌型概率
 */
export const TYPE_PROBABILITY = {
    5: 24,                  // 豹子
    4: 122,                 // 同花顺
    3: 1246,                // 同花
    2: 1776,                // 顺子
    1: 3194,                // 对子
    0: 3639                 // 单牌
};

/**
 * 调控情况下牌型概率
 */
export const CONTROL_TYPE_PROBABILITY = {
    5: 24,                  // 豹子
    4: 22,                  // 同花顺
    3: 1546,                // 同花
    2: 2476,                // 顺子
    1: 3544,                // 对子
    0: 2389                 // 单牌
};