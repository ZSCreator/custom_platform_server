'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Iuser_info extends Document {
    uid: string,
    bankCardName: string,        //银行卡户名
    bankName: string,           //开户银行
    bankCardNo: string,         //银行卡号
    bankAddress: string,         //开户行地址
    isRobot: number,         //是否是机器人
}
// 是否需要添加插件
const schema = new Schema({
    uid: { type: String, index: true },
    bankCardName: String,           //银行卡户名
    bankName: String,               //开户银行
    bankCardNo: String,             //银行卡号
    bankAddress: String,             //开户行地址
    isRobot: Number,             //是否是机器人
}, { versionKey: false });

export const user_info = model<Iuser_info>("user_info", schema, 'user_info');