/**
 * 抽利方式枚举类
 */
export enum GameCommissionWayEnum {
    None = 0,
    /**
     * @property 赢取抽利
     */
    Win = 1,
    /**
     * @property 下注抽利
     */
    BET = 2,
    /**
     * @property 赢和下注抽利
     */
    WIN_BET = 3,
    /**
     * @property 结算抽利
     */
    SETTLE = 4,
}
