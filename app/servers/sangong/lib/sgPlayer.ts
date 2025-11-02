import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import sangongConst = require('./sangongConst');
import * as mailModule from '../../../modules/mailModule';
import sgRoom from './sgRoom';
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';


export default class sgPlayer extends PlayerInfo {
    /**WAIT.等待 READY.准备 GAME.游戏中 */
    status: 'NONE' | 'WAIT' | 'GAME' = 'NONE';
    /**下注金额 */
    bet: number = 0;
    /**手牌 */
    cards: number[] = [];
    /**牌型 */
    cardType: number = null;
    /**是否准备 */
    isReady: boolean = false;
    /**是否亮牌 */
    isLiangpai: boolean = false;
    /**掉线时间 */
    leaveTimer: number = 0;
    /**玩家回合收益 */
    profit: number = 0;
    /**总押注倍率 */
    totalOdds: number = 1;
    /**这局谁赢 */
    isWin: boolean = false;
    /**是否为庄 */
    isBanker: boolean = false;
    /**是否已经参与抢庄 false表示没有操作*/
    isRob: boolean = false;
    seat: number;
    /**下注倍数 */
    bOdds: number = 1;
    /**为机器人准备 该机器人调控必赢 */
    control: boolean = false;
    /**牌型倍数 */
    cardsOdds: number = 1;
    /**抢庄倍数 */
    robOdds: number = 1;
    /**是否已下注 */
    isBet: boolean = false;
    /**已经翻开的牌 默认为未翻开过 false */
    openCards = false;
    /**保留初始化金币 */
    initgold: number = 0;
    gameRecordService: RecordGeneralManager;
    constructor(opts, seat) {
        super(opts);
        this.gold = opts.gold;// 初始金币
        this.seat = seat;// 座位号
        this.initgold = this.gold;
    }

    // 发牌
    licensing(cards: number[], cardType: number) {
        this.cards = cards;
        this.cardType = cardType;
    }

    /**在没回合结束初始化玩家信息 */
    init() {
        this.status = `WAIT`;
        this.cards = null;              // 手牌
        this.cardType = null;           // 牌型
        this.isReady = false;           // 是否准备
        this.isLiangpai = false;        // 是否亮牌
        this.bet = 0;                // 下注金额
        this.isBanker = false;          // 是否为庄
        this.isRob = false;             // 是否已经参与抢庄
        this.isBet = false;             // 是否已下注
        this.isWin = false;             // 这局谁赢
        this.profit = 0;                // 回合收益
        this.totalOdds = 1;             // 押注倍数清零
        this.bOdds = 1;                 // 下注倍数清零
        this.robOdds = 1;               // 抢庄倍数清零
        this.cardsOdds = 1;             // 牌型倍数清零
        this.control = false;           // 初始化玩家是否调控
        this.openCards = false;
        this.initControlType();
    }

    /**进入游戏后的包装 */
    strip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,

            status: this.status,
            onLine: this.onLine,

            cards: this.openCards ? this.cards : null,
            cardType: this.cardType,

            isLiangpai: this.isLiangpai,
            isReady: this.isReady,
            robOdds: this.robOdds,
            bet: this.bet,
            Banker: this.isBanker,
            isWin: this.isWin,
            totalOdds: this.totalOdds,
            seat: this.seat,
            isRob: this.isRob,
            isBet: this.isBet,
            robot: this.isRobot,
        };
    }

    /**
     * 手牌信息
     */
    toHoldsInfo() {
        return {
            uid: this.uid,
            seat: this.seat,
            cards: this.openCards ? this.cards : null,
            cardType: this.cardType,
            bOdds: this.bOdds,
            bet: this.bet,
            totalOdds: this.totalOdds,
            robOdds: this.robOdds,
            cardsOdds: this.cardsOdds,
        };
    }
    /**
     * 结果
     */
    toResult() {
        return {
            uid: this.uid,
            seat: this.seat,
            cards: this.cards,
            cardType: this.cardType,
            isLiangpai: this.isLiangpai,
            isWin: this.isWin,
            gold: this.gold,
            profit: this.profit,
            totalOdds: this.totalOdds,
            bOdds: this.bOdds,
            robOdds: this.robOdds,
            cardsOdds: this.cardsOdds,
            bet: this.bet,
            headurl: this.headurl
        };
    }

    /**进入下注状态 包装 */
    betStateStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            totalOdds: this.totalOdds,
            // control: this.control,
        }
    }

    /**抢庄时候的包装 */
    robStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            gold: this.gold,
            seat: this.seat,
            isRob: this.isRob,
            // control: this.control,
        }
    }

    /**扣钱记录 */
    async updateGold(roomInfo: sgRoom) {

        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        this.gameRecordService = createPlayerRecordService();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, this.seat)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(validBet, validBet, this.profit, false)
            // .setGameRecordLivesResult(record_history)
            .sendToDB(1);

        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
        // (!this.onLine) && mailModule.changeGoldsByMail17({}, this);
    }
    /**对战类 特有， */
    async only_update_game(roomInfo: sgRoom) {
        const record_history = {
            list: roomInfo.players.filter(c => !!c).map(c => {
                return {
                    uid: c.uid,
                    isBanker: this.isBanker,
                    seat: c.seat,
                    cards: c.cards,
                    cardType: c.cardType,
                    isLiangpai: c.isLiangpai,
                    isWin: c.isWin,
                    gold: c.gold,
                    profit: c.profit,
                    totalOdds: c.totalOdds,
                    bOdds: c.bOdds,
                    robOdds: c.robOdds,
                    cardsOdds: c.cardsOdds,
                    bet: c.bet,
                }
            }),
        };
        await this.gameRecordService.Later_updateRecord(record_history);

    }
    /**抢庄操作 0为不抢 传入的参数为倍数 */
    handler_rob(roomInfo: sgRoom, odds: number) {
        this.isRob = true;
        // 默认值改为1
        if (odds) {
            this.robOdds = odds;
            roomInfo.robBankers.push(this);
        }

        roomInfo.channelIsPlayer(sangongConst.route.playerRob, { uid: this.uid, seat: this.seat, odds });

        if (roomInfo.curPlayers.every(pl => pl.isRob == true)) {
            roomInfo.robAnimation_step_3();
        }
    }

    handler_bet(roomInfo: sgRoom, odds: number) {
        this.bOdds = odds;
        this.isBet = true;
        this.bet = roomInfo.lowBet * this.bOdds;

        roomInfo.channelIsPlayer(sangongConst.route.playerBet, {
            uid: this.uid,
            seat: this.seat,
            bet: this.bet,
            odds: this.bOdds,
            gold: this.gold,
        });

        if (roomInfo.curPlayers.filter(pl => pl.uid != roomInfo.Banker.uid).every(pl => pl.isBet)) {
            roomInfo.lookState_step_5();
        }
    }

    /**亮牌 */
    handler_openCard(roomInfo: sgRoom) {
        this.openCards = true;
        roomInfo.channelIsPlayer(sangongConst.route.liangpai, {
            player: Object.assign(this.toHoldsInfo()),
        });

        // 如果所有人都亮牌 结算
        if (roomInfo.curPlayers.every(pl => pl.openCards)) {
            roomInfo.settlement();
        }
    }
}

