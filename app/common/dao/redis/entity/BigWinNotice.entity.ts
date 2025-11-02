
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 走马灯
 */
const propExclude = ["messageID", "isRobot", "params"];

export class BigWinNoticeInRedis {
    /** 喇叭编号 */
    messageID: string;
    /** 是否是机器人 */
    isRobot: number;
    /** 发送喇叭内容 */
    params: [];

    constructor(initPropList: initPropList<BigWinNoticeInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }

}

