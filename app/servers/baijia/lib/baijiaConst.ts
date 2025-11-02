import * as hallConst from '../../../consts/hallConst';

export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;//离线玩家最大能参加游戏的局数
export const CHANNEL_NAME = 'baijia';
export const BET_XIANZHI = 10;//押注限制（庄闲,顶注的10倍）
export const BET_XIANZHI2 = 2;//押注限制（大小,顶注的10倍）
export const ZHUANG_NUM = 6;//当庄轮数
export const CHOU_SHUI = 0.4;//提前下庄抽水
export const ZHUANG = "ZHUANG";//庄家标识
export const XIAN = "XIAN";//闲家标识

//是否记录机器人日志
export const LOG_ISROBOT = hallConst.LOG_ISROBOT !== null ? hallConst.LOG_ISROBOT : true;

export const FAN_JIANG = 5;//返奖达到五倍

// 对押区域
export const mapping = {
    play: 'bank',
    bank: 'play',
    small: 'big',
    big: 'small',
};

// 百家参与有效押注判断的区域
export const validAreas = ['bank', 'play', 'big', 'small'];



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

export interface baijia_mainHandler_loaded {
    code: number,
    roomInfo: any,
    offLine: {
        isOnLine: any;
        toResultBack: any;
    },
    sceneId: number,
    roundId: string,
    poundage: number,
    /**上庄条件 */
    upZhuangCond: number,
    pl: any,
    playerInfo: { gold: number; }
};

export interface Ibj_onUpdateZhuangInfo {
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
        isRobot: number;
    }[];
    applyZhuangsNum: number;
}
