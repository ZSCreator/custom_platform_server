'use strict';
/**
 * 非游戏记录金币变化记录到游戏记录的nid 类型
 * @property  ZENG_SONG              赠送
 * @property CELL_PHONE              绑定手机赠送
 * @property GAME_CLOSE              游戏中断
 * @property TI_XIAN                 体现
 * @property CAI_JIN                 首充彩金
 */
export enum GameRecordTypeNidEnum {

    ACTIVE  = "g1",
    TI_XIAN = "g2",
    PAY = "g3",
    GAME_CLOSE = "g4",
    CELL_PHONE = "g5" ,
    CAI_JIN = "g6" ,
}

/**
 * 非游戏记录金币变化记录到游戏记录的nid 类型
 * @property  ZENG_SONG              赠送
 * @property CELL_PHONE              绑定手机赠送
 * @property GAME_CLOSE              游戏中断
 * @property TI_XIAN                 体现
 * @property CAI_JIN                 首充彩金
 */

export enum GameRecordTypeNameEnum {

    ACTIVE  = "游戏活动",
    TI_XIAN = "提现失败—邮件返回",
    PAY = "充值",
    GAME_CLOSE = "游戏中断",
    CELL_PHONE = "手机绑定" ,
    CAI_JIN = "首充彩金" ,
}