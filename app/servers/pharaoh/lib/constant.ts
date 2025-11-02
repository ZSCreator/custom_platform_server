// 引爆 bonus 雷管
export type specialElementType = 'F' | 'S' | 'H';

/**
 *   元素类型
 *   'A': 圣甲虫
 *   'B': 石碑
 *   'C': 十字架
 *   'D': 守护神
 *   'E':  法老
 *   'F': '引爆'
 *   'S': 'bonus',
 *   'H': '雷管',
 */
export type elementType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'S' | 'H';

// 雷管
export const detonator = 'H';

// 引爆元素
export const squib = 'F';

// bonus 元素
export const bonus = 'S';

// 需要直接消除的特殊元素
export const clearSpecialElements = ['S', 'H'];

// 普通元素
export const ordinaryElements = ['A', 'B', 'C', 'D', 'E'];

// 特殊元素数组
export const specialElements = ['F', 'S', 'H'];

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

// 金币
export const gold = 'gold';

// 银币
export const silver = 'silver';

// 铜币
export const copper = 'copper';

// 小游戏路途奖品代表投次数加一
export const dice = 'dice';

// 小游戏bonus类型代表走到尽头 领取大奖
export const littleBonus = 'bonus';

// 币种集合
export const coinList = [gold, silver, copper];