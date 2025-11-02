'use strict';
/**
 * 代理抽取流水的总和 在该表里面，玩家会有两天数据
 * 暂时没有用到
 */
import { Schema, Document, model } from 'mongoose';
interface IagentBack_day_record extends Document {
    id: string,                     //记录id
    uid: string,                     //代理uid
    superior: string,                //代理uid
    zhishuPeople: number,           //今日新增直属人数
    jianjiePeople: number,          //今日新增间接人数
    dayPeople: number,              //今日新增团队人数
    jianjieProfits: number, 	    //代理直接玩家产生的抽水值产生的利润 单位为金币
    zhijieProfits: number, 	    //代理直接玩家产生的抽水值产生的利润 单位为金币
    allProfits: number, 	        //代理玩家产生的当日总利润 单位为金币
    chouShui: number, 	            //抽水值
    selfProfits: number, 	        //自己玩游戏贡献的利润
    createTime: number,              // 创建时间
}
const schema = new Schema({
    id: String,                     //记录id
    uid: String,                     //代理uid
    superior: String,                //代理uid
    zhishuPeople: Number,           //今日新增直属人数
    jianjiePeople: Number,          //今日新增间接人数
    dayPeople: Number,              //今日新增团队人数
    jianjieProfits: Number, 	    //代理直接玩家产生的抽水值产生的利润 单位为金币
    zhijieProfits: Number, 	    //代理直接玩家产生的抽水值产生的利润 单位为金币
    allProfits: Number, 	        //代理玩家产生的当日总利润 单位为金币
    chouShui: Number, 	            //抽水值
    selfProfits: Number, 	        //自己玩游戏贡献的利润
    createTime: Number,              // 创建时间
}, { versionKey: false });
export const agentBack_day_record = model<IagentBack_day_record>("agentBack_day_record", schema, 'agentBack_day_record');
