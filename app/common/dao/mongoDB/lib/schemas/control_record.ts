import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface IControlRecord extends Document {
    name: string,                                // 操作人的名字
    type: '1' | '2' | '3',                       // 调控类型 1 类型为场控个人调控 | 2 个人调控总控 | 3 场控
    uid: string,                                 // 被调控玩家的uid 可能为空
    nid: string,                                 // 被调控的游戏 可能为空
    remark: string,                              // 调控备注
    data: object,                                // 调控数据详情
    updateTime: number,                          // 更新时间
    createTime: number,                          // 创建时间
}

const schema = new Schema({
    name: String,
    type: String,
    remark: String,
    data: Object,
    uid: { type: String, default: '' },
    nid: { type: String, default: '' },
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });

export const control_record = model<IControlRecord>("control_record", schema, 'control_record');
