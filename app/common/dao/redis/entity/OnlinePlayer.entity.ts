
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 玩家在线，在哪个游戏当中以及场和房间号以及连接的服务器
 */
const propExclude = ["uid","nid", "isRobot", "entryHallTime", "sceneId", "roomId", "frontendServerId", "entryGameTime", "hallServerId"];

export class OnlinePlayerInRedis {
    /** uid */
    uid: string;
    /** 游戏NID */
    nid: string;
    /** 是否是机器人 */
    isRobot: number;
    /** 进入大厅时间 */
    entryHallTime: Date;
    /** 场编号 */
    sceneId: number;
    /** 房间编号 */
    roomId: string;
    /** 场编号 */
    frontendServerId: string;
    /** 进入游戏时间 */
    entryGameTime: Date;
    /** 大厅连接服务器 */
    hallServerId: string;

    constructor(initPropList: initPropList<OnlinePlayerInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

