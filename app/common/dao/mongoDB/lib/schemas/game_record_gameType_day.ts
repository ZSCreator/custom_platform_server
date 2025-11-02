'use strict';

import { Schema, Document, model } from 'mongoose';

/**
 * 运营数据统计游戏类型的输赢
 * 暂时没有用到
 */
interface Igame_record_gameType_day extends Document {
	id: string,				// 玩家 id
	createTime: number,  		// 时间错
	input: number,    			// 押注金额
	win: number,				// 中奖金额
	profits: number,				// 盈亏为数据库中的profit
	fanshui: number,				// 返水
	gameType: string,				// 游戏类型
}
/**
 * 公司输赢，每日第二天凌晨统计
 */
const schema = new Schema({
	id: String,				// 玩家 id
	createTime: { type: Number, index: true },  		// 时间错
	input: Number,    			// 押注金额
	win: Number,				// 中奖金额
	profits: Number,				// 盈亏为数据库中的profit
	fanshui: Number,				// 返水
	gameType: String,				// 游戏类型
}, { versionKey: false });

export const game_record_gameType_day = model<Igame_record_gameType_day>("game_record_gameType_day", schema, 'game_record_gameType_day');
