





/**区域 */
export enum AreaBet {
    POINTS_1,
    POINTS_2,
    POINTS_3,
    POINTS_4,
    POINTS_5,
    POINTS_6,
    /**三条 */
    SANTIAO,
    /**炸弹 */
    ZHADAN,
    /**葫芦 */
    HULU,
    /**小连子 */
    XIAOLIANZI,
    /**大连子 */
    DALIANZI,
    /**豹子 */
    BAOZI,
    /**任意 */
    ANY,
}
//摇骰子推送
export interface Dice_Play {
    /**当前摇出来的骰子 */
    curr_DiceList: number[];
    /**保存的骰子 */
    save_DiceList: number[];
    seat: number;
    roomId: number;
    players: {
        seat: number;
        /**每回合抽奖次数 */
        Number_draws: number;
        /**额外抽奖次数 */
        Number_extra: number;
        area_DiceList: {
            [key: number]: {//区域
                /**提交后的骰子 */
                DiceList: number[];
                /**点数 */
                points: number;
                /**是否提交 */
                submit: boolean;
            };
        };
    }[];
}
/**点击骰子 */
export interface Dice_set {
    /**当前骰子 */
    curr_DiceList: number[];
    /**保存的骰子 */
    save_DiceList: number[];
    seat: number;
    /**true 放入 反之 移除 */
    Mod: boolean;
    /**数组下标 */
    Idx: number;
}
/**提交 */
export interface Dice_submit {
    seat: number;
    area_DiceList: {
        [key: number]: {//区域
            /**提交后的骰子 */
            DiceList: number[];
            /**点数 */
            points: number;
            /**是否提交 */
            submit: boolean;
        };
    };
}

export interface Dice_onWait {
    waitTime: number;
}
/**摇2个骰子 确定庄家 */
export interface Dice_startNextHand {
    plys: {
        seat: number;
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        status: "NONE" | "WAIT" | "GAME" | "READY";
        profit: number;
    }[];
    roundTimes: number;
    roundId: string;
    setSice: number[];
    banker: string;
}
/**通知谁操作 */
export interface Dice_onFahua {
    curr_doing_seat: number;
}