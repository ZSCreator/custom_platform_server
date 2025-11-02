import { conversionCards } from "../../../../utils/GameUtil";
import { BaiRenRoomImpl } from '../BaiRenRoomImpl';
/**
 * 构建记录需要结果
 * @param roomInfo 百人牛牛房间
 */
export function buildRecordResult(roomInfo: BaiRenRoomImpl) {
    const bankerCards = roomInfo.zhuangResult;
    const prefix = roomInfo.lotterys.map(p => {
        return conversionCards(p.cards) + p.cardType.toString(16);
    }).reduce((a, b) => a + b);

    // 闲家胜利使用1表示输则0
    const suffix = roomInfo.lotterys.map(p => p.isWin ? '1' : '0').reduce(((a, b) => a + b), '');

    // 2515051d3d51301332a2c40826292d190122b021c36a1a273b0c1180001
    // 红桃5 梅花5 方块5 梅花K 梅花K 牛五
    // 梅花3 方块A 黑桃3 红桃A 红桃Q 牛四
    // 方块8 红桃6 红桃9 红桃K 梅花9 没牛
    // 梅花2 红桃J 方块2 梅花Q 黑桃6 牛牛
    // 梅花10 红桃7 黑桃J 方块Q 梅花A 牛八
    return `${prefix}${conversionCards(bankerCards.cards) + bankerCards.cardType.toString(16)}${suffix}`;
}