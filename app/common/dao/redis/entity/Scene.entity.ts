type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["nid", "sceneId", "name", "entryCond", "lowBet", "capBet", "allinMaxNum", "room_count", "canCarryGold", "blindBet", "ante", "bullet_value"];

export class SceneInRedis {

    nid: string;

    sceneId: number;

    name: string;

    entryCond: number;

    lowBet: number;

    capBet: number;

    allinMaxNum: number;

    room_count: number;

    ante: number;

    canCarryGold: any;

    blindBet: any;
    /**捕鱼字段 */
    bullet_value: number;
    constructor(initPropList: initPropList<SceneInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            /* if (!propExclude.includes(key)) {
                continue;
            } */
            this[key] = val;
        }
    }

}
