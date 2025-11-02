"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackPlayerHistory = void 0;
class BlackJackPlayerHistory {
    constructor() {
        this.betAreaList = [0, 0, 0];
        this.separateBetAreaList = [0, 0, 0];
        this.betTotal = 0;
        this.pokerList = [[], [], []];
        this.pokerCountList = [0, 0, 0];
        this.separatePokerList = [[], [], []];
        this.separatePokerCountList = [0, 0, 0];
        this.dealerPokerList = [];
        this.dealerPokerCount = 0;
    }
    setBetAreaList(betAreaList) {
        for (let idx = 0; idx < betAreaList.length; idx++) {
            const betArea = betAreaList[idx];
            this.betAreaList[idx] = betArea.getCurrentBet();
            const { pokerList, countList } = betArea.getPokerAndCount();
            this.pokerList[idx] = pokerList;
            this.pokerCountList[idx] = countList[0];
        }
        return this;
    }
    setSeparateBetAreaList(betAreaList) {
        for (let idx = 0; idx < betAreaList.length; idx++) {
            const betArea = betAreaList[idx];
            this.separateBetAreaList[idx] = betArea.getCurrentBet();
            const { pokerList, countList } = betArea.getPokerAndCount();
            this.separatePokerList[idx] = pokerList;
            this.separatePokerCountList[idx] = countList[0] || 0;
        }
        return this;
    }
    setBetTotal(bet) {
        this.betTotal = bet;
        return this;
    }
    setDealerArea({ pokerList, countList }) {
        this.dealerPokerList = pokerList;
        this.dealerPokerCount = countList[0];
        return this;
    }
}
exports.BlackJackPlayerHistory = BlackJackPlayerHistory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUGxheWVySGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvQmxhY2tKYWNrUGxheWVySGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxNQUFhLHNCQUFzQjtJQUFuQztRQUdZLGdCQUFXLEdBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUd2Qyx3QkFBbUIsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRy9DLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFHYixjQUFTLEdBQXlCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUcvQyxtQkFBYyxHQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFHMUMsc0JBQWlCLEdBQXlCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUd2RCwyQkFBc0IsR0FBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBR2xELG9CQUFlLEdBQWtCLEVBQUUsQ0FBQztRQUdwQyxxQkFBZ0IsR0FBVyxDQUFDLENBQUM7SUErQ3pDLENBQUM7SUE3Q0csY0FBYyxDQUFDLFdBQW9DO1FBQy9DLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQy9DLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUdqQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUdoRCxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELHNCQUFzQixDQUFDLFdBQW9DO1FBQ3ZELEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQy9DLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUdqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBR3hELE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQztZQUN4QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4RDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxXQUFXLENBQUMsR0FBVztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUVwQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtRQUVsQyxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQTFFRCx3REEwRUMifQ==