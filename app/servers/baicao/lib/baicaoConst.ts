/**各个状态倒计时 */
export enum COUNTDOWN {

    LICENS = 5,           // 发牌 筹码倒计时
    LOOK = 3,             // 查看手牌倒计时
    BIPAI = 5,
    SETTLEMENT = 2,       // 结算倒计时
};



/**各个状态路由 */
export enum route {
    InitGame = "baicao_initGame",               // 初始化游戏*
    OnExit = "baicao_onExit",                   // 玩家退出
    KickPlayer = "baicao_KickPlayer",           // 踢出玩家*
    Add = "baicao_addPlayer",                   // 玩家加入*
    ReadyState = "baicao_IntoTheReadyState",    // 进入准备状态
    Licens = "baicao_LicensState",              // 进入发牌状态
    LookState = "baicao_lookState",             // 通知进入看牌状态
    BipaiState = "baicao_BipaiState",
    SettleResult = "baicao_settleResult",       // 进入结算
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


// 历史记录
export const HistoryMAXLength = 20;
// 三公开始游戏抽成  默认为 底注的 1 / 4;
export const pump = 4;
export interface IInitGame {
    list: {
        uid: string;
        gold: number;
    }[];
    status: string,
}
export interface IBetState {
    countdown: number;
    Banker: {
        uid: string;
        winCount: number;
        totalOdds: number;
        control: boolean;
    };
    players: {
        uid: string;
        winCount: number;
        totalOdds: number;
        control: boolean;
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

export interface Irecord_history {
    deal_info: {
        uid: string,
        cards: number[],
        cardType: number,
        Points: number,
        roundTimes: number,
        total_CardValue: number
    }[]
    player_info: {
        uid: string;
        cards: number[];
        cardType: number;
        gold: number;
        profit: number;
        bet: number;
    }[]
}