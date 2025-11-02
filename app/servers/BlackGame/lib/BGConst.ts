export const CHANNEL_NAME = 'BlackGame';

export interface BlackGame_oper {
    seat: number;
    location: number;
    idx: number;
    area_list: {
        [seat: number]: {
            bet: number;
            profit: number;
            cards: number[];
            insurance: boolean;
            insurance_bet: number;
            operate_status: 0 | 2 | 3;
            addMultiple: boolean;
            type: number;
            Points: number;
            uid: string;
        }[];
    };
    auto_time: number;
    /**分牌 */
    separatePoker: boolean;
    insurance: boolean;
    insurance_bet: number;
}

export interface BlackGame_deal {
    banker_cards: any[];
    area_list: {
        [seat: number]: {
            bet: number;
            profit: number;
            cards: number[];
            insurance: boolean;
            insurance_bet: number;
            operate_status: 0 | 2 | 3;
            addMultiple: boolean;
            type: number;
            Points: number;
            uid: string;
        }[];
    };
}
