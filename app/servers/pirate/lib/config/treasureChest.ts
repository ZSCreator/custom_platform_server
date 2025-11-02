// 宝箱总个数
export const treasureChestNumber = 7;

// 钥匙数量
export const keyNumber = 3;

// 金币宝箱
export const goldTreasureChest = '1';

// 免费摇奖宝宝箱
export const freeSpinTreasureChest = '2';

// 透视宝箱
export const perspectiveTreasureChest = '3';

// 钥匙宝箱
export const keyTreasureChest = '4';

/**
 * 宝箱类型
 * 1: N倍押注金币
 * 2: 免费摇奖freeSpin
 * 3: 透视
 * 4：钥匙 一把钥匙有一次看宝箱的机会
 */
export type treasureChestType = '1' | '2' | '3' | '4';

/**
 * 宝箱
 * @property open 是否开启
 * @property type 宝箱类型
 * @property visible 是否可见
 * @property specialAttributes 特殊属性 不同类型的宝箱含义不同
 * 如果是是N倍押注金币宝箱 则代表N倍奖励
 * 如果是免费摇奖宝箱 则代表摇奖几次
 * 如果是透视宝箱 则改数值没有意义
 * 如果是钥匙宝箱 则代表钥匙有几把，一把钥匙有
 * @property name 宝箱名字
 */
export interface ITreasureChest {
    open: boolean,
    visible: boolean,
    type: treasureChestType,
    specialAttributes: number,
    name: string,
}

/**
 * 基础宝箱
 */
export const baseTreasureChests: ITreasureChest[] = [
    {open: false, visible: false, type: goldTreasureChest, specialAttributes: 5, name: '5倍押注宝箱'},
    {open: false, visible: false, type: goldTreasureChest, specialAttributes: 10, name: '10倍押注宝箱'},
    {open: false, visible: false, type: goldTreasureChest, specialAttributes: 15, name: '15倍押注宝箱'},
    {open: false, visible: false, type: freeSpinTreasureChest, specialAttributes: 5, name: '5次免费摇奖宝箱'},
    {open: false, visible: false, type: freeSpinTreasureChest, specialAttributes: 10, name: '10次免费摇奖宝箱'},
    {open: false, visible: false, type: perspectiveTreasureChest, specialAttributes: 0, name: '透视宝箱'},
    {open: false, visible: false, type: keyTreasureChest, specialAttributes: 1, name: '钥匙宝箱'},
];
