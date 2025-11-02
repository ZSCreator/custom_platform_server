"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const sangongConst = require("./sangongConst");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class sgPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(opts, seat) {
        super(opts);
        this.status = 'NONE';
        this.bet = 0;
        this.cards = [];
        this.cardType = null;
        this.isReady = false;
        this.isLiangpai = false;
        this.leaveTimer = 0;
        this.profit = 0;
        this.totalOdds = 1;
        this.isWin = false;
        this.isBanker = false;
        this.isRob = false;
        this.bOdds = 1;
        this.control = false;
        this.cardsOdds = 1;
        this.robOdds = 1;
        this.isBet = false;
        this.openCards = false;
        this.initgold = 0;
        this.gold = opts.gold;
        this.seat = seat;
        this.initgold = this.gold;
    }
    licensing(cards, cardType) {
        this.cards = cards;
        this.cardType = cardType;
    }
    init() {
        this.status = `WAIT`;
        this.cards = null;
        this.cardType = null;
        this.isReady = false;
        this.isLiangpai = false;
        this.bet = 0;
        this.isBanker = false;
        this.isRob = false;
        this.isBet = false;
        this.isWin = false;
        this.profit = 0;
        this.totalOdds = 1;
        this.bOdds = 1;
        this.robOdds = 1;
        this.cardsOdds = 1;
        this.control = false;
        this.openCards = false;
        this.initControlType();
    }
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
    betStateStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            totalOdds: this.totalOdds,
        };
    }
    robStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            gold: this.gold,
            seat: this.seat,
            isRob: this.isRob,
        };
    }
    async updateGold(roomInfo) {
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, this.seat)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(validBet, validBet, this.profit, false)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
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
                };
            }),
        };
        await this.gameRecordService.Later_updateRecord(record_history);
    }
    handler_rob(roomInfo, odds) {
        this.isRob = true;
        if (odds) {
            this.robOdds = odds;
            roomInfo.robBankers.push(this);
        }
        roomInfo.channelIsPlayer(sangongConst.route.playerRob, { uid: this.uid, seat: this.seat, odds });
        if (roomInfo.curPlayers.every(pl => pl.isRob == true)) {
            roomInfo.robAnimation_step_3();
        }
    }
    handler_bet(roomInfo, odds) {
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
    handler_openCard(roomInfo) {
        this.openCards = true;
        roomInfo.channelIsPlayer(sangongConst.route.liangpai, {
            player: Object.assign(this.toHoldsInfo()),
        });
        if (roomInfo.curPlayers.every(pl => pl.openCards)) {
            roomInfo.settlement();
        }
    }
}
exports.default = sgPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2dQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9zYW5nb25nL2xpYi9zZ1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUNwRSwrQ0FBZ0Q7QUFHaEQsbUZBQTJHO0FBRzNHLE1BQXFCLFFBQVMsU0FBUSx1QkFBVTtJQXlDNUMsWUFBWSxJQUFJLEVBQUUsSUFBSTtRQUNsQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUF4Q2hCLFdBQU0sR0FBNkIsTUFBTSxDQUFDO1FBRTFDLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUVyQixhQUFRLEdBQVcsSUFBSSxDQUFDO1FBRXhCLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFFekIsZUFBVSxHQUFZLEtBQUssQ0FBQztRQUU1QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixVQUFLLEdBQVksS0FBSyxDQUFDO1FBRXZCLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIsVUFBSyxHQUFZLEtBQUssQ0FBQztRQUd2QixVQUFLLEdBQVcsQ0FBQyxDQUFDO1FBRWxCLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFFekIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBRXBCLFVBQUssR0FBWSxLQUFLLENBQUM7UUFFdkIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUVsQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBSWpCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJ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