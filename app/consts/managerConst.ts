'use strict';

// 提现的常量
const TixianConst = module.exports;

//提现的type类型
export const TIXIAN_TYPE = {
    NO_PENDING:0,                     //未审核0
    PASS: 1,            // 通过
    REFUSED: 2,         // 拒绝
    PENDING: 9,          // 正在审核当中
    GUADAN: 10          // 挂单
};

export const TIXIAN_CURRENCY  = 100;  // 提现的货币单位为 元  乘以 100  记录在playerInfo 里面有分

//提现的type 报错 类型
export const TIXIAN_TYPE_ERROR = {
    ENTER_PENDING: '该订单已经进入待审核',
    NOT_EXIST: '该订单不存在',
    IS_CLOSE:  '该订单已经被冻结 ',
    IS_OPEN:  '该订单未被冻结 ',
    MANAGER:  '该订单不是这个管理员操作 ',
};

//代付 remittance   类型
//是否已经汇款   0 为默认没汇款 1 为已汇款  2 为出款失败  3 为出款中
export const TIXIAN_REMITTANCE = {
    NO_REMITTANCE : 0,
    PASS: 1,
    REFUSE_REMITTANCE:  2,
    REMITTANCE_ING:  3 ,
    GUADAN: 10          // 挂单
};

//提现的type 报错 类型
export const TIXIAN_REMITTANCE_ERROR = {
    ENTER_PENDING: '该订单已经进入出款状态',
    NOT_EXIST: '该订单不存在',
    NOT_PASS:  '该订单未审核通过不能出款 ',
    MANAGER:  '该订单不是这个管理员操作 ',
    IS_SHENHE: '该订单已经被审核',
};
//客服回信息类型
//1为没处理,2为处理中 3为已处理 4为已回复
export const CUSTOMER_TYPE = {
    NO_REPLY : 1,
    PASS: 3,
    REPLY: 4,
    REPLY_ING:  2 ,
};
//提现的type 报错 类型
export const CUSTOMER_TYPE_ERROR = {
    NOT_EXIST: '该反馈信息不存在',
    REPLY_ING:   '该反馈信息已在处理中',
    PASS:   '该反馈信息已在处理完成'
};

//大区渠道day_qudao_profits_info ,用一个uid来表示整个系统
export const SYSTEM_UID  = '00000001';
//大区渠道day_qudao_profits_info ,用一个uid来表示整个系统代理等级大于2的，属于裂变玩家
export const SYSTEM_LIEBIAN_UID  = '00000002';
//大区渠道day_qudao_profits_info ,用一个uid来表示整个系统玩家从官网下载下来的玩家，属于官网玩家
export const SYSTEM_GUANWANG_UID  = '00000003';
//大区渠道day_qudao_profits_info ,用一个uid来表示IOS
export const SYSTEM_IOS_UID  = '00000004';
//大区渠道day_qudao_profits_info ,用一个uid来表示ANDROID
export const SYSTEM_ANDRIOD_UID  = '00000005';
