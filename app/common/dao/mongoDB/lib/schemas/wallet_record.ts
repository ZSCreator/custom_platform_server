'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Iwallet_record extends Document {
	uid: string,				// 玩家 uid
	op_type: number,			// 操作类型
	changed_gold: number,		// 操作金额
	curr_gold: number,			// 操作后身上金币
	curr_wallet_gold: number,	// 操作后钱包金币
	time: number,				// 操作时间
}
// 游戏记录
const schema = new Schema({
	uid: String,				// 玩家 uid
	op_type: Number,			// 操作类型
	changed_gold: Number,		// 操作金额
	curr_gold: Number,			// 操作后身上金币
	curr_wallet_gold: Number,	// 操作后钱包金币
	time: Number,				// 操作时间
}, { versionKey: false });

export const wallet_record = model<Iwallet_record>("wallet_record", schema, 'wallet_record');
