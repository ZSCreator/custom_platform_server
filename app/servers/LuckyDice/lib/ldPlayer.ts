import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as mailModule from '../../../modules/mailModule';
import JsonConfig = require('../../../pojo/JsonConfig');
import ld_Logic = require("./ld_Logic");
import ldRoom from './ldRoom';
import utils = require('../../../utils/index');
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';

/**一个玩家 */
export default class ldPlayer extends PlayerInfo {
    seat: number;
    /**WAIT.等待 READY.准备 GAME.游戏中 */
    status: "NONE" | "WAIT" | "GAME" = "NONE";
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE"
    /**初始手牌 */
    cards: number[] = [];
    cardType: number = -1;
    // alikeCounts: { key: number, count: number, Subscript: number[] }[];
    /**累计下注 */
    bet: number = 0;
    totalBet: number = 0;
    /**利润 */
    profit: number = 0;
    totalProfit: number = 0;
    /**自动操作 */
    Oper_timeout: NodeJS.Timer = null;
    /**保留的骰子 */
    keep_dices: number[] = [];
    gameRecordService: RecordGeneralManager;
    /**保留初始化金币 */
    initgold: number = 0;
    constructor(i: number, opts: any) {
        super(opts);
        this.seat = i;//座位号
        this.gold = opts.gold;
        this.initgold = this.gold;
    }

    /**准备 */
    prepare() {
        this.profit = 0;
        this.bet = 0;
    }

    /**初始游戏信息 */
    initGame(cards: number[]) {
        this.status = "GAME";
        this.cards = cards.map(c => c);
        this.cardType = ld_Logic.getCardType(this.cards);
        this.initControlType();
    }

    // 第一次发牌的数据
    wrapGame() {
        return {
            seat: this.seat,
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            bet: this.bet,
        };
    }

    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            status: this.status,
            bet: this.bet,
            profit: this.profit,
            totalBet: this.totalBet,
            totalProfit: this.totalProfit,
            cards: this.cards,
            cardType: this.cardType,
            isRobot: this.isRobot
        };
    }


    /**金币结算 */
    async updateGold(roomInfo: ldRoom) {
        this.gameRecordService = createPlayerRecordService();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.totalBet), Math.abs(this.totalBet), this.totalProfit, false)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.totalProfit = res.playerRealWin;
    }
    /**对战类 特有， */
    async only_update_game(roomInfo: ldRoom) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    /**Keep */
    handler_Keep(roomInfo: ldRoom, dices: number[]) {
        clearTimeout(this.Oper_timeout);
        this.keep_dices = dices;
        this.state = "PS_NONE";
        const opts = {
            uid: this.uid,
            seat: this.seat,
            dices
        }
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "Keep", update_time: utils.cDate(), msg: dices })
        roomInfo.channelIsPlayer('ld.Keep', opts);
        if (roomInfo.min_pls.every(pl => pl.state == "PS_NONE") == true) {
            roomInfo.handler_start();
        }
    }
}

