import * as  hallConst from '../../../consts/hallConst';

export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;//玩家离线局数
export const CHANNEL_NAME = '7up7down';//游戏名字
export const FAN_JIANG = 5;//返奖倍数（播放走马灯）
// export const BET_XIANZHI = 10;//押注限制（顶注的10倍）
/**下注时间 */
export const BETTING = 20;
/**开奖时间 */
export const KAIJIANG = 8;
/**结算时间 */
// export const JIESUAN = 4;

/**
 * 押注区域
 */
export enum BetAreas {
    AA = 'AA',
    BB = 'BB',
    CC = 'CC',
}

export const points = [BetAreas.AA, BetAreas.BB, BetAreas.CC];
export const odds = { [BetAreas.AA]: 2, [BetAreas.BB]: 5, [BetAreas.CC]: 2 };


export interface I7up7down_result {
    sceneId: number;
    roomId: string;
    roomStatus: "NONE" | "BETTING" | "OPENAWARD";
    result: number[];
    winAreas: BetAreas;
    userWin: {
        uid: string;
        nickname: string;
        headurl: string;
        profit: number;
        gold: number;
        bets: {
            [area: string]: {
                bet: number;
                profit: number;
            };
        };
    }[];
    countDown: number;
};
export interface I7up7down_start {
    countDown: number;
    isRenew: number;
};
export interface up7down_mainHandler_loaded {
    code: number;
    room: {
        sceneId: number;
        roomId: string;
        roundId: string;
        roomStatus: "NONE" | "BETTING" | "OPENAWARD";
        tallBet: number;
        lowBet: number;
        countDown: number;
        rankingList: {
            uid: string;
            nickname: string;
            headurl: string;
            gold: number;
            winRound: number;
            totalBet: any;
            totalProfit: any;
        }[];
        situations: {
            area: string;
            betList: {
                uid: string;
                bet: number;
            }[];
            totalBet: 0;
        }[];
        up7Historys: {
            lotteryResult: number[];
        }[];
    };
    pl: {
        gold: number;
        isRenew: number;
    };
    offLine: I7up7down_result;
};