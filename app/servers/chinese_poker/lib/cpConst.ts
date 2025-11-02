export const CHANNEL_NAME = 'chinese_poker';


export interface Ipoker_onSettlement {
    list: {
        uid: string;
        seat: number;
        type: number;
        type2: number;
        type3: number;
        specialType: number;
        gain: number;
        gain2: number;
        gain3: number;
        tmp_gain: number;
        specialgain: number;
        sumgain: number
        lastGain: any;
        shoot: any;
        extension: any;
        BiPaicards: any;
        biPai_status: any;
        gold: number;
    }[];
}

export interface Ipoker_onDeal {
    otherPlayers: {
        uid: string;
        headurl: string;
        nickname: string;
        seat: number;
        gold: number;
        bet: number;
        cards: number[];
        card_arr: {
            cards: number[];
            type: number[];
        }[];
        holdStatus: 0 | 1;
        status: "NONE" | "WAIT" | "GAME";
        BiPaicards: number[][];
    }[];
    players: {
        uid: string;
        headurl: string;
        nickname: string;
        seat: number;
        gold: number;
        bet: number;
        cards: number[];
        card_arr: {
            cards: number[];
            type: number[];
        }[];
        holdStatus: 0 | 1;
        status: "NONE" | "WAIT" | "GAME";
        BiPaicards: number[][];
    };
    configuration_TIME: number;
}