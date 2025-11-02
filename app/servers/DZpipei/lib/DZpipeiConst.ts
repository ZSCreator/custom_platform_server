'use strict';
import * as  hallConst from '../../../consts/hallConst';
/**
 * 德州扑克游戏设置的常量
 */
export const PLAYER_HISTORY_RECORD = 'dzpipei:history_record';
export const CHANNEL_NAME = 'dzpipei';
export const RESULT_NUM = 10;
export const EXPIRATION = 60 * 60;//德州记录过期时间
export const TIME_INSPECT = 60 * 1000;//检查记录过期定时器
export const FAN_JIANG = 500;//返奖500倍数
export const CHOUSHUI = 1;//抽水比例一个小忙

// 金币变化类型
export const GOLD_CHANGE_TYPE = {
    BET: 1,     // 带入金币
    WIN: 2,     // 带出金币
};
//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;




/**底池 不知道是什么东西 */
export interface pool_interface {
    bet: number,
    uids: {
        uid: string;
        typeSize: number;
    }[]
}
/**操作 */
export enum Player_Oper {
    PO_READY

}
/**发话推送 */
export interface Ionfahua {
    roundTimes: number;
    /**座位号 */
    fahuaIdx: number;
    lastBetNum: number;
    /**自己金币 */
    currGold: number
    /**跟注信息 */
    cinglNum: number
    /**下注范围 */
    freedomBet: number[]
    /**下注推荐 */
    recommBet: number[]
    /**倒计时 */
    fahuaTime: number;
    /**首轮概率区间 */
    round_action: string;
}

export interface Idz_onDeal {
    zhuang: {
        seat: number;
        uid: string;
    };
    roomCurrSumBet: number;
    fahuaIdx: number;
    players: {
        uid: string;
        seat: number;
        gold: number;
        currGold: number;
        bet: number;
        tatalBet: number;
        holds: number[];
        playerType: "" | "SB" | "BB";
        status: "NONE" | "WAIT" | "GAME"
    }[];
    default: string;
}

/**发送工牌 */
export interface Idz_onDeal2 {
    publicCards: number[];
    roundTimes: number;
    cardType: { cards: number[], type: number };
    isFold: boolean;
    allPlayer: {
        uid: string;
        type: number;
        cardType: {
            cards: number[];
            type: number;
        };
        seat: number;
        isRobot: number;
    }[];
}

export interface DZpipei_mainHandler_loaded {
    code: number;
    room: {
        roomId: string;
        players: {
            seat: number;
            uid: string;
            nickname: string;
            headurl: string;
            currGold: number;
            status: "NONE" | "WAIT" | "READY" | "GAME";
            bet: number;
            isFold: boolean;
            holds: any;
        }[];
        status: "NONE" | "INWAIT" | "INGAME" | "END";
        waitTime: number;
        fahuaIdx: number;
        roomCurrSumBet: number;
        blindBet: number[];
        canCarryGold: number[];
        publicCard: number[];
        /**可能里面是null */
        zhuang: {
            seat: number;
            uid: string;
        };
    };
    offLine: {
        onFahua: Ionfahua;
        onLine: boolean;
        selfHolds: {
            uid: string;
            holds: number[];
            type: number;
        };
    };
    sceneId: number;
    roundId: string;
}


export interface Idz_onSettlement {
    list: {
        uid: string;
        seat: number;
        profit: number;
        currGold: number;
        gold: number;
        holds: number[];
        cardType: {
            cards: number[];
            type: number;
        };
        type: number;
        roundTimes: number;
        isFold: boolean;
    }[];
}

// 顺子 vs 两对
export const TYPE_ONE = '1';
// 同花 vs 两对
export const TYPE_TWO = '2';
// 顺子 vs 顶对
export const TYPE_THREE = '3';
// 三条 vs 两对
export const TYPE_FOUR = '4';
// 葫芦 vs 三条
export const TYPE_FIVE = '5';
// 顺子 vs 三条
export const TYPE_SIX = '6';
// 同花 vs 顺子
export const TYPE_SEVEN = '7';

/**
 * 调控发牌几种模型
 */
export const dealCardsModels: string[] = [TYPE_ONE, TYPE_TWO, TYPE_THREE, TYPE_FOUR, TYPE_FIVE, TYPE_SEVEN];

/**0 同花色 1 不同花色 */
export const Robot_Y1_Y4 = [
    [
        "T5s", "T4s", "T3s", "T2s",
        "94s", "93s", "92s",
        "83s", "82s", "72s",
        "Q8o", "Q7o", "Q6o", "Q5o", "Q4o", "Q3o", "Q2o",
        "J7o", "J6o", "J5o", "J4o", "J3o", "J2o",
        "T7o", "T6o", "T5o", "T4o", "T3o", "T2o",
        "96o", "95o", "94o", "93o", "92o",
        "86o", "85o", "84o", "83o", "82o",
        "76o", "75o", "74o", "73o", "72o",
        "65o", "64o", "63o", "62o",
        "54o", "53o", "52o",
        "43o", "42o", "32o"
    ],
    [
        "44", "33", "22",
        "A5s", "A4s", "A3s", "A2s",
        "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
        "J7s", "T7s", "97s", "96s",
        "87s", "86s", "76s", "75s",
        "65s", "54s",
        "A9o", "A8o", "A7o", "A6o", "A5o",
        "K9o", "K8o", "Q9o", "J9o", "J8o",
        "T9o", "T8o", "98o", "97o", "87o",
        "Q7s", "Q6s", "Q5s", "Q4s", "Q3s", "Q2s",
        "J6s", "J5s", "J4s", "J3s", "J2s",
        "T6s", "95s", "85s", "84s",
        "74s", "73s", "64s", "63s", "62s",
        "53s", "52s", "43s", "42s", "32s",
        "A4o", "A3o", "A2o",
        "K7o", "K6o", "K5o", "K4o", "K3o", "K2o"
    ],
    [
        "66", "55", "A9s", "A8s", "A7s", "A6s",
        "K9s", "Q9s", "Q8s", "J8s",
        "T8s", "98s", "KTo",
        "QJo", "QTo", "JTo",
    ],
    [
        "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "AKs", "AQs", "AJs",
        "ATs", "KQs", "KJs", "KTs", "QJs", "QTs", "JTs", "J9s", "T9s",
        "AKo", "AQo", "AJo", "ATo", "KQo", "KJo"
    ]
]