"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackRuntimeData = void 0;
const GameUtil_1 = require("../../../../../utils/GameUtil");
const BlackJackBetArea_1 = require("../BlackJackBetArea");
const BlackJackPlayerRoleEnum_1 = require("../../enum/BlackJackPlayerRoleEnum");
const pinus_logger_1 = require("pinus-logger");
const robotlogger = (0, pinus_logger_1.getLogger)("server_out", __filename);
class BlackJackRuntimeData {
    constructor(room) {
        this.countdown = 0;
        this.pokerPool = [];
        this.totalBet = 0;
        this.commonAreaList = [];
        this.separateAreaList = [];
        this.insuranceCountdown = 3;
        this.betCountdown = 10;
        this.pokerPoolRound = 0;
        this.dealerPreparePoker = [];
        this.distPoker = [0, 13, 26, 39];
        this.room = room;
        const maxBet = this.room.areaMaxBet;
        this.dealerArea = new BlackJackBetArea_1.BlackJackBetArea(maxBet);
        this.commonAreaList.push(new BlackJackBetArea_1.BlackJackBetArea(maxBet), new BlackJackBetArea_1.BlackJackBetArea(maxBet), new BlackJackBetArea_1.BlackJackBetArea(maxBet));
    }
    initRuntimeData() {
        this.seatList = Array.from({ length: this.room.roomUserLimit }).map(() => null);
        this.restPokerPool();
        this.resetRoomInfoAndRestart();
        this.dealerPreparePoker = [];
    }
    sitInSeat(player) {
        const idx = this.seatList.findIndex((val) => val === null);
        if (idx < 0) {
            robotlogger.warn(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${player.uid} | 玩家身份 isRobot : ${player.isRobot} | 游戏身份 role: ${player.role} | 坐进位置: ${idx + 1} | 出错 - 没有空位 `);
            return false;
        }
        this.seatList[idx] = player.uid;
        return idx + 1;
    }
    leaveSeat(uid) {
        const idx = this.seatList.findIndex((val) => val === uid);
        if (idx < 0) {
            robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${uid} | 离开位置: ${idx + 1} | 出错 - 并不在座位上 `);
            return false;
        }
        this.seatList[idx] = null;
        return true;
    }
    getSeatNumByUid(uid) {
        const idx = this.seatList.findIndex((val) => val === uid);
        if (idx < 0) {
            robotlogger.warn(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${uid} | 离开位置: ${idx + 1} | 出错 - 并不在座位上 `);
            return "未落座";
        }
        return idx;
    }
    getCurrentCountdown() {
        return this.countdown;
    }
    decreaseToCountDown() {
        this.countdown--;
    }
    setDealerPreparePoker(dealerPreparePoker) {
        this.dealerPreparePoker = dealerPreparePoker;
    }
    reserveDealerPoker() {
        this.dealerArea.reserveTwoPoker();
    }
    reserveDealerOnePoker() {
        this.dealerArea.reserveOnePoker();
    }
    getDealerResidualPoker() {
        return this.dealerArea.getResidualPoker();
    }
    checkAreaCanBet(areaIdx, bet) {
        const targetArea = this.commonAreaList[areaIdx];
        return targetArea.checkPlayerCanBet(bet);
    }
    betIntoCommonByAreaIdx(areaIdx, bet) {
        this.commonAreaList[areaIdx].add(bet);
        this.totalBet += bet;
    }
    betIntoBySeparateAreaIdx(areaIdx, bet) {
        this.separateAreaList[areaIdx].add(bet);
        this.totalBet += bet;
    }
    getTotalBetByAreaIdx(areaIdx) {
        return this.commonAreaList[areaIdx].getCurrentBet() + (this.separateAreaList.length === 0 ? 0 : this.separateAreaList[areaIdx].getCurrentBet());
    }
    checkBettingToPlayer() {
        if (this.totalBet === 0) {
            return false;
        }
        return true;
    }
    copyPokerFromCommonArea() {
        return this.commonAreaList.map(area => area.getPokerList());
    }
    pasteSeparateAreaFromCommonArea(areaIdx) {
        if (this.separateAreaMap.has(areaIdx)) {
            return;
        }
        this.separateAreaMap.add(areaIdx);
        const commonPokerList = this.commonAreaList.map(area => area.getPokerList());
        this.separateAreaList.forEach((area, idx) => {
            if (areaIdx === idx) {
                const firstPoker = commonPokerList[idx].basePokerList[0];
                area.addPoker(firstPoker);
            }
        });
    }
    restPokerPool() {
        this.pokerPool = (0, GameUtil_1.getPai)(5);
        this.pokerPoolRound++;
    }
    getOnePokerFromPokerPool() {
        if (this.pokerPool.length === 0) {
            this.restPokerPool();
        }
        const poker = this.pokerPool.shift();
        return poker;
    }
    addPokerIntoCommonAreaByAreaIdx(areaIdx, poker) {
        this.commonAreaList[areaIdx].addPoker(poker);
        const { countList } = this.commonAreaList[areaIdx].getPokerAndCount();
        const maxCount = Math.max(...countList);
        return maxCount;
    }
    addPokerIntoSeparateAreaByAreaIdx(areaIdx, poker) {
        this.separateAreaList[areaIdx].addPoker(poker);
        const { countList } = this.separateAreaList[areaIdx].getPokerAndCount();
        const maxCount = Math.max(...countList);
        return maxCount;
    }
    handoutPokerForCommonArea(role) {
        switch (role) {
            case BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Dealer:
                this.dealerArea.addPoker(this.getOnePokerFromPokerPool());
                break;
            case BlackJackPlayerRoleEnum_1.BlackJackPlayerRoleEnum.Player:
                const { length } = this.commonAreaList;
                for (let i = 0; i < length; i++) {
                    const area = this.commonAreaList[i];
                    if (this.commonAreaList[i].getCurrentBet() === 0) {
                        continue;
                    }
                    area.addPoker(this.getOnePokerFromPokerPool());
                    area.addPoker(this.getOnePokerFromPokerPool());
                }
                break;
            default:
                robotlogger.error(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 公共区域发牌出错 : role - ${role}`);
                break;
        }
    }
    checkChangesToInsurance() {
        return this.distPoker.includes(this.dealerArea.getFirstPoker());
    }
    nextAreaSpeakOnInsurance() {
        const areaIdx = this.room.waitForNoticeAreaListOnInsurance.shift();
        if (typeof areaIdx === "number") {
            const currentCount = this.commonAreaList[areaIdx].getCount();
            if (currentCount === 21) {
                return this.nextAreaSpeakOnInsurance();
            }
            this.setInsuranceCountdown();
            return areaIdx;
        }
        return false;
    }
    nextAreaSpeakOnPlayer() {
        this.setPlayerCountdown();
    }
    dealerHit() {
        this.dealerArea.addPoker(this.getOnePokerFromPokerPool());
        return this.dealerArea.getCount();
    }
    rollbackBankerDeal() {
        this.dealerArea.reserveOnePoker();
    }
    afterDealerHit() {
        this.dealerArea.addPoker(this.dealerPreparePoker.shift());
        return this.dealerArea.getCount();
    }
    resetRoomInfoAndRestart() {
        this.totalBet = 0;
        this.countdown = this.betCountdown;
        const maxBet = this.room.areaMaxBet;
        this.dealerArea = new BlackJackBetArea_1.BlackJackBetArea(maxBet);
        this.commonAreaList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(maxBet));
        this.separateAreaList = Array.from({ length: 3 }).map(() => new BlackJackBetArea_1.BlackJackBetArea(maxBet));
        this.separateAreaMap = new Set();
    }
    setInsuranceCountdown() {
        this.countdown = 3;
    }
    setPlayerCountdown() {
        this.countdown = 5;
    }
    setSettlementCountdown(countdown = 3) {
        this.countdown = countdown;
    }
    getDealerPokerListAndCount() {
        return this.dealerArea.getPokerAndCount();
    }
    getCommonPokerListAndCount() {
        return this.commonAreaList.map(area => area.getPokerAndCount());
    }
    getSeparatePokerListAndCount() {
        return this.separateAreaList.map(area => area.getPokerAndCount());
    }
}
exports.BlackJackRuntimeData = BlackJackRuntimeData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUnVudGltZURhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9CbGFja0phY2svbGliL2V4cGFuc2lvbi9yb29tRXhwYW5zaW9uL0JsYWNrSmFja1J1bnRpbWVEYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDREQUF1RDtBQUN2RCwwREFBdUQ7QUFDdkQsZ0ZBQTZFO0FBQzdFLCtDQUF5QztBQUN6QyxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR3hELE1BQWEsb0JBQW9CO0lBNEM3QixZQUFZLElBQXVCO1FBeEMzQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBS3RCLGNBQVMsR0FBa0IsRUFBRSxDQUFDO1FBTTlCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHckIsbUJBQWMsR0FBNEIsRUFBRSxDQUFDO1FBRzdDLHFCQUFnQixHQUE0QixFQUFFLENBQUM7UUFLL0MsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1FBRy9CLGlCQUFZLEdBQVcsRUFBRSxDQUFDO1FBRzFCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBRzNCLHVCQUFrQixHQUFhLEVBQUUsQ0FBQztRQUtsQyxjQUFTLEdBQWtCLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFLL0MsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFFakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLG1DQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksbUNBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxtQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLG1DQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkgsQ0FBQztJQUlNLGVBQWU7UUFHbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFNaEYsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQU1NLFNBQVMsQ0FBQyxNQUEyQjtRQUN4QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNULFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sVUFBVSxNQUFNLENBQUMsR0FBRyxxQkFBcUIsTUFBTSxDQUFDLE9BQU8saUJBQWlCLE1BQU0sQ0FBQyxJQUFJLFlBQVksR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDOU8sT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFJaEMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFNTSxTQUFTLENBQUMsR0FBVztRQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRTFELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNULFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sVUFBVSxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzSyxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxlQUFlLENBQUMsR0FBVztRQUM5QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRTFELElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNULFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sVUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sVUFBVSxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMxSyxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUtNLG1CQUFtQjtRQUN0QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUtNLG1CQUFtQjtRQUN0QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQU1NLHFCQUFxQixDQUFDLGtCQUFrQjtRQUMzQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7SUFDakQsQ0FBQztJQUtNLGtCQUFrQjtRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFLTSxxQkFBcUI7UUFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBS0Qsc0JBQXNCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFNTSxlQUFlLENBQUMsT0FBZSxFQUFFLEdBQVc7UUFDL0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVoRCxPQUFPLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBUU0sc0JBQXNCLENBQUMsT0FBZSxFQUFFLEdBQVc7UUFDdEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUM7SUFHekIsQ0FBQztJQVFNLHdCQUF3QixDQUFDLE9BQWUsRUFBRSxHQUFXO1FBQ3hELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFeEMsSUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUM7SUFHekIsQ0FBQztJQU1NLG9CQUFvQixDQUFDLE9BQWU7UUFDdkMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDcEosQ0FBQztJQUtNLG9CQUFvQjtRQUN2QixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUtNLHVCQUF1QjtRQUMxQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUtNLCtCQUErQixDQUFDLE9BQWU7UUFDbEQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuQyxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRTdFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFFeEMsSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFO2dCQUVqQixNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV6RCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzdCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBS08sYUFBYTtRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUEsaUJBQU0sRUFBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFMUIsQ0FBQztJQU1NLHdCQUF3QjtRQUMzQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUU3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDeEI7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBSXJDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFRTSwrQkFBK0IsQ0FBQyxPQUFlLEVBQUUsS0FBYTtRQUlqRSxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU3QyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXRFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUl4QyxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBUU0saUNBQWlDLENBQUMsT0FBZSxFQUFFLEtBQWE7UUFHbkUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBSXhDLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFNTSx5QkFBeUIsQ0FBQyxJQUE2QjtRQUMxRCxRQUFRLElBQUksRUFBRTtZQUNWLEtBQUssaURBQXVCLENBQUMsTUFBTTtnQkFHL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQztnQkFJMUQsTUFBTTtZQUNWLEtBQUssaURBQXVCLENBQUMsTUFBTTtnQkFHL0IsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7Z0JBRXZDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXBDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEVBQUU7d0JBQzlDLFNBQVM7cUJBQ1o7b0JBSUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7aUJBUWxEO2dCQUNELE1BQU07WUFDVjtnQkFDSSxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLHdCQUF3QixJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNsSSxNQUFNO1NBQ2I7SUFDTCxDQUFDO0lBS00sdUJBQXVCO1FBQzFCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFLTSx3QkFBd0I7UUFFM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVuRSxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUU3QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTdELElBQUksWUFBWSxLQUFLLEVBQUUsRUFBRTtnQkFFckIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzthQUMxQztZQUlELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzdCLE9BQU8sT0FBTyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQU1NLHFCQUFxQjtRQUN4QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBT00sU0FBUztRQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7UUFFMUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3RDLENBQUM7SUFLTSxrQkFBa0I7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBT00sY0FBYztRQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUUxRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQU1NLHVCQUF1QjtRQUMxQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUVsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFFbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFFcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLG1DQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLG1DQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFFeEYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxtQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTFGLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBS08scUJBQXFCO1FBRXpCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFLTyxrQkFBa0I7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUtNLHNCQUFzQixDQUFDLFlBQW9CLENBQUM7UUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUtNLDBCQUEwQjtRQUM3QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBS00sMEJBQTBCO1FBQzdCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFLTSw0QkFBNEI7UUFDL0IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUN0RSxDQUFDO0NBQ0o7QUE1ZUQsb0RBNGVDIn0=