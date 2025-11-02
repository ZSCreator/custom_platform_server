
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 短信验证码，验证的记录
 */
const propExclude = ["auth_code", "createTime", "status", "phone"];

export class AuthCodeInRedis {
    /** 验证码 */
    auth_code: string;
    /** 创建事件 */
    createTime: Date;
    /** 状态 */
    status: number;
    /** 手机号 */
    phone: string;

    constructor(initPropList: initPropList<AuthCodeInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

