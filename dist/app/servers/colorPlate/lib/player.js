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
        this.bets = initBetDetail();
        this.winRoundCount = 0;
        this.lastBets = this.bets;
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
        this.initControlType();
    }
    addBets(areaName, num) {
        this.bets[areaName] += num;
        this.totalBet += num;
        this.deductGold(num);
    }
    isLackGold(num) {
        return this.gold < (num);
    }
    getTotalBet() {
        return this.totalBet;
    }
    resetOnlineState() {
        this.onLine = true;
    }
    setOffline() {
        this.onLine = false;
    }
    deductGold(gold) {
        this.gold -= gold;
    }
    async settlement(room) {
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold + this.totalBet)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(room.roundId, 1)
            .addResult(room.zipResult)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(room))
            .setGameRecordInfo(this.totalBet, this.totalBet, this.profit, false)
            .sendToDB(1);
        if (playerRealWin > 0) {
            this.winRoundCount++;
        }
        if (this.profit >= 100000) {
            (0, MessageService_1.sendBigWinNotice)(room.nid, this.nickname, this.profit, this.isRobot, this.headurl);
        }
        this.gold = gold;
        this.profit = playerRealWin + this.totalBet;
    }
    isBet() {
        return this.totalBet > 0;
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
        }
        if (betAreas.includes(betAreas_1.BetAreasName.SINGLE) && betAreas.includes(betAreas_1.BetAreasName.DOUBLE)) {
            return false;
        }
        for (let key in bets) {
            if (typeof bets[key] !== 'number' || bets[key] <= 0) {
                return false;
            }
            if (key === betAreas_1.BetAreasName.SINGLE && this.bets[betAreas_1.BetAreasName.DOUBLE] > 0) {
                return false;
            }
            if (key === betAreas_1.BetAreasName.DOUBLE && this.bets[betAreas_1.BetAreasName.SINGLE] > 0) {
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
            winRoundCount: this.winRoundCount,
            totalBet: this.totalBet,
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
            winAreas: room.getWinAreas(),
        };
    }
}
exports.default = Player;
function initBetDetail() {
    return {
        [betAreas_1.BetAreasName.SINGLE]: 0,
        [betAreas_1.BetAreasName.DOUBLE]: 0,
        [betAreas_1.BetAreasName.FOUR_WHITE]: 0,
        [betAreas_1.BetAreasName.FOUR_RED]: 0,
        [betAreas_1.BetAreasName.THREE_RED]: 0,
        [betAreas_1.BetAreasName.THREE_WHITE]: 0,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29sb3JQbGF0ZS9saWIvcGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUVBQWtFO0FBQ2xFLGdEQUFzRDtBQUV0RCwwQ0FBcUM7QUFDckMsdUVBQWtFO0FBQ2xFLG1GQUFpRjtBQUNqRixxRUFBa0U7QUFXbEUsTUFBcUIsTUFBTyxTQUFRLHVCQUFVO0lBTzFDLFlBQVksR0FBUTtRQUNoQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFQUCxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsU0FBSSxHQUFzQyxhQUFhLEVBQUUsQ0FBQztRQUMxRCxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixhQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUk3QixDQUFDO0lBS0QsSUFBSTtRQUVBLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUVmLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBQSxhQUFLLEVBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO2FBQU07WUFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDeEI7UUFHRCxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7UUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQU9ELE9BQU8sQ0FBQyxRQUFzQixFQUFFLEdBQVc7UUFDdkMsSUFBSSxDQUFDLElB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