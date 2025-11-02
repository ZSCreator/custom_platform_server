'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Ijackpot_record_info extends Document {
	nid: string,  			// 游戏编号
	roomId: string,  		// 房间编号
	id: number,  			// 当前游戏的奖池编号
	jackpot: number,  		// 基础奖池
	runningPool: number,  	// 流水奖池
	profitPool: number,  	// 盈利奖池
	createTime: number,  	// 保存时间
}
const schema = new Schema({
	nid: String,  			// 游戏编号
	roomId: String,  		// 房间编号
	id: Number,  			// 当前游戏的奖池编号
	jackpot: Number,  		// 基础奖池
	runningPool: Number,  	// 流水奖池
	profitPool: Number,  	// 盈利奖池
	createTime: Number,  	// 保存时间
}, { versionKey: false });

export const jackpot_record_info = model<Ijackpot_record_info>("jackpot_record_info", schema, 'jackpot_record_info');
