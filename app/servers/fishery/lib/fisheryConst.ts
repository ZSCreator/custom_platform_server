import * as  hallConst from '../../../consts/hallConst';
export const OFFLINE_NUM = hallConst.OFFLINE_NUM || 10;//离线玩家最大能参加游戏的局数
export const FISHERY = 'fishery';
export const CHANNEL_NAME = 'FISHERY';
export const RESULT_NUM = 20;//选桌界面历史纪录记录条数

// 区域位置
export const SEAT = {
    A: 'brine',                     // 深海区
    B: 'freshWater',                // 灾害区
    C: 'fightFlood',                // 淡水区

    D: 'brine-shoalSater',          // 小型鱼
    E: 'brine-deepwater',           // 大型鱼

    F: 'fightFlood-watch',          // 观赏鱼
    G: 'fightFlood-rare',           // 食用鱼

    1: 'brine-shoalSater-fish1',    // 小丑鱼
    2: 'brine-shoalSater-fish2',    // 黄鱼
    3: 'brine-shoalSater-fish3',    // 黄金鱼
    4: 'brine-deepwater-fish4',     // 鲨鱼
    5: 'brine-deepwater-fish5',     // 旗鱼
    6: 'brine-deepwater-fish6',     // 玛丽鱼
    7: 'fightFlood-watch-fish7',    // 金鱼
    8: 'fightFlood-watch-fish8',    // 孔雀鱼
    9: 'fightFlood-watch-fish9',    // 丽丽鱼
    10: 'fightFlood-rare-fish10',   // 河豚
    11: 'fightFlood-rare-fish11',   // 鱿鱼
    12: 'fightFlood-rare-fish12'    // 螃蟹
}

// 深水区
export const deepFish = ['fish1', 'fish2', 'fish3', 'fish4', 'fish5', 'fish6'];
// 淡水区
export const freshFish = ['fish7', 'fish8', 'fish9', 'fish10', 'fish11', 'fish12'];
// 小鱼区
export const smallFish = ['fish1', 'fish2', 'fish3',];
// 大鱼区
export const bigFish = ['fish4', 'fish5', 'fish6'];
// 观赏鱼区域
export const watchFish = ['fish7', 'fish8', 'fish9', ];
// 食用鱼区域
export const canEatFish = [ 'fish10', 'fish11', 'fish12'];

//每种鱼所属区域
export const FISHTYPE = {
    A: { brine: true, fightFlood: false, shoalSater: false, deepwater: false, watch: false, rare: false },
    B: { brine: false, fightFlood: false, shoalSater: false, deepwater: false, watch: false, rare: false },
    C: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: false, rare: false },
    D: { brine: true, fightFlood: false, shoalSater: true, deepwater: false, watch: false, rare: false },
    E: { brine: true, fightFlood: false, shoalSater: false, deepwater: true, watch: false, rare: false },
    F: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: true, rare: false },
    G: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: false, rare: true },

    1: { brine: true, fightFlood: false, shoalSater: true, deepwater: false, watch: false, rare: false },
    2: { brine: true, fightFlood: false, shoalSater: true, deepwater: false, watch: false, rare: false },
    3: { brine: true, fightFlood: false, shoalSater: true, deepwater: false, watch: false, rare: false },

    4: { brine: true, fightFlood: false, shoalSater: false, deepwater: true, watch: false, rare: false },
    5: { brine: true, fightFlood: false, shoalSater: false, deepwater: true, watch: false, rare: false },
    6: { brine: true, fightFlood: false, shoalSater: false, deepwater: true, watch: false, rare: false },

    7: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: true, rare: false },
    8: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: true, rare: false },
    9: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: true, rare: false },

    10: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: false, rare: true },
    11: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: false, rare: true },
    12: { brine: false, fightFlood: true, shoalSater: false, deepwater: false, watch: false, rare: true }
}

//开奖几率
export const FISH = [
    { name: 'B', probability: 0.00976 },
    { name: 1, probability: 0.08252 },
    { name: 2, probability: 0.08252 },
    { name: 3, probability: 0.08252 },
    { name: 4, probability: 0.08252 },
    { name: 5, probability: 0.08252 },
    { name: 6, probability: 0.08252 },
    { name: 7, probability: 0.08252 },
    { name: 8, probability: 0.08252 },
    { name: 9, probability: 0.08252 },
    { name: 10, probability: 0.08252 },
    { name: 11, probability: 0.08252 },
    { name: 12, probability: 0.08252 }
]

//区域赔付
export const COMPENSATE = {
    'brine': 1.8,
    'freshWater': 90,
    'fightFlood': 1.8,
    'shoalSater': 3.6,
    'deepwater': 3.6,
    'watch': 3.6,
    'rare': 3.6,

    'brine-shoalSater-fish1': 10.7,
    'brine-shoalSater-fish2': 10.7,
    'brine-shoalSater-fish3': 10.7,

    'brine-deepwater-fish4': 10.7,
    'brine-deepwater-fish5': 10.7,
    'brine-deepwater-fish6': 10.7,

    'fightFlood-watch-fish7': 10.7,
    'fightFlood-watch-fish8': 10.7,
    'fightFlood-watch-fish9': 10.7,

    'fightFlood-rare-fish10': 10.7,
    'fightFlood-rare-fish11': 10.7,
    'fightFlood-rare-fish12': 10.7
}

//区域关系配置
export const BET_RELATION = {
    1: ['1', 'D', 'A'],
    2: ['2', 'D', 'A'],
    3: ['3', 'D', 'A'],
    4: ['4', 'E', 'A'],
    5: ['5', 'E', 'A'],
    6: ['6', 'E', 'A'],
    7: ['7', 'C', 'F'],
    8: ['8', 'C', 'F'],
    9: ['9', 'C', 'F'],
    10: ['10', 'C', 'G'],
    11: ['11', 'C', 'G'],
    12: ['12', 'C', 'G']
}
export const FISHERY_RECOED = 'fishery:result_record';

export const ERROR_MESSAGE = {
    0: '加载渔场失败',
    1: '下注失败',
    2: '获取开奖记录失败',
    3: '获取玩家列表失败',
    4: '搏一搏操作失败',
    5: '续押失败'
}

// 对押区域
export const mapping = {
    A: 'C',
    C: 'A'
};

// 参与对押有效押注区域
export const validArea = ['A', 'C'];

// 复式押注区域
export const repeatBetsArea = ['D', 'E', 'F', 'G'];

// 限压检测
export const betLimit = 1000000;
