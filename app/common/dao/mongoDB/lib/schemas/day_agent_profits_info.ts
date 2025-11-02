'use strict';
/**
 * 暂时没有使用
 */

import { Schema, Document, model } from 'mongoose';
interface Iday_agent_profits_info extends Document {
	uid: string,  				//渠道的uid
	remark:string,  			//代理的名称
	profit: number,  			//每天的代理的利润
	createTime: number, 	    //创建时间
	playerPeople: [], 			//今日在线人数
	chouShui:number,			//抽水
    validBet:number,			//有效投注金币
    betNum:number,				//注单数量
	group_remark:string		    //平台备注


}
const schema = new Schema({

	uid: String,  				//渠道的uid
    remark: {type:String , index:true},  			//代理的名称
	profit: Number,  			//每天的代理的利润
	createTime: {type:Number , index:true}, 		//创建时间
    playerPeople: [], 			//今日在线人数
    chouShui: Number, 			//抽水
    validBet: Number, 			//有效投注金币
	betNum:Number,				//注单数量
    group_remark:String,		//平台备注


}, { versionKey: false });

export const day_agent_profits_info = model<Iday_agent_profits_info>("day_agent_profits_info", schema, 'day_agent_profits_info');
