"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackPlayerImpl = void 0;
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const BlackJackPlayerStatusEnum_1 = require("./enum/BlackJackPlayerStatusEnum");
const BlackJackPlayerRoleEnum_1 = require("./enum/BlackJackPlayerRoleEnum");
const BlackJackBetArea_1 = require("./expansion/BlackJackBetArea");
const BlackJackPlayerInsuranceArea_1 = require("./expansion/playerExpansion/BlackJackPlayerInsuranceArea");
class BlackJackPlayerImpl extends PlayerInfo_1.PlayerInfo {
    constructor(opts) {
        super(opts);
        this.status = BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.None;
        this.seatNum = 0;
        this.totalBet = 0;
        this.winRound = 0;
        this.profitQueue = [];
        this.commonAreaBetList = [];
        this.hadBuyInsurance = false;
        this.insuranceAreaList = [];
        this.canSeparate = false;
        this.hadSeparate = false;
        this.separateAreaBetList = [];
        this.canAction = false;
        this.betHistory = [0, 0, 0];
        const { role, seatNum } = opts;
        this.role = role || BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player;
        this.seatNum = seatNum || 1;
        this.standbyRounds = 0;
        this.commonAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        this.separateAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        this.insuranceAreaList = Array.from({ length: 3 }).map(() => new BlackJackPlayerInsuranceArea_1.BlackJackPlayerInsuranceArea());
        this.actionList = {
            multiple: true,
            continueBet: false,
            insurance: false,
            separate: false
        };
    }
    initRunData() {
        this.status = BlackJackPlayerStatusEnum_1.BlackJackPlayerStatusEnum.Ready;
        this.totalBet = 0;
        this.commonAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        this.insuranceAreaList = Array.from({ length: 3 }).map(() => new BlackJackPlayerInsuranceArea_1.BlackJackPlayerInsuranceArea());
        this.hadBuyInsurance = false;
        this.canSeparate = false;
        this.hadSeparate = false;
        this.separateAreaBetList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(0));
        this.actionList.multiple = true;
        this.actionList.insurance = false;
        this.actionList.separate = false;
        this.initControlType();
    }
    getCurrentGold() {
        const commonBet = this.commonAreaBetList.reduce((totalBet, area) => totalBet += area.getCurrentBet(), 0);
        const separateBet = this.separateAreaBetList.reduce((totalBet, area) => totalBet += area.getCurrentBet(), 0);
        const insuranceBet = this.insuranceAreaList.reduce((totalBet, area) => {
            if (area.checkBuyInsurance()) {
                totalBet += area.getBet();
            }
            return totalBet;
        }, 0);
        return this.gold - commonBet - separateBet - insuranceBet;
    }
    checkPlayerCanBet(bet) {
        if (this.totalBet + bet > this.gold / 2) {
            return false;
        }
        return true;
    }
    getCurrentTotalBet() {
        return this.totalBet;
    }
    bet(areaIdx, bet) {
        this.commonAreaBetList[areaIdx].add(bet);
        this.totalBet += bet;
        this.betHistory[areaIdx] += bet;
    }
    multiple(areaIdx, bet) {
        this.commonAreaBetList[areaIdx].add(bet);
        this.totalBet += bet;
    }
    continueBet(areaIdx, bet) {
        this.commonAreaBetList[areaIdx].add(bet);
        this.totalBet += bet;
    }
    insurance(areaIdx) {
        if (!this.hadBuyInsurance) {
            this.hadBuyInsurance = true;
            this.commonAreaBetList.map((area, i) => {
                const bet = area.getCurrentBet();
                this.insuranceAreaList[i].setBet(bet);
            });
        }
        this.insuranceAreaList[areaIdx].buyInsurance();
    }
    separate(areaIdx) {
        if (!this.hadSeparate) {
            this.hadSeparate = true;
        }
        const commonPokerList = this.commonAreaBetList.map(area => area.getPokerList());
        this.separateAreaBetList.forEach((area, idx) => {
            if (areaIdx === idx) {
                const { basePokerList } = commonPokerList[idx];
                area.addPoker(basePokerList[1]);
            }
        });
        this.commonAreaBetList[areaIdx].setHadSeparate(true);
        if (this.commonAreaBetList[areaIdx].checkHadSeparate()) {
            const bet = this.commonAreaBetList[areaIdx].getCurrentBet();
            this.totalBet += bet;
            this.separateAreaBetList[areaIdx].add(bet);
            this.separateAreaBetList[areaIdx].setHadSeparate(true);
        }
    }
    actionDone(areaIdx, isSeparate = false) {
        if (isSeparate) {
            this.separateAreaBetList[areaIdx].playerHadAction = true;
            this.separateAreaBetList[areaIdx].continueAction = true;
            this.separateAreaBetList[areaIdx].actionComplete = false;
            return;
        }
        this.commonAreaBetList[areaIdx].playerHadAction = true;
        this.commonAreaBetList[areaIdx].continueAction = true;
        this.commonAreaBetList[areaIdx].actionComplete = true;
    }
    playerHadLeave() {
        this.commonAreaBetList = null;
        this.insuranceAreaList = null;
        this.separateAreaBetList = null;
    }
    presettlement(dealerPokerList, dealerCountList, beInsuranceToSettlement = false) {
        let { bet, win, hadSeparate } = this.commonAreaBetList.reduce((result, area, areaIdx) => {
            const { countList, pokerList } = area.getPokerAndCount();
            if (pokerList.length === 0) {
                return result;
            }
            if (area.checkHadSeparate()) {
                result.hadSeparate = true;
            }
            const playerIsBlackJack = countList.some(count => count === 21);
            result.bet += area.getCurrentBet();
            if (this.hadBuyInsurance) {
                result.bet += this.insuranceAreaList[areaIdx].getBet();
            }
            if (beInsuranceToSettlement) {
                result.bet += (area.getCurrentBet() * 0.5);
                if (this.hadBuyInsurance) {
                    result.win += area.getCurrentBet();
                    return result;
                }
                if (playerIsBlackJack) {
                    result.win += area.getCurrentBet();
                    return result;
                }
                return result;
            }
            const dealerPokerCount = Math.max(...dealerCountList);
            const dealerIsBlackJack = dealerCountList.some(count => count === 21);
            const playerPokerCount = Math.max(...countList);
            if (dealerPokerCount <= 21 && playerPokerCount > 21) {
                if (dealerIsBlackJack && dealerPokerList.length === 2) {
                    result.bet += (area.getCurrentBet() * 0.5);
                }
                return result;
            }
            if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                if (playerIsBlackJack && pokerList.length === 2) {
                    result.win += area.getCurrentBet() * 2.5;
                }
                else {
                    result.win += area.getCurrentBet() * 2;
                }
            }
            if (dealerPokerCount > 21 && playerPokerCount > 21) {
                return result;
            }
            if (dealerPokerCount > playerPokerCount) {
                return result;
            }
            if (dealerPokerCount < playerPokerCount) {
                if (playerIsBlackJack && pokerList.length === 2) {
                    result.win += area.getCurrentBet() * 2.5;
                }
                else {
                    result.win += area.getCurrentBet() * 2;
                }
            }
            if (dealerPokerCount === playerPokerCount) {
                result.win += area.getCurrentBet();
                return result;
            }
            return result;
        }, { bet: 0, win: 0, hadSeparate: false });
        if (hadSeparate) {
            const { bet: sepBet, win: sepWin } = this.separateAreaBetList.reduce((result, area, areaIdx) => {
                const { countList, pokerList } = area.getPokerAndCount();
                if (pokerList.length === 0) {
                    return result;
                }
                result.bet += area.getCurrentBet();
                const dealerPokerCount = Math.max(...dealerCountList);
                const playerPokerCount = Math.max(...countList);
                if (dealerPokerCount <= 21 && playerPokerCount > 21) {
                    return result;
                }
                if (dealerPokerCount > 21 && playerPokerCount <= 21) {
                    result.win += area.getCurrentBet() * 2;
                    return result;
                }
                if (dealerPokerCount > 21 && playerPokerCount > 21) {
                    return result;
                }
                if (dealerPokerCount > playerPokerCount) {
                    return result;
                }
                if (dealerPokerCount < playerPokerCount) {
                    result.win += area.getCurrentBet() * 2;
                    return result;
                }
                if (dealerPokerCount === playerPokerCount) {
                    result.win += area.getCurrentBet();
                    return result;
                }
                return result;
            }, { bet, win });
            bet = sepBet;
            win = sepWin;
        }
        return win - bet;
    }
}
exports.BlackJackPlayerImpl = BlackJackPlayerImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUGxheWVySW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvQmxhY2tKYWNrUGxheWVySW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1RUFBb0U7QUFDcEUsZ0ZBQTZFO0FBQzdFLDRFQUF5RTtBQUN6RSxtRUFBZ0U7QUFDaEUsMkdBQXdHO0FBR3hHLE1BQWEsbUJBQW9CLFNBQVEsdUJBQVU7SUFnRC9DLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUEzQ2hCLFdBQU0sR0FBOEIscURBQXlCLENBQUMsSUFBSSxDQUFDO1FBR25FLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFHcEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR3JCLGdCQUFXLEdBQWtCLEVBQUUsQ0FBQztRQUdoQyxzQkFBaUIsR0FBNEIsRUFBRSxDQUFDO1FBR2hELG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBR2pDLHNCQUFpQixHQUF3QyxFQUFFLENBQUM7UUFHNUQsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFHN0IsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFHN0Isd0JBQW1CLEdBQTRCLEVBQUUsQ0FBQztRQUdsRCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBTTNCLGVBQVUsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBTWxDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLGlEQUF1QixDQUFDLE1BQU0sQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIs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