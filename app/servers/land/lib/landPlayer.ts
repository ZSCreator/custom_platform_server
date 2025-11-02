import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import * as mailModule from '../../../modules/mailModule';
import JsonConfig = require('../../../pojo/JsonConfig');
import land_Logic = require("./land_Logic");
import landRoom from './landRoom';
import ApiResultDTO, { Result } from "../../../common/classes/apiResultDTO";
import { CardsType } from './land_Logic';
import { Iddz_mingCard } from './land_interface';
import createPlayerRecordService, { RecordGeneralManager } from '../../../common/dao/RecordGeneralManager';

/**一个玩家 */
export default class landPlayer extends PlayerInfo {
    seat: number;
    /**WAIT.等待 READY.准备 QIANG.抢地主 GAME.游戏中 */
    status: "NONE" | "WAIT" | "QIANG" | "GAME" = "NONE";
    /**操作状态 */
    state: "PS_NONE" | "PS_OPER" = "PS_NONE"
    /**初始手牌 */
    cards: number[] = [];
    /**手牌状态 0.正常 1.看牌 2.弃牌 3.比牌失败 */
    holdStatus: 0 | 1 | 2 | 3;
    /**累计下注 */
    bet: number = 0;
    /**利润 */
    profit: number = 0;
    /**剩余手牌 */
    cardList: number[] = [];
    /**当前所发棋牌 */
    postcardList: number[] = [];
    /**出牌次数 */
    postCardNum: number = 0;
    /**是否托管  1取消托管  2托管 */
    trusteeshipType: number = 1;
    /**是否明牌 1明牌  0不明牌 */
    isMing: boolean = false;
    /**是否加倍 */
    isDOUBLE = 1;
    /**队友 */
    friendSeat: number = -1;
    /**抢分 -1 为操作 0 没抢 1 2 3 对应分数 */
    points = -1;
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
        this.status = "WAIT";
        this.cards = [];
        this.holdStatus = 0;
        this.isDOUBLE = 1;
        this.bet = 0;
        this.profit = 0;
        this.cardList = [];//剩余棋牌
        this.postcardList = [];//当前所发棋牌
        this.postCardNum = 0;
        this.trusteeshipType = 1;
        this.isMing = false;
        this.friendSeat = -1;
        this.points = -1;
        this.state = "PS_NONE";
    }

    /**初始游戏信息 */
    initGame(cards: number[]) {
        this.status = "GAME";
        this.cards = cards.map(c => c);
        this.holdStatus = 0;
        this.cardList = cards.map(c => c);//剩余棋牌
        this.postcardList = [];//当前所发棋牌
        this.postCardNum = 0;
        this.trusteeshipType = 1;
        this.isMing = false;
    }

    // 第一次发牌的数据
    wrapGame() {
        return {
            seat: this.seat,
            gold: this.gold,
            bet: this.bet,
            cards: this.cards,
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
            isDOUBLE: this.isDOUBLE,
            isRobot: this.isRobot
        };
    }
    /**实况记录 */
    Record_strip() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            nickname: encodeURI(this.nickname),
            headurl: this.headurl,
            gold: this.gold,
            profit: this.profit
        }
    }

    /**金币结算 */
    async updateGold(roomInfo: landRoom) {
        this.gameRecordService = createPlayerRecordService();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .addResult(roomInfo.zipResult)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);

        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }

    /**对战类 特有， */
    async only_update_game(roomInfo: landRoom) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }

    /**
   * 对抢地主的结果进行处理
   * @param data
   */
    robDeal(seat: number) {
        // 如果不是自己则判断朋友是谁
        if (this.seat !== seat) {
            this.friendSeat = [0, 1, 2].find(s => s !== seat && s !== this.seat);
        }

    }

    /**抢地主 */
    handler_ShoutPoints(roomInfo: landRoom, points: number) {
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        this.points = points;
        roomInfo.points = Math.max(roomInfo.points, points);
        do {
            if (points == 3) {
                roomInfo.land_seat = this.seat;
                break;
            }
            if (roomInfo.players.filter(pl => pl.points >= 0).length != 3) {
                roomInfo.set_next_doing_seat(roomInfo.nextFahuaIdx());
                break;
            }
            if (roomInfo.points === 0) {
                setTimeout(() => {
                    roomInfo.channelIsPlayer('ddz_liuju', {});
                    roomInfo.players.forEach(pl => pl && pl.prepare());
                    roomInfo.handler_start(roomInfo.players);
                }, 1000);
            } else {
                roomInfo.land_seat = roomInfo.players.find(pl => pl.points == roomInfo.points).seat;
            }
            break;
        } while (true);
        roomInfo.channelIsPlayer('land_jiaoFeng', {
            points: points,
            seat: this.seat
        });
        if (roomInfo.land_seat != -1) {
            roomInfo.gameStart();
        }
    }
    handler_Double(roomInfo: landRoom, double: number) {
        this.isDOUBLE = double;
        this.state = "PS_NONE";
        roomInfo.Farmer_totalBei += double;
        roomInfo.channelIsPlayer("land_oper", { seat: this.seat, double: double });
        roomInfo.note_pls();
        let ret = roomInfo.players.every(pl => pl.state == "PS_NONE");
        if (ret) {
            roomInfo.status = "INGAME";
            clearTimeout(roomInfo.waitTimeout);
            roomInfo.set_next_doing_seat(roomInfo.land_seat);
        }
    }


    /**
     * 出牌接口
     * @param cards 手牌 1-54 癞子+100
     * @param cardType 手牌类型
     * @param currPlayer 
     */
    handler_postCards(cards: number[], cardType_: land_Logic.CardsType, roomInfo: landRoom) {
        // 如果牌为空
        let cardType = land_Logic.GetCardType(cards);
        if (cards.length == 0) {
            this.postcardList = [];
            roomInfo.onPostCard(cardType, cards, this);
            return new ApiResultDTO({ code: 200 }).result();
        }
        this.postcardList = land_Logic.sort_CardList(cards);
        if (roomInfo.lastDealPlayer.seat !== this.seat && !land_Logic.isOverPre(this.postcardList, roomInfo.lastDealPlayer.cards)) {
            return new ApiResultDTO({ code: 500, msg: '错误牌型:2' }).result();
        }
        roomInfo.lastDealPlayer.seat = this.seat;
        roomInfo.lastDealPlayer.cards = cards;
        roomInfo.lastDealPlayer.cardType = cardType;
        roomInfo.lastDealPlayer.cards_len = this.cardList.length;

        // 炸弹判断
        if (cardType === CardsType.BOOM || cardType === CardsType.BIG_BOOM) {
            roomInfo.totalBei = roomInfo.totalBei * 2;
        }
        this.cardList = land_Logic.delCardList(this.cardList, cards);
        this.postCardNum += 1;
        roomInfo.onPostCard(cardType, cards, this);
        return new ApiResultDTO({ code: 200 }).result();
    }

    /**明牌 */
    handler_openCards(roomInfo: landRoom) {
        roomInfo.totalBei = roomInfo.totalBei * 2;
        this.isMing = true;
        const opts: Iddz_mingCard = {
            uid: this.uid,
            seat: this.seat,
            cards: land_Logic.sort_CardList(this.cardList),
        }
        roomInfo.channelIsPlayer('ddz_mingCard', opts);
        roomInfo.note_pls();
    }
}

