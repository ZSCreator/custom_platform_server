
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 游戏预警
 */
const propExclude = [ "id","uid", "thirdUid", "gameName", "nid", "thingType", "type", "status", "input", "win", "oneWin", "oneAddRmb", "dayWin", "sceneId", "createDate"];

export class AlarmEventThingInRedis {
    id: number;

    uid: string;

    thirdUid: string;


    gameName: string;


    nid: string;


    thingType: number;


    type: number;


    status: number;


    input: number;


    win: number;


    oneWin: number;


    oneAddRmb: number;

    dayWin: number;


    sceneId: number;


    createDate: Date;


    constructor(initPropList: initPropList<AlarmEventThingInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }

}
