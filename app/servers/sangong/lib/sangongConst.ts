/**各个状态倒计时 */
export enum COUNTDOWN {
    READY = 10e3,           // 准备状态倒计时
    ROB = 1e4,              // 抢庄倒计时
    ROBANIMATION = 3e3,     // 抢庄动画时间
    BET = 1e4,              // 下注时间
    LOOK = 1e4,             // 查看手牌倒计时
    SETTLEMENT = 8e3,       // 结算倒计时
    LICENS = 3e3,           // 发牌 筹码倒计时
    SETTLEMENT_O = 2e3,     // 第2个比牌及以后玩家比牌的时间
};



/**各个状态路由 */
export enum route {
    InitGame = "initGame",               // 初始化游戏*
    OnExit = "onExit",                   // 玩家退出
    Offline = "onOffline",               // 玩家离线
    KickPlayer = "KickPlayer",           // 踢出玩家*
    Add = "addPlayer",                   // 玩家加入*
    Reconnect = "onPlayerReconnect",     // 玩家断线重连
    /**进入准备状态 */
    ReadyState = "IntoTheReadyState",    // 进入准备状态
    /**进入抢庄状态* */
    RobState = "RobState",               // 进入抢庄状态*
    /**游戏进入下注阶段* */
    BetState = "BetState",               // 游戏进入下注阶段*
    RobAnimation = "RobAnimationState",  // 抢庄动画
    Licens = "LicensState",              // 进入发牌状态
    /**通知进入看牌状态 */
    LookState = "lookState",             // 通知进入看牌状态
    SettleResult = "settleResult",       // 进入结算

    playerReady = "playerReady",         // 通知玩家已准备
    playerRob = "playerRob",             // 通知玩家已抢庄
    playerBet = "playerBet",             // 通知玩家已下注
    lookCards = "lookCards",             // 通知玩家已看牌
    liangpai = "liangpai",               // 通知玩家已亮牌
    topUp = "topUpPlayer",               // 通知玩家充值
    kickEveryone = "kickEveryone",       // 踢出所有玩家
};

// 房间最多容纳人数
export const maxCount = 6;

// 玩家最多离线多少回合
export const leaveCountNum = 3;

// 最多离线时间 1分钟
export const leaveTimer = 6e4;

// 各个点数赔率
export const Odds = {
    "12": 9,        // 大三公
    "11": 7,        // 小三公
    "10": 5,        // 混三公
    "9": 3,         // 九点
    "8": 3,         // 八点
    "7": 1,
    "6": 1,
    "5": 1,
    "4": 1,
    "3": 1,
    "2": 1,
    "1": 1,
    "0": 1,
};

export const sangongProbability = 0.2;

// 结算的时候多久比一次牌
export const settleTime = 1e5;

// 最多连胜的次数
export const maxWinCount = 8;

// 历史记录
export const HistoryMAXLength = 20;
// 三公开始游戏抽成  默认为 底注的 1 / 4;
export const pump = 4;
export interface IInitGame {
    list: {
        uid: string;
        gold: number;
    }[];
}
export interface IBetState {
    countdown: number;
    Banker: {
        uid: string;
        totalOdds: number;
        control?: boolean;
    };
    players: {
        uid: string;
        totalOdds: number;
        control?: boolean;
    }[];
}

export interface IlookState {
    countdown: number;
    players: {
        uid: string;
        nickname: string;
        gold: number;
        seat: number;
        isRob: boolean;
        control: boolean;
    }[];
}

export interface ISettleResult {
    players: {
        uid: string;
        cards: number[];
        cardType: number;
        isLiangpai: boolean;
        isWin: boolean;
        gold: number;
        profit: number;
        totalOdds: number;
        bOdds: number;
        robOdds: number;
        cardsOdds: number;
        bet: number;
        headurl: string;
    }[];
    Banker: {
        uid: string;
        cards: number[];
        cardType: number;
        isLiangpai: boolean;
        isWin: boolean;
        gold: number;
        profit: number;
        totalOdds: number;
        bOdds: number;
        robOdds: number;
        cardsOdds: number;
        bet: number;
        headurl: string;
    };
}