"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils");
const utils_2 = require("../../../utils/utils");
const roomUtil_1 = require("./util/roomUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
class Player extends slotMachinePlayer_1.default {
    constructor(opts) {
        super(opts);
        this.profit = 0;
        this.totalProfit = 0;
        this.totalBet = 0;
        this.betAreas = {};
        this.leaveCount = 0;
        this.gold = opts.gold || 0;
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.betAreas = {};
        this.initControlType();
    }
    isLackGold(bets) {
        for (let area in bets) {
            if (typeof bets[area] !== 'number' || bets[area] <= 0) {
                return true;
            }
        }
        return this.gold < ((0, utils_1.sum)(bets));
    }
    setRoundId(roundId) {
        this.roundId = roundId;
    }
    strip() {
        return {
            gold: this.gold,
            betAreas: this.betAreas,
            totalBet: this.totalBet
        };
    }
    betHistory(area, betGold) {
        this.totalBet += betGold;
        if (!this.betAreas[area])
            this.betAreas[area] = 0;
        this.betAreas[area] += betGold;
    }
    async bet(bets) {
        this.gold -= (0, utils_1.sum)(bets);
        for (let area in bets) {
            this.betHistory(area, bets[area]);
        }
    }
    async addGold(winGold, odds, lotteryResult, details, room) {
        const record = (0, roomUtil_1.buildRecordResult)(lotteryResult.data);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo((0, utils_2.genRoundId)(room.nid, room.roomId, this.uid), 1)
            .addResult(record)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(details, record))
            .setGameRecordInfo(this.totalBet, this.totalBet, winGold - this.totalBet, false)
            .sendToDB(1);
        this.gold = gold;
        this.profit = winGold;
        this.totalProfit += playerRealWin;
        return playerRealWin;
    }
    buildLiveRecord(areas, record) {
        return {
            uid: this.uid,
            areas,
            result: record
        };
    }
    buildResult(winArea, settlement_info) {
        let settleDetails = {};
        for (let area in this.betAreas) {
            settleDetails[area] = winArea[area] ? { win: winArea[area], bet: this.betAreas[area] } :
                { win: -(this.betAreas[area]), bet: this.betAreas[area] };
        }
        return {
            uid: this.uid,
            area: settleDetails,
            settlement_info
        };
    }
}
exports.default = Player;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvRnJ1aXRNYWNoaW5lL2xpYi9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBbUM7QUFFbkMsZ0RBQWdEO0FBQ2hELDhDQUFrRDtBQUNsRCxtRkFBaUY7QUFDakYsc0ZBQStFO0FBWS9FLE1BQXFCLE1BQU8sU0FBUSwyQkFBaUI7SUFRakQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQVJoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUErQixFQUFFLENBQUM7UUFDMUMsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUtuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFLRCxJQUFJO1FBQ0EsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFLRCxVQUFVLENBQUMsSUFBOEI7UUFDckMsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDbkIsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDbkQsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBQSxXQUFHLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBTUQs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