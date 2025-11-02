import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Imall_pay_method_info extends Document {
    payMethodId: number,
    payMethodName: string,                      // 支付方式名称
    payMethodDescription: string,               // 支付提示说明
    payMethodIcon: string,                      // 支付图标
    cornerIcon: string,                         // 支付按钮角标
    minAmount: number,    // 支付金额下限
    maxAmount: number,                          // 支付金额上限
    isMobile: boolean,                          // 是否在手机上显示
    isPC: boolean,                              // 是否在电脑上显示
    isWX: boolean,                              // 是否在电脑上显示
    isQrCode: boolean,                          // 是否在电脑上显示
    sort: number,                               // 排序
    isOpenJustShowPay: boolean, // 是否开启仅显示给充值的玩家
}
/**
 * 支付方式信息
 *  - 原生充值自动匹配充值通道
 * @date 2019年10月23日
 * @description 新版支付
 * @author Andy
 */
const schema = new Schema({
    payMethodId: Number,
    payMethodName: String,                      // 支付方式名称
    payMethodDescription: String,               // 支付提示说明
    payMethodIcon: String,                      // 支付图标
    cornerIcon: String,                         // 支付按钮角标
    minAmount: { type: Number, default: 0 },    // 支付金额下限
    maxAmount: Number,                          // 支付金额上限
    isMobile: Boolean,                          // 是否在手机上显示
    isPC: Boolean,                              // 是否在电脑上显示
    isWX: Boolean,                              // 是否在电脑上显示
    isQrCode: Boolean,                          // 是否在电脑上显示
    sort: Number,                               // 排序
    isOpenJustShowPay: { type: Boolean, default: false }, // 是否开启仅显示给充值的玩家
}, { versionKey: false });

export const mall_pay_method_info = model<Imall_pay_method_info>("mall_pay_method_info", schema, 'mall_pay_method_info');