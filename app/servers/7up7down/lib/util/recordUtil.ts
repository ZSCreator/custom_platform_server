import {sum} from "../../../../utils";

/**
 * 构建记录需要结果
 * @param lotteryResult 开奖结果
 */
export function buildRecordResult(lotteryResult: number[]) {
    return sum(lotteryResult).toString(16);
}