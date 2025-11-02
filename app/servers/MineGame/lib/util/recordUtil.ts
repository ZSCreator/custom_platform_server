import { WinningDetail } from './lotteryUtil';
import Player from '../Player';
/**
 * 构建记录需要结果
 * @param gameLevel 基础押注
 * @param winningDetails 盈利详情
 */
export function buildRecordResult(playerInfo: Player): string {
    let prefix = "";
    for (const once of playerInfo.Details) {
        prefix += `${once.type}/${once.X}/${once.Y}|`;
    }

    return prefix;
}