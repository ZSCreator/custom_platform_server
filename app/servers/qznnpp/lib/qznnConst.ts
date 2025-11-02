export const CHANNEL_NAME = 'qznn';
export const RESULT_NUM = 10;//随机结果集次数


/**抢庄倍数 */
export const robzhuang_arr = [0, 1, 2, 3];
/**闲家下注倍数 */
export const xj_bet_arr = [1, 3, 6, 9, 12, 15];


export interface Iqz_onReadybet {
    stateInfo: {
        status: "NONE" | "INWAIT" | "ROBZHUANG" | "READYBET" | "LOOK" | "SETTLEMENT";
        countdown: number;
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
        pushbet: number;
        gold: number;
    }[];
}
export interface Iqz_onStart {
    lookPlayer: {
        uid: string;
        seat: number;
        cards: number[];
    }[];
    gamePlayer: {
        uid: string;
        seat: number;
    }[];
}

export interface Iqz_onRobzhuang {
    stateInfo: {
        status: "NONE" | "INWAIT" | "ROBZHUANG" | "READYBET" | "LOOK" | "SETTLEMENT";
        countdown: number;
    };
    roundId: string;
    // players: {
    //     uid: string;
    //     seat: number;
    //     cards: number[];
    //     robmul: number;
    // }[];
    // max_uid: string;
}

export interface Iqz_onLook {
    stateInfo: {
        status: "NONE" | "INWAIT" | "ROBZHUANG" | "READYBET" | "LOOK" | "SETTLEMENT";
        countdown: number;
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
        cardType: {
            count: number;
            cows: number[];
        };
        betNum: number;
    }[];
}

export interface Iqz_onSettlement {
    stateInfo: {
        status: "NONE" | "INWAIT" | "ROBZHUANG" | "READYBET" | "LOOK" | "SETTLEMENT";
        countdown: number;
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
        cardType: {
            count: number;
            cows: number[];
        };
        gold: number;
        profit: number;
        betNum: number;
    }[];
}