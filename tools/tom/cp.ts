import cp_logic = require('../../app/servers/chinese_poker/lib/cp_logic');
// import { delete } from '../../app/services/http/httpApp';
/**
 * 开奖结果 那个区域赢钱
 */
export interface KaiJiangReulst {
    /**闲赢 */
    play?: boolean,
    /**庄赢 */
    bank?: boolean,
    /**和局 */
    draw?: boolean,
    /**大 */
    big?: boolean,
    /**小 */
    small?: boolean,
    /**闲对 */
    pair0?: boolean,
    /**庄对 */
    pair1?: boolean
}

//----------------------------请求 应答模式 返回
/**加载完成 */
export interface baijia_mainHandler_loaded {
    code: number,
    roomInfo: {
        roomId: string;
        LowBetLimit: number;
        status: "NONE" | "BETTING" | "INBIPAI";
        countdownTime: number;
        paiCount: number;
        area_bet: {
            play: { mul: number; betUpperLimit: number; sumBet: number; }; // 闲
            draw: { mul: number; betUpperLimit: number; sumBet: number; }; // 和
            bank: { mul: number; betUpperLimit: number; sumBet: number; }; // 庄
            small: { mul: number; betUpperLimit: number; sumBet: number; }; // 小
            pair0: { mul: number; betUpperLimit: number; sumBet: number; }; // 闲对
            pair1: { mul: number; betUpperLimit: number; sumBet: number; }; // 庄对
            big: { mul: number; betUpperLimit: number; sumBet: number; }; // 大
        };
        baijiaHistory: {
            win_area: string;
        }[],
        historys2: {
            result: KaiJiangReulst;
            play: {
                cards: number[];
                cardType: number;
            };
            bank: {
                cards: number[];
                cardType: number;
            };
        }[],
        allPoker: number,
        zhuangInfo: {
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            gain: number;
            totalProfit: any;
            bet: number;
            hasRound: number;
        }, applyZhuangs: {
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            gain: number;
            totalProfit: any;
            bet: number;
            // isRobot: number;
        }[]
    },
    offLine: {
        isOnLine: any;
        toResultBack: any;
    },
    sceneId: number,
    roundId: string,
    poundage: number,
    /**上庄条件 */
    upZhuangCond: number,
    pl: {
        play: { mul: number; bet: number; gain: number; }; // 闲
        draw: { mul: number; bet: number; gain: number; }; // 和
        bank: { mul: number; bet: number; gain: number; }; // 庄
        small: { mul: number; bet: number; gain: number; }; // 小
        pair0: { mul: number; bet: number; gain: number; }; // 闲对
        pair1: { mul: number; bet: number; gain: number; }; // 庄对
        big: { mul: number; bet: number; gain: number; };// 大
    }
};
/**申请开始下注 */
export interface baijia_mainHandler_applyBet {
    code: number;
    status: "NONE" | "BETTING" | "INBIPAI";
    countdownTime: number;
    roundId: string;
    data: {
        paiCount: number;
        zhuangInfo: {
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            gain: number;
            totalProfit: number;
            bet: number;
            hasRound: number;
        };
        applyZhuangs: {
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            gain: number;
            totalProfit: number;
            bet: number;
            isRobot: number;
        }[];
    };
    pl: {
        uid: string;
        gold: number;
        bet: number;
    };
}
/**申请结果 */
export interface baijia_mainHandler_applyResult {
    code: number;
    status: "NONE" | "INBIPAI";
    countdownTime: number;
    data: {
        paiCount: number;
        regions: {
            cards: number[];
            cardType: number;
            oldCardType: number;
        }[];
        result: KaiJiangReulst;
        baijiaHistory: {
            win_area: string;
        }[];
        historys2: {
            result: KaiJiangReulst;
            play: {
                cards: number[];
                cardType: number;
            };
            bank: {
                cards: number[];
                cardType: number;
            };
        }[],
        players: {
            uid: string;
            gold: number;
            bet: number;
            profit: number;
            refundNum: number;
            bets: {
                play: { mul: number; bet: number; gain: number; }; // 闲
                draw: { mul: number; bet: number; gain: number; }; // 和
                bank: { mul: number; bet: number; gain: number; }; // 庄
                small: { mul: number; bet: number; gain: number; }; // 小
                pair0: { mul: number; bet: number; gain: number; }; // 闲对
                pair1: { mul: number; bet: number; gain: number; }; // 庄对
                big: { mul: number; bet: number; gain: number; };// 大
            };
            nickname: string;
            headurl: string;
        }[];
        isShuffle: boolean;
        allPoker: number;
        zhuangInfo: {
            uid: string;
            gold: number;
            profit: number;
        };
    };
}
/**下注 */
export interface baijia_mainHandler_bet {
    code: number
}
/**续押 */
export interface baijia_mainHandler_goonBet {
    code: number
}
/**申请玩家列表 */
export interface baijia_mainHandler_applyplayers {
    code: number;
    list: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        winRound: number;
        totalBet: number;
        totalProfit: number;
    }[];
}
/**刷新6个有位置的 玩家信息 */
export interface baijia_mainHandler_rankingList {
    code: number;
    list: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        winRound: number;
        totalBet: number;
        totalProfit: number;
    }[];
}
/**申请上庄列表信息 */
export interface baijia_mainHandler_applyupzhuangs {
    code: number;
    list: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        gain: number;
        totalProfit: any;
        bet: number;
        isRobot: number;
    }[];
}
/**申请下庄 */
export interface baijia_mainHandler_applyUpzhuang {
    code: number;
}

