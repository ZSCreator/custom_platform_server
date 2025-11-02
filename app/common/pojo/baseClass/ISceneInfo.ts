/**
 * @property id                     场  编号
 * @property sceneName              场名称
 * @property accessToGold           准入金额
 * @property minBet                 最低金额
 * @property maxBet                 最高金额
 */
export class ISceneInfo {
    /** @property {number} id  场  编号 */
    id: number;

    /** @property {string} sceneName 场名称 */
    sceneName: string;

    /** @property {string} accessToGold 准入金额 */
    accessToGold: number;

    /** @property {string} minBet 最低金额 */
    minBet: number;

    /** @property {string} maxBet 最高金额 */
    maxBet: number;

    constructor(prop: ISceneInfo) {
        const {
            id,
            sceneName,
            accessToGold,
            minBet,
            maxBet
        } = prop;

        this.id = id;
        this.sceneName = sceneName;
        this.accessToGold = accessToGold;
        this.minBet = minBet;
        this.maxBet = maxBet;
    }
}
