import {FISHTYPE} from "../fisheryConst";

/**
 * 构建记录需要结果 详情参见文档 3位定长字符串
 * 第一位表示鱼的类型  16进制表示
 * 第二位表示鱼所在的区域
 * 第三位表示鱼所在的类型
 * @param lotteryResult
 */
export function buildRecordResult(lotteryResult: string) {
    let result = '';

    // 如果开出灾害区
    if (lotteryResult === 'B') {
        return '014';
    }

    // 第一位
    result += parseInt(lotteryResult).toString(16);

    // 第二位表示鱼所在的区域
    const types = FISHTYPE[lotteryResult];

    switch (true) {
        case types.brine: result += '0'; break;
        case types.fightFlood: result += '2'; break;
    }

    // 第二位表示鱼所在的类型
    switch (true) {
        case types.shoalSater: result += '0'; break;
        case types.deepwater: result += '1'; break;
        case types.watch: result += '2'; break;
        case types.rare: result += '3'; break;
    }

    return result;
}

// console.log(buildRecordResult('1'));
// console.log(buildRecordResult('2'));
// console.log(buildRecordResult('3'));
// console.log(buildRecordResult('4'));
// console.log(buildRecordResult('5'));
// console.log(buildRecordResult('6'));
// console.log(buildRecordResult('7'));
// console.log(buildRecordResult('8'));
// console.log(buildRecordResult('9'));
// console.log(buildRecordResult('10'));
// console.log(buildRecordResult('11'));
// console.log(buildRecordResult('12'));
// console.log(buildRecordResult('B'));
