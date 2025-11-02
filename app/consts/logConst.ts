'use strict';

// 加log用到的常量


// 文件名
export const FILE_NAME = {
    LOTTERY_ABNORMAL_PERIOD: 'lottery_abnormal_period_log',  // 期数异常 log
    LOTTERY_ERROR: 'lottery_error_log',                      // 错误 log
    FISHING_FLOW: 'fishing_flow',                            // 钓鱼流程 log
};

// 彩票游戏触发事件
export const LOTTERY_EVENT = {
    CLOSE: 1, // 关闭
    START: 2, // 启动
};

// 更新玩家数据时三种数据
export const PLAYER_VALUE_TYPE = {
    PARAM: 1,           // 传入的参数数据
    TO_BE_UPDATE: 2,    // 将要更新的数据
    UPDATED: 3,         // 更新过后的数据
};