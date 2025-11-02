/**
 * 元素转换配置
 */
const elementConversionConfig = {
    'A': '1',           // 樱桃
    'B': '2',           // 铃铛
    'C': '3',           // 钻石
    'D': '4',           // bar
    'E': '5',           // 双bar
    'F': '6',           // 三bar
    'G': '7',           // 7
    'H': '8',           // 77
    'I': '9',           // 777
    'anyBar': 'a',      // any bar
    'any7': 'b',        // any 7
};


/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param betLine 押注线
 * @param winLines 中奖线
 */
export function buildRecordResult(bet: number, betLine: number, winLines: any[]) {
    // 基础押注|押注线|中奖线条数|中奖金额/中奖类型/中奖赔率/
    const linesCount = winLines.length;

    let lines: string = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${elementConversionConfig[line.type]}/${line.multiple}|`;
    }), '');

    if (lines.length) lines = lines.slice(0, lines.length - 1);

    return `${bet}|${betLine}|${linesCount}|${lines}`;
}