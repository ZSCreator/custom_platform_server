"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const gameUtil2 = require("../../../utils/gameUtil2");
const util = require("../../../utils/index");
const sicboConst_1 = require("./sicboConst");
const commonConst_1 = require("../../../domain/CommonControl/config/commonConst");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
class sicboPlayer extends PlayerInfo_1.PlayerInfo {
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
        this.validBet = 0;
        this.maxBet = 0;
        this.lastGain = 0;
        this.winRound = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.standbyRounds = 0;
        this.initgold = 0;
        this.initgold = this.gold;
    }
    siboInit() {
        this.initControlType();
        this.standbyRounds++;
        if (this.bet > 0) {
            this.standbyRounds = 0;
            this.totalBet.push(this.bet);
            this.totalProfit.push(this.profit);
            (this.totalBet.length > 20) && this.totalBet.shift();
            (this.totalProfit.length > 20) && this.totalProfit.shift();
            this.lastBets = this.betAreas;
        }
        this.betAreas = [];
        this.validBet = 0;
        this.bets = {};
        this.maxBet = 0;
        this.bet = 0;
        this.profit = 0;
        this.controlState = commonConst_1.CommonControlState.RANDOM;
        this.winRound = this.totalProfit.reduce((total, Value) => {
            if (Value > 0) {
                total++;
            }
            return total;
        }, 0);
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
    betHistory(area, gold) {
        this.betAreas.push({ area, bet: gold });
        if (!this.bets[area])
            this.bets[area] = { bet: 0, profit: 0 };
        this.bets[area].bet += gold;
    }
    validBetCount(betNumber) {
        this.validBet = betNumber;
    }
    betCheck(bets, roomInfo) {
        if (sicboConst_1.mappingAreas.includes(bets.area)) {
            const mappingArea = sicboConst_1.mapping[bets.area], areaBet = roomInfo.area_bet[bets.area] ? roomInfo.area_bet[bets.area].allBet + bets[bets.area] : bets[bets.area], mappingBet = roomInfo.area_bet[mappingArea] ? roomInfo.area_bet[mappingArea].allBet : 0, max = Math.max(areaBet, mappingBet), min = Math.min(areaBet, mappingBet);
            if (max - min > sicboConst_1.betLimit) {
                return true;
            }
        }
        return false;
    }
    playerBet(roomInfo, bets) {
        this.betHistory(bets.area, bets.bet);
        let bet = bets.bet;
        this.bet += bet;
        this.maxBet += bet;
        if (roomInfo.area_bet[bets.area] == undefined) {
            roomInfo.area_bet[bets.area] = { playerArr: [], allBet: 0 };
        }
        let isExist = roomInfo.area_bet[bets.area].playerArr.find(m => m.uid == this.uid);
        if (isExist) {
            isExist.bet += bet;
            isExist.betList.push(bet);
            isExist.betRepeat = gameUtil2.getArrNum(isExist.betList);
        }
        else {
            roomInfo.area_bet[bets.area].playerArr.push({
                uid: this.uid,
                bet: bet,
                betList: [bet],
                betRepeat: gameUtil2.getArrNum([bet])
            });
        }
        roomInfo.area_bet[bets.area].allBet += bet;
        roomInfo.allBetNum += bet;
        if (this.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER)
            roomInfo.realPlayerTotalBet += bet;
    }
    setControlState(state) {
        this.controlState = state;
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
}
exports.default = sicboPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ljYm9QbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TaWNCby9saWIvc2ljYm9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFDcEUsc0RBQXNEO0FBQ3RELDZDQUE2QztBQUM3Qyw2Q0FBK0Q7QUFFL0Qsa0ZBQXNGO0FBQ3RGLHVFQUFvRTtBQUVwRSxNQUFxQixXQUFZLFNBQVEsdUJBQVU7SUFnQy9DLFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7UUEvQmYsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUVuQixnQkFBVyxHQUFhLEVBQUUsQ0FBQztRQUUzQixRQUFHLEdBQVcsQ0FBQyxDQUFDO1FBRWhCLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFFeEIsU0FBSSxHQUF3RCxFQUFFLENBQUM7UUFFL0QsYUFBUSxHQUFvQyxFQUFFLENBQUM7UUFFL0MsYUFBUSxHQUFvQyxFQUFFLENBQUM7UUFFL0MsY0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFakMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdyQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdyQixpQkFBWSxHQUFHLGdDQUFrQixDQUFDLE1BQU0sQ0FBQztRQUV6QyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUVsQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUM5QixDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNkLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JELENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDakM7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFlBQVksR0FBRyxnQ0FBa0IsQ0FBQyxNQUFNLENBQUM7UUFFOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNyRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLENBQUM7YUFDWDtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFRCxLQUFLO1FBQ0QsT0FBTztZQUNILEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUMxQixXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3ZDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUMxQixDQUFBO0lBQ0wsQ0FBQztJQUVELE1BQU07UUFDRixPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1NBQ2hCLENBQUE7SUFDTCxDQUFDO0lBRUQsTUFBTTtRQUNGLE9BQU87WUFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUMxQixDQUFBO0lBQ0wsQ0FBQztJQUdELFVBQVUsQ0FBQyxJQUFZLEVBQUUsSUFBWTtRQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUV4QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBR0QsYUFBYSxDQUFDLFNBQWlCO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0lBQzlCLENBQUM7SUFPRCxRQUFRLENBQUMsSUFBbUMsRUFBRSxRQUFtQjtRQUc3RCxJQUFJLHlCQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNsQyxNQUFNLFdBQVcsR0FBRyxvQkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDbEMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDaEgsVUFBVSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3ZGLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFDbkMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBR3hDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxxQkFBUSxFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsU0FBUyxDQUFDLFFBQW1CLEVBQUUsSUFBbUM7UUFDOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ25CLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFO1lBQzNDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUE7U0FDOUQ7UUFDRCxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEYsSUFBSSxPQUFPLEVBQUU7WUFDVCxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQztZQUNuQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQixPQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDSCxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2dCQUN4QyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7Z0JBQ2IsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUNkLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDeEMsQ0FBQyxDQUFDO1NBQ047UUFDRCxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQzNDLFFBQVEsQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDO1FBRzFCLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxtQkFBUSxDQUFDLFdBQVc7WUFBRSxRQUFRLENBQUMsa0JBQWtCLElBQUksR0FBRyxDQUFDO0lBQ2xGLENBQUM7SUFLRCxlQUFlLENBQUMsS0FBeUI7UUFDckMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUdELFVBQVU7UUFDTixJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFDRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNqRCxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUNuQixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDTixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ2hDLENBQUM7SUFNRCxlQUFlLENBQUMsU0FBaUI7UUFDN0IsSUFBSSxlQUFlLEdBQUcsRUFBRSxFQUFFLG9CQUFvQixHQUFHLFNBQVMsR0FBRyxHQUFHLENBQUM7UUFDakUsSUFBSSxvQkFBb0IsS0FBSyxDQUFDO1lBQUUsT0FBTyxlQUFlLENBQUM7UUFFdkQsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3hCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksb0JBQW9CLEVBQUU7Z0JBQzdDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQzthQUMvQztTQUNKO1FBRUQsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBck1ELDhCQXFNQyJ9