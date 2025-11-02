// 行数
export const row = 3;

// 列数
export const column = 5;

// 猴子元素
export const monkey = 'i';

// wild元素
export const wild = 'wild';

// bonus元素
export const bonus = 'bonus';

// 元素类型
export type elementType = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'wild' | 'bonus';

// 特殊元素 这些元素可以进行二连
export const specialElements = ['g', 'h', 'i'];

// 西游记 “如意金箍棒” 五个字图标
export const characterIcon = ['1', '2', '3', '4', '5'];

// 下注元素
export const betNums = [2, 10, 40, 100, 400, 2000];

/**
 * 元素映射名字
 */
export const mappingElement = {
    'a': '捆仙索',
    'b': '铃铛',
    'c': '宝塔',
    'd': '铜锣',
    'e': '琵琶',
    'f': '芭蕉扇',
    'g': '乾坤袋',
    'h': '葫芦',
    'i': '猴子',
    'wild': 'wild',
    'bonus': 'bonus',
};


export const element = {
    general: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    special: ['wild', 'bonus'],
};


export const linesNum = [9, 15, 25];
export const bets = [2, 10, 40, 100, 400, 2000];

// 最大中奖赔率
export const maxAward = 23;