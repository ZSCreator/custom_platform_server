


export interface ld_mainHandler_loaded {
    code: number;
    room: {
        nid: string;
        sceneId: number;
        roomId: string;
        roundId: string;
        waitTime: number;
        players: {
            seat: number;
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            status: "NONE" | "WAIT" | "QIANG" | "GAME";
            bet: number;
            profit: number;
            cards: number[];
            cardType: number;
            isRobot: number;
        }[];
        status: "NONE" | "INWAIT" | "GameStart" | "GameBipai" | "PROCESSING";
        lowBet: number;
    };
}



export interface Iland_onSettlement {
    land_seat: number;
    winSeat: number;
    entryCond: number;
    list: {
        uid: string;
        seat: number;
        profit: number;
        gold: number;
        nickname: string;
        lowFen: number;
        totalBei: number;
    }[];
}

export interface Irecord_history {
    info: {
        uid: string;
        seat: number;
        cards: number[];
        cardType: number;
        bet: number;
        profit: number;
        gold: number;
    }[][],
    oper: { uid: string, oper_type: string, update_time: string, msg: any }[]
}