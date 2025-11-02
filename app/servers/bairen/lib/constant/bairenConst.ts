import * as hallConst from '../../../../consts/hallConst';
/**当前庄家结果 */
import { CommonControlState } from "../../../../domain/CommonControl/config/commonConst";
export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;
export const CHANNEL_NAME = 'bairen';
export const FAN_JIANG = 10;//返奖达到十倍
export const XIAN_HONG = 10;//限红倍数
export const TIAO_KONG = 8;//调控结果集获取次数（次数越大，调控精度越准确）
export const ZHUANG_NUM = 6;//当庄轮数
export const CHOU_SHUI = 0.4;//提前下庄抽水
export const ZHUANG = "ZHUANG";//庄家标识
export const XIAN = "XIAN";//闲家标识
export const NO_TONGPEI = 0.8;//不开通赔通杀的概率
export const NO_TONGPEI_NUM = 3;//随机结果次数（不开通赔和通杀）

//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;


/**每个区域下注信息 */
export interface IBaiRenRegions {
    area: number,
    cards: number[],
    cardType: number,
    multiple: number,
    isWin: boolean,
    isniu: boolean,
    cardNum: number[];
}

interface IZhuangResult {
    /**ç‰Œ */
    cards: number[];
    /**ç‰Œåž‹ */
    cardType: number;
    profit: number;
    isniu: boolean;
    cardNum: any[];
}

export interface bairen_mainHandler_loaded {
    code: number;
    msg?: string;
    room: {
        roomId: string;
        lowBet: number;
        upZhuangCond: number;
        status: 'NONE' | 'Licensing' | 'BETTING' | 'INBIPAI';
        countdownTime: number;
        regions: IBaiRenRegions[];
        bairenHistory: any[];
        zhuangResult: IZhuangResult;
        situations: {
            area: number;
            betList: {
                uid: string;
                bet: number;
                updatetime: number;
            }[];
            totalBet: 0;
        }[]
    };
    players: {
        uid: string;
        headurl: string;
        nickname: string;
        bet: number;
        gold: number;
    }[];
    offLine: Ibr_over;
    sceneId: number;
    roundId: string;
    poundage: number;
    pl: { bets: { bet: number, profit: number }[], isRenew: number }
}

export interface Ibr_over {
    status?: 'NONE' | 'Licensing' | 'BETTING' | 'INBIPAI';
    countdownTime?: number;
    data?: {
        zhuangResult: IZhuangResult;
        regions: IBaiRenRegions[];
        situations: {
            area: number;
            betList: {
                uid: string;
                bet: number;
                updatetime: number;
            }[];
            totalBet: 0;
        }[],
        bairenHistory: any[];
        zhuangInfo: {
            uid?: string;
            gold?: number
        };
        players: {
            uid: string;
            nickname: string;
            headurl: string;
            gold: number;
            winRound: number;
            bet: number;
            bets: {
                area: number;
                bet: number;
                profit: number;
            }[];
            profit: number;
            totalBet: any;
            totalProfit: any;
        }[];
        countdownTime: number;
    }
}

export interface Ibr_start {
    status: "NONE" | "Licensing" | "BETTING" | "INBIPAI";
    countdownTime: number;
}

export interface Ibr_onUpdateZhuangInfo {
    zhuangInfo: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        profit: number;
        hasRound: any;
    };
    zj_queues: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        isRobot: number;
    }[];
    applyZhuangsNum: number;
}
