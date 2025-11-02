import Player from "../player";
import {conversionCards} from "../../../../utils/GameUtil";

const elementConversionConfig = {
    'A': '1',           // 樱桃
    'B': '2',           // 铃铛
    'C': '3',           // 钻石
    'D': '4',           // bar
    'E': '5',           // 双bar
    'F': '6',           // 三bar
    'G': '7',           // 7
    'H': '8',           // 77
    'I': '9',           // 777
    'anyBar': 'a',      // any bar
    'any7': 'b',        // any 7
};


/**
 * 构建记录需要结果
 * @param bet 基础押注
 * @param winLines 中奖线
 */
export function buildRecordResult(bet: number, winLines: any[]) {
    // 基础押注|中奖线条数|中奖金额/中奖类型/中奖赔率/
    const linesCount = winLines.length;

    let lines: string = winLines.length === 0 ? '' : winLines.reduce(((str, line) => {
        return str + `${line.money}/${elementConversionConfig[line.type]}/${line.multiple}|`;
    }), '');

    if (lines.length) lines = lines.slice(0, lines.length - 1);

    return `${bet}|${linesCount}|${lines}`;
}

/**
 * 设置正常调控
 * @param player 玩家
 * @param normal 是否是免费游戏
 * @param bet 基础下注
 * @param winLines 中奖线
 */
export function buildNormalRecord(player: Player, normal: boolean, bet: number, winLines: any[]) {
    if (normal) {
        // 是否是免费游戏|基础押注|中奖线|
        return `1|${buildRecordResult(bet, winLines)}`;
    }

    const openStr = player.disCards.reduce((s, card) => {
        return s + conversionCards(card);
    }, '');

    // 是否是免费游戏|是否博一博/剩余次数/博一博盈利/陆续开的牌|基础押注|中奖线|
    // "0|true/2/40000/210111|2000|2|20000/1/10|20000/1/10"
    return `0|${player.boTimes < 5 ? 1 : 0}/${player.boTimes}/${player.boProfit}/${openStr}|${buildRecordResult(bet, winLines)}`;
}