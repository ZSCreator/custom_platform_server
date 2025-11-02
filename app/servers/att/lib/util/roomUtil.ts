import Player from "../player";
import {conversionCards} from '../../../../utils/GameUtil';

/**
 * 构造记录
 * 01111d110002201e9
 * @param player 构造记录的玩家
 */
export function buildRecordResult(player: Player) {
    // 第一位和第二位表示打了几炮
    let handNum = player.roundCount.toString();
    handNum = handNum.length === 1 ? `0${handNum}` : handNum;

    let str = `${handNum}${(player.baseBet/100).toString()}|`;

    // 表示是否参与搏一搏 参与了次数
    str += `${player.boRecords.length}`;
    player.boRecords.forEach(record => {
        // 选择颜色 开牌结果 倍数 收益
        str += `/${record.color}.${conversionCards(record.card)}.${record.multiple}.${record.profit/100}`;
    })
    str += '|'

    // 剩余的牌11 为一组 前十位表示五张牌的花色，最后一位表示牌型
    player.cardsList.forEach(onceResult => {
        str += conversionCards(onceResult.cards);
        str += onceResult.id === -1 ? Number(10).toString(16) : onceResult.id.toString(16);
    });

    return str;
}