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
            .addResult(room.getResult().toString())
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
    buildLiveRecord(room) {
        if (this.isRobot === RoleEnum_1.RoleEnum.ROBOT) {
            return {};
        }
        const betAreas = room.getBetAreas();
        const areas = {};
        for (let name in betAreas) {
            const area = betAreas[name].getPlayerBetAndWin(this.uid);
            if (area) {
                areas[name] = area;
            }
        }
        return {
            uid: this.uid,
            doubleAreas: room.getDoubleAreas(),
            winAreas: room.getWinAreas(),
            areas
        };
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
            if (this.bets[areaName] > killCondition) {
                areas.push(areaName);
            }
        }
        return areas;
    }
}
exports.default = Player;
function initBetDetail() {
    const bets = {};
    betAreas_1.areas.forEach(area => bets[area] = 0);
    return bets;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvZmFuVGFuL2xpYi9wbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBa0U7QUFDbEUsZ0RBQXNEO0FBRXRELDBDQUFxQztBQUNyQyx1RUFBa0U7QUFDbEUsbUZBQWlGO0FBQ2pGLHFFQUFrRTtBQVdsRSxNQUFxQixNQUFPLFNBQVEsdUJBQVU7SUFPMUMsWUFBWSxHQUFRO1FBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQVBQLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixTQUFJLEdBQXNDLGFBQWEsRUFBRSxDQUFDO1FBQzFELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLGFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBSTdCLENBQUM7SUFLRCxJQUFJO1FBRUEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBRWYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLGFBQUssRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7U0FDMUI7YUFBTTtZQUNILElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN4QjtRQUdELEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QjtRQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBT0QsT0FBTyxDQUFDLFFBQXNCLEVBQUUsR0FBVztRQUN2QyxJQUFJLENBQUMsSUFBSSxD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