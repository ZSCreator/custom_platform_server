import { RoleEnum } from "../../../constant/player/RoleEnum";
import { Column, CreateDateColumn } from "typeorm";

type initPropList<T> = { [P in keyof T]?: T[P] };

const propExclude = ["uid", "groupRemark", "thirdUid", "lineCode", "myGames", "nickname", "superior", "shareUid", "headurl", "gold", "isRobot", "position", "walletGold", "passWord", "closeTime", "kickself", "updatetime", "maxBetGold", "createTime",
    "loginCount", "addDayRmb", "addDayTixian", "oneAddRmb", "oneWin", "group_id", "language", "guestid", "cellPhone", "ip", "language", "sid", "dayMaxWin", "dailyFlow", "flowCount",
    "instantNetProfit", "kickedOutRoom", "abnormalOffline", "addRmb", "userId", "addTixian", "level",  "withdrawalChips"];

export class PlayerInRedis {
    /**
     * @property 玩家id
     */
    uid: string;

    /**
     * @property 玩家id
     */
    thirdUid: string;
    /**
     * @property 玩家id
     */
    userId: string;
    /**
     * @property 玩家租户的名称
     */
    groupRemark: string;

    /**
     * @property 玩家租户的名称
     */
    superior: string;

    /**
     * @property 推广uid  ========APP版本
     */
    shareUid: string;

    /**
     * @property 站点字段作为玩家房间隔离条件
     */
    lineCode: string;

    /**
     * @property 玩家最近玩的10条游戏的nid
     */
    myGames: string;

    /**
     * @property 顶级平台的uid
     */
    group_id: string;

    /**
     * @property 访客编号
     */
    guestid: string;

    /**
     * @property 当日充值金额    ==== 今日带入 //单位为分
     */

    addDayRmb: number;

    /**
     * @property 当日提现金额 =========== 今日带出金额
     */
    addDayTixian: number;

    /**
     * @property 提现金额
     */
    addTixian: number;
    /**
     * @property 每次带入累计赢取
     */
    oneWin: number;

    /**
     * @property 每次带出
     * @description 单位为分
     */
    oneAddRmb: number;

    /**
     * @property 玩家昵称
     */
    nickname: string;

    /**
     * @property 玩家头像
     */
    headurl: string;

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
     * @property 玩家所处的位置
     * @property 0 大厅,1 选场list,2 游戏(房间)
     */
    position: number;

    /**
     * @property 钱包金币
     */
    walletGold: number;

    /**
     * @property 密码
     */
    passWord: string;

    /**
     * @property 玩家语言
     */
    language: string;

    /**
     * @property 手机号码
     */
    cellPhone: string;
    /**
     * @property IP
     */
    ip: string;
    /**
     * @property sid
     */
    sid: string;

    /**
     * @property 玩家当天最大的中奖
     */
    dayMaxWin: number;

    /**
     * @property 日流水
     * @description 用于计算利润，会清除
     */
    dailyFlow: number;

    /**
     * @property 总流水
     */
    flowCount: number;
    /**
     * @property 即时利润统计，可清除
     */

    instantNetProfit: number;

    /**
     * @property 玩家封禁到什么时候
     */
    closeTime: Date;

    /** 顶号 */
    kickself: boolean;

    /**
     * @property 新最后一次操作 时间戳 单位秒
     */
    updatetime: number;

    /**
     * @property 登陆次数
     */
    loginCount: number;
    /**
     * @property 是否已被踢出房间
     */
    kickedOutRoom: boolean;
    /**
     * @property 是否是异常掉线
     */
    abnormalOffline: boolean;

    /**
     * @property 创建时间
     */
    createTime: Date;
    /**
     * @property 最大单注
     */
    maxBetGold: number;

    /**
     * @property 总共充值  单位为分======gold 最大带入金币
     */
    addRmb: number;

    /**o
     * @property vip 等级
     */
    level: number;

    /**
     * @property 提现码量
     */
    withdrawalChips: number;
    constructor(initPropList: initPropList<PlayerInRedis>) {
        for (const [key, val] of Object.entries(initPropList)) {
            if (!propExclude.includes(key)) {
                continue;
            }
            this[key] = val;
        }
    }
}

