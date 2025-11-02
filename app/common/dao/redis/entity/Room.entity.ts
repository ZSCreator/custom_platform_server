type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["id", "serverId", "nid", "sceneId", "roomId", "jackpot", "runningPool", "profitPool", "open", "jackpotShow", "betUpperLimit", "createTime", "updateTime"];

export class RoomInRedis {

    id: number;

    serverId: string;

    nid: string;

    sceneId: number;

    roomId: string;

    jackpot: number;

    runningPool: number;

    profitPool: number;

    open: boolean;

    jackpotShow: any;

    betUpperLimit: any;

    createTime: Date;

    updateTime: Date;
    constructor(initPropList: initPropList<RoomInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }

}
