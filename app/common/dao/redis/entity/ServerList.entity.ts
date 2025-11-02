
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 短信验证码，验证的记录
 */
const propExclude = ["serverName", "serverHttp",];

export class ServerListInRedis {
    /** 服务器名 */
    serverName: string;
    /** 服务器地址 */
    serverHttp: string;

    constructor(initPropList: initPropList<ServerListInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

