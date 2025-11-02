'use strict'



/**主下注区域 */
export const mainGates = ['d', 't', 'f'];

/**副下注区域 */
export const sideGates = ['db', 'dr', 'dd', 'ds', 'tb', 'tr', 'td', 'ts'];

/**下注区域赔率 */
export enum odds {
    'd' = 1,
    't' = 1,
    'f' = 8,
    //龙红、龙黑
    'db' = 0.9,
    'dr' = 0.9,
    //龙双、虎双dragon double
    'dd' = 1.05,
    'td' = 1.05,
    //龙单、虎单dragon single
    'ds' = 0.75,
    'ts' = 0.75,
    //虎红、虎黑 
    'tb' = 0.9,
    'tr' = 0.9,
};

/**下注区域  龙 虎 和 龙黑 龙红 龙双 龙单 虎黑 虎红 虎双 虎单 */
export const area = [
    "d",
    "t",
    "f",
    "db",
    "dr",
    "dd",
    "ds",
    "tb",
    "tr",
    "td",
    "ts"
];

/**普通场无法的区域 */
// export const notBetArea = ["db", "dr", "dd", "ds", "tb", "tr", "td", "ts"];

/**普通场下注区域 */
export const ordinaryArea = ['d', 't', 'f'];

/**和的下注区域 */
export const draw = 'f';

/**房间最多容纳人数 */
export const mostNumberPlayer = 100;

/**各个状态的倒数计时 */
export enum statusTimer {
    LICENS = 3e3,
    BETTING = 15e3,
    OPENAWARD = 7e3,
    SETTLEING = 5e3,
};

/**房间状态 */
export enum status {
    NONE = "NONE",               // 房间初始状态
    LICENS = "LICENS",           // 房间发牌阶段
    BET = "BETTING",             // 押注状态
    OPENAWARD = "OPENAWARD",     // 开奖状态
    SETTLEING = "SETTLEING",     // 结算状态
};

/**消息路由 */
export enum route {
    plChange = "playersChange",          // 玩家列表发生变化
    Start = "DragonTigerStart",          // 房间开始运行
    StartBet = "DragonTigerBet",         // 房间开始下注*
    Lottery = "DragonTigerLottery",      // 房间开奖
    Settle = "DragonTigerSettle",        // 房间结算
    OtherBet = "DragonTigerOtherBets",   // 通知其他玩家下注
    topUp = "topUpPlayer",               // 通知玩家充值
    // queueLength = "bankerQueueLength",   // 上庄列表数量
    /**庄家信息 */
    dt_zj_info = "dt_zj_info",
    /**通知消息 */
    dt_msg = "dt_msg"

};

/**牌的数量 */
export const cardsLength = 416;

/**历史记录最多存储条数 */
export const MAX_History_LENGTH = 50;

/**日志打印 */
export enum LogInfo {
    scene = "从场",
    room = "房间",
    delete = "删除玩家",
    reason = "未在玩家通道中找到玩家",
    reason1 = "未在玩家列表中找到玩家",
};

/**龙虎斗限红对应关系 */
export enum mapping {
    d = "t",
    t = "d",
    //龙红、龙黑
    db = "dr",
    dr = "db",
    //虎红、虎黑 
    tb = "tr",
    tr = "tb",
    dd = "ds",
    ds = "dd",
    td = "ts",
    ts = "td",
};

/**跑马灯限制 */
export const scrolling = 1e5;

/**上庄限制 */
export const bankerGoldLimit = {
    0: 2000 * 100,         // 普通场 200000
    1: 10000 * 100,         // 高级场
    2: 20000 * 100,         // 贵宾场
    4: 2e6,         // 贵宾场
};

/**庄家回合限制 */
export const bankerRoundLimit = 6;

/**强制下庄扣取 当庄时赢钱比例 */
export const bankerProfitProportion = 0.4;


/**玩家离线多少回合踢出玩家 */
export const leaveCount = 1;

/**限红提示 personal: 个人押注超过限红  total: 押注超过总押注限红 */
export enum LimitRed {
    personal = "personal",
    total = "total",
};

/**不参与有效押注差值计算的区域 */
export const notValidBetArea = ['f'];

export enum DTControlState {
    WIN,
    LOSS,
    RANDOM
}

export interface Idt_zj_info {
    banker: {
        uid: string;
        gold: number;
        headurl: string;
        nickname: string;
        remainingRound: number;
    };
    bankerQueue: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        isRobot: number;
    }[];
    bankerQueueLength: number;
}