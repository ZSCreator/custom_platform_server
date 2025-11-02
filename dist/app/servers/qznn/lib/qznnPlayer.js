"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class qznnPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.cards = [];
        this.profit = 0;
        this.initgold = 0;
        this.Rank = false;
        this.seat = i;
        this.cardType = null;
        this.betNum = 0;
        this.pushbet = 0;
        this.gold = opts.gold;
        this.isLiangpai = false;
        this.isAgreeDisband = 0;
        this.robmul = 1;
        this.foldState = -1;
        this.isBet = 0;
        this.initgold = this.gold;
    }
    initGame() {
        this.status = `WAIT`;
        this.cards = [];
        this.betNum = 0;
        this.isLiangpai = false;
        this.robmul = 1;
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
    strip(roomInfo) {
        let opts = {
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
            isBet: this.isBet,
        };
        if (roomInfo.status == 'READYBET' || roomInfo.status == 'ROBZHUANG') {
            opts.cards = this.cards.slice(0, 4);
            delete opts.cardType;
        }
        return opts;
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
            robmul: this.robmul,
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
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: utils.sum(this.gold)
        };
    }
    async updateGold(roomInfo) {
        try {
            let result = {
                list: roomInfo._cur_players.map(c => c.toResult(roomInfo.lowBet)),
                roomInfo: {
                    zhuangInfo: roomInfo.zhuangInfo,
                    lowBet: roomInfo.lowBet,
                    isControl: roomInfo.controlLogic.isControl,
                    max_uid: roomInfo.max_uid,
                }
            };
            if (this.profit < 0 && Math.abs(this.profit) > this.gold) {
                this.profit = -this.gold;
            }
            const isZhuang = roomInfo.zhuangInfo.uid == this.uid;
            const res = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .addResult(roomInfo.zipResult)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, isZhuang)
                .setGameRecordLivesResult(result)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
        }
        catch (error) {
            roomInfo.Logger.error(`抢庄牛牛结算${error}`);
        }
    }
}
exports.default = qznnPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpublBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3F6bm4vbGliL3F6bm5QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFDcEUsOENBQStDO0FBSS9DLG1GQUFpRjtBQUtqRixNQUFxQixVQUFXLFNBQVEsdUJBQVU7SUF5QjlDLFlBQVksQ0FBUyxFQUFFLElBQVM7UUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBdkJoQixXQUFNLEdBQXVDLE1BQU0sQ0FBQztRQUNwRCxVQUFLLEdBQWEsRUFBRSxDQUFDO1FBZ0JyQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsU0FBSSxHQUFHLEtBQUssQ0FBQztRQUdULElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUdELFFBQVE7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEVB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