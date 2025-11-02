"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../../../utils/index");
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class Player extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.totalProfit = [];
        this.totalBet = [];
        this.winRound = 0;
        this.initgold = 0;
        this.profit = 0;
        this.bet = 0;
        this.isWang = false;
        this.betArea = {};
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.betDetails = {};
        this.initgold = this.gold;
    }
    init() {
        if (this.bet) {
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.standbyRounds = 0;
        }
        else {
            this.standbyRounds++;
        }
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.profit = 0;
        this.bet = 0;
        this.isWang = false;
        this.betArea = {};
        this.betDetails = {};
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.initControlType();
    }
    bets(roomInfo, area, bet) {
        let isExit = roomInfo.area[area].arr.find(m => m.uid == this.uid);
        if (isExit) {
            isExit.bet += bet;
        }
        else {
            roomInfo.area[area].arr.push({ uid: this.uid, bet: bet });
        }
        this.addBetInfo(area, bet);
        roomInfo.area[area].allBet += bet;
        roomInfo.allBet += bet;
        this.bet += bet;
    }
    addBetInfo(area, bet) {
        if (!this.betArea[area]) {
            this.betArea[area] = 0;
        }
        this.betArea[area] += bet;
    }
    strip() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
        };
    }
    strip1() {
        return {
            uid: this.uid,
            gold: this.gold,
            headurl: this.headurl,
            nickname: this.nickname,
            profit: this.profit,
            isWang: this.isWang,
        };
    }
    strip2() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            profit: this.profit,
            headurl: this.headurl,
            bet: this.bet,
            gold: utils.sum(this.gold),
        };
    }
    checkOverrunBet(params) {
        const transfiniteCondition = params.condition * 100;
        let controlArea = {};
        if (transfiniteCondition === 0)
            return controlArea;
        for (let index in this.betArea) {
            controlArea[index] = this.betArea[index] >= transfiniteCondition ? commonConst_1.CommonControlState.LOSS : commonConst_1.CommonControlState.RANDOM;
        }
        return controlArea;
    }
    setControlState(params) {
        this.controlState = params.state;
    }
    getBetAreas() {
        return this.betArea;
    }
    async updateGold(roomInfo, index) {
        const { gold } = await (0, RecordGeneralManager_1.default)()
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.bet), Math.abs(this.bet), this.profit - this.bet, false)
            .setGameRecordLivesResult(this.buildLiveRecord(index))
            .sendToDB(1);
        this.gold = gold;
        this.initgold = this.gold;
    }
    buildLiveRecord(index) {
        return {
            uid: this.uid,
            areas: this.betDetails,
            index
        };
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2FvaHVhamkvbGliL1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUErQztBQUMvQyx1RUFBb0U7QUFDcEUsa0ZBQXNGO0FBRXRGLG1GQUFpRjtBQUVqRixNQUFxQixNQUFPLFNBQVEsdUJBQVU7SUFrQjFDLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFmaEIsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFHM0IsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUt4QixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBS2IsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdqQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUViLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsZ0NBQWtCLENBQUMsTUFBTSxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBR0QsSUFBSTtRQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxD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