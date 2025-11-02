"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fisheryConst = require("./fisheryConst");
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
class Player extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.bet = 0;
        this.totalBet = [];
        this.profit = 0;
        this.totalProfit = [];
        this.allSeat = {};
        this.betAreas = {};
        this.winRound = 0;
        this.standbyRounds = 0;
        this.brine = {
            self: { bet: 0 },
            shoalSater: {
                self: { bet: 0 },
                fish1: { bet: 0 },
                fish2: { bet: 0 },
                fish3: { bet: 0 }
            },
            deepwater: {
                self: { bet: 0 },
                fish4: { bet: 0 },
                fish5: { bet: 0 },
                fish6: { bet: 0 }
            }
        };
        this.freshWater = { self: { bet: 0 } };
        this.fightFlood = {
            self: { bet: 0 },
            watch: {
                self: { bet: 0 },
                fish7: { bet: 0 },
                fish8: { bet: 0 },
                fish9: { bet: 0 }
            },
            rare: {
                self: { bet: 0 },
                fish10: { bet: 0 },
                fish11: { bet: 0 },
                fish12: { bet: 0 }
            }
        };
        this.bet = 0;
        this.profit = 0;
        this.allSeat = {};
        this.isBet = false;
        this.isContinue = false;
        this.allWinArea = [];
        this.betWinArea = [];
        this.betAreas = {};
        this.validBet = 0;
    }
    initPlayer() {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet) {
            this.standbyRounds = 0;
            this.totalProfit.push(this.profit > 0 ? this.profit : 0);
            this.totalBet.push(this.bet);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
        }
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
        this.betAreas = {};
        this.validBet = 0;
        this.brine = {
            self: { bet: 0 },
            shoalSater: {
                self: { bet: 0 },
                fish1: { bet: 0 },
                fish2: { bet: 0 },
                fish3: { bet: 0 }
            },
            deepwater: {
                self: { bet: 0 },
                fish4: { bet: 0 },
                fish5: { bet: 0 },
                fish6: { bet: 0 }
            }
        };
        this.freshWater = { self: { bet: 0 } };
        this.fightFlood = {
            self: { bet: 0 },
            watch: {
                self: { bet: 0 },
                fish7: { bet: 0 },
                fish8: { bet: 0 },
                fish9: { bet: 0 }
            },
            rare: {
                self: { bet: 0 },
                fish10: { bet: 0 },
                fish11: { bet: 0 },
                fish12: { bet: 0 }
            }
        };
        this.bet = 0;
        this.profit = 0;
        this.isContinue = false;
        this.isBet = false;
        this.allWinArea = [];
        this.betWinArea = [];
    }
    betHistory(area, gold) {
        if (!this.betAreas[area])
            this.betAreas[area] = 0;
        this.betAreas[area] += gold;
    }
    validBetCount(betNumber) {
        this.validBet = betNumber;
    }
    betCheck(gold) {
        return this.bet + gold > fisheryConst.betLimit;
    }
    playerFisheryBet(gold, roomInfo, seat, seat_) {
        this.betHistory(seat_, gold);
        !this.betWinArea.includes(seat_) && this.betWinArea.push(seat_);
        let isSeat = seat.indexOf('-');
        let roomArea;
        if (isSeat >= 0) {
            let Seat_arr = seat.split('-');
            if (Seat_arr.length == 3) {
                try {
                    roomArea = roomInfo[Seat_arr[0]][Seat_arr[1]][Seat_arr[2]];
                    this[Seat_arr[0]][Seat_arr[1]][Seat_arr[2]].bet += gold;
                    roomArea.allbet += gold;
                }
                catch (error) {
                    console.error(error);
                }
            }
            else {
                roomArea = roomInfo[Seat_arr[0]][Seat_arr[1]].self;
                this[Seat_arr[0]][Seat_arr[1]].self.bet += gold;
                roomArea.allbet += gold;
            }
        }
        else {
            this[seat].self.bet += gold;
            roomArea = roomInfo[seat].self;
            roomArea.allbet += gold;
        }
        let isExitPlayer = roomArea.allPeople.find(m => m && m.uid == this.uid);
        if (isExitPlayer) {
            isExitPlayer.bet += gold;
        }
        else {
            roomArea.allPeople.push({ uid: this.uid, bet: gold });
        }
        this.bet += gold;
    }
    continueGolds(roomInfo) {
        for (let x in this.allSeat) {
            this.playerFisheryBet(this.allSeat[x], roomInfo, fisheryConst.SEAT[x], x);
        }
        this.isContinue = true;
    }
    recordBetSeat(gold, seat_) {
        if (this.allSeat[seat_] === undefined) {
            this.allSeat[seat_] = gold;
        }
        else {
            this.allSeat[seat_] += gold;
        }
    }
    stip() {
        return {
            uid: this.uid,
            gold: this.gold - this.profit,
            profit: this.profit,
            headurl: this.headurl,
            nickname: this.nickname,
            allWinArea: this.allWinArea
        };
    }
    mailStrip() {
        return {
            uid: this.uid,
            profit: this.profit,
            nickname: this.nickname
        };
    }
    checkOverrunBet(killCondition) {
        const areas = {};
        for (let key in this.brine) {
            if (key === 'self' && this.brine.self.bet >= killCondition) {
                areas['brine'] = this.brine.self.bet;
            }
            else {
                for (let shallow in this.brine[key]) {
                    if (shallow === 'self' && this.brine[key].self.bet >= killCondition) {
                        areas[key] = this.brine[key].self.bet;
                    }
                    else {
                        if (this.brine[key][shallow].bet >= killCondition) {
                            areas[shallow] = this.brine[key][shallow].bet;
                        }
                    }
                }
            }
        }
        for (let key in this.fightFlood) {
            if (key === 'self' && this.fightFlood.self.bet >= killCondition) {
                areas['fightFlood'] = this.fightFlood.self.bet;
            }
            else {
                for (let shallow in this.fightFlood[key]) {
                    if (shallow === 'self' && this.fightFlood[key].self.bet >= killCondition) {
                        areas[key] = this.fightFlood[key].self.bet;
                    }
                    else {
                        if (this.fightFlood[key][shallow].bet >= killCondition) {
                            areas[shallow] = this.fightFlood[key][shallow].bet;
                        }
                    }
                }
            }
        }
        if (this.freshWater.self.bet >= killCondition) {
            areas['freshWater'] = this.freshWater.self.bet;
        }
        return areas;
    }
}
exports.default = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZlBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Zpc2hlcnkvbGliL2ZQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQ0FBZ0Q7QUFDaEQsdUVBQW9FO0FBRXBFLE1BQXFCLE1BQU8sU0FBUSx1QkFBVTtJQTRDMUMsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXBCaEIsUUFBRyxHQUFXLENBQUMsQ0FBQztRQUVoQixhQUFRLEdBQWEsRUFBRSxDQUFDO1FBRXhCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFFM0IsWUFBTyxHQUErQixFQUFFLENBQUM7UUFLekMsYUFBUSxHQUErQixFQUFFLENBQUM7UUFHMUMsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUViLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBR2QsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNULElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7WUFDaEIsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hCLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQ2pCLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQ2pCLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7YUFDcEI7WUFDRCxTQUFTLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtnQkFDaEIsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtnQkFDakIsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTtnQkFDakIsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRTthQUNwQjtTQUNKLENB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