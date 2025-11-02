
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 白名单
 */
const propExclude = ["createTime", "ip", "account", "id"];

export class WhiteIpRecordInRedis {
    id: number;
    /** ip */
    ip: string;
    /** 账号 */
    account: string;

    constructor(initPropList: initPropList<WhiteIpRecordInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

