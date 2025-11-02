'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Ithird_gold_record extends Document {
    agentUid: string,                                            //上级uid
    agentRemark: string,                                         //上级名称
    orderId: string,                                             //流水号
    platformUid: string,                                         // 平台uid
    uid: string,                                                 // 用户uid
    add_time: number,                                            // 操作时间
    change_before: number,                                       // 调整前
    gold: number,                                                // 调整分数(+-)
    change_after: number,                                         // 调整后
    type: number,                                                   //给代理上下分，1为玩家  2 为代理
    status: number,
    remark: string
}

/**
 * 第三方 用户上分/下分记录
 * 2019-04-23
 */
const schema = new Schema({
    uid: { type: String, index: true, unique: false },            // uid
    orderId: { type: String, index: true, unique: false },        // 流水号
    agentUid: { type: String, index: true, unique: false },       // 上级uid
    agentRemark: String,                                        // 上级名称
    platformUid: String,                                           // 平台uid
    add_time: Number,                                           // 操作时间
    change_before: Number,                                      // 调整前
    gold: Number,                                               // 调整分数(+-)
    change_after: Number,                                      // 调整后
    type: Number,            //给代理上下分，1为玩家  2 为代理
    status: Number,
    remark: String
}, { versionKey: false });

export const third_gold_record = model<Ithird_gold_record>("third_gold_record", schema, 'third_gold_record');

