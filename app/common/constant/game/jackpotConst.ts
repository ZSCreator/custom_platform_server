/** 游戏奖池常量 */

//基础奖池初始值
export const BASIC_JACKPOT_INIT_VALUE = 1000000;
// 游戏奖池 ID
export const GAME_JACKPOT_ID = {
    RACING: 1,
    FISHING_ELEVEN_FIVE: 2,
    FISHING_SIX_THREE: 3,
    FISHING_TEN_FIVE: 4,
    FISHING_SLOTS: 5,
    FOOTBALL: 6,
    scratchCard_1: 7,
    scratchCard_2: 8,
    scratchCard_3: 9,
    scratchCard_4: 10,
    scratchCard_5: 11,
};

//放入各个奖池的比例
export const DEST_PROP = {
    FOOTBALL_PROFIT: 0.05, //足球 5% 进入盈利池
    FOOTBALL_BASIC: 0.95, //足球 95% 进入基础池

    RACING_PROFIT: 0.05, //赛车 5% 进入盈利池
    RACING_BASIC: 0.95, //赛车 95% 进入基础池

    FISHING_PROFIT: 0.05, //钓鱼 5% 进入盈利池
    FISHING_BASIC: 0.95, //钓鱼 95% 进入基础池
};

//放奖比例
export const OUT_AWARD = {
    INCREASE: 0.9,//放奖增幅量
    RATIO: 0.1
};

// 假奖池显示相关，时间单位：ms
export const FAKE_JACKPOT = {
    // 需要显示假奖池的游戏
    GAMES: ['1', "2", "4", "7", "10", "12", "41"],
    // 变化的时间节点，5分钟
    PERIOD_TIME: 300000,
    // 房间假奖池的初始值范围
    INIT_RANGE: {
        LOW: 500000,
        HIGH: 1000000
    },
    // 第一个五分钟内，变化的条件
    FIRST_PERIOD_COND: {
        LOW: 10000,
        HIGH: 2000000
    },
    // 第一个五分钟内，累加比例
    FIRST_PERIOD_INC_RATE: 0.001,
    // 第一个五分钟内，随机增加值的范围
    FIRST_PERIOD_INC_RANGE: {
        LOW: 200,
        HIGH: 1000
    },
    // 假奖池变化的时间间隔
    SHOW_CHANGE_INTERVAL: 1000,

    // 之后每五分钟的判断范围
    SECOND_PERIOD_RANGE: {
        LOW: 0,
        HIGH: 2000000,
    },
    // 之后五分钟增量
    SECOND_PERIOD_INC_NUM: 1000000,
    // 之后五分钟除数
    SECOND_PERIOD_DIVISION_NUM: 300,
    // 之后五分钟增加的比例
    SECOND_PERIOD_MULTI_RATE: 0.5,
};