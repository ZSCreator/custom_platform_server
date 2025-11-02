// 限制类型 A 代表
// A 代表 全部 + 赢取
// B 代表不限制
import { WinLimitConfig } from "../interface/commonInterface";
import { GameNidEnum } from "../../../common/constant/game/GameNidEnum";

// slots调控类型
export enum LIMIT_TYPE_ENUM {
    A,      // 限制赢钱
    B       // 不限制
}


export const WIN_LIMITED_CONFIG: WinLimitConfig[] = [
    { lowTopUp: 0, highTopUp: 0, type: LIMIT_TYPE_ENUM.A, coefficient: 1, minimum: 19 },
    { lowTopUp: 1, highTopUp: 2e2, type: LIMIT_TYPE_ENUM.A, coefficient: 3.6, minimum: 56 },
    { lowTopUp: 201, highTopUp: 1e3, type: LIMIT_TYPE_ENUM.A, coefficient: 3.3, minimum: 281 },
    { lowTopUp: 1001, highTopUp: 1e4, type: LIMIT_TYPE_ENUM.A, coefficient: 2.7, minimum: 469 },
    { lowTopUp: 10001, highTopUp: 3e4, type: LIMIT_TYPE_ENUM.A, coefficient: 1.9, minimum: 623 },
    { lowTopUp: 30001, highTopUp: 1e5, type: LIMIT_TYPE_ENUM.A, coefficient: 1.6, minimum: 731 },
    { lowTopUp: 100001, highTopUp: 6e5, type: LIMIT_TYPE_ENUM.A, coefficient: 1.5, minimum: 822 },
    { lowTopUp: 600001, highTopUp: 2e6, type: LIMIT_TYPE_ENUM.A, coefficient: 1.4, minimum: 908 },
    { lowTopUp: 2000001, highTopUp: 2e10, type: LIMIT_TYPE_ENUM.B, coefficient: 1, minimum: 0 },
];

/**
 * nid 映射主题
 */
export const mappingTheme = {
    [GameNidEnum.xiyouji]: 'xiyouji',
    [GameNidEnum.pharaoh]: 'pharaoh',
    [GameNidEnum.buyu]: 'buyu',
    [GameNidEnum.slots777]: 'slots777',
    [GameNidEnum.att]: 'att',
    [GameNidEnum.FruitMachine]: 'fruitMachine',
    [GameNidEnum.SpicyhotPot]: 'spicyhotPot',
    [GameNidEnum.pirate]: 'pirate',
    [GameNidEnum.luckyWheel]: 'luckyWheel',
    [GameNidEnum.Halloween]: 'halloween',
    [GameNidEnum.IceBall]: 'iceBall',
    [GameNidEnum.gems]: 'gems',
    [GameNidEnum.hl6xc]: 'hl6xc',
    [GameNidEnum.BingoMoney]: 'BingoMoney',
    [GameNidEnum.CandyParty]: 'CandyParty',
    [GameNidEnum.FortuneRooster]: 'FortuneRooster',
    [GameNidEnum.DeadBook]: 'DeadBook',
    [GameNidEnum.CandyMoney]: 'CandyMoney',
    [GameNidEnum.MineGame]: 'MineGame',
    [GameNidEnum.RotateParty]: 'RotateParty',
    [GameNidEnum.TriplePanda]: 'TriplePanda',
    [GameNidEnum.Samba]: 'Samba',
    [GameNidEnum.CashSlot]: 'CashSlot',
};