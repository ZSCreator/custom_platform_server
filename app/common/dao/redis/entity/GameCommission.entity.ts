
type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["nid", "way", "targetCharacter", "bet", "win", "settle","open"];

export class GameCommissionInRedis {

    nid: string;

    /**
     * @property 佣金方式
     */
    way: number;
    /**
     * @property 目标角色
     */
    targetCharacter: number;

    /**
     * @property 下注比例
     * @description 百分比 0-1
     */
    bet: number;

    /**
     * @property 赢取比例
     * @description 百分比 0-1
     */
    win: number;

    /**
     * @property 结算比例
     * @description 百分比 0-1
     */
    settle: number;
    /**
     * @property 是否开启抽水模式
     * @description
     */
    open:boolean;
    constructor(initPropList: initPropList<GameCommissionInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
