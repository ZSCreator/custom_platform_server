/**
 * 元素转换配置
 */
const elementConversionConfig = {
    'A': '1',           // 财神
    'B': '2',           // 元宝
    'C': '3',           // 鞭炮
    'D': '4',           // 扇子
    'E': '5',           //  灯笼
    'H': '6',           // Bonus
    'W': '7',           // WILD
};


/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param betLine 押注线
 * @param winLines 中奖线
 */
export function buildRecordResult(bet: number, winLines: any) {
    // 基础押注|押注线|中奖线条数|中奖金额/中奖类型/中奖赔率/
    // const linesCount = winLines.length;
    let lines: string = "";
    if (winLines) {
        lines = `${winLines.money}/${elementConversionConfig[winLines.type]}/${winLines.multiple}|`;
    }
    return `${bet}|${lines}`;
}
