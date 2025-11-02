"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrchardGameRecord = exports.buildTurnTableGameRecord = exports.buildDiceGameRecord = exports.buildClayPotGameRecord = exports.buildRecordResult = void 0;
const elemenets_1 = require("../config/elemenets");
function buildRecordResult(bet, result) {
    const winLinesCount = result.winLines.length;
    const winRowsLength = result.winRows.length;
    let lines = result.winLines.length === 0 ? '' : result.winLines.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), '');
    lines = result.winRows.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), lines);
    if (lines.length)
        lines = lines.slice(0, lines.length - 1);
    return `N|${bet}|${winLinesCount}|${winRowsLength}|${lines}`;
}
exports.buildRecordResult = buildRecordResult;
function buildClayPotGameRecord(bet, profit, bonusCount, result) {
    return `${elemenets_1.ElementsEnum.ClayPot}|${bet}|${profit}|${bonusCount}|${result}`;
}
exports.buildClayPotGameRecord = buildClayPotGameRecord;
function buildDiceGameRecord(bet, profit, baseOdds, result) {
    return `${elemenets_1.ElementsEnum.Vampire}|${bet}|${profit}|${baseOdds}|${result}`;
}
exports.buildDiceGameRecord = buildDiceGameRecord;
function buildTurnTableGameRecord(bet, profit, baseOdds, result) {
    return `${elemenets_1.ElementsEnum.Wizard}|${bet}|${profit}|${baseOdds}|${result}`;
}
exports.buildTurnTableGameRecord = buildTurnTableGameRecord;
function buildOrchardGameRecord(bet, profit, baseOdds, results) {
    return `${elemenets_1.ElementsEnum.Witch}|${bet}|${profit}|${baseOdds}|${results.toString()}`;
}
exports.buildOrchardGameRecord = buildOrchardGameRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2hhbGxvd2Vlbi9saWIvdXRpbC9yZWNvcmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1EQUFpRDtBQU9qRCxTQUFnQixpQkFBaUIsQ0FBQyxHQUFXLEVBQUUsTUFBa0I7SUFDN0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDN0MsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFHNUMsSUFBSSxLQUFLLEdBQVcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDMUYsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO0lBQ2hFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBR1IsS0FBSyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDekMsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO0lBQ2hFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRVgsSUFBSSxLQUFLLENBQUMsTUFBTTtRQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTNELE9BQU8sS0FBSyxHQUFHLElBQUksYUFBYSxJQUFJLGFBQWEsSUFBSSxLQUFLLEVBQUUsQ0FBQztBQUNqRSxDQUFDO0FBakJELDhDQWlCQztBQVNELFNBQWdCLHNCQUFzQixDQUFDLEdBQVcsRUFBRSxNQUFjLEVBQUUsVUFBa0IsRUFBRSxNQUE4QjtJQUVsSCxPQUFPLEdBQUcsd0JBQVksQ0FBQyxPQUFPLElBQUksR0FBRyxJQUFJLE1BQU0sSUFBSSxVQUFVLElBQUksTUFBTSxFQUFFLENBQUE7QUFDN0UsQ0FBQztBQUhELHdEQUdDO0FBV0QsU0FBZ0IsbUJBQW1CLENBQUMsR0FBVyxFQUFFLE1BQWMsRUFBRSxRQUFnQixFQUFFLE1BQWM7SUFFN0YsT0FBTyxHQUFHLHdCQUFZLENBQUMsT0FBTyxJQUFJLEdBQUcsSUFBSSxNQUFNLElBQUksUUFBUSxJQUFJLE1BQU0sRUFBRSxDQUFBO0FBQzNFLENBQUM7QUFIRCxrREFHQztBQVNELFNBQWdCLHdCQUF3QixDQUFDLEdBQVcsRUFBRSxNQUFjLEVBQUUsUUFBZ0IsRUFBRSxNQUFjO0lBRWxHLE9BQU8sR0FBRyx3QkFBWSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLEVBQUUsQ0FBQTtBQUMxRSxDQUFDO0FBSEQsNERBR0M7QUFTRCxTQUFnQixzQkFBc0IsQ0FBQyxHQUFXLEVBQUUsTUFBYyxFQUFFLFFBQWdCLEVBQUUsT0FBaUM7SUFFbkgsT0FBTyxHQUFHLHdCQUFZLENBQUMsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO0FBQ3RGLENBQUM7QUFIRCx3REFHQyJ9