
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 记录今日玩家登陆次数以及时间
 */
const propExclude = ["uid","loginTime", "loginNum"];

export class DayLoginPlayerInRedis {
    /** uid */
    uid: string;
    /** 登陆时间 */
    loginTime: Date;
    /** 登陆次数 */
    loginNum: number ;

    constructor(initPropList: initPropList<DayLoginPlayerInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

