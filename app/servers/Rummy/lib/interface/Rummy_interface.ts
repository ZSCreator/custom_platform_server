/**斗地主牌型 */

export interface Rummy_mainHandler_loaded {
    code: number;
    roomInfo: {
        roomId: string;
        players: {
            playerSet: number;
            uid: string;
            headurl: string;
            nickname: string;
            gold: number;
            point: number;
            isRobot: number;
        }[];
        status: 'NONE'|'READY' | 'PLAY_CARD' | 'SEND_AWARD';
        round: number;
        lookTime: number;
        firstCard: number;
        whichSet: number;
        lostCards: number;
        changeCard: number;

    };
    sceneId: number;
    seat: number;
    offLine: boolean;
    pl: {
        uid: string,
        gold: number,
        profit: number,
        nickname: string,
        headurl: string,
        cardsList: {},
        cards: [],
        playerSet : number,
        point : number,
        getCard :number,
    };//玩家总下注额度
}
/**喊话推送 */


