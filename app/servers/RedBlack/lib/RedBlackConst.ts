// 赢的区域
export enum area { red = "red", black = "black", draw = "draw" };

// 押注区域
export enum betArea { red = "red", black = "black", luck = "luck" };

export const areas = ['red', "black", "luck"];

// 幸运一击区域最大押注
export const MAX = 500000;

// 黑红区域差值
export const DIFFERENCE = 500000;

// 各个状态时间调控
export enum statusTime {
    LICENS = 3e3,              // 发牌时间
    BETTING = 15e3,            // 下注时间
    OPENAWARD = 7e3,           // 开奖时间
    SETTLEING = 6e3,           // 结算时间
};

// 房间最多容纳人数
export const MAXCOUNT = 100;

// // 房间状态
// export const status = {
//     NONE: "NONE",           // 房间未开启的状态
//     LICENS: "LICENS",       // 发牌阶段
//     BET: "BETTING",         // 押注状态
//     OPENAWARD: "OPENAWARD", // 开奖状态
//     SETTLE: "SETTLEING", // 结算状态
// };

// 房间通知路由
export enum route {
    ListChange = "RedBlack_playersChange",        // 玩家列表改变*
    Start = "RedBlack_Start",              // 房间开始运行
    StartBet = "RedBlack_Bet",             // 房间开始下注*
    Lottery = "RedBlack_Lottery",          // 房间开奖
    Settle = "RedBlack_Settle",           // 房间结算*
    NoTiceBet = "RedBlack_OtherBets",       // 通知其他玩家下注
    topUp = "tRedBlack_opUpPlayer",               // 通知玩家充值
    queueLength = "RedBlack_bankerQueueLength",   // 上庄列表数量
};

// 历史记录最多存储次数
export const MAX_HISTORY_LENGTH = 20;

// 对子牌对应点数
export const pair = {
    0: 14,  // 对A
    1: 2,   // 对2
    2: 3,   // 对3
    3: 4,   // 对4
    4: 5,   // 对5
    5: 6,   // 对6
    6: 7,   // 对7
    7: 8,   // 对8
    8: 9,   // 对9
    9: 10,  // 对十
    10: 11, // 对J
    11: 12, // 对Q
    12: 13, // 对K
};

// 其他牌型对应点数
export enum otherPair {
    singular = 1,    // 单牌
    shunza = 15,     // 顺子
    flower = 16,     // 同花
    flush = 17,      // 同花顺
    leopard = 18,    // 豹子
};

// 赔率
export const odds2 = {
    red: 1.97,      // 红
    black: 1.97,    // 黑
    18: 15,         // 豹子
    17: 10,         // 同花顺
    16: 4,          // 同花
    15: 3,          // 顺子
    14: 2, 13: 2, 12: 2, 11: 2, 10: 2, 9: 2, 8: 2
};     // 对A - 对8

// 跑马灯
export const scrolling = 1e5;

// 离线超过多少回合踢出玩家
export const leaveRound = 1;

// 限红提示
export enum LimitRed {
    personal = "personal",
    total = "total",
};

export enum mapping {
    black = "red",
    red = "black"
};

// 强制下庄扣取 当庄时赢钱比
export const bankerProfitProportion = 0.4;

// 上庄限制
export const bankerGoldLimit = {
    0: 2e5,         // 普通场
    1: 2e6,         // 高级场
    2: 2e6,         // 贵宾场
};

// 庄家回合限制
export const bankerRoundLimit = 3;
export interface RedBlack_mainHandler_enterGame {
    code: number;
    status: "NONE" | "LICENS" | "BETTING" | "OPENAWARD" | "SETTLEING";
    betSituation: any;
    countdown: number;
    MAX: number;
    sceneId: number;
    roundId: string;
    bankerQueueLength: number;
    playerLength: number;
    bankerProfitProportion: number;
    desktopPlayers: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        winRound: number;
        totalBet: any;
        totalProfit: any;
    }[];
    room: {
        lowBet: number
    },
    desktopPlayers_num: number;
    bankerGoldLimit: number;
    players: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        totalProfit: number[];
        firstEnTime: number;
        bet: number;
        robot: number;
    }
}