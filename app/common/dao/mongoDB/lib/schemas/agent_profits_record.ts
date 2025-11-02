'use strict';
/**
 *  记录代理进行计算考核的记录
 *  暂时没有用到，可以先屏蔽
 */
import { Schema, Document, model } from 'mongoose';

interface Iagent_profits_record extends Document {
    id: string,
    allLiushui: number,  //的玩家推广总流水
    teamLiushui: number,  //的玩家推广团队流水
    selfLiushui: number,  //的玩家推广团队流水
    createTime: number, //创建时间
    dailiUid: string,  //玩家的uid
    kaohebili: number, //考核比例
    profits: number, //获取得到考核利润
    yuzhiProfits: number, //预支的金额
}

const schema = new Schema({
    id: String,
    allLiushui: Number,  //的玩家推广总流水
    teamLiushui: Number,  //的玩家推广团队流水
    selfLiushui: Number,  //的玩家推广团队流水
    createTime: Number, //创建时间
    dailiUid: String,  //玩家的uid
    kaohebili: Number, //考核比例
    profits: Number, //获取得到考核利润
    yuzhiProfits: Number, //预支的金额
}, { versionKey: false });

export const agent_profits_record = model<Iagent_profits_record>("agent_profits_record", schema, 'agent_profits_record');
