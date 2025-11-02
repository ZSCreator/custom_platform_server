import {conversionCards} from "../../../../utils/GameUtil";

/**
 * 构建记录需要结果
 * @param playerCards 玩家
 * @param bankerCards 庄家游戏
 */
export function buildRecordResult(playerCards: any[], bankerCards: any) {
    const prefix = playerCards.map(p => {
        return conversionCards(p.cards) + p.cardType.toString(16);
    }).reduce((a, b) => a + b);

    // 闲家胜利使用1表示输则0
    const suffix = playerCards.map(p => p.isWin ? '1' : '0').reduce(((a, b) => a + b), '');

    // 2515051d3d51301332a2c10826292d193122b021c3611a273b0c1121010
    // 红桃5 梅花5 方块5 梅花K 梅花K 豹子
    // 梅花3 方块A 黑桃3 红桃A 红桃Q 对子
    // 方块8 红桃6 红桃9 红桃K 梅花9 金花
    // 梅花2 红桃J 方块2 梅花Q 黑桃6 对子
    // 梅花10 红桃7 黑桃J 方块Q 梅花A 顺子
    return `${prefix}${conversionCards(bankerCards.cards) + bankerCards.cardType.toString(16)}${suffix}`;
}