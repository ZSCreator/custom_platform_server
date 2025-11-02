import {PirateResult} from './lotteryUtil';

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
 * @param betOdds 押注倍率
 * @param result 开奖结果
 * @param totalBet 总押注
 */
export function buildRecordResult(betOdds: number, result: PirateResult, totalBet: number): string {
    let prefix = `${RecordType.SPIN.toString()}|${totalBet/100}|${betOdds}|${result.winLines.length}|`;

    const types = {};

    result.winLines.forEach(once => {
        const str = `${once.type}${once.count}/${once.win}`;

        if (!types[str]) {
            types[str] = 1;
        } else {
            types[str] += 1;
        }
    });

    for (let str in types) {
        prefix += `${str}/${types[str]}|`
    }

    return prefix;
}

/**
 * 构建小游戏记录需要结果
 * @param totalBet 上次押注
 * @param odds 宝箱金币赔率
 */
export function buildLittleGameResult(totalBet: number, odds: number): string {
    return `${RecordType.LITTER.toString()}|${totalBet}|${odds}|`;
}

// console.log(buildRecordResult(1, [{type: bonus, num: 2}]));
// console.log(buildLittleGameResult(100, 10));
