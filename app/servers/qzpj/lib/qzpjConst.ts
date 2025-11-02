export const CHANNEL_NAME = 'qzpj';
export const RESULT_NUM = 10;//随机结果集次数

//  0＜玩家携带/底分  最大可抢0倍；
// 30＜玩家携带/底分≤60 最大可抢1倍；
// 60＜玩家携带/底分≤90 最大可抢2倍；
// 90＜玩家携带/底分≤120 最大可抢3倍；
// 120＜玩家携带/底分 最大可抢4倍。


/**抢庄倍数 */
export const robzhuang_arr = [0, 1, 2, 3, 4];
/**闲家下注倍数 */
export const xj_bet_arr = [0, 1, 2, 4];
export enum RoomState {
    NONE = "NONE",
    INWAIT = "INWAIT",
    /**抢庄中 */
    ROBZHUANG = "ROBZHUANG",
    /**下注中 */
    READYBET = "READYBET",
    //DICE
    DICE = "DICE",
    DEAL = "DEAL",
    LOOK = "LOOK",
    SETTLEMENT = "SETTLEMENT",
}
export enum route {
    qzpj_onExit = "qzpj.onExit",
    qzpj_onEntry = "qzpj.onEntry",
    qzpj_bet = "qzpj.OperBet",
    /**抢庄操作推送 */
    qzpj_robzhuang = "qzpj.OperRobzhuang",

    qzpj_onStart = "qzpj.onStart",
    /**定庄中 */
    qzpj_onSetBanker = "qzpj.onSetBanker",
    /**下注中 */
    qzpj_onReadybet = "qzpj.onReadybet",
    qzpj_setSice = "qzpj.setSice",
    qzpj_onDeal = "qzpj.onDeal",
    qzpj_liangpai = "qzpj.liangpai",
    qzpj_onSettlement = "qzpj.onSettlement",
}

export interface Oper_qzpj_bet {
    uid: string;
    seat: number;
    betNum: number;
    lowBet: number;
}
export interface Oper_qzpj_robzhuang {
    uid: string;
    seat: number;
    robmul: number;
    list: {
        uid: string;
        seat: number;
        robmul: number;
        pushbet: number;
        gold: number;
    }[];
}
export interface IRoom_route_enter {
    player: {
        uid: string;
        gold: any;
        seat: number;
        status: "NONE" | "WAIT" | "READY" | "GAME";
        profit: number;
        cards: number[];
        cardType: number;
        betNum: number;
        isLiangpai: boolean;
        robmul: number;
        pushbet: number;
        isBet: number;
    };
    status: RoomState;
}

export interface IRoom_route_exit {
    uid: string;
    playerNum: number;
}

export interface IRoom_route_start {
    lookPlayer: {
        uid: string;
        seat: number;
        gold: number;
        headurl: string;
        nickname: string;
    }[];
    auto_time: number;
    r: number;
}
export interface IRoom_route_bet {
    stateInfo: {
        status: RoomState;
        auto_time: number;
    };
    robzhuangs: {
        uid: string;
        mul: number;
    }[];
    zhuangInfo: {
        uid: string;
        mul: number;
        seat: number;
    };
    players: {
        uid: string;
        seat: number;
        robmul: number;
        // pushbet: number;
        gold: number;
    }[];
    auto_time: number;
}
export interface IRoom_route_setSice {
    status: RoomState.DICE;
    setSice: number;
    auto_time: number;
}
export interface IRoom_route_Deal {
    uid: string;
    gold: any;
    seat: number;
    status: "NONE" | "WAIT" | "READY" | "GAME";
    profit: number;
    cards: number[];
    cardType: number;
    betNum: number;
    isLiangpai: boolean;
    robmul: number;
    // pushbet: number;
    isBet: number;
}
export interface IRoom_route_liangpai {
    uid: string;
    seat: number;
    cards: number[];
    cardType: number;
    points: number;
}
export interface IRoom_route_onSettlement {
    stateInfo: {
        status: RoomState;
        auto_time: number;
    };
    zhuangInfo: {
        uid: string;
        mul: number;
        seat: number;
    };
    players: {
        uid: string;
        cards: number[];
        seat: number;
        cardType: number;
        gold: number;
        profit: number;
        betNum: number;
        points: number;
    }[];
    /**下一把开局倒计时 */
    auto_time: number;
    /**第几轮 */
    roundTimes: number;
}
