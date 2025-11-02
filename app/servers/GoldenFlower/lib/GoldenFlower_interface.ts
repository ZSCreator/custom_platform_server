
export interface IZJH_onFahua {
    fahuaIdx: number;
    /**当前下注额度 不翻倍的 */
    betNum: number;
    /**当前玩家每轮总下注 */
    totalBet: number;
    roundTimes: number;
    canBipai: boolean;
    canKanpai: boolean;
    fahuaTime: number;
    /**未弃牌人数 */
    member_num: number;
    zhuangIdx: number;
    allin: boolean;
    /**盘面总押注 */
    currSumBet: number;
    isRobotData:
    {
        cards: number[],
        cardType: number,
        uid: string,
        isRobot: number
    }
}

/**玩家操作 */
export enum Player_Oper {
    PO_NONE,
    /**设置 自动跟住 */
    PO_SET_auto_genzhu,
    /**设置 防超时弃牌 */
    PO_SET_auto_no_Fold,
};
export interface IZJH_onSettlement {
    auto: boolean;
    winner: string;
    winnerSeat: number;
    list: {
        uid: string;
        seat: number;
        totalBet: number;
        profit: number;
        gold: number;
        holds: {
            uid: string;
            cards: number[];
            type: number;
            isRobot: number;
        };
        canliangs: string[];
    }[];
}

export interface Irecord_history {
    max_uid: string,
    info: {
        uid: string;
        isRobot: number;
        seat: number;
        nickname: string;
        gold: number;
        totalBet: number;
        hold: number[];
        cardType: number;
        holdStatus: number;
        profit: number;
    }[],
    oper: { uid: string, oper_type: string, update_time: string, msg: any }[]
}