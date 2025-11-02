import { FreeSpinResult } from "../constant";

/**
 * 元素转换配置
 */
const elementConversionConfig = {
    'A': '1',           // 樱桃
    'K': '2',           // 铃铛
    'Q': '3',           // 钻石
    'J': '4',           // bar
    'E': '5',           // 双bar
    'F': '6',           // 三bar
    'G': '7',           // 7
    'H': '8',           // 77
    'I': '9',           // 777
};


/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param betLine 押注线
 * @param winLines 中奖线
 */
export function buildRecordResult(bet: number, freeSpinResult: FreeSpinResult, winLines: any[]) {
    // 基础押注|中奖金额/中奖类型/中奖赔率/|幸运奖项
    const linesCount = winLines.length;

    let lines: string = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${line.type}/${line.multiple}|`;
    }), '');

    if (lines.length) lines = lines.slice(0, lines.length - 1);

    return `${bet}|${linesCount}|${lines}|${freeSpinResult.group == 0 ? 0 : freeSpinResult.group}`;
}