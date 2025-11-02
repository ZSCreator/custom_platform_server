import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as mailModule from '../../../modules/mailModule';
import baicaoRoom from './baicaoRoom';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';



export default class Player extends PlayerInfo {
    /**WAIT.等待 READY.准备 GAME.游戏中 */
    status: 'NONE' | 'WAIT' | 'GAME' = 'NONE';
    /**下注金额 */
    bet: number = 0;
    /**手牌 */
    cards: number[] = [];
    /**牌型 */
    cardType = 0;
    /**点数 */
    Points = 0;
    /**掉线局数 */
    leaveCount: number = 0;
    /**掉线时间 */
    leaveTimer: number = 0;
    /**玩家回合收益 */
    profit: number = 0;

    seat: number;

    /**为机器人准备 该机器人调控必赢 */
    control: boolean = false;
    total_CardValue: number = 0;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(seat, player: any) {
        super(player);
        this.gold = player.gold;                // 初始金币
        this.seat = seat;                                    // 座位号
        this.initgold = this.gold;
    }

    // 发牌
    licensing(roomInfo: baicaoRoom, cards: number[], cardType: number, Points: number, total_CardValue: number) {
        this.cards = cards;
        this.cardType = cardType;
        this.Points = Points;
        this.total_CardValue = total_CardValue;
        roomInfo.record_history.deal_info.push({
            uid: this.uid,
            cards: this.cards,
            cardType: this.cardType,
            Points: this.Points,
            roundTimes: roomInfo.roundTimes,
            total_CardValue: this.total_CardValue
        });
    }

    /**进入游戏状态 */
    gameState() {
        this.status = 'GAME';
    }

    /**在没回合结束初始化玩家信息 */
    init() {
        this.status = `WAIT`;
        this.cards = null;              // 手牌
        this.cardType = null;           // 牌型
        this.bet = 0;                // 下注金额
        this.profit = 0;                // 回合收益
        this.control = false;           // 初始化玩家是否调控
        this.total_CardValue = 0;
        // 如果玩家是离线加一次离线回合
        if (!this.onLine) this.leaveCount += 1;
        this.initControlType();
    }

    /**进入游戏后的包装 */
    strip() {
        let opts = {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            status: this.status,
            onLine: this.onLine,
            profit: this.profit,
            bet: this.bet,
            seat: this.seat,
            robot: this.isRobot,
        }
        // if (roomInfo.status == "LOOK" || roomInfo.status == "BIPAI" || roomInfo.status == "SETTLEMENT") {
        opts['cards'] = this.cards;
        opts['cardType'] = this.cardType;
        opts['Points'] = this.Points;
        // }
        return opts;
    }

    /**
     * 手牌信息
     */
    toHoldsInfo() {
        return {
            uid: this.uid,
            cardType: this.cardType,
            bet: this.bet,
        };
    }


    /**
     * 结果
     */
    toResult() {
        return {
            uid: this.uid,
            cards: this.cards,
            cardType: this.cardType,
            gold: this.gold,
            profit: this.profit,
            bet: this.bet,
        };
    }


    /**扣钱记录 */
    async updateGold(roomInfo: baicaoRoom) {
        const res = await createPlayerRecordService()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);

        this.gold = res.gold;
        this.initgold = this.gold
        this.profit = res.playerRealWin;
        // (!this.onLine) && mailModule.changeGoldsByMail17({}, this);
    }

    // 玩家游戏初始化通知包装
    initStrip() {
        return {
            uid: this.uid,
            gold: this.gold,
        }
    }

    // 历史记录包装
    historyStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            cards: this.cards,
            cardType: this.cardType,
        }
    }
}

