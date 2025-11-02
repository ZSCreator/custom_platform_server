import {IGraberRedPacket} from "../interface/IGraberRedPacket";


/**
 * 构建记录需要结果
 */
export function buildRecordResult(grabQueue: IGraberRedPacket[]) {
    // 发包金额 | 红包数量 |含雷数量 | 红包金额/是否被抢/是否含雷 |
    const redPacketAmount = grabQueue.reduce(((num, redPacket) => {
        return parseFloat(redPacket.redPacketAmount) + num;
    }) , 0);

    // 8000|10|2|3106/1/0|2303/1/0|939/1/0|795/1/0|287/1/1|9/1/0|27/1/1|82/1/0|92/1/0|360/1/0
    // 红包数量
    const redPacketCount = grabQueue.length;

    // 含雷数量
    const containMinesCount = grabQueue.filter(redPacket => redPacket.isStepInMine).length;

    // 红包结构
    let redPackets = grabQueue.reduce((str, redPacket) => {
        return str + `${redPacket.redPacketAmount}/${redPacket.hasGrabed ? 1 : 0}/${redPacket.isStepInMine ? 1 : 0}|`;
    }, '');

    redPackets = redPackets.slice(0, redPackets.length - 1);

    return `${redPacketAmount}|${redPacketCount}|${containMinesCount}|${redPackets}`;
}