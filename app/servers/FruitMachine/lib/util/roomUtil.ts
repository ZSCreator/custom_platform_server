import {GoodLuckType, kindSubSet, oddsSubSet} from "../FruitMachineConst";

/**
 * goodLuck 映射字符
 */
const goodLuckMapping = {
    [GoodLuckType.NONE]: '0',
    [GoodLuckType.BIG_TERNARY]: '1',
    [GoodLuckType.MIN_TERNARY]: '2',
    [GoodLuckType.FOUR_HAPPY]: '3',
    [GoodLuckType.TRAIN]: '4'
};


/**
 * 根据赔率配置的集合
 */
export const fruitMapping = {
    banana: '1',                 // 香蕉
    apple: '2',                  // 苹果
    durian: '3',                 // 榴莲
    snakeFruit: '4',             // 蛇果
    orange: '5',                 // 橘子
    pear: '6',                   // 鸭梨
    star: '7',                   // 星星
    watermelon: '8',             // 西瓜
    redBonus: '9',               // 红bonus
    blueBonus: 'a',              // 蓝bonus
};



/**
 * 构造记录
 * 由一个11位定长的字符串组成
 * @param lotteryResult 开奖结构
 */
export function buildRecordResult(lotteryResult: { goodLuck: GoodLuckType, results: number[] }): string {
    // 第一个是否是goodLuck 
    // 不是goodLuck表示为0 大三元表示1 小三元表示2 大四喜表示3 开火车表示4
    let prefix = goodLuckMapping[lotteryResult.goodLuck];
    
    // 2 - 11位表示  一个水果类型以及大小 1表示小 2 表示大 如果没有或者为goodLuck则以00表示  水果类型映射参见下表
    let suffix = '';
    lotteryResult.results.forEach(fruit => {
        if (kindSubSet.goodLuck.includes(fruit)) {
            suffix += '00';
            return;
        }

        // 判断水果大小
        suffix += oddsSubSet.min.includes(fruit) ? '1' : '2';

        // 判断水果钟类
        for (let fruitType in kindSubSet) {
            if (kindSubSet[fruitType].includes(fruit)) {
                suffix += fruitMapping[fruitType];
                break;
            }
        }
    });

    if (suffix.length < 10) {
        for (let i = 0, len = 10 - suffix.length; i < len; i++) {
            suffix += '0';
        }
    }

    return prefix + suffix;
}

// console.warn(buildRecordResult({goodLuck: GoodLuckType.FOUR_HAPPY, results: [5, 2, 15, 23, 10]}))