// 游戏状态
export enum state {
    NONE = "NONE",
    BET = "BET",
    LOTTERY = "LOTTERY",
    SETTLEMENT = "SETTLEMENT",
}

// 消息通知路由
export const router = {
    playersChange: "playersChange",          // 玩家列表发生变化，玩家退出，玩家加入
    playerBet: "playerBet",                  // 玩家下注
    playerTopUp: "playerTopUp",              // 玩家充值
    roomStart: "roomStart",                  // 开始下注
    roomLottery: "roomLottery",              // 开始开奖
    roomSettlement: "roomSettlement",        // 开始结算
};

// 各个状态倒计时
export const statusTimer = {
    BET: 15e3,
    LOTTERY: 11e3,
    BOUNSLOTTERY: 18e3,
    SETTLEMENT: 5e3,
};

// 概率配置
// export const odds = {
//     goodLuck: 100,                // 幸运
//     min: 1500,                     // 小香蕉，榴莲、蛇果、橘⼦、鸭梨、星星、⻄⽠、苹果
//     banana: 1500,                 // 香蕉
//     apple: 1200,                  // 苹果
//     durian: 1000,                 // 榴莲
//     snakeFruit: 700,              // 蛇果
//     redBonus: 200,                // 红bonus
//     blueBonus: 300,               // 蓝bonus
//     orange: 700,                  // 橘子
//     pear: 1000,                   // 鸭梨
//     star: 1100,                   // 星星
//     watermelon: 700              // 西瓜
// };

// 概率配置
export const odds = {
    goodLuck: 95,                // 幸运
    min: 5100,                   // 小香蕉，榴莲、蛇果、橘⼦、鸭梨、星星、⻄⽠、苹果
    banana: 860,                 // 香蕉
    apple: 425,                  // 苹果
    durian: 283,                 // 榴莲
    snakeFruit: 212,              // 蛇果
    redBonus: 15,                // 红bonus
    blueBonus: 25,               // 蓝bonus
    orange: 252,                  // 橘子
    pear: 340,                   // 鸭梨
    star: 576,                   // 星星
    watermelon: 1790              // 西瓜
};

/**
 * 构建一个类似前端的轮盘 下标位分别对应
 * 大西瓜（0）小橘子（1）鸭梨（2）小星星（3）蓝bonus（4）小蛇果（5）苹果（6）小榴莲（7）小香蕉（8）
 * 蛇果（9）小星星（10）小鸭梨（11）小橘子（12）西瓜（13）小香蕉（14）小蛇果（15）香蕉（16）小榴莲（17）
 * 红bonus（18）小西瓜（19） 榴莲（20）小苹果（21）小鸭梨（22）星星（23）小西瓜（24）good luck（25）小苹果（26）橘子（27）
 */
export const roulette = (() => {
    const wheel = [];
    for (let i = 0; i < 28; i++) {
        wheel.push(i);
    }
    return wheel;
})();

/**
 * 根据赔率区分的下注区域下标集合
 * @property min 小香蕉，榴莲、蛇果、橘⼦、鸭梨、星星、⻄⽠、苹果
 * @property banana 香蕉
 * @property apple 苹果
 * @property durian 榴莲
 * @property snakeFruit 蛇果
 * @property redBonus 红bonus
 * @property blueBonus 蓝bonus
 * @property orange 橘子
 * @property pear 鸭梨
 * @property star 星星
 * @property watermelon 西瓜
 *
 */
export const oddsSubSet = {
    min: [1, 3, 5, 7, 8, 10, 11, 12, 14, 15, 17, 19, 21, 22, 24, 26],
    banana: [16],
    apple: [6],
    durian: [20],
    snakeFruit: [9],
    redBonus: [18],
    blueBonus: [4],
    orange: [27],
    pear: [2],
    star: [23],
    watermelon: [13, 0]
};


/**
 * 根据赔率配置的集合
 */
export const areaOdds = {
    min: 2,                     // 小香蕉，榴莲、蛇果、橘⼦、鸭梨、星星、⻄⽠、苹果
    banana: 10,                 // 香蕉
    apple: 20,                  // 苹果
    durian: 30,                 // 榴莲
    snakeFruit: 40,             // 蛇果
    redBonus: 100,              // 红bonus
    blueBonus: 75,              // 蓝bonus
    orange: 35,                 // 橘子
    pear: 25,                   // 鸭梨
    star: 15,                   // 星星
    watermelon: 5               // 西瓜
};

/**
 * 种类下标集合
 */
export const kindSubSet = {
    goodLuck: [25],                      // good luck
    banana: [8, 14, 16],                 // 香蕉
    apple: [6, 21, 26],                  // 苹果
    durian: [7, 17, 20],                 // 榴莲
    snakeFruit: [5, 9, 15],              // 蛇果
    redBonus: [18],                      // 红bonus
    blueBonus: [4],                      // 蓝bonus
    orange: [1, 12, 27],                 // 橘子
    pear: [2, 11, 22],                   // 鸭梨
    star: [3, 10, 23],                   // 星星
    watermelon: [0, 13, 24, 19]          // 西瓜
};

/**
 * 当跑马等选中good luck时 随机出来的类型
 * @property BIG_TERNARY ⼤三元为玩家同时中奖：蛇果、橘⼦、榴莲
 * @property FOUR_HAPPY ⼤四喜为玩家同时中奖：四个⻄⽠
 * @property MIN_TERNARY ⼩三元为玩家同时中奖：⾹蕉、星星、苹果
 * @property TRAIN 开⽕⻋为玩家同时中奖：任意2-5个图标（任意图标⽆红蓝bonus）
 * @property NONE 没中
 */
export enum GoodLuckType {
    BIG_TERNARY = 'big:ternary',
    FOUR_HAPPY = 'four:happy',
    MIN_TERNARY = 'min:ternary',
    TRAIN = 'train',
    NONE = 'none',
}