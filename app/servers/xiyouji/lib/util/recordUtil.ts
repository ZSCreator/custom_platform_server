import {XYJLotteryResult} from './lotteryUtil'

/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param betLine 押注线
 * @param result
 */
export function buildRecordResult(bet: number, betLine: number, result: XYJLotteryResult) {
    // 基础押注|押注线|中奖线条数|中奖类型/个数/
    const linesCount = result.roundsAward.reduce((total, once) => {
        return total += once.winLines.length;
    }, 0);

    let suffix = '';
    if (linesCount !== 0) {
        result.roundsAward.forEach(once => {
            once.winLines.forEach(line => {
                suffix += `${line.type}${line.linkNum}/${line.money}|`;
            });
        });
    }

    return `${bet}|${betLine}|${linesCount}|${suffix}`;
}