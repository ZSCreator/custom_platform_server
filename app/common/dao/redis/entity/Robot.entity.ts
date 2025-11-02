import { RoleEnum } from "../../../constant/player/RoleEnum";
import { Column } from "typeorm";

type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["uid", "nickname", "headurl", "gold", "isRobot", "position", "language", "guestid", "language", "robotOnLine", "sid", "updatetime", "kickedOutRoom"];

export class RobotInRedis {
    /**
     * @property 玩家id
     */
    uid: string;

    /**
     * @property 访客编号
     */
    guestid: string;

    /**
     * @property 玩家昵称
     */
    nickname: string;

    /**
     * @property 玩家头像
     */
    headurl: string;

    /**
     * @property sid
     */
    sid: string;

    /**
     * @property 玩家所处的位置
     * @property 0 大厅,1 选场list,2 游戏(房间)
     */
    position: number;

    /**
     * @property 玩家金币
     * @description 单位为分
     */
    gold: number;

    /**
     * @property 角色身份
     * @description 0为真实玩家 3 为测试玩家 2 为机器人
     */
    isRobot: RoleEnum;

    /**
     * @property 玩家语言
     */
    language: string;


    /**
     * @property 机器人是否在线
     */
    robotOnLine: boolean;

    /**
     * @property 新最后一次操作 时间戳 单位秒
     */
    updatetime: number;

    kickedOutRoom: boolean;
    
    abnormalOffline: boolean;

    constructor(initPropList: initPropList<RobotInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

