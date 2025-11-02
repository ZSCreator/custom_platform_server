'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Iplayer_info extends Document {
    uid: string,
    thirdUid: string,                                   //第三方id
    nameChanged: boolean,                               //是否改过名
    addRmb: number,                                     //立即充值 //单位为分
    addTixian: number,                                  //总共提现多少 //单位为分
    addDayRmb: number,                                  //今日充值 //单位为分
    addDayTixian: number,                               //今日提现多少 //单位为分
    gold: number,                       //金币
    nickname: string,                                   //昵称
    headurl: string,                                    //头像
    language: string, 							        //语言
    // inviteCode: string,            //邀请码
    superior: string,                                   //上级uid
    group_id: string,                                   //顶级uid
    groupRemark: string,                                 //顶级渠道的备注名
    loginTime: number,                                  //登录时间
    lastLogoutTime: number,                             //上次登录离线时间
    createTime: number,
    teamPeople: number,                                 //团队人数
    closeTime: number,                                  //封号时间段
    closeReason: string,                                 //封号原因
    enterRoomTime: number,                              //进入房间时的时间戳
    leaveRoomTime: number,                              //退出房间时的时间戳
    isRobot: number,                                    //0为真实玩家 1 为测试玩家 2 为机器人
    ip: string,                                         //登陆IP
    loginCount: number,                                 //登录次数
    // unlock: {},                                         //游戏押注解锁
    lastGameContents: {},                               //最近游戏 最近房间记录
    abnormalOffline: boolean,                           //是否异常掉线
    kickedOutRoom: boolean,                             //是否被踢出房间
    position: number,                                   //玩家所处位置
    address: string,
    dayMaxWin: number,                                  //玩家当天最大的中奖
    // tools: {},                                          // 道具
    // charm: number,                                      // 魅力值
    dailyFlow: number,                                  // 日流水（用于计算利润，会清除）
    flowCount: number,                                      // 总流水

    todayVipPlayFlowCount: number,                         // 今日自玩Vip返水金币
    yesterdayVipPlayFlowCount: number,                     // 昨日自玩Vip返水金币

    // todayPlayFlowCount: number,                         // 今日自玩总流水
    // yesterdayPlayFlowCount: number,                     // 昨日自玩总流水
    // yesterdayPlayCommissionRatio: number,               // 昨日自玩流水的返佣比例
    // yesterdayReceivePlayCommissionCond: number,         // 昨日自玩流水可领条件
    // yesterdayPlayCommissionReceived: boolean,           // 是否已经领取了昨日的自玩返佣
    // cashedPlayCommission: number,                       // 记录自盘古开天以来已领的自玩返佣

    instantNetProfit: {},                               // 即时纯利润
    // dailyNetProfit: {},                                 // 日纯利润
    // netProfitCount: {},                                 // 总纯利润
    // dailyAbsProfit: number,                             // 日总利润绝对值
    // absProfitCount: number,                             // 总利润绝对值
    // consumedSelfFlow: number,                           // 提佣消耗的的自玩流水
    // consumedPromoteFlow: number,                        // 提佣消耗的的推广流水
    // daily_remain_relief_times: number,                  // 日救济金次数
    // dailyCommission: {},                                // 日抽水明细
    // commissionCount: {},                                // 总抽水明细

    walletGold: number,                                 // 钱包金币
    walletPassword: string,                             // 钱包密码
    walletAddress: string,                              // 钱包地址（对 uid 进行 md5 加密后的字符串）
    /**
     * 幸运红包的相关功能暂时屏蔽
     */
    // lastOpenRedPacketRmb: Number,                       // 上次打开红包的时候的充值总额
    // lastOpenRedPacketTime: Number,                      // 上次打开红包的的时间
    // lastOpenRedPacketGold: Number,                      // 上次打开红包的的时间

    rom_type: string,                                   // 登录设备系统名
    customVar: {},                                      // 玩家自定义变量
    /**
     * 2019年12月28日
     * 打码量
     */
    lastChips: number,            // 上次码量
    totalBonus: number,            // 赠送总的彩金

    /**
     * user_info 合过来的字段
     */

    guestid: string,       // 游客id
    cellPhone: string,
    passWord: string,                           // 手机号登录密码


    /**
     * 2020.7.24 添加API在线会员的字段
     * @param opts
     * 最大带入
     * 最大单注
     */
    maxBetGold: number,

    /**
     * 2020.11.30 第三方平台下分预警金币字段
     */
    earlyWarningGold: number,
    // 第三方下分审核通过字段，下次可自动提走
    earlyWarningFlag: boolean;
    // 第三方下分使用: 进入前的金币
    entryGold: number;
    kickself: boolean;
}

