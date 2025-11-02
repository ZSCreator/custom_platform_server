'use strict';
import baijiaConst = require('../baijiaConst');
import {conversionCards} from "../../../../utils/GameUtil";



//判断是不是机器人（需不需要记录日志）
export function isRobotLog(isRobot: number) {
    return baijiaConst.LOG_ISROBOT ? true : isRobot != 2;
}



/**
 * 构造结果记录
 * @param bankerCards
 * @param playerCards
 * @param result
 */
export function buildRecordResult(bankerCards: number[], playerCards: number[], result: any) {
    let bankerStr = conversionCards(bankerCards),
        playerStr = conversionCards(playerCards);

    // 如果自由两张牌自动给他补全第三张牌以00代替
    if (bankerCards.length === 2) bankerStr += '00';
    if (playerCards.length === 2) playerStr += '00';

    // 第13 位为庄 闲 赢 2表示庄赢 1表示闲赢 0表示开和
    const thirteenth = result.bank ? '2' : result.play ? '1' : '0';
    // 第十四位为大小 2表示大 1表示小
    const fourteenth = result.big ? '2' : '1';
    // 第十五为庄对 1表示庄对 0表示不是
    const fifteenth = result.pair0 ? '1' : '0';
    // 第十六位表示闲对 1表示闲对 0表示不是
    const sixteenth = result.pair1 ? '1' : '0';

    return `${bankerStr}${playerStr}${thirteenth}${fourteenth}${fifteenth}${sixteenth}`;
}