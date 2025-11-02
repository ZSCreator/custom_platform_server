
import { CommonControlState } from "../../../../domain/CommonControl/config/commonConst";
/**玩家列表 */
export interface rankingLists {
    uid: string,
    nickname: string,
    headurl: string,
    gold: number,
    bet: number,
    bets: { bet: number, profit: number }[],
    profit: number,
    winRound: number,
    totalBet: number,
    totalProfit: number,
}
/**
 * 押注区域
 */
export interface BetArea {
    sumBet: number;
    sumBetRobot: number;
    cards: number[];
    cardType: number;
    multiple: number;
    isWin: boolean;
    historys: any[];
    // uids: any[];
    cardNum: any[];
    areaControlState: CommonControlState;
}

/**离线 */
export interface Ioffline {
    zhuangResult: {
        cards: any[];
        cardType: number;
        profit: number;
        cardNum: any[];
    };
    regions: {
        sumBet: number;
        sumBetRobot: number;
        cards: number[];
        cardType: number;
        multiple: number;
        isWin: boolean;
        historys: any[];
        // uids: any[];
        cardNum: any[];
    }[];
    bairenHistory: any[],
    zhuangInfo: {
        uid: string;
        gold: number;
    };
    players: rankingLists[];
    countdownTime: number
}

/**初始化 */
export interface WanRenZJH_mainHandler_loaded {
    code: number;
    room: {
        roomId: string;
        lowBet: number;
        compensate: number;
        upZhuangCond: number;
        status: "NONE" | "BETTING" | "INBIPAI"
        countdownTime: number;
        regions: BetArea[];
        zhuangResult: IzhuangResult;
    };
    players: {
        uid: string;
        headurl: string;
        nickname: string;
        bets: { bet: number, profit: number }[];
        gold: number;
        // lastBets: { bet: number, profit: number }[];
        /**非0 可续押 */
        isRenew: number;
    };
    offLine: Ioffline;
    sceneId: number;
    roundId: string;
    poundage: number;
    situations: {
        area: number;
        betList: {
            uid: string;
            bet: number;
            updatetime: number;
        }[];
        totalBet: 0;
    }[]
}
/**申请开始下注 */
export interface WanRenZJH_mainHandler_applyBet {
    code: number;
    status: "NONE" | "BETTING";
    countdownTime: number;
    data: {
        zhuangResult: {
            cards: any[];
        };
        zhuangInfo: {
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            profit: number;
            hasRound: any;
        };
        applyZhuangs: any[];
        regions: {
            cards: number[];
        }[];
        robotNum: number;
    };
    /**非0 可续押 */
    isRenew: number;
}
/**申请结果 */
export interface WanRenZJH_mainHandler_applyResult {
    code: number;
    /**状态 BETTING.下注阶段 INBIPAI.比牌结算阶段 INSETTLE.结算中; */
    status: 'NONE' | 'BETTING' | 'INBIPAI' | 'INSETTLE';
    countdownTime: number;
    data: Ioffline;
    /**非0 可续押 */
    isRenew: number;
}
/**下注结果 */
export interface WanRenZJH_mainHandler_bet {
    code: 200, changeJettonNum: number
}

/**申请玩家列表 */
export interface WanRenZJH_mainHandler_applyplayers {
    code: number;
    list: {
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        winRound: number;
        totalBet: any;
        totalProfit: any;
    }[];
    zhuang: string;
}

/**申请排行榜 */
export interface WanRenZJH_mainHandler_rankingList {
    code: number;
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
/**申请上庄列表 */
export interface WanRenZJH_mainHandler_applyupzhuangs {
    code: number;
    list: {
        uid: string;
        headurl: string;
        nickname: string;
        bet: number;
        gold: number;
        robot: number;
    }[];
}

/**通知玩家退出 */
export interface Iwr_onExit {
    roomId: string;
    uid: string;
}
/**下注推送 */
export interface Iwr_onBeting {
    roomId: string;
    uid: string;
    betNums: number[];
    curBetNums: { bet: number, profit: number }[];
    sumBets: number[];
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
/**通知庄家信息 */
export interface Iwr_onUpdateZhuangInfo {
    roomId: string;
    zhuangInfo: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        profit: number;
        hasRound: any;
    };
    applyZhuangs: {
        uid: string;
        headurl: string;
        nickname: string;
        bet: number;
        gold: number;
        robot: number;
    }[];
    // choushui: {
    //     zhuangUid: string;
    //     choushui: any;
    //     gold: number;
    // };
}
/**当前庄家结果 */
export interface IzhuangResult {
    /**五张牌 */
    cards: number[]; // 
    /**牌型 牌的类型 */
    cardType: number;
    /**牌 最大三张 */
    profit: number;
    cardNum: number[];
};

export interface Iwr_start {
    status: "NONE" | "BETTING" | "INBIPAI" | "INSETTLE";
    downTime: number;
    /**非0 可续押 */
    isRenew: number;
}