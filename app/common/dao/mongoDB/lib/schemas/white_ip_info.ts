import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Iwhite_ip_info extends Document {
    ip: string,                // 绑定id
    account: string,           // 后台管理账号
    createTime: number,    // 时间戳
}
const schema = new Schema({
    ip: {type: String, index: true},      // 绑定ip
    createTime: Number,                   // 时间戳
    account: String,                      // 后台管理账号
}, { versionKey: false });

export const white_ip_info = model<Iwhite_ip_info>("white_ip_info", schema, 'white_ip_info');
