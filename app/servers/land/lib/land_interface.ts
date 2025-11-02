/**斗地主牌型 */
export enum CardsType {
    /**错误类型 */
    CARD_TYPE_ERROR = 0,
    /**不出类型 */
    CHECK_CALL = 1,
    /**单张 */
    Single,
    /**顺子 */
    SHUN,
    /**对子 */
    DOUBLE,
    /**连对*/
    CONTINUOUSLY_PAIR,
    /**三张不带 */
    THREE,
    /**三带一 */
    THREE_ONE,
    /**三带二 */
    THREE_TWO,
    /**4个带二 */
    FOUR_TWO,
    /**飞机 333444 5 6 */
    AIRCRAFT,
    /**4个		硬炸弹 */
    BOOM,
    /**王炸类型 */
    BIG_BOOM = 12,
};


/**上个玩家出的牌 */
export interface interface_land {
    seat: number;
    /**剩余手牌 */
    cards: number[];
    /**类型 */
    cardType: CardsType;
    /**当前出牌 */
    // postCardList: number[];
    /**剩余手牌长度 */
    cards_len: number
}
/**出牌推送 */
export interface Iddz_onPostCard {
    cardType: CardsType;
    seat: number;
    /**当前出牌 */
    postCardList: number[];
    mingCardPlayer: {
        uid: string;
        seat: number;
        cards: number[];
    }[];
    /**剩余手牌 */
    cards: number[];
    /**剩余手牌num */
    cards_len: number,
    /**记牌器 */
    JiPaiQi: number[];
}

export interface Iddz_chunTian {

}
export interface IoffLine {
    status: "NONE" | "INWAIT" | "CPoints" | "DOUBLE" | "INGAME" | "END";
    curr_doing_seat: number;

    overCards: number[];

    publicCards: number[];
    shoupaiLen: { seat: number, len: number, trusteeshipType: number }[];

    land_seat: number;

    lastDealPlayer: interface_land;
    mingCardPlayer: {
        uid: string;
        seat: number;
        cards: number[];
    }[];
    jiaofen: {
        points: number;
        seat: number;
    };
    notices: {
        type: number;
        cards: number[];
    }[];
    countdown: number;
    JiPaiQi: number[]
}
export interface land_mainHandler_loaded {
    code: number;
    room: {
        roomId: string;
        players: {
            seat: number;
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            status: "NONE" | "WAIT" | "READY" | "QIANG" | "GAME";
            bet: number;
            isDOUBLE: number;
            isRobot: number;
        }[];
        status: "NONE" | "INWAIT" | "CPoints" | "DOUBLE" | "INGAME" | "END";
        lastWinIdx: number;
        curr_doing_seat: number;
        lowFen: number;
        lowBet: number;
    };
    waitTime: number;
    seat: number;
    roundId: string;
    offLine: IoffLine;
    bet: number;//玩家总下注额度
}
/**喊话推送 */
export interface Iddz_onFahua {
    status: "NONE" | "INWAIT" | "CPoints" | "DOUBLE" | "INGAME" | "END";
    curr_doing_seat: number;
    curr_doing_uid: string;
    betNum: number;
    countdown: number;
    fen: number;
    isRobotData: number[];
    lastDealPlayer: interface_land;
    notices: {
        type: number;
        cards: number[];
    }[];
}

/**明牌 推送 */
export interface Iddz_mingCard {
    uid: string,
    seat: number;
    cards: number[];
}
export interface Iland_qiang {
    land_seat: number;
    uid: string;
    fen: number;
    publicCards: number[];
    lowFen: number,
    JiPaiQi: number[];
    countdown: number;
}

export interface Iland_onSettlement {
    land_seat: number;
    winSeat: number;
    entryCond: number;
    list: {
        uid: string;
        seat: number;
        profit: number;
        gold: number;
        nickname: string;
        lowFen: number;
        totalBei: number;
    }[];
}

export interface Irecord_history {
    info: {
        uid: string;
        seat: number;
        profit: number;
        gold: number;
        nickname: string;
        lowFen: number;
        totalBei: number;
    }[],
    oper: { uid: string, oper_type: string, update_time: string, msg: any }[]
}