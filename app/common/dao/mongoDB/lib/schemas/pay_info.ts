'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

/**
 * 重置记录表
 * 暂时没用
 */
interface Ipay_info extends Document {
    id: string,
    time: number,		//充值时间
    time_end: number,  //充值时间
    attach: string,    //充值类型
    bank_type: string,
    fee_type: string,
    total_fee: number,   //充值金额(分)
    openid: string,
    remark: string,
    uid: string,    //玩家uid
    nickname: string,  //玩家昵称
    addgold: number,
    gold: number,
    agencylink: string,
    customerName: string,  //客服名称
    customerId: string,  //客服Id
    customerIp: string,  //客服Ip
    lastGold: number, //充值完最后玩家身上的金币
    isUpdateGold: boolean,  //查看玩家是否更新了金币
    updateTime: number,  //充值时间
    aisleId: number,//通道id
    /** 赠送彩金 */
    bonus: number
}
/**
 * 充值记录
 */
const schema = new Schema({
    id: { type: String, unique: true },
    time: Number,		//充值时间
    time_end: Number,  //充值时间
    attach: String,    //充值类型
    bank_type: String,
    fee_type: String,
    total_fee: Number,   //充值金额(分)
    openid: String,
    remark: String,
    uid: String,    //玩家uid
    nickname: String,  //玩家昵称
    addgold: Number,
    gold: Number,
    agencylink: String,
    customerName: String,  //客服名称
    customerId: String,  //客服Id
    customerIp: String,  //客服Ip
    lastGold: Number, //充值完最后玩家身上的金币
    isUpdateGold: Boolean,  //查看玩家是否更新了金币
    updateTime: Number,  //充值时间
    aisleId: Number,//通道id
    /** 赠送彩金 */
    bonus: { type: Number, default: 0 }
}, { versionKey: false });

export const pay_info = model<Ipay_info>("pay_info", schema, 'pay_info');

