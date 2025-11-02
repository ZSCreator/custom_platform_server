'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Itest_pay_info extends Document {
    id: string,
    createTime: number,  //扣款时间
    total_fee: number,   //扣款金额(分)
    walletGoldToGold: number,   //钱包金额(分)
    remark: string,
    uid: string,    //玩家uid
    nickname: string,  //玩家昵称
    addgold: number,
    gold: number,
    customerName: string,  //客服名称
    customerId: string,  //客服Id
    lastGold: number, //扣款完最后玩家身上的金币
    lastWalletGold: number, //扣款过后玩家身上的钱包金币
}
/**
 * 后台人工扣款记录
 */
const schema = new Schema({
    id: String,
    createTime: Number,  //扣款时间
    total_fee: Number,   //扣款金额(分)
    walletGoldToGold: Number,   //钱包金额(分)
    remark: String,
    uid: String,    //玩家uid
    nickname: String,  //玩家昵称
    addgold: Number,
    gold: Number,
    agencylink: String,
    customerName: String,  //客服名称
    customerId: String,  //客服Id
    lastGold: Number, //扣款完最后玩家身上的金币
    lastWalletGold: Number, //扣款过后玩家身上的钱包金币
}, { versionKey: false });

export const test_pay_info = model<Itest_pay_info>("test_pay_info", schema, 'test_pay_info');

