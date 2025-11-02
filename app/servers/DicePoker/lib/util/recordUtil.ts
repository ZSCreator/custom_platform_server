/**
 * 构建记录需要结果
 * @param lotteryResults 开奖结果
 */
export function buildRecordResult(lotteryResults: any[]) {
    // 前缀
    let prefix = '';

    // 东 南 西 北
    const east = lotteryResults.find(details => details.area === 'east');
    const south = lotteryResults.find(details => details.area === 'south');
    const west = lotteryResults.find(details => details.area === 'west');
    const north = lotteryResults.find(details => details.area === 'north');
    // 中
    const centre = lotteryResults.find(once => once.area === 'center');

    // 东南西北
    [east, south, west, north].forEach(details => prefix += (details.iswin ? 1 : 0));

    // 中东南西北
    [centre, east, south, west, north].forEach(details => {
        // 两位表示牌
        let str = details.result.reduce((pre, card) => pre += card.toString(16), '');
        if (details.type === 1) {
            str += 'a';
        } else if (details.type === 2) {
            str += 'b';
        } else {
            str += details.Points.toString();
        }

        prefix += str;
    });

    if (prefix.length > 19) {
        prefix = prefix.slice(0, 19);
        console.error(`Dice 构造记录报错: ${JSON.stringify([centre, east, south, west, north])}`);
    }

    return prefix;
}