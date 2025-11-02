

/**  苹果、桃子、西瓜、葡萄、香蕉
 *   元素类型
 *   'A': 红糖
 *   'B': 紫糖
 *   'C': 绿糖
 *   'D': 蓝糖
 *   'E': 苹果
 *   'F': 桃子
 *   'G': 西瓜
 *   'H': 葡萄
 *   'I': 香蕉
 *   'BOW': 苹果炸弹
 *   'Scatter': scatter
 */
export type elementType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'BOW' | "Scatter";




// 当游戏中出现1个此元素，玩家可进行10次免费游戏且奖金将随机翻倍1~5倍。
export const scatter = 'W';


// 普通元素
export const ordinaryElements = ['A', 'B', 'C', 'D', 'E'];





// 基础下注 只能选择这里的下注
export const baseBetList = [10, 20, 40, 100, 400, 1000, 2000];

// 基础倍率 只能选择这里的倍数
// export const oddsList = [10, 100, 200, 500, 1000, 2000];

//免费游戏权重配置
export const Multiples = [
    { group: 1, weight: 35 },
    { group: 2, weight: 30 },
    { group: 3, weight: 30 },
    { group: 4, weight: 10 },
    { group: 5, weight: 10 },
]