"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genRandomResult = exports.LotteryUtil = void 0;
const constants_1 = require("../constants");
const betAreas_1 = require("../config/betAreas");
const utils_1 = require("../../../../utils");
const plates = [constants_1.red, constants_1.white];
class LotteryUtil {
    constructor() {
        this.result = null;
        this.winAreas = [];
        this.killAreas = [];
    }
    setKillAreas(killAreas) {
        this.killAreas = killAreas;
        return this;
    }
    setBetAreas(betAreas) {
        this.betAreas = betAreas;
    }
    getKillAreas() {
        return this.killAreas;
    }
    isContain() {
        return !!this.killAreas.find(areaName => this.winAreas.includes(areaName));
    }
    genLotteryResult() {
        const result = [];
        for (let i = 0; i < 4; i++) {
            const index = (0, utils_1.random)(0, plates.length - 1);
            result.push(plates[index]);
        }
        this.result = result;
        return result;
    }
    lottery() {
        this.genLotteryResult();
        this.calculationWinAreas();
        if (this.killAreas.length > 0 && this.isContain()) {
            return this.lottery();
        }
        for (let [areaName, area] of Object.entries(this.betAreas)) {
            this.winAreas.includes(areaName) ? area.setWinResult() : area.setLossResult();
        }
        return this.result;
    }
    calculationWinAreas() {
        this.winAreas = [];
        const redCount = this.result.filter(plate => plate === constants_1.red).length;
        const whiteCount = this.result.filter(plate => plate === constants_1.white).length;
        this.winAreas.push(redCount % 2 === 0 ? betAreas_1.BetAreasName.DOUBLE : betAreas_1.BetAreasName.SINGLE);
        if (whiteCount === 3) {
            this.winAreas.push(betAreas_1.BetAreasName.THREE_WHITE);
        }
        else if (redCount === 3) {
            this.winAreas.push(betAreas_1.BetAreasName.THREE_RED);
        }
        if (redCount === 4) {
            this.winAreas.push(betAreas_1.BetAreasName.FOUR_RED);
        }
        else if (whiteCount === 4) {
            this.winAreas.push(betAreas_1.BetAreasName.FOUR_WHITE);
        }
    }
    getWinAreas() {
        return this.winAreas;
    }
    getResult() {
        return this.result;
    }
}
exports.LotteryUtil = LotteryUtil;
function genRandomResult() {
    const num = (0, utils_1.random)(10, 20);
    const results = [];
    for (let i = 0; i < num; i++) {
        const result = [];
        for (let i = 0; i < 4; i++) {
            const index = (0, utils_1.random)(0, plates.length - 1);
            result.push(plates[index]);
        }
        results.push(result);
    }
    return results;
}
exports.genRandomResult = genRandomResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG90dGVyeVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jb2xvclBsYXRlL2xpYi91dGlsL2xvdHRlcnlVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDRDQUF3QztBQUN4QyxpREFBZ0Q7QUFFaEQsNkNBQXlDO0FBR3pDLE1BQU0sTUFBTSxHQUFHLENBQUMsZUFBRyxFQUFFLGlCQUFLLENBQUMsQ0FBQztBQU81QixNQUFhLFdBQVc7SUFBeEI7UUFDWSxXQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2QsYUFBUSxHQUFtQixFQUFFLENBQUM7UUFDOUIsY0FBUyxHQUFtQixFQUFFLENBQUM7SUF1SDNDLENBQUM7SUFoSEcsWUFBWSxDQUFDLFNBQXlCO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxXQUFXLENBQUMsUUFBMEM7UUFDbEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsQ0FBQztJQUtELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUtELFNBQVM7UUFDTCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUtELGdCQUFnQjtRQUNaLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUdsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUEsY0FBTSxFQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxD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