/** 取消上庄队列*/
export interface baijia_mainHandler_exitUpzhuanglist {
    code: number;
}


//----------------------------广播 服务器主动 推送
/**每局开始的时候推送 */
interface bj_bet {
    /**房间号 */
    roundId: string;
}
/**下注推送 */
interface bj_onBeting {
    roomId: string;
    uid: string;
    gold: number;
    RecordBets: {
        uid: string;
        area: string;
        bet: number;
    }[];
    curBetNums: {
        play: { mul: number; bet: number; gain: number; }; // 闲
        draw: { mul: number; bet: number; gain: number; }; // 和
        bank: { mul: number; bet: number; gain: number; }; // 庄
        small: { mul: number; bet: number; gain: number; }; // 小
        pair0: { mul: number; bet: number; gain: number; }; // 闲对
        pair1: { mul: number; bet: number; gain: number; }; // 庄对
        big: { mul: number; bet: number; gain: number; };// 大
    };
    area_bet: {
        play: { mul: number; betUpperLimit: number; sumBet: number; }; // 闲
        draw: { mul: number; betUpperLimit: number; sumBet: number; }; // 和
        bank: { mul: number; betUpperLimit: number; sumBet: number; }; // 庄
        small: { mul: number; betUpperLimit: number; sumBet: number; }; // 小
        pair0: { mul: number; betUpperLimit: number; sumBet: number; }; // 闲对
        pair1: { mul: number; betUpperLimit: number; sumBet: number; }; // 庄对
        big: { mul: number; betUpperLimit: number; sumBet: number; }; // 大
    };
    list: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        winRound: number;
        totalBet: any;
        totalProfit: any;
    }[];
}
/**通知庄家信息 变动 */
interface bj_onUpdateZhuangInfo {
    zhuangInfo: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        gain: number;
        totalProfit: any;
        bet: number;
        hasRound: number;
    };
    applyZhuangs: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        // isRobot: number;
    }[];
    applyZhuangsNum: number;
}
/**玩家离开通知 */
interface bj_onExit {
    roomId: string;
    list: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        winRound: number;
        totalBet: any;
        totalProfit: any;
    }[];
    playerNum: number;
}

interface hlbj_over {
    //这个时候 调用  baijia.mainHandler.applyResult  获取 开奖结果
}
/**庄家被踢下去，只能收到 自己的 */
interface bj_onKickZhuang {
    msg: string;
}