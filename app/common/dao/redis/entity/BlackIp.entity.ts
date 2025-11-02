
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 玩家在线，在哪个游戏当中以及场和房间号以及连接的服务器
 */
const propExclude = ["ip","time", "creator"];

export class BlackIpInRedis {
    /** ip */
    ip: string;
    /** 时间 */
    time: Date;
    /** 创建者 */
    creator: string;
    constructor(initPropList: initPropList<BlackIpInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

