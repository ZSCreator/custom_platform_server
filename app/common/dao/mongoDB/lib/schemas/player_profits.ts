'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

/**
 * 记录玩家的返水的利润
 * 暂时没有用到
 */
interface Iplayer_profits extends Document {
	id: string,
	profits: number,  					//大区玩家推广利润单位是金币
	extractProfits: number,  			//累计提取了多少金币
	profitsForGold: number,  			// 普通代理的利润是金币
	kaoheProfits: number,  				//大区玩家的考核利润
	createTime: number, 				//创建时间
	canGetNum: number,					//一天可以进行几次的领取  -1 为无线领取, 1 为一天领取一次 2 为两天领取一次
	uid: string,  						//玩家的uid
}
/**
*  记录渠道和代理人的利润
 *  1、无限代理的 profits 单位为金币，
 *  2、但是无限代级差是根据流水来算的,每一万为多少元，所以要乘以100, 所以 profits 单位为元
*/
const schema = new Schema({
	id: String,
	profits: Number,  					//大区玩家推广利润单位是金币
    extractProfits: Number,  			//累计提取了多少金币
	profitsForGold: Number,  			// 普通代理的利润是金币
	kaoheProfits: Number,  				//大区玩家的考核利润
	createTime: Number, 				//创建时间
	canGetNum: Number,					//一天可以进行几次的领取  -1 为无线领取, 1 为一天领取一次 2 为两天领取一次
	uid: String,  						//玩家的uid
}, { versionKey: false });

export const player_profits = model<Iplayer_profits>("player_profits", schema, 'player_profits');
