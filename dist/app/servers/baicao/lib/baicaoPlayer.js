"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class Player extends PlayerInfo_1.PlayerInfo {
    constructor(seat, player) {
        super(player);
        this.status = 'NONE';
        this.bet = 0;
        this.cards = [];
        this.cardType = 0;
        this.Points = 0;
        this.leaveCount = 0;
        this.leaveTimer = 0;
        this.profit = 0;
        this.control = false;
        this.total_CardValue = 0;
        this.initgold = 0;
        this.gold = player.gold;
        this.seat = seat;
        this.initgold = this.gold;
    }
    licensing(roomInfo, cards, cardType, Points, total_CardValue) {
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
    gameState() {
        this.status = 'GAME';
    }
    init() {
        this.status = `WAIT`;
        this.cards = null;
        this.cardType = null;
        this.bet = 0;
        this.profit = 0;
        this.control = false;
        this.total_CardValue = 0;
        if (!this.onLine)
            this.leaveCount += 1;
        this.initControlType();
    }
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
        };
        opts['cards'] = this.cards;
        opts['cardType'] = this.cardType;
        opts['Points'] = this.Points;
        return opts;
    }
    toHoldsInfo() {
        return {
            uid: this.uid,
            cardType: this.cardType,
            bet: this.bet,
        };
    }
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
    async updateGold(roomInfo) {
        const res = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    initStrip() {
        return {
            uid: this.uid,
            gold: this.gold,
        };
    }
    historyStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            cards: this.cards,
            cardType: this.cardType,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFpY2FvUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYmFpY2FvL2xpYi9iYWljYW9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFHcEUsbUZBQWlGO0FBSWpGLE1BQXFCLE1BQU8sU0FBUSx1QkFBVTtJQXlCMUMsWUFBWSxJQUFJLEVBQUUsTUFBVztRQUN6QixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUF4QmxCLFdBQU0sR0FBNkIsTUFBTSxDQUFDO1FBRTFDLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUVyQixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWIsV0FBTSxHQUFHLENBQUMsQ0FBQztRQUVYLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBS25CLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFDekIsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFFNUIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdqQixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFHRCxTQUFTLENBQUMsUUFBb0IsRUFBRSxLQUFlLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsZUFBdUI7UUFDdEcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsUUFB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