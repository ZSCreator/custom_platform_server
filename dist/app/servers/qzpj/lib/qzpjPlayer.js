"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const qzpjConst_1 = require("./qzpjConst");
class qzpjPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = 'NONE';
        this.cards = [];
        this.bet_mul_List = [];
        this.profit = 0;
        this.initgold = 0;
        this.Rank = false;
        this.seat = i;
        this.cardType = null;
        this.betNum = 0;
        this.gold = opts.gold;
        this.isLiangpai = false;
        this.robmul = -1;
        this.isBet = 0;
        this.initgold = this.gold;
    }
    initGame() {
        this.status = `WAIT`;
        this.cards = [];
        this.betNum = 0;
        this.isLiangpai = false;
        this.robmul = -1;
        this.bet_mul_List = [];
        this.points = 0;
        this.isBet = 0;
        this.profit = 0;
        this.initControlType();
    }
    strip() {
        let opts = {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: utils.sum(this.gold),
            seat: this.seat,
            status: this.status,
            profit: this.profit,
            cards: this.cards,
            cardType: this.cardType,
            betNum: this.betNum,
            isLiangpai: this.isLiangpai,
            robmul: this.robmul,
            points: this.points,
            isBet: this.isBet,
            bet_mul_List: this.bet_mul_List,
        };
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
    toResult() {
        return {
            uid: this.uid,
            cards: this.cards,
            seat: this.seat,
            cardType: this.cardType,
            gold: this.gold,
            profit: this.profit,
            robmul: this.robmul,
            nickname: this.nickname,
            betNum: this.betNum,
            points: this.points
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
                list: roomInfo._cur_players.map(c => c.toResult()),
                roomInfo: {
                    zhuangInfo: roomInfo.zhuangInfo,
                    lowBet: roomInfo.lowBet,
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
            roomInfo.Logger.error(`抢庄牌九结算${error}`);
        }
    }
    handler_robBanker(roomInfo, mul) {
        this.robmul = mul;
        roomInfo.robzhuangs.push({ uid: this.uid, mul: mul, gold: this.gold });
        let opts = {
            uid: this.uid,
            seat: this.seat,
            robmul: mul,
            list: roomInfo._cur_players.map(pl => pl.toRobzhuangData())
        };
        roomInfo.channelIsPlayer(qzpjConst_1.route.qzpj_robzhuang, opts);
        if (roomInfo.robzhuangs.length === roomInfo._cur_players.length) {
            roomInfo.handler_readybet();
        }
    }
    handler_bet(roomInfo, betNum) {
        this.betNum = betNum;
        this.isBet = betNum;
        let opts = {
            uid: this.uid,
            seat: this.seat,
            betNum: betNum,
            lowBet: roomInfo.lowBet
        };
        roomInfo.channelIsPlayer(qzpjConst_1.route.qzpj_bet, opts);
        if (roomInfo._cur_players.every(m => m.betNum != 0 || m.uid === roomInfo.zhuangInfo.uid)) {
            roomInfo.handler_deal();
        }
    }
}
exports.default = qzpjPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpwalBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3F6cGovbGliL3F6cGpQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFDcEUsOENBQThDO0FBSTlDLG1GQUFpRjtBQUVqRiwyQ0FBK0M7QUFJL0MsTUFBcUIsVUFBVyxTQUFRLHVCQUFVO0lBeUI5QyxZQUFZLENBQVMsRUFBRSxJQUFTO1FBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXZCaEIsV0FBTSxHQUF1QyxNQUFNLENBQUM7UUFDcEQsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQU1yQixpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQVU1QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsU0FBSSxHQUFHLEtBQUssQ0FBQztRQUdULElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUdELFFBQVE7UUFDSixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFH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