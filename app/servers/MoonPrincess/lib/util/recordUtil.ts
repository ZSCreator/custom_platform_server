import { WinningDetail } from './lotteryUtil';

/**
 * 构建记录需要结果
 * @param gameLevel 基础押注
 * @param winningDetails 盈利详情
 */
export function buildRecordResult(gameLevel: number, winningDetails: WinningDetail[], odds: number): string {
    let prefix = `SPIN|${gameLevel.toString()}|${winningDetails.length.toString()}|${odds}|`;

    winningDetails.forEach(once => {
        prefix += `${once.type}${once.num}/${once.win}|`;
    })

    return prefix;
}
