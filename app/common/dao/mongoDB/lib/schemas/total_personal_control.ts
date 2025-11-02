import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface ITotalPersonalControl extends Document {
    uid: string,                                                    // 玩家id
    probability: number,                                            // 调控概率
    killCondition: number,                                          // 必杀条件
    remark: string,                                                 // 调控备注
    managerId: string,                                              // 添加调控人
    updateTime: number,
    createTime: number
}
const schema = new Schema({
    uid: { type: String, index: true },                             // 玩家id
    probability: Number,                                            // 调控概率
    killCondition: Number,                                          // 必杀条件
    remark: String,                                                 // 调控备注
    managerId: String,                                              // 添加调控人
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() }
}, { versionKey: false });

export const total_personal_control = model<ITotalPersonalControl>("total_personal_control", schema, 'total_personal_control');
