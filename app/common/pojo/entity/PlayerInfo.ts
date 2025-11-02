import Utils = require('../../../utils/index');
import HallConst = require('../../../consts/hallConst');
import { PositionEnum } from '../../constant/player/PositionEnum';
import { RoleEnum } from '../../constant/player/RoleEnum';
import { ControlKinds } from "../../../services/newControl/constants";
import { EventEmitter } from "events";
import { pinus, Session, FrontendSession } from "pinus";
import * as commonUtil from '../../../utils/lottery/commonUtil';

// 玩家账户定义
export class PlayerInfo {
    uid: string;
    /**
     * 第三方平台id
     */
    thirdUid: string;

    /**总共立即充值  //单位为分======gold 最大带入金币 */
    addRmb: number;

    /**总共提现多少钱 //单位为分 */
    addTixian: number;

    /**今日充值  == 带入 //单位为分 */
    addDayRmb: number;

    /**今日提现多少钱 === 带出//单位为分 */
    addDayTixian: number;

    /**每次带入  不用存入永久数据库//单位为分 */
    oneAddRmb: number;

    /**每次带入累计赢取  不用存入永久数据库//单位为分 */
    oneWin: number;
    /**金币*/
    public gold: number;

    /**昵称 */
    public nickname: string;

    headurl: string;
    /**语言 */
    language: string;
    /**
     * 上级uid
     */
    superior: string;
    lineCode: string;
    /**
     * 顶级uid
     */
    group_id: string;
    /**
     * 顶级渠道的备注名
     */
    groupRemark: string;

    /**登录时间 */
    loginTime: number;

    /**上次登录离线时间 */
    lastLogoutTime: number;

    /**创建时间 */
    createTime: Date;

    /**0为真实玩家 3 为测试玩家 2 为机器人 */
    isRobot: RoleEnum;

    // /**进入房间时的时间戳 */
    // enterRoomTime: number;

    // /**
    //  * 退出房间的时间错
    //  */
    // leaveRoomTime: number;

    sid: string;

    ip: string;

    /**登录次数 */
    loginCount: number;


    /**是否已被踢出房间 */
    kickedOutRoom: boolean;

    /**是否是异常掉线，true 表示异常掉线，false 表示正常离线 */
    abnormalOffline: boolean;

    /**玩家所处的位置 api 接口会根据这个状态判断 是否可以下分*/
    position: PositionEnum;

    /**玩家封印到什么时候 */
    closeTime: number;

    /**封印原因 */
    closeReason: string;

    /**玩家当天最大的中奖 */
    dayMaxWin: number;


    /**日流水（用于计算利润，会清除） */
    dailyFlow: number;

    /**总流水 */
    flowCount: number;

    /**即时利润统计，可清除，各个游戏分开统计 */
    instantNetProfit: number;

    /**钱包金币 */
    walletGold: number;

    /**登录设备系统名 */
    rom_type: string;

    /**是否在线(不用存入redis)  true 表示在线*/
    onLine: boolean;

    /**是否恢复在线(不用存入redis) 默认false,通知游戏要回来到load中间时间 true*/
    isOnLine: boolean;


    /** 游客Id */
    guestid: string;

    /** 手机 */
    cellPhone: string;

    /** 密码 */
    passWord: string;




    /**
     * 2020.7.24 添加API在线会员的字段
     * @param opts
     * 最大单注
     */
    maxBetGold: number;

    /**
     * 第三方平台下分预警金币字段
     */
    earlyWarningGold: number;
    // 第三方下分审核通过字段
    earlyWarningFlag: boolean;

    // 第三方平台下分: 进入前的金额
    entryGold: number;

    /**待机轮数 限于回合制游戏 */
    standbyRounds: number = 0;

    /** 顶号 */
    kickself: boolean;
    /**更新最后一次操作 时间戳 单位秒 */
    updatetime: number;

    /** 调控的类型 */
    controlType: ControlKinds;


