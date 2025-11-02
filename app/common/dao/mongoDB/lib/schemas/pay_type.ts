'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Ipay_type extends Document {
    name: string,       //充值类型名称
    isOpen: boolean, //是否开启,
    url: string,
    buyId: number,  //支付的ID
    shanghu: string,
    type: string,  //  支付类型
    isMobile: boolean, //是否在手机上显示
    isPC: boolean, //是否在电脑上显示
    isWX: boolean, //是否在电脑上显示
    isQrCode: boolean, //是否在电脑上显示
    tips: string,  //提示语言
    isUse: boolean,  //是否可以使用
    remark: string,  //备注信息
    sort: number,//排序
    icon: string,//图标
    callBackDelay: number,//回调延迟
    rate: number,//费率
    callBackSucceed: number,
    callBackAll: number,
    isOpenJustShowPay: boolean, // 是否开启仅显示给充值的玩家
}

/**
 * 支付类型
 */
const schema = new Schema({
    name: String,       //充值类型名称
    isOpen: Boolean, //是否开启,
    url: String,
    buyId: Number,  //支付的ID
    shanghu: String,
    type: String,  //  支付类型
    isMobile: Boolean, //是否在手机上显示
    isPC: Boolean, //是否在电脑上显示
    isWX: Boolean, //是否在电脑上显示
    isQrCode: Boolean, //是否在电脑上显示
    tips: String,  //提示语言
    isUse: Boolean,  //是否可以使用
    sort: Number,//排序
    icon: String,//图标
    remark: String,//备注信息
    callBackDelay: Number,//回调延迟
    rate: { type: Number, default: 0 },//费率
    callBackSucceed: { type: Number, default: 0 },
    callBackAll: { type: Number, default: 0 },
    isOpenJustShowPay: { type: Boolean, default: false }, // 是否开启仅显示给充值的玩家
}, { versionKey: false });


export const pay_type = model<Ipay_type>("pay_type", schema, 'pay_type');
