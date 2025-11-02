import {WinLine} from "./lotteryUtil";


/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param betLine 押注线
 * @param winLines 中奖线
 */
export function buildRecordResult(bet: number, betLine: number, winLines: WinLine[]) {
    // 基础押注|押注线|中奖线条数|该类型中奖的条数/中奖金额/中奖类型/中奖赔率/
    const linesCount = winLines.length;
    const bill = [];
    let lines = ''

    winLines.forEach(line => {
        bill.push(`${line.money}/${line.type}/${line.multiple}|`);
    });

    if (bill.length) {
        while (bill.length) {
            const first = bill[0];
            const others = bill.filter(detail => detail === first);
            lines += `${others.length}/${first}`;

            others.forEach(o => {
                const index = bill.findIndex(detail => detail === o);
                if (index !== -1) {
                    bill.splice(index, 1);
                }
            })
        }
    }

    if (lines.length) lines = lines.slice(0, lines.length - 1);

    return `${bet}|${betLine}|${linesCount}|${lines}`;
}