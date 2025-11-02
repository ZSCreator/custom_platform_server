"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class benzPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.bet = 0;
        this.totalBet = [];
        this.profit = 0;
        this.totalProfit = [];
        this.betList = [];
        this.lastBets = [];
        this.forceZhuang = false;
        this.commission = 0;
        this.winRound = 0;
        this.standbyRounds = 0;
        this.initgold = 0;
        this.gold = opts.gold;
        this.commission = 0;
        this.initgold = this.gold;
    }
    playerInit() {
        this.standbyRounds++;
        if (this.bet) {
            this.standbyRounds = 0;
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.winRound = this.totalProfit.reduce((total, Value) => {
                if (Value > 0) {
                    total++;
                }
                return total;
            }, 0);
            this.lastBets = this.betList;
        }
        this.betList = [];
        this.bet = 0;
        this.profit = 0;
        this.commission = 0;
        this.initControlType();
    }
    handler_bet(roomInfo, betList) {
        for (const bet_e of betList) {
            roomInfo.totalBet += bet_e.bet;
            let situation = roomInfo.situations.find(m => m.area == bet_e.area);
            if (!situation) {
                roomInfo.situations.push({ area: bet_e.area, betList: [], totalBet: 0 });
                situation = roomInfo.situations.find(m => m.area == bet_e.area);
            }
            situation.betList.push({
                uid: this.uid,
                bet: bet_e.bet,
                updatetime: new Date().getTime() / 1000
            });
            situation.totalBet += bet_e.bet;
            this.bet += bet_e.bet;
            this.gold -= bet_e.bet;
            this.betList.push({ area: bet_e.area, bet: bet_e.bet, profit: 0 });
        }
        const opts = {
            bet: betList,
            rankingList: roomInfo.rankingLists().slice(0, 6)
        };
        roomInfo.channelIsPlayer("Benz.OtherBets", opts);
    }
    strip(hasRound) {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            totalProfit: this.totalProfit,
            hasRound: hasRound,
            online: this.onLine,
            isRobot: this.isRobot,
            bet: this.bet,
        };
    }
    mailStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            gain: this.profit,
        };
    }
    async addGold(roomInfo) {
        let result = {
            uid: this.uid,
            lotterys: roomInfo.lotterys,
            regions_chang_gold: this.betList
        };
        result.regions_chang_gold = [];
        for (const eee of this.betList) {
            if (!result.regions_chang_gold.find(c => c.area == eee.area)) {
                result.regions_chang_gold.push({ area: eee.area, bet: 0, profit: 0 });
            }
            let temp = result.regions_chang_gold.find(c => c.area == eee.area);
            temp.bet += eee.bet;
            temp.profit += eee.profit;
        }
        let validBet = this.bet;
        if (Math.abs(this.profit) > this.bet && this.profit < 0) {
            validBet = Math.abs(this.profit);
        }
        try {
            const res = await (0, RecordGeneralManager_1.default)()
                .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
                .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
                .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
                .setGameRecordInfo(Math.abs(this.bet), validBet, this.profit, false)
                .addResult(roomInfo.zipResult)
                .setControlType(this.controlType)
                .setGameRecordLivesResult(result)
                .sendToDB(1);
            this.profit = res.playerRealWin;
            this.gold = res.gold;
            this.initgold = this.gold;
        }
        catch (error) {
            console.warn(this.gold, this.profit, this.bet);
        }
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
        const areas = {};
        const bets = {};
        this.betList.forEach(lattice => {
            if (!bets[lattice.area]) {
                bets[lattice.area] = 0;
            }
            bets[lattice.area] += lattice.bet;
        });
        for (let area in bets) {
            if (bets[area] >= condition) {
                areas[area] = bets[area];
            }
        }
        return areas;
    }
}
exports.default = benzPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuelBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JlbnpCbXcvbGliL2JlbnpQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFHcEUsbUZBQWlGO0FBRWpGLE1BQXFCLFVBQVcsU0FBUSx1QkFBVTtJQXNCOUMsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXJCaEIsUUFBRyxHQUFXLENBQUMsQ0FBQztRQUVoQixhQUFRLEdBQWEsRUFBRSxDQUFDO1FBRXhCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFFM0IsWUFBTyxHQUFnRSxFQUFFLENBQUM7UUFFMUUsYUFBUSxHQUFnRSxFQUFFLENBQUM7UUFFM0UsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFFN0IsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUN2QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBR0QsVUFBVTtRQUNOLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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