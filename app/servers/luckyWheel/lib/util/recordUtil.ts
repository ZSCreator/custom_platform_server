import {LWLotteryResult} from './lotteryUtil'

/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param result
 */
export function buildRecordResult(bet: number, result: LWLotteryResult) {
    return result.result.toString();
}