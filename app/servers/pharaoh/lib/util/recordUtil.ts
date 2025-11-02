import {WinningDetail} from './lotteryUtil';
import {bonus, copper, gold, silver,} from '../constant';

/**
 * 记录类型
 * SPIN: 正常SPIN
 *
 */
enum RecordType {
    SPIN ,
    LITTER
}


/**
 * 构建记录需要结果
 * @param gameLevel 基础押注
 * @param winningDetails 盈利详情
 */
export function buildRecordResult(gameLevel: number, winningDetails: WinningDetail[]): string {
    let prefix = `${RecordType.SPIN.toString()}|${gameLevel.toString()}|${winningDetails.length.toString()}|`;

    winningDetails.forEach(once => {
        prefix += `${once.type}${once.num}/${once.win}|`;
    })

    return prefix;
}

/**
 * 构建小游戏记录需要结果
 * @param gameLevel 基础押注
 * @param awardType 小游戏骰子投出来的类型 如果是空格或者下一步不进行记录
 */
export function buildLittleGameResult(gameLevel: number, awardType: string): string {
    let prefix = `${RecordType.LITTER.toString()}|${gameLevel.toString()}|`;

    // 后缀
    switch (awardType) {
        case gold: prefix += '2'; break;
        case silver: prefix += '1'; break;
        case copper: prefix += '0'; break;
        case bonus: prefix += '3'; break;
    }

    return prefix;
}

// console.log(buildRecordResult(1, [{type: bonus, num: 2}]));
// console.log(buildLittleGameResult(1, 'copper'));
