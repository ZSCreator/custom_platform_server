export const CHANNEL_NAME = 'Jackpotbenz';
export const HANDLINGFEE = 0.4;
export const ZHUANG_NUM = 6;

/**
 * 押注区域
 */
export enum BetAreas {
    /**BetAreas.BMW */
    BMW = 'BMW',
    /**BetAreas.Benz */
    Benz = 'Benz',
    /**BetAreas.Audi */
    Audi = 'Audi',
    /**阿尔法·罗密欧 */
    AlfaRomeo = 'AlfaRomeo',
    /**BetAreas.Maserati */
    Maserati = 'Maserati',
    /**BetAreas.Porsche */
    Porsche = 'Porsche',
    /**BetAreas.Lamborghini */
    Lamborghini = 'Lamborghini',
    /**BetAreas.Ferrari */
    Ferrari = 'Ferrari'
}

export const points = [
    { area: BetAreas.BMW, odds: 5, prob: 20 },
    { area: BetAreas.Benz, odds: 5, prob: 20 },
    { area: BetAreas.Audi, odds: 5, prob: 20 },
    { area: BetAreas.AlfaRomeo, odds: 5, prob: 20 },
    { area: BetAreas.Maserati, odds: 10, prob: 9.34 },
    { area: BetAreas.Porsche, odds: 15, prob: 5.66 },
    { area: BetAreas.Lamborghini, odds: 25, prob: 3.5 },
    { area: BetAreas.Ferrari, odds: 40, prob: 1.5 },
];

export const motorcade = [BetAreas.Maserati, BetAreas.Benz, BetAreas.Audi, BetAreas.AlfaRomeo, BetAreas.BMW,
BetAreas.Benz, BetAreas.Lamborghini, BetAreas.Audi, BetAreas.AlfaRomeo, BetAreas.BMW,
BetAreas.Benz, BetAreas.Audi, BetAreas.Porsche, BetAreas.AlfaRomeo, BetAreas.BMW,
BetAreas.Benz, BetAreas.Audi, BetAreas.AlfaRomeo, BetAreas.Ferrari, BetAreas.BMW,
BetAreas.Benz, BetAreas.Audi, BetAreas.AlfaRomeo, BetAreas.BMW];



export interface IBenz_Start {
    countdown: number;
    roundId: string;
    isRenew: number;
    gold: number;
}

export interface IBenzBmw_mainHandler_loaded {
    code: number;
    roomInfo: {
        status: "NONE" | "Licensing" | "BETTING" | "OPENAWARD";
        lowBet: number;
        /**车队 */
        motorcade: string[];
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
        lotterys: BetAreas;
        motorcade_ran: number;
        countdown: number;
        record_historys: any[];
    };
    pl: {
        gold: number;
        nickname: string;
        headurl: string;
        bets: { area: BetAreas, bet: number, profit: number }[];
        profit: number;
        lastBets: {
            area: BetAreas;
            bet: number;
            profit: number;
        }[];
    };
}

export interface IBenzBmw_zj_info {
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

/**结算 */
export interface IBenz_Lottery {
    lotterys: BetAreas;
    userWin: {
        uid: string;
        gold: number;
        bets: {
            area: BetAreas;
            bet: number;
            profit: number;
        }[];
        profit: number;
        bet: number;
    }[];
    countdown: number;
}