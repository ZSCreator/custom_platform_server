// 引爆 bonus 雷管
export type specialElementType = 'F' | 'S' | 'H';

/**
 *   元素类型
 *   'A': 方块1
 *   'B': 方块2
 *   'C': 方块3
 *   'D': 方块4
 *   'E': 方块5
 * 
 *   'S': 'scatter', 当游戏中出现1个此元素，玩家可进行10次免费游戏且奖金将随机翻倍1~5倍。
 *   'H': '雷管',
 */
export type elementType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'S' | 'H';

// 雷管 特殊宝石
export const detonator = 'H';

// 引爆元素 特殊宝石 随机消除一类不中奖元素
// export const squib = 'F';

// 当游戏中出现1个此元素，玩家可进行10次免费游戏且奖金将随机翻倍1~5倍。
export const scatter = 'S';

// 需要直接消除的特殊元素
// export const clearSpecialElements = ['S', 'H'];

// 普通元素
export const ordinaryElements = ['A', 'B', 'C', 'D', 'E'];

// 特殊元素数组
export const specialElements = ['H'];

// 游戏关卡映射元素数量
export const gameLevelMappingElementsNum = {
    '1': 4,
    '2': 5,
    '3': 6,
};

// 基础下注 只能选择这里的下注
export const baseBetList = [1, 2, 3, 4, 5];

// 基础倍率 只能选择这里的倍数
export const oddsList = [10, 100, 200, 500, 1000, 2000];

//免费游戏权重配置
export const Multiples = [
    { group: 1, weight: 35 },
    { group: 2, weight: 30 },
    { group: 3, weight: 30 },
    { group: 4, weight: 10 },
    { group: 5, weight: 10 },
]