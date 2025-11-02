
const dishes = [
    // 豆腐 藕片 木耳 土豆 香菇 甜肠 血旺 午餐肉 香肠 黄喉 羊肉 毛肚
    'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'K10', 'K11', 'K12',
];

/**
 * 构造记录
 * @param awardType 麻辣奖类型
 * @param bonusProfit 麻辣奖收益
 * @param result 开奖结果
 * @param winDetail 具体每个元素赢取
 * @param bet 押注额
 */
export function buildRecordResult(awardType: string, bonusProfit: number, result: string[], winDetail: {[str: string]: number}, bet: number): string {
    let str = `${bet/100}/${awardType}/${bonusProfit}`;


    const elementsCount = {};

    result.forEach(f => {
        if (!Reflect.has(elementsCount, f)) {
            elementsCount[f] = 0;
        }

        elementsCount[f]++;
    });

    // 如果没有这个元素 加0
    dishes.forEach(f => {
        const profit = winDetail[f] === undefined ? 0 : winDetail[f];
        str += !Reflect.has(elementsCount, f) ? '|0/0' : `|${elementsCount[f]}/${profit}`;
    });


    return str;
}

// console.log(buildRecordResult('0', ['K2', "K2", 'K1']));