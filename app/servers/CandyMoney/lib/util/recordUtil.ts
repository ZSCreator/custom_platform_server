import { WinningDetail } from './lotteryUtil';

/**
 * 构建记录需要结果
 * @param gameLevel 基础押注
 * @param winningDetails 盈利详情
 */
export function buildRecordResult(RecordType: 'SPIN' | 'FREE', winningDetails: WinningDetail[][], odds: number): string {
    let prefix = `${RecordType}|${winningDetails.length.toString()}|${odds}|`;
    let result: WinningDetail[] = [];
    result = result.concat.apply([], winningDetails);
    result.forEach(once => {
        prefix += `${once.type}${once.num}/${once.odds}/${once.win}|`;
    })

    return prefix;
}