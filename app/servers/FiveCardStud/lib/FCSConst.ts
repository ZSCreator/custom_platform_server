'use strict';
import * as  hallConst from '../../../consts/hallConst';


export const CHANNEL_NAME = 'souha';

export const FAN_JIANG = 500;//返奖500倍数



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

/**发话推送 */
export interface Ionfahua {
    /**座位号 */
    curr_doing_seat: number;
    /**轮数 大于等2轮 就能梭哈*/
    roundTimes: number;
    /**自己金币 */
    currGold: number;
    /**下注范围 */
    freedomBet: number[];
    /**推进下注 */
    // recommBet: number[];
    /**跟注 */
    cinglNum: number;
    /**倒计时 */
    aoto_time: number;
    /**1/3 2/3 1 底池 */
    recommendBet: number[];
}

/**发送工牌 */
export interface Idz_onDeal2 {
    roundTimes: number;
    players: {
        uid: string;
        seat: number;
        gold: number;
        currGold: number;
        bet: number;
        tatalBet: number;
        holds: number[];
        status: "NONE" | "WAIT" | "GAME";
        isFold: boolean;
    }[];
}

export interface FiveCardStud_mainHandler_loaded {
    code: number,
    room: {
        sceneId: number;
        roomId: string;
        roundId: string;
        status: "NONE" | "INWAIT" | "INGAME" | "END";
        waitTime: number;
        /**底注 */
        lowBet: number;
        curr_doing_seat: number;
        /**跟注范围[10,100] */
        freedomBet: number[];
        roundTimes: number;
        roomCurrSumBet: number;
        canCarryGold: number[];
    },
    players: {
        seat: number;
        uid: string;
        nickname: string;
        headurl: string;
        gold: number;
        currGold: number;
        profit: number;
        status: "NONE" | "WAIT" | "GAME";
        bet: number;
        isFold: boolean;
        holds: any;
    }[],
}

export interface IFCS_mainHandler_robotNeed {
    code: 200, robotNeed: {
        uid: string;
        isRobot: number;
        holds: number[];
        type: number;
    }[]
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
        // type: number;
        roundTimes: number;
        isFold: boolean;
    }[];
}

export interface FiveCardStud_onDeal {
    zhuang: {
        seat: number;
        uid: string;
    };
    roomCurrSumBet: number;
    players: {
        uid: string;
        seat: number;
        gold: number;
        currGold: number;
        bet: number;
        tatalBet: number;
        holds: number[];
        status: "NONE" | "WAIT" | "GAME";
    }[];
}