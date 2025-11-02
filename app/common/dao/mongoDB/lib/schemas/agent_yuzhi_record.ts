'use strict';
/**
 *  记录代理进行计算考核的记录
 *  暂时没有用到
 */
import { Schema, Document, model } from 'mongoose';
interface Iagent_yuzhi_record extends Document {
    id: string,
    createTime: number,      //创建时间
    dailiUid: string,       //玩家的uid
    yuzhiProfits: number,    //提取预支金额
    type: number,            // type 1 为提取佣金 2为提取预支
    lastProfits: number,     //剩余提取金额
}

const schema = new Schema({
    id: String,
    createTime: Number,      //创建时间
    dailiUid: String,       //玩家的uid
    yuzhiProfits: Number,    //提取预支金额
    type: Number,            // type 1 为提取佣金 2为提取预支
    lastProfits: Number,     //剩余提取金额
}, { versionKey: false });

export const agent_yuzhi_record = model<Iagent_yuzhi_record>("agent_yuzhi_record", schema, 'agent_yuzhi_record');
