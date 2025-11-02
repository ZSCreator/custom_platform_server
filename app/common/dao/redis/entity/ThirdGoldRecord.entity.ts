
type initPropList<T> = { [P in keyof T]?: T[P] };
/**
 * 上下分预警
 */
const propExclude = ["id", "orderId", "uid", "type", "agentRemark", "goldChangeBefore", "gold", "goldChangeAfter", "status", "remark", "createDateTime"];

export class ThirdGoldRecordInRedis {
    id: number;


    orderId: string;


    uid: string;


    type: number;


    agentRemark: string;


    goldChangeBefore: number;


    gold: number;


    goldChangeAfter: number;


    status: number;


    remark: string;


    createDateTime: Date;


    constructor(initPropList: initPropList<ThirdGoldRecordInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}
