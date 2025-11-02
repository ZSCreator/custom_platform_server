import {SlotResult} from "./lotteryUtil";
import {ClayPotGameElementType, OrchardGameElementType} from "../constant";
import {ElementsEnum} from "../config/elemenets";

/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param result 中奖线
 */
export function buildRecordResult(bet: number, result: SlotResult) {
    const winLinesCount = result.winLines.length;
    const winRowsLength = result.winRows.length;
    // 游戏类型|基础押注|中奖线条数|中奖列条数|中奖金额/中奖类型/中奖赔率/|中奖金额/中奖类型/中奖赔率/

    let lines: string = result.winLines.length === 0 ? '' : result.winLines.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), '');


    lines = result.winRows.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), lines);

    if (lines.length) lines = lines.slice(0, lines.length - 1);

    return `N|${bet}|${winLinesCount}|${winRowsLength}|${lines}`;
}

/**
 * 构造陶罐小游戏压缩记录
 * @param bet 基础押注
 * @param profit 收益
 * @param bonusCount 翻倍
 * @param result 开奖结果
 */
export function buildClayPotGameRecord(bet: number, profit: number, bonusCount: number, result: ClayPotGameElementType) {
    // 游戏类型|基础押注|收益|bonus翻倍次数|开奖结果
    return `${ElementsEnum.ClayPot}|${bet}|${profit}|${bonusCount}|${result}`
}



/**
 * 构造骰子小游戏压缩记录
 * @param bet 基础押注
 * @param profit 收益
 * @param baseOdds 基础赔率
 * @param result 开奖结果
 */
export function buildDiceGameRecord(bet: number, profit: number, baseOdds: number, result: number) {
    // 游戏类型|基础押注|收益|基础赔率|开奖结果
    return `${ElementsEnum.Vampire}|${bet}|${profit}|${baseOdds}|${result}`
}

/**
 * 构造转盘小游戏压缩记录
 * @param bet 基础押注
 * @param profit 收益
 * @param baseOdds 基础赔率
 * @param result 开奖结果
 */
export function buildTurnTableGameRecord(bet: number, profit: number, baseOdds: number, result: number) {
    // 游戏类型|基础押注|收益|基础赔率|结果
    return `${ElementsEnum.Wizard}|${bet}|${profit}|${baseOdds}|${result}`
}

/**
 * 构造果园小游戏压缩记录
 * @param bet 基础押注
 * @param profit 收益
 * @param baseOdds 基础赔率
 * @param results 开奖结果
 */
export function buildOrchardGameRecord(bet: number, profit: number, baseOdds: number, results: OrchardGameElementType[]) {
    // 游戏类型|基础押注|收益|基础赔率|结果
    return `${ElementsEnum.Witch}|${bet}|${profit}|${baseOdds}|${results.toString()}`;
}