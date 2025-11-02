'use strict';
import { SchemaTypes, Schema, Document, model } from 'mongoose';

/**
 * 真人视讯的表结构
 * 暂时没有用到
 */
interface Ireality_video_agent_balance_record extends Document {
    integralBeforeChange: number,// 变化前的值
    changeIntegral: number,     // 变化分数(正整数)，与changeStatus联动
    integralAfterChange: number,// 变化后的值 (余额)
    agentTotalOfHistory: number, // 代理历史补充余额总值
    changeStatus: number,       // 1.代理充值 2.代理扣值 3.属代理用户上下分 4.用户退出真人视讯，持有金币回归代理数
    createUser: string,         // changeStatus=1|2:显示后台补充代理余额操作者名字;=3|4时，显示用户(玩家) uid
    createTime: number,
    createDateTime: number,     // 创建时间
}

const schema = new Schema({
    integralBeforeChange: Number,// 变化前的值
    changeIntegral: Number,     // 变化分数(正整数)，与changeStatus联动
    integralAfterChange: Number,// 变化后的值 (余额)
    agentTotalOfHistory: Number, // 代理历史补充余额总值
    changeStatus: Number,       // 1.代理充值 2.代理扣值 3.属代理用户上下分 4.用户退出真人视讯，持有金币回归代理数
    createUser: String,         // changeStatus=1|2:显示后台补充代理余额操作者名字;=3|4时，显示用户(玩家) uid
    createTime: Number,
    createDateTime: Number,     // 创建时间
}, { versionKey: false });


export const reality_video_agent_balance_record = model<Ireality_video_agent_balance_record>("reality_video_agent_balance_record", schema, 'reality_video_agent_balance_record');
