"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const qznn_logic = require("./qznn_logic");
class qznnPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.cards = [];
        this.profit = 0;
        this.initgold = 0;
        this.seat = i;
        this.cardType = null;
        this.betNum = 0;
        this.pushbet = 0;
        this.gold = opts.gold;
        this.isLiangpai = false;
        this.isAgreeDisband = 0;
        this.robmul = -1;
        this.foldState = -1;
        this.isBet = 0;
        this.initgold = this.gold;
    }
    initGame() {
        this.status = `WAIT`;
        this.cards = [];
        this.betNum = 0;
        this.isLiangpai = false;
        this.robmul = -1;
        this.foldState = -1;
        this.isBet = 0;
        this.profit = 0;
        this.initControlType();
    }
    setCards_1(cards) {
        this.cards = cards.map(c => c);
    }
    setCards_2(cards, cardType) {
        this.cards = cards.map(c => c);
        this.cardType = cardType;
    }
    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: utils.sum(this.gold),
            seat: this.seat,
            status: this.status,
            online: this.onLine,
            profit: this.profit,
            cards: this.cards,
            cardType: this.cardType,
            betNum: this.betNum,
            isLiangpai: this.isLiangpai,
            robmul: this.robmul,
            foldState: this.foldState,
            isAgreeDisband: this.isAgreeDisband,
            pushbet: this.pushbet,
            isBet: this.isBet
        };
    }
    toMingPaiInfo(uid) {
        return {
            uid: this.uid,
            seat: this.seat,
            cards: uid == this.uid ? this.cards.slice(0, 4) : [],
            robmul: this.robmul
        };
    }
    toRobzhuangData() {
        return {
            uid: this.uid,
            seat: this.seat,
            robmul: this.robmul,
            pushbet: this.pushbet,
            gold: this.gold
        };
    }
    toHoldsInfo() {
        return {
            uid: this.uid,
            cards: this.cards,
            seat: this.seat,
            cardType: this.cardType,
            betNum: this.betNum,
        };
    }
    toResult(lowBet) {
        return {
            uid: this.uid,
            cards: this.cards,
            seat: this.seat,
            cardType: this.cardType,
            gold: this.gold,
            profit: this.profit,
            betNum: this.betNum * lowBet
        };
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            status: this.status
        };
    }
    async updateGold(roomInfo) {
        let result = {
            list: roomInfo._cur_players.map(c => c.toResult(roomInfo.lowBet)),
            roomInfo: {
                zhuangInfo: roomInfo.zhuangInfo,
                lowBet: roomInfo.lowBet
            }
        };
        const isZhuang = roomInfo.zhuangInfo.uid == this.uid;
        const res = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, isZhuang)
            .setGameRecordLivesResult(result)
            .sendToDB(1);
        this.profit = res.playerRealWin;
        this.gold = res.gold;
        this.initgold = this.gold;
    }
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: utils.sum(this.gold)
        };
    }
    action_robzhuangOpt(roomInfo, mul) {
        this.robmul = mul;
        if (mul > 0)
            roomInfo.robzhuangs.push({ uid: this.uid, mul: mul });
        roomInfo.channelIsPlayer('qz_onOpts', {
            type: 'robzhuang',
            uid: this.uid,
            seat: this.seat,
            robmul: mul,
            list: roomInfo._cur_players.map(pl => pl.toRobzhuangData())
        });
        if (roomInfo._cur_players.every(c => c.robmul >= 0)) {
            roomInfo.handler_readybet();
        }
    }
    action_betOpt(roomInfo, betNum) {
        this.betNum = betNum;
        this.isBet = betNum;
        roomInfo.channelIsPlayer('qz_onOpts', {
            type: 'bet',
            uid: this.uid,
            seat: this.seat,
            betNum: betNum,
            lowBet: roomInfo.lowBet
        });
        if (roomInfo._cur_players.every(m => m.betNum !== 0 || m.uid == roomInfo.zhuangInfo.uid)) {
            roomInfo.handler_look();
        }
    }
    action_liangpaiOpt(roomInfo) {
        this.isLiangpai = true;
        const cardType = qznn_logic.getCardType(this.cards);
        const opts = {
            type: 'pinpai',
            uid: this.uid,
            seat: this.seat,
            cardType
        };
        roomInfo.channelIsPlayer('qz_onOpts', opts);
        if (roomInfo._cur_players.every(m => m.isLiangpai)) {
            roomInfo.handler_settlement();
        }
    }
}
exports.default = qznnPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpublBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3F6bm5wcC9saWIvcXpublBsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUNwRSw4Q0FBK0M7QUFDL0MsbUZBQWlGO0FBQ2pGLDJDQUE0QztBQUs1QyxNQUFxQixVQUFXLFNBQVEsdUJBQVU7SUF1QjlDLFlBQVksQ0FBUyxFQUFFLElBQVM7UUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBckJoQixXQUFNLEdBQXVDLE1BQU0sQ0FBQztRQUNwRCxVQUFLLEdBQWEsRUFBRSxDQUFDO1FBZ0JyQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHakIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFHRCxRQUFRO1FBQ0osSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENB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