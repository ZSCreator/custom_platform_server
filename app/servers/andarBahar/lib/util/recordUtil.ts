import {BetAreasName} from "../config/betAreas";


/**
 * 获取牌的花色
 * */
export function getPokerFlowerColor(poker: number) {
    if (poker >= 39 && poker <= 51) {
        // 方块
        return 0;
    } else if (poker >= 26 && poker <= 38) {
        // 梅花
        return 1;
    } else if (poker >= 13 && poker <= 25) {
        // 红桃
        return 2;
    } else {
        // 黑桃
        return 3;
    }
}

/**
 * 构建记录需要结果
 * @param systemCard 系统牌
 * @param lotteryResult 开奖结果
 * @param winAreas  赢的区域
 */
export function buildRecordResult(systemCard: number, lotteryResult: {[key in BetAreasName]: number[]}, winAreas: string) {
    let result = '';
    const andar = lotteryResult[BetAreasName.ANDAR][lotteryResult[BetAreasName.ANDAR].length - 1],
        bahar = lotteryResult[BetAreasName.BAHAR][lotteryResult[BetAreasName.BAHAR].length - 1];

    result += getPokerFlowerColor(systemCard).toString() + ((systemCard + 1) % 13).toString(16);
    result += getPokerFlowerColor(andar).toString() + ((andar + 1) % 13).toString(16);
    result += getPokerFlowerColor(bahar).toString() + ((bahar + 1)% 13).toString(16);
    result += winAreas === BetAreasName.ANDAR ?  '1' : '2';

    return result;
}