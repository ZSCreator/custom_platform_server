import Player from "../scratchPlayer";

/**
 * 构造结果记录 12位定长字符串 前三位代表倍率
 * @param data 开奖数据
 * @param player 玩家
 */
export function buildRecordResult(player: Player, data: any) {
    let prefix = `${player.bet / 100}|`;
    let suffix = data.rebate.toString();

    if (suffix.length === 2) {
        suffix = `0${suffix}`;
    } else if (suffix.length === 1) {
        suffix = `00${suffix}`;
    }

    prefix += suffix;

    return data.result.reduce((prefix, s) => prefix += s.toString(), prefix);
}

// 0	仙桃
// 1	莲花宝座
// 2	唐僧
// 3	孙悟空
// 4	猪八戒
// 5	沙和尚
// 6	牛魔王
