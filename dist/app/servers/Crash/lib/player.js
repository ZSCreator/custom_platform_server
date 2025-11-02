"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const MessageService_1 = require("../../../services/MessageService");
class Player extends PlayerInfo_1.PlayerInfo {
    constructor(opt) {
        super(opt);
        this.totalBet = 0;
        this.profit = 0;
        this.winRoundCount = 0;
        this.check = false;
        this.result = 0;
        this.auto = 1;
        this.takeProfitPoint = 0;
    }
    init() {
        if (this.totalBet) {
            this.standbyRounds = 0;
        }
        else {
            this.standbyRounds++;
        }
        this.auto = 1;
        this.profit = 0;
        this.totalBet = 0;
        this.result = 0;
        this.check = false;
        this.initControlType();
    }
    setNotAuto() {
        this.auto = 0;
    }
    addBets(num) {
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
    setTakeProfitPoint(num) {
        this.takeProfitPoint = num;
    }
    async settlement(room) {
        this.check = true;
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
    isTaken() {
        return this.check;
    }
    addProfit(result, done) {
        this.profit += done ? this.calculateProfit(0) : this.calculateProfit(result);
        this.result = result;
    }
    getProfit() {
        return this.profit;
    }
    calculateProfit(result) {
        const profit = this.totalBet * result;
        return profit === 0 ? -this.totalBet : profit - this.totalBet;
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
    isRealPlayerAndBet() {
        return this.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER && this.totalBet > 0;
    }
    settlementResult() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            result: this.result,
            takeProfitPoint: this.takeProfitPoint
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
    buildLiveRecord(room) {
        let auto = this.auto;
        if (this.takeProfitPoint === 0) {
            auto = 0;
        }
        return {
            uid: this.uid,
            result: `${auto}|${this.result}`,
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvQ3Jhc2gvbGliL3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFrRTtBQUVsRSx1RUFBa0U7QUFDbEUsbUZBQWlGO0FBQ2pGLHFFQUFrRTtBQWFsRSxNQUFxQixNQUFPLFNBQVEsdUJBQVU7SUFTMUMsWUFBWSxHQUFRO1FBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQVRQLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUNuQixrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsU0FBSSxHQUFXLENBQUMsQ0FBQztRQUN6QixvQkFBZSxHQUFXLENBQUMsQ0FBQztJQUk1QixDQUFDO0lBS0QsSUFBSTtRQUVBLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO2FBQU07WUFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDeEI7UUFFRCxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBS0QsVUFBVTtRQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFNRCxPQUFPLENBQUMsR0FBVztRQUNmLElBQUksQ0FBQyxRQUFRLElBQUksR0FB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