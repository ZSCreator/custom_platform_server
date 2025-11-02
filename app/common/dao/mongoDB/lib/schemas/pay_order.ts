'use strict';
import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Ipay_order extends Document {
    orderNumber: string,//订单号
    time: number,//订单发起时间
    aisleId: number,//通道id
    uid: string,//uid
    money: number,//人民币
    platform: string,//支付通道
    payType: string,//支付类型
    status: number,//回调状态
    field1: string,//附加信息
    shopId: string,//商品id
    reissue: boolean,//补发状态
    isLock: boolean,//是否锁定
    callBackTime: string,//回调时间
    remark: string,    //备注信息
}
/**
 * 订单请求的支付记录
 */
const schema = new Schema({
    orderNumber: String,//订单号
    time: Number,//订单发起时间
    aisleId: Number,//通道id
    uid: String,//uid
    money: Number,//人民币
    platform: String,//支付通道
    payType: String,//支付类型
    status: { type: Number, default: 0 },//回调状态
    field1: String,//附加信息
    shopId: String,//商品id
    reissue: { type: Boolean, default: false },//补发状态
    isLock: { type: Boolean, default: false },//是否锁定
    callBackTime: String,//回调时间
    remark: String,    //备注信息
}, { versionKey: false });

export const pay_order = model<Ipay_order>("pay_order", schema, 'pay_order');

