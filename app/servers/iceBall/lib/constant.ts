/**
 *   元素类型
 *   'A': 红队
 *   'B': 白队
 *   'C': 红队守门员
 *   'D': 裁判
 *   'E': 抢球
 *   'F': 球场
 *   'G': 头盔
 *   'H': 溜冰鞋
 *   'I': 制冰车
 *   'J': 百搭元素
 *   'L': 分散元素
 */
export type elementType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' |'G' | 'H' | 'I' | 'J' | 'L';

// 百搭元素
export const anyElement = 'J';

// 分散元素
export const specialElement = 'L';

// 分散元素最大的数量
export const MAX_SPECIAL_COUNT = 5;

// 免费摇奖次数
export const FREE_SPIN_COUNT = 12;

// 乘数轨道翻倍
export const freeSpinOverlay = {
    '1': 2,
    '2': 3,
    '3': 4,
    '4': 5,
    '5': 8,
}


export const lineNumList = [18, 38, 68, 88];

// 基础倍率 只能选择这里的倍数
export const oddsList = [10, 20, 40, 100, 400, 1000, 2000];
