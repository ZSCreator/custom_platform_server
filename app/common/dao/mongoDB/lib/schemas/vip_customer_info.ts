import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Ivip_customer_info extends Document {
    gms_account_id: string,     // gms后台账户id
    uid: string,                // 绑定id
    name: string,               // 名字 customerText
    qq_id: string,              // qq 号码
    wechat_id: string,          // 微信号码
    other_id: string,           // 其他联系方式
    other_name: string,         // 其他联系方式名称
    createTimeStamp: number,    // 时间戳
    sort: number,               // 客服充值的排序
    isOpen: boolean,            // 是否开启
}
const schema = new Schema({
    gms_account_id: String,     // gms后台账户id
    uid: String,                // 绑定id
    name: String,               // 名字 customerText
    qq_id: String,              // qq 号码
    wechat_id: String,          // 微信号码
    other_id: String,           // 其他联系方式
    other_name: String,         // 其他联系方式名称
    createTimeStamp: Number,    // 时间戳
    sort: Number,               // 客服充值的排序
    isOpen: Boolean,            // 是否开启
}, { versionKey: false });

export const vip_customer_info = model<Ivip_customer_info>("vip_customer_info", schema, 'vip_customer_info');
