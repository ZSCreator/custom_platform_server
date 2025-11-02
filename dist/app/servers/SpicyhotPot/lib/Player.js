"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
const recordUtil_1 = require("./util/recordUtil");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const slotMachinePlayer_1 = require("../../../common/classes/game/slotMachinePlayer");
const MessageService_1 = require("../../../services/MessageService");
class Player extends slotMachinePlayer_1.default {
    constructor(opts) {
        super(opts);
        this.gold = opts.gold;
        this.profit = 0;
        this.totalProfit = 0;
        this.totalBet = 0;
        this.online = true;
        this.betArea1 = 0;
        this.betArea2 = 0;
        this.betArea3 = 0;
        this.betAreas = [
            { bet: 100, Area: [0, 0, 0] },
            { bet: 500, Area: [0, 0, 0] },
            { bet: 1000, Area: [0, 0, 0] },
            { bet: 5000, Area: [0, 0, 0] },
            { bet: 10000, Area: [0, 0, 0] },
        ];
    }
    init() {
        this.profit = 0;
        this.totalBet = 0;
        this.initControlType();
    }
    isOnline() {
        return this.online;
    }
    updateRoundId(room) {
        this.roundId = (0, utils_1.genRoundId)(room.nid, room.roomId, this.uid);
    }
    upOnlineTrue() {
        this.online = true;
        this.leaveCount = 0;
    }
    upOnlineFlase() {
        this.online = false;
    }
    checkPlayerOnline() {
        return this.leaveCount >= 10;
    }
    betHistory(area, betGold) {
        this.totalBet += betGold;
        if (!this.betAreas[area])
            this.betAreas[area] = 0;
        this.betAreas[area] += betGold;
    }
    async deductGold(gold) {
        this.totalBet = gold;
        return true;
    }
    async addGold(totalWin, BZProfit, lotteryResult, lotteryDetails, awardType, room) {
        const record = (0, recordUtil_1.buildRecordResult)(awardType, BZProfit, lotteryResult, lotteryDetails, this.totalBet);
        const { playerRealWin, gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.gold)
            .setGameInfo(room.nid, room.sceneId, room.roomId)
            .setGameRoundInfo(this.roundId, 1)
            .addResult(record)
            .setControlType(this.controlType)
            .setGameRecordLivesResult(this.buildLiveRecord(record))
            .setGameRecordInfo(this.totalBet, this.totalBet, totalWin + BZProfit - this.totalBet, false)
            .sendToDB(1);
        this.gold = gold;
        this.profit = playerRealWin + this.totalBet;
        this.totalProfit += this.profit - this.totalBet;
        if (this.profit / this.totalBet > 20 && this.profit >= 100000) {
            (0, MessageService_1.sendBigWinNotice)(room.nid, this.nickname, this.profit, this.isRobot, this.headurl);
        }
        return { playerRealWin: playerRealWin - BZProfit, reBZProfit: BZProfit };
    }
    strip() {
        return {
            gold: this.gold,
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            totalProfit: this.totalProfit,
            robot: this.isRobot,
            totalBet: this.totalBet,
        };
    }
    getBetAreas() {
        return {
            betAreas: this.betAreas,
        };
    }
    buildLiveRecord(result) {
        return {
            uid: this.uid,
            result
        };
    }
}
exports.default = Player;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvU3BpY3lob3RQb3QvbGliL1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUFnRDtBQUVoRCxrREFBb0Q7QUFDcEQsbUZBQWlGO0FBQ2pGLHNGQUErRTtBQUMvRSxxRUFBa0U7QUFHbEUsTUFBcUIsTUFBTyxTQUFRLDJCQUFpQjtJQVlqRCxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRVosSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUM3QixFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUM3QixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUM5QixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFF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