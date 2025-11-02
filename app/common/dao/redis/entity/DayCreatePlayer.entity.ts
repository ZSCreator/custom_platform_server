
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 记录今日玩家登陆次数以及时间
 */
const propExclude = ["uid","createTime"];

export class DayCreatePlayerInRedis {
    /** uid */
    uid: string;
    /** 登陆时间 */
    createTime: number;

    constructor(initPropList: initPropList<DayCreatePlayerInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

