
type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["uid", "nid", "gameName", "gameOrder", "roomId", "validBet", "profit", "createTimeDate", "validBet"];
export class GameRecordInRedis {



    uid: string;

    nid: string;

    // superior: string;

    /**
     * @property 租客的备注信息
     */
    // groupRemark: string
    /**
     * @property 游戏编号
     */

    gameName: string;
    /**
     * @property 注单号
     */

    gameOrder: string;


    // sceneId: number;
    /**
     * @property 场名
     */
    // sceneName: string;


    roomId: string;

    /**
     * @property 玩家此时金币携带量
     */

    // gold: number;


    /**
     * @property 有效下注额
     */
    validBet: number;

    /**
     * @property 有效下注额
     */
    // input: number;

    /**
     * @property 纯利
     */
    profit: number;

    /**
     * @property 总充值
     */

    // addRmb: number;

    /**
     * @property 总提现
     */

    // addTixian: number;

    /**
     * 订单创建时间
     */
    createTimeDate: Date;

    constructor(initPropList: initPropList<GameRecordInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }


}