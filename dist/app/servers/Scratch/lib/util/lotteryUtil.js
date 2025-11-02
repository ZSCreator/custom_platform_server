"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crateSlotLottery = exports.Lottery = void 0;
const ScratchCardResult_manager_1 = require("../../../../common/dao/daoManager/ScratchCardResult.manager");
const ScratchCardResult_mysql_dao_1 = require("../../../../common/dao/mysql/ScratchCardResult.mysql.dao");
class Lottery {
    constructor() {
        this.totalBet = 0;
        this.totalWin = 0;
        this.controlState = 1;
    }
    init() {
        this.totalWin = 0;
        this.card = null;
    }
    setTotalBetAndJackpotId(bet, jackpotId) {
        this.totalBet = bet;
        this.jackpotId = jackpotId;
    }
    setSystemWinOrLoss(win) {
        this.controlState = win ? 2 : 3;
        return this;
    }
    async result() {
        if (this.controlState === 1 || this.controlState === 3) {
            await this.randomLottery();
        }
        else {
            await this.controlLottery();
        }
        return {
            totalWin: this.totalWin,
            card: this.card
        };
    }
    async randomLottery() {
        this.init();
        this.card = await this.getCard();
        this.card.result = this.card.result.split(',').map(n => Number(n));
        await ScratchCardResult_mysql_dao_1.default.updateOne({ id: this.card.id }, { status: 1 });
        this.calculateEarnings();
    }
    async controlLottery() {
        for (let i = 0; i < 100; i++) {
            await this.randomLottery();
            if (this.controlState === 2 && this.totalWin <= this.totalBet) {
                break;
            }
            if (this.controlState === 3 && this.totalWin > this.totalBet) {
                break;
            }
        }
    }
    calculateEarnings() {
        this.totalWin = this.card.rebate * this.totalBet;
    }
    async getCard() {
        let cards = await ScratchCardResult_manager_1.default.findOneNotLottery(this.jackpotId);
        if (cards) {
            return cards;
        }
        await ScratchCardResult_mysql_dao_1.default.updateMany({ jackpotId: this.jackpotId, status: 1 }, { status: 0 });
        cards = await ScratchCardResult_manager_1.default.findOneNotLottery(this.jackpotId);
        if (!cards) {
            throw new Error('未找到可用刮刮卡卡');
        }
        return cards;
    }
}
exports.Lottery = Lottery;
function crateSlotLottery() {
    return new Lottery();
}
exports.crateSlotLottery = crateSlotLottery;
function test() {
    const lottery = crateSlotLottery();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9TY3JhdGNoL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJHQUFtRztBQUNuRywwR0FBaUc7QUEwQmpHLE1BQWEsT0FBTztJQU9oQjtRQUpBLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixpQkFBWSxHQUFjLENBQUMsQ0FBQztJQUc1QixDQUFDO0lBRU8sSUFBSTtRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFPRCx1QkFBdUIsQ0FBQyxHQUFXLEVBQUUsU0FBaUI7UUFDbEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQU1ELGtCQUFrQixDQUFDLEdBQVk7UUFDM0IsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFLRCxLQUFLLENBQUMsTUFBTTtRQUVSLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUU7WUFDcEQsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDOUI7YUFBTTtZQUNILE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQy9CO1FBRUQsT0FBTztZQUNILFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDbEIsQ0FBQTtJQUNMLENBQUM7SUFLTyxLQUFLLENBQUMsYUFBYTtRQUV2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFHWixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUluRSxNQUFNLHFDQUF5QixDQUFDLFNBQVMsQ0FBQyxFQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBQyxFQUFHLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7UUFHNUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUtPLEtBQUssQ0FBQyxjQUFjO1FBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFFM0IsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQzNELE1BQU07YUFDVDtZQUVELElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUMxRCxNQUFNO2FBQ1Q7U0FDSjtJQUNMLENBQUM7SUFLTyxpQkFBaUI7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3JELENBQUM7SUFLRCxLQUFLLENBQUMsT0FBTztRQUdULElBQUksS0FBSyxHQUFHLE1BQU0sbUNBQXdCLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTdFLElBQUksS0FBSyxFQUFFO1lBQ1AsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxNQUFNLHFDQUF5QixDQUFDLFVBQVUsQ0FBQyxFQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUMsRUFBRyxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBR2pHLEtBQUssR0FBRyxNQUFNLG1DQUF3QixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV6RSxJQUFHLENBQUMsS0FBSyxFQUFDO1lBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNoQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjtBQXJIRCwwQkFxSEM7QUFLRCxTQUFnQixnQkFBZ0I7SUFDNUIsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFGRCw0Q0FFQztBQUdELFNBQVMsSUFBSTtJQUNULE1BQU0sT0FBTyxHQUFHLGdCQUFnQixFQUFFLENBQUM7QUFTdkMsQ0FBQyJ9