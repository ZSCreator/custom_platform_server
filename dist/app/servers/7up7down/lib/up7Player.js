"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const util = require("../../../utils/index");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const JsonConfig = require("../../../pojo/JsonConfig");
const MessageService = require("../../../services/MessageService");
class up7Player extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.profit = 0;
        this.totalProfit = [];
        this.bet = 0;
        this.totalBet = [];
        this.bets = {};
        this.betAreas = [];
        this.lastBets = [];
        this.entryTime = new Date().getTime();
        this.lastGain = 0;
        this.winRound = 0;
        this.initgold = 0;
        this.initgold = this.gold;
    }
    up7Init() {
        this.standbyRounds++;
        if (this.bet > 0) {
            this.totalBet.push(this.bet);
            this.totalProfit.push(this.profit);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.lastBets = this.betAreas;
            this.standbyRounds = 0;
        }
        this.betAreas = [];
        this.bets = {};
        this.bet = 0;
        this.profit = 0;
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.initControlType();
    }
    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            money: util.sum(this.gold),
            totalProfit: util.sum(this.totalProfit),
            gold: this.gold,
            bet: this.bet,
            lastGain: this.lastGain,
        };
    }
    strip1() {
        return {
            uid: this.uid,
            bet: this.bet,
        };
    }
    strip2() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            bet: this.bet,
            profit: this.profit,
            language: this.language
        };
    }
    playerBet(roomInfo, RecordBets) {
        let situation = roomInfo.situations.find(c => c.area == RecordBets.area);
        situation.totalBet += RecordBets.bet;
        situation.betList.push({ uid: this.uid, bet: RecordBets.bet });
        if (this.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
            roomInfo.realPlayerTotalBet += RecordBets.bet;
        this.gold -= RecordBets.bet;
        this.bet += RecordBets.bet;
        this.betAreas.push(RecordBets);
        if (!this.bets[RecordBets.area])
            this.bets[RecordBets.area] = { bet: 0, profit: 0 };
        this.bets[RecordBets.area].bet += RecordBets.bet;
    }
    isCanRenew() {
        if (this.isRobot == 2) {
            return 0;
        }
        let tatalBet = this.lastBets.reduce((total, Value) => {
            total += Value.bet;
            return total;
        }, 0);
        if (tatalBet > this.gold) {
            return 0;
        }
        return this.lastBets.length;
    }
    checkOverrunBet(condition) {
        let transfiniteArea = {}, transfiniteCondition = condition * 100;
        if (transfiniteCondition === 0)
            return transfiniteArea;
        for (let area in this.bets) {
            if (this.bets[area].bet >= transfiniteCondition) {
                transfiniteArea[area] = this.bets[area].bet;
            }
        }
        return transfiniteArea;
    }
    getOverrunBetAreas(killCondition) {
        const areas = [];
        for (let areaName in this.bets) {
            if (this.bets[areaName].bet > killCondition) {
                areas.push(areaName);
            }
        }
        return areas;
    }
    async updateGold(roomInfo) {
        roomInfo.endTime = Date.now();
        try {
            const res = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setControlType(this.controlType)
                .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
                .setGameRecordLivesResult(roomInfo.buildPlayerGameRecord(this.uid))
                .addResult(roomInfo.zipResult)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
            if (this.profit >= 100000) {
                const zname = JsonConfig.get_games(roomInfo.nid).zname;
                MessageService.sendBigWinNotice(roomInfo.nid, this.nickname, this.profit, this.isRobot, this.headurl);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.default = up7Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXA3UGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvN3VwN2Rvd24vbGliL3VwN1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVFQUFvRTtBQUNwRSw2Q0FBNkM7QUFHN0MsdUVBQW9FO0FBRXBFLG1GQUFpRjtBQUNqRix1REFBd0Q7QUFDeEQsbUVBQW9FO0FBR3BFLE1BQXFCLFNBQVUsU0FBUSx1QkFBVTtJQXVCN0MsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQXRCZixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGdCQUFXLEdBQWEsRUFBRSxDQUFDO1FBRTNCLFFBQUcsR0FBVyxDQUFDLENBQUM7UUFFaEIsYUFBUSxHQUFhLEVBQUUsQ0FBQztRQUV4QixTQUFJLEdBQXdELEVBQUUsQ0FBQztRQUUvRCxhQUFRLEdBQW9DLEVBQUUsQ0FBQztRQUUvQyxhQUFRLEdBQW9DLEVBQUUsQ0FBQztRQUUvQyxjQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUdqQyxhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBQ3JCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFFckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdqQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFD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