
export interface ZJH_onFahua_interface {
    fahuaIdx: number;
    /**玩家总下注 */
    totalBet: number;
    betNum: number;
    roundTimes: number;
    canBipai: boolean;
    canKanpai: boolean;
    fahuaTime: number;
    member_num: number;
    zhuang_seat: number;
    is_filling: boolean;
    max_uid?: string;
    isControl?: boolean;
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