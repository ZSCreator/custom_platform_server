export const CHANNEL_NAME = 'ttz_zhuang';
export const HANDLINGFEE = 0.4;
export const ZHUANG_NUM = 6;
export interface ITTZ_Start {
    countdown: number;
    lotterys: {
        area: string;
        iswin: boolean;
        result: number[];
        type: 0 | 1 | 2;
        Points: number;
    }[];
    isRenew: number;
    roundId: string;
    robotNum: number;
    gold: number;
}

export interface IbairenTTZ_mainHandler_loaded {
    code: number;
    roomInfo: {
        status: "NONE" | "Licensing" | "BETTING" | "OPENAWARD";
        lowBet: number;
        upZhuangCond: number;
        roundId: string;
        sceneId: number;
        situations: {
            area: string;
            betList: {
                uid: string;
                bet: number;
                updatetime: number;
            }[];
            totalBet: 0;
        }[];
        lotterys: {
            area: string;
            iswin: boolean;
            result: number[];
            type: 0 | 1 | 2;
            Points: number;
        }[];
        countdown: number;
        ttzHistory: any[];
    };
    pl: {
        gold: number;
        nickname: string;
        headurl: string;
        bets: {
            center: {
                bet: number;
                profit: number;
            };
            east: {
                bet: number;
                profit: number;
            };
            north: {
                bet: number;
                profit: number;
            };
            west: {
                bet: number;
                profit: number;
            };
            south: {
                bet: number;
                profit: number;
            };
        };
        profit: number;
        isRenew: number;
    };
}

export interface IbairenTTZ_zj_info {
    zhuangInfo: {
        uid: string;
        headurl: string;
        nickname: string;
        gold: number;
        totalProfit: number[];
        hasRound: number;
        online: boolean;
        isRobot: number;
        bet: number;
        ip: string;
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