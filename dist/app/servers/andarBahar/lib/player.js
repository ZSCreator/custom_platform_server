"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const betAreas_1 = require("./config/betAreas");
const utils_1 = require("../../../utils");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const MessageService_1 = require("../../../services/MessageService");
class Player extends PlayerInfo_1.PlayerInfo {
    constructor(opt) {
        super(opt);
        this.totalBet = 0;
        this.profit = 0;
        this.skip = false;
        this.bets = initBetDetail();
        this.winRoundCount = 0;
        this.lastBets = this.bets;
        this.secondBet = false;
    }
    init() {
        if (this.totalBet) {
            this.lastBets = (0, utils_1.clone)(this.bets);
            this.standbyRounds = 0;
        }
        else {
            this.standbyRounds++;
        }
        for (let key in this.bets) {
            this.bets[key] = 0;
        }
        this.profit = 0;
        this.totalBet = 0;
        this.skip = false;
        this.secondBet = false;
        this.initControlType();
    }
    setSkip() {
        this.skip = true;
    }
    addBets(areaName, num) {
        this.bets[areaName] += num;
        this.totalBet += num;
        this.deductGold(num);
    }
    isLackGold(num) {
        return this.gold < (num);
    }
    setSecondBet() {
        this.secondBet = true;
    }
    isSecondBet() {
        return this.secondBet;
    }
    getTotalBet() {
        return this.totalBet;
    }
    resetOnlineState() {
        this.onLine = true;
        this.isOnLine = true;
    }
    setOffline() {
        this.onLine = false;
    }
    deductGold(gold) {
        this.gold -= gold;
    }
    async settlement(room) {
        const validBet = Math.max(this.bets[betAreas_1.BetAreasName.ANDAR], this.bets[betAreas_1.BetAreasName.BAHAR]) -
            Math.min(this.bets[betAreas_1.BetAreasName.ANDAR], this.bets[betAreas_1.BetAreasName.BAHAR]);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold + this.totalBet)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(room.roundId, 1)
            .setGameRecordLivesResult(this.buildLiveRecord(room))
            .addResult(room.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(this.totalBet, validBet, this.profit, false)
            .sendToDB(1);
        if (playerRealWin > 0) {
            this.winRoundCount++;
        }
        if (this.profit >= 100000) {
            (0, MessageService_1.sendBigWinNotice)(room.nid, this.nickname, this.profit, this.isRobot, this.headurl);
        }
        this.gold = gold;
        this.profit = playerRealWin;
    }
    isBet() {
        return this.totalBet > 0;
    }
    isSkip() {
        return this.skip;
    }
    addProfit(profit) {
        this.profit += profit;
    }
    displayProperty() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            winRoundCount: this.winRoundCount,
        };
    }
    getWinRoundCount() {
        return this.winRoundCount;
    }
    getBetsDetail() {
        return this.bets;
    }
    isLastBet() {
        for (let [, num] of Object.entries(this.lastBets)) {
            if (num > 0) {
                return true;
            }
        }
        return false;
    }
    isRealPlayerAndBet() {
        return this.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && this.totalBet > 0;
    }
    checkBetAreas(bets) {
        if (typeof bets !== 'object') {
            return false;
        }
        const betAreas = Object.keys(bets);
        for (const key of betAreas) {
            if (!betAreas_1.areas.includes(key)) {
                return false;
            }
            if (typeof bets[key] !== 'number' || bets[key] <= 0) {
                return false;
            }
        }
        return true;
    }
    getLastBets() {
        let lastBets = {};
        for (let [areaName, num] of Object.entries(this.lastBets)) {
            if (num > 0) {
                lastBets[areaName] = num;
            }
        }
        return lastBets;
    }
    settlementResult() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            bets: this.bets,
        };
    }
    frontDisplayProperty() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            totalBet: this.totalBet,
            betDetail: this.bets,
            skip: this.skip
        };
    }
    getOverrunBetAreas(killCondition) {
        const areas = [];
        for (let areaName in this.bets) {
            if (this.bets[areaName] >= killCondition) {
                areas.push(areaName);
            }
        }
        return areas;
    }
    buildLiveRecord(room) {
        const areas = {};
        const betAreas = room.getBetAreas();
        for (let areaName in betAreas) {
            const betDetail = betAreas[areaName].getPlayerBetAndWin(this.uid);
            if (betDetail) {
                areas[areaName] = betDetail;
            }
        }
        return {
            uid: this.uid,
            areas,
            winArea: room.getWinArea(),
        };
    }
}
exports.default = Player;
function initBetDetail() {
    return {
        [betAreas_1.BetAreasName.ANDAR]: 0,
        [betAreas_1.BetAreasName.BAHAR]: 0,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvYW5kYXJCYWhhci9saWIvcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUVBQW9FO0FBQ3BFLGdEQUF3RDtBQUV4RCwwQ0FBdUM7QUFDdkMsdUVBQW9FO0FBQ3BFLG1GQUFpRjtBQUNqRixxRUFBa0U7QUFhbEUsTUFBcUIsTUFBTyxTQUFRLHVCQUFVO0lBUzFDLFlBQVksR0FBUTtRQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFUUCxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsU0FBSSxHQUFZLEtBQUssQ0FBQztRQUN0QixTQUFJLEdBQXNDLGFBQWEsRUFBRSxDQUFDO1FBQzFELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLGNBQVMsR0FBWSxLQUFLLENBQUM7SUFJbkMsQ0FBQztJQUtELElBQUk7UUFFQSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFFZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUEsYUFBSyxFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztTQUMxQjthQUFNO1lBRUgsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCO1FBR0QsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO1FBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFD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