const schema = new Schema({
    // _uid: { type: SchemaTypes.ObjectId, ref: 'user_info' },   //用来引用user_info
    uid: { type: String, index: true },
    thirdUid: { type: String, index: true },              //第三方id
    nameChanged: Boolean,                               //是否改过名
    addRmb: { type: Number, min: 0 },                                     //立即充值 //单位为分
    addTixian: { type: Number, min: 0 },                                  //总共提现多少 //单位为分
    addDayRmb: { type: Number, min: 0 },                                  //今日充值 //单位为分
    addDayTixian: { type: Number, min: 0 },                               //今日提现多少 //单位为分
    gold: { type: Number, min: 0 },                       //金币
    nickname: String,                                   //昵称
    headurl: String,                                    //头像
    language: String, 							        //语言
    // inviteCode: String,                                 //邀请码
    superior: String,                                   //上级uid
    group_id: String,                                   //顶级uid
    groupRemark: { type: String, index: true },                                //顶级渠道的备注
    loginTime: Number,                                  //登录时间
    lastLogoutTime: Number,                             //上次登录离线时间
    createTime: { type: Number, index: true },
    teamPeople: Number,                                 //团队人数
    closeTime: Number,                                  //封号时间段
    closeReason: String,                                 //封号原因
    enterRoomTime: Number,                              //进入房间时的时间戳
    leaveRoomTime: Number,                              //退出房间时的时间戳
    isRobot: { type: Number, index: true },                                   //0为真实玩家 1 为测试玩家 2 为机器人
    ip: { type: String, index: true },                                         //登陆IP
    loginCount: Number,                                 //登录次数
    unlock: {},                                         //游戏押注解锁
    lastGameContents: {},                               //最近游戏 最近房间记录
    abnormalOffline: Boolean,                           //是否异常掉线
    kickedOutRoom: Boolean,                             //是否被踢出房间
    position: Number,                                   //玩家所处位置
    address: String,
    dayMaxWin: Number,                                  //玩家当天最大的中奖
    // tools: {},                                          // 道具
    // charm: Number,                                      // 魅力值
    dailyFlow: Number,                                  // 日流水（用于计算利润，会清除）
    flowCount: Number,                                      // 总流水

    todayVipPlayFlowCount: Number,                         // 今日自玩Vip返水金币
    yesterdayVipPlayFlowCount: Number,                     // 昨日自玩Vip返水金币

    // todayPlayFlowCount: Number,                         // 今日自玩总流水
    // yesterdayPlayFlowCount: Number,                     // 昨日自玩总流水
    // yesterdayPlayCommissionRatio: Number,               // 昨日自玩流水的返佣比例
    // yesterdayReceivePlayCommissionCond: Number,         // 昨日自玩流水可领条件
    // yesterdayPlayCommissionReceived: Boolean,           // 是否已经领取了昨日的自玩返佣
    // cashedPlayCommission: Number,                       // 记录自盘古开天以来已领的自玩返佣

    instantNetProfit: {},                               // 即时纯利润
    dailyNetProfit: {},                                 // 日纯利润
    netProfitCount: {},                                 // 总纯利润
    dailyAbsProfit: Number,                             // 日总利润绝对值
    absProfitCount: Number,                             // 总利润绝对值
    consumedSelfFlow: Number,                           // 提佣消耗的的自玩流水
    consumedPromoteFlow: Number,                        // 提佣消耗的的推广流水
    daily_remain_relief_times: Number,                  // 日救济金次数
    dailyCommission: {},                                // 日抽水明细
    commissionCount: {},                                // 总抽水明细

    walletGold: Number,                                 // 钱包金币
    walletPassword: String,                             // 钱包密码
    walletAddress: String,                              // 钱包地址（对 uid 进行 md5 加密后的字符串）
    /**
     * 幸运红包的相关功能暂时屏蔽
     */
    // lastOpenRedPacketRmb: Number,                       // 上次打开红包的时候的充值总额
    // lastOpenRedPacketTime: Number,                      // 上次打开红包的的时间
    // lastOpenRedPacketGold: Number,                      // 上次打开红包的的时间

    rom_type: String,                                   // 登录设备系统名
    /**
     * 2019年12月28日
     * 打码量
     */
    lastChips: { type: Number, default: 0 },            // 上次码量
    totalBonus: { type: Number, default: 0 },            // 赠送总的彩金

    /**
     * user_info 合过来的字段
     */

    guestid: { type: String, index: true },       // 游客id
    cellPhone: { type: String, default: '' },
    passWord: String,                           // 手机号登录密码



    /**
     * 2020.7.24 添加API在线会员的字段
     * @param opts
     * 最大带入
     * 最大单注
     */
    maxBetGold: Number,

    /**
     * 2020.11.30 第三方平台下分预警字段
     */
    earlyWarningGold: Number,
    // 第三方下分审核通过字段，下次可自动提走
    earlyWarningFlag: Boolean,
    entryGold: Number,
    kickself: Boolean,
}, { versionKey: false });

export const player_info = model<Iplayer_info>("player_info", schema, 'player_info');
// TODO 频闭代码， 新mongoose编译不通过，如重新打开则恢复注释
// schema.index({ uid: 1, type: -1 });
// schema.index({ thirdUid: 1, type: -1 });
// schema.index({ guestid: 1, type: -1 });