
type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["id","typeId", "sort", "open", "name", "nidList","hotNidList"];

export class SystemGameTypeInRedis {
    /** 游戏类型Id  */
    id: number;
    /** 游戏类型Id  1 ,2,3,4,5 */
    typeId: number;
    /** 序号 1 ,2,3,4,5 */
    sort: number;
    /** 是否显示 */
    open: boolean;
    /** 游戏分类名称 */
    name: string;
    /** nid 的集合 [1,2,3,4] */
    nidList: string;
    /** hotNidList 的集合 [1,2,3,4] */
    hotNidList: string;
    constructor(initPropList: initPropList<SystemGameTypeInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