    constructor(opts: any) {
        this.uid = opts.uid;
        this.thirdUid = opts.thirdUid || '';
        this.addRmb = opts.addRmb || 0;                                                                 // 总共立即充值 (最大带入)     //单位为分
        this.addTixian = opts.addTixian || 0;                                                           // 总共提现多少钱    //单位为分
        this.addDayRmb = opts.addDayRmb || 0;                                                           // 今日充值  (第三方带入)       //单位为分
        this.addDayTixian = opts.addDayTixian || 0;                                                     // 今日提现多少钱 (第三方带出)   //单位为分
        this.oneAddRmb = opts.oneAddRmb || 0;                                                           //  一次带入多少钱 (第三方带出)   //单位为分
        this.gold = opts.gold || 0;                                                                     // 金币分成普通金币 和充值金币1-普通金币 2-充值金币
        this.nickname = opts.nickname || 'P' + this.uid;                                                // 昵称
        this.headurl = opts.headurl || Utils.getHead();                                                 // 头像
        this.language = opts.language || HallConst.LANGUAGE.DEFAULT; 			                        // 语言
        this.superior = opts.superior || '';                                                            // 上级uid
        this.group_id = opts.group_id || '';                                                            // 顶级uid
        this.groupRemark = opts.groupRemark || '';                                                      // 租客渠道备注名
        this.loginTime = opts.loginTime || 0;                                                           // 登录时间
        this.lastLogoutTime = opts.lastLogoutTime || 0;                                                 // 上次登录离线时间
        this.createTime = new Date();                                                // 创建时间
        this.isRobot = opts.isRobot || RoleEnum.REAL_PLAYER;                                            // 0为真实玩家 3 为测试玩家 2 为机器人
        this.sid = opts.sid || '';                                                                      // 所在服务器ID
        this.ip = opts.ip || '';                                                                        // 登陆IP
        this.loginCount = opts.loginCount || 0;                                                         // 登录次数
        this.abnormalOffline = opts.abnormalOffline || false;                                           // 是否是异常掉线，true 表示异常掉线，false 表示正常离线
        this.kickedOutRoom = opts.kickedOutRoom || false;                                               // 是否已被踢出房间
        this.position = opts.position || PositionEnum.HALL;                                             //

        this.closeTime = opts.closeTime || 0;                                                           // 玩家封印到什么时候
        this.closeReason = opts.closeReason || '';                                                           //封印原因
        this.dayMaxWin = opts.dayMaxWin || 0;                                                           // 玩家当天最大的中奖
        this.dailyFlow = opts.dailyFlow || 0;                                                           // 日流水（用于计算利润，会清除）
        this.flowCount = opts.flowCount || 0;                                                           // 总流水
        this.oneWin = opts.oneWin || 0;                                                                 // 每次带入累计赢取
        this.instantNetProfit = opts.instantNetProfit || 0;                                             // 即时利润统计，可清除，各个游戏分开统计  //改成number, 子游戏明细不要
        // 位图表示，每日首次登录若有奖励，数组中push一个1，表示未领取，领取后，将1改为0
        this.walletGold = opts.walletGold || 0;                                                         // 钱包金币
        this.rom_type = opts.rom_type || '';                                                            // 登录设备系统名
        this.onLine = true;                                                                             // 是否在线(不用存入redis)
        this.isOnLine = false;                                                                          // 是否恢复在线(不用存入redis)
        /**vip相关参数 */
        /**
         * user_info的表
         */
        this.guestid = opts.guestid || '';                                                                // 玩家自定义变量
        this.cellPhone = opts.cellPhone || '';                                                                // 玩家自定义变量
        this.passWord = opts.passWord || '';                                                                // 玩家自定义变量
        this.maxBetGold = opts.maxBetGold || 0              // 最大押注
        this.earlyWarningGold = opts.earlyWarningGold || 0;
        this.earlyWarningFlag = opts.earlyWarningFlag || false;
        this.entryGold = opts.entryGold || 0;
        this.kickself = opts.kickself || false;
        this.controlType = ControlKinds.NONE;
        this.lineCode = opts.lineCode;
        this.updatetime = opts.updatetime || Math.round(new Date().getTime() / 1000);
    }

    /**
     * 包装玩家基础信息
     */
    basicsStrip() {
        return {
            uid: this.uid,
            nickname: this.nickname,
            headurl: this.headurl,
            isRobot: this.isRobot
        }
    }

    /**
     * 设置调控类型
     * @param type
     */
    setControlType(type: ControlKinds) {
        if (type !== ControlKinds.NONE) {
            this.controlType = type;
        }
    }

    /**
     * 初始化调控类型
     */
    initControlType() {
        this.controlType = ControlKinds.NONE;
    }

    /**
     * 更新最后一次操作 时间戳 单位秒
     */
    update_time() {
        this.updatetime = Math.round(new Date().getTime() / 1000);
    }

    registerListener() { }
    destroy() { }

}
