'use strict';
/**
 * 代理返佣的数据总和 在该表里面，玩家会有两天数据
 * 暂时没有用到
 */
import { Schema, Document, model } from 'mongoose';
interface IagentBack_record extends Document {
    id: string,                     //记录id
    uid: string,                     //代理uid
    superior: string,                //上级代理uid
    zhishuPeople: number,            //直属人数
    jianjiePeople: number,           //间接人数
    todayPeople: number,             //今日新增人数
    alreadyTiqu: number,             // 已提取玩家奖励
    yesDayZhishuProfits: number,     // 昨日直属玩家奖励
    yesDayJianjieProfits: number,    // 昨日间接玩家奖励
    jianjieProfits: number, 	    //代理间接玩家返佣的利润 单位为金币
    zhijieProfits: number, 	    //代理直接玩家返佣的利润 单位为金币
    allProfits: number,             //代理总返佣的利润
    selfProfits: number,            //自己玩游戏贡献的利润
    createTime: number,              // 创建时间
}
const schema = new Schema({
    id: String,                     //记录id
    uid: String,                     //代理uid
    superior: String,                //上级代理uid
    zhishuPeople: Number,            //直属人数
    jianjiePeople: Number,           //间接人数
    todayPeople: Number,             //今日新增人数
    alreadyTiqu: Number,             // 已提取玩家奖励
    yesDayZhishuProfits: Number,     // 昨日直属玩家奖励
    yesDayJianjieProfits: Number,    // 昨日间接玩家奖励
    jianjieProfits: Number, 	    //代理间接玩家返佣的利润 单位为金币
    zhijieProfits: Number, 	    //代理直接玩家返佣的利润 单位为金币
    allProfits: Number,             //代理总返佣的利润
    selfProfits: Number,            //自己玩游戏贡献的利润
    createTime: Number,              // 创建时间
}, { versionKey: false });

export const agentBack_record = model<IagentBack_record>("agentBack_record", schema, 'agentBack_record');
