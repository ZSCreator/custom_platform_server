'use strict';
/**
 * 每日统计每个游戏的每个场 的押注金额和赢取金额
 * 暂时没有用到
 */
import { Schema, Document, model } from 'mongoose';

interface Igame_analysis_day extends Document {
	createTime: number,  		// 时间错
	nid: string,                   		//游戏id
	sceneId: number,             		//场id
	remark: string,			 		// 游戏名+ 场名
	win: number,				 		//赢取金额
	input: number,						//押注金额
	settle_commission: number,  		//税收金额
	betPlayers: [],       				//下注人数
}
/**
 * 公司输赢，每日第二天凌晨统计
 */
const schema = new Schema({
	createTime: { type: Number, index: true },  		// 时间错
	nid: String,                   		//游戏id
	sceneId: Number,             		//场id
	remark: String,			 		// 游戏名+ 场名
	win: Number,				 		//赢取金额
	input: Number,						//押注金额
	settle_commission: Number,  		//税收金额
	betPlayers: [],       				//下注人数
}, { versionKey: false });

export const game_analysis_day = model<Igame_analysis_day>("game_analysis_day", schema, 'game_analysis_day');
