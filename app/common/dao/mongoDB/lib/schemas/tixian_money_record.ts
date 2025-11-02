'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Itixian_money_record extends Document {
    id: string,  // 记录id
    uid: string,                        // uid
    bankCardName: string,               // 银行卡户名
    bankName: string,                   // 开户行
    bankCardNo: string,                 // 银行卡号
    openBankAddress: string,            // 银行开户号
    bankCode: string,                   // 银行的验证码
    moblieNO: number,                   // 银行预留的电话
    selfAddRmb: number,                 // 提现的时候的充值金额
    selfTixian: number,                 // 提现的时候的累计提现(不包含了本次,现在是通过出款过后)
    nickname: string,                   // 玩家名称
    playerType: number,                 // 玩家类型 1 为代理 0 为普通玩家
    createTime: number,                 // 创建时间
    money: number,                      // 提取得到金额
    remark: string,                     // 备注是谁通过审核的
    type: number,                       // 0为未审核  1为已审核通过 2为审核不通过 9 为订单审核中
    remittance: number,                 // 是否已经汇款  0 为默认没汇款 1 为已汇款  2 为出款失败  3 为出款中    10  "挂单"
    remittanceRemark: string,           // 备注是谁汇款的
    gold: number,                       // 现在的金币
    moneyNum: number,                   // 提取金额
    daiFuStatus: number,                // 代付状态，1：代付中，2：代付失败，3：代付成功
    daiFuFlag: boolean,                 // 自动代付
    daiFuAccountName: string,           // 代付商户名称
    shopNo: string,                     // 代付时，自有订单编号
    outTradeNo: string,                 // 代付时，商户编号
    closeStatus: boolean,               // 该订单是否冻结
    content: string,                    // 拒绝理由
    remittanceContent: string,          // 拒绝理由
    nearPayMoney: number,               // 最近一次充值金额
    nearFlowCount: number,              // 最近一次充值开始到当前生成这条记录为止的累计流水
}
/**
 * 提现金额的记录
 */
const schema = new Schema({
    id: { type: String, index: true },  // 记录id
    uid: { type: String, index: true }, // uid
    bankCardName: String,               // 银行卡户名
    bankName: String,                   // 开户行
    bankCardNo: String,                 // 银行卡号
    openBankAddress: String,            // 银行开户号
    bankCode: String,                   // 银行的验证码
    moblieNO: Number,                   // 银行预留的电话
    selfAddRmb: Number,                 // 提现的时候的充值金额
    selfTixian: Number,                 // 提现的时候的累计提现(不包含了本次,现在是通过出款过后)
    nickname: String,                   // 玩家名称
    playerType: Number,                 // 玩家类型 1 为代理 0 为普通玩家
    createTime: { type: Number, index: true },                 // 创建时间
    money: Number,                      // 提取得到金额
    remark: String,                     // 备注是谁通过审核的
    type: Number,                       // 0为未审核  1为已审核通过 2为审核不通过 9 为订单审核中
    remittance: Number,                 // 是否已经汇款  0 为默认没汇款 1 为已汇款  2 为出款失败  3 为出款中    10  "挂单"
    remittanceRemark: String,           // 备注是谁汇款的
    gold: Number,                       // 现在的金币
    moneyNum: Number,                   // 提取金额
    daiFuStatus: Number,                // 代付状态，1：代付中，2：代付失败，3：代付成功
    daiFuFlag: Boolean,                 // 自动代付
    daiFuAccountName: String,           // 代付商户名称
    shopNo: String,                     // 代付时，自有订单编号
    outTradeNo: String,                 // 代付时，商户编号
    closeStatus: Boolean,               // 该订单是否冻结
    content: String,                    // 拒绝理由
    remittanceContent: String,          // 拒绝理由
    nearPayMoney: Number,               // 最近一次充值金额
    nearFlowCount: Number,              // 最近一次充值开始到当前生成这条记录为止的累计流水
}, { versionKey: false });

export const tixian_money_record = model<Itixian_money_record>("tixian_money_record", schema, 'tixian_money_record');
