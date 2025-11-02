export interface IBaseScene {
    /** @property nid 游戏编号 */
    nid: string;

    /** @property id 场 id */
    id: number;

    /** @property name 场名称 */
    name: string;

    /** @property entryCond 准入金额 */
    entryCond: number;

    /** @property minBet 最低下注额 */
    // minBet: number;

    /** @property maxBet 最高下注额 */
    // maxBet: number;

    /** @property magnification 结算倍率 */
    // magnification: number;

    /** @property room_count 房间数 */
    room_count: number;
}
