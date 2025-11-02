

/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param winLines 中奖线
 * @param freeOdds 免费游戏倍数
 * @param freeProfit 免费游戏收益
 */
export function buildRecordResult(bet: number, winLines: any[], freeOdds: number, freeProfit: number) {
    // 基础押注|中奖线条数|中奖金额/中奖类型/中奖赔率/
    const linesCount = winLines.length;

    let lines: string = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), '');

    if (lines.length) lines = lines.slice(0, lines.length - 1);

    // 免费游戏倍数|免费游戏收集|基础押注|中奖线
    return `${freeOdds}|${freeProfit}|${bet}|${linesCount}|${lines}`;
}


/**
 * 构建Samba游戏
 */
export function buildSambaRecord() {
    return `a`;
}