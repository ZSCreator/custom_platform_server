
type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["uid","platformName", "platformGold", "roleType", "rootUid", "deepLevel"];

export class playerAgentInRedis {
    /**
     * @property 玩家id
     */
    uid: string;
    /**
     * @property 玩家id
     */
    platformName: string;
    /**
     * @property 玩家租户的名称
     */
    platformGold : number;

    /**
     * @property 玩家租户的名称
     */
    roleType : number;

    /**
     * @property 根玩家编号
     */
    rootUid : string;

    /**
     * @property 关系层级
     */
    deepLevel : number;

    constructor(initPropList: initPropList<playerAgentInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

