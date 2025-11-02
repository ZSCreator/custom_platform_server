'use strict';

import { Schema, Document, model } from 'mongoose';

interface Igame_record extends Document {
	uid: string,				// 玩家 uid
    superior: string,				// 上级 uid
    groupRemark: string,				// 代理
    group_id:string,				// 平台id
    thirdUid: string,				// 第三方 uid
	nickname: string,  			// 玩家昵称
	nid: string,				// 游戏ID
	sceneId: number,			// 游戏场
	// winType: string, 			// 中奖类型
	gname: string,    			// 游戏名称
	createTime: number,  		// 时间错
    validBet: number,  			// 有效押注
	input: number,    			// 押注金额
	win: number,				// 中奖金额
	bet_commission: number,		// 押注抽水
	win_commission: number,		// 赢取抽水
	settle_commission: number,	// 结算抽水
	multiple: number,			// 盈利倍数
	profit: number,     		// 利润
	gold: number,				// 当前金币
	playStatus: number,			// 记录状态
	isDealer: boolean,			// 是否庄家：true 表示庄家
	addRmb: number,				// 总充值
	addTixian: number,			// 总提现
	gameOrder: string,			// 订单编号
	game_record_live_id: string,// game_record_live 主键
	// privateRoom: boolean,		// 是否私人房：true 表示私人房

	/** 新加字段 */
	roomId: string,				// 房间编号
	roundId: string,			// 游戏局号
	seat: number,				// 座位号
	playersNumber: number,		// 玩家人数
	result: string,				// 游戏当局结果
	startTime: string,			// 游戏开始时间
	endTime: string,			// 结束时间
}
// 游戏记录
const schema = new Schema({
	uid: { type: String, index: true },				// 玩家 uid
    superior:  String,				// 上级 uid
    groupRemark: { type: String, index: true },				// 租客的备注信息
    group_id: { type: String, index: true },				// 顶级备注信息
	nickname: String,  			// 玩家昵称
	nid: { type: String, index: true },				// 游戏ID
	thirdUid:  String ,				// 第三方uid
	sceneId: Number,			// 游戏场
	// winType: String, 			// 中奖类型
	gname: String,    			// 游戏名称
	createTime: Number,  		// 时间错
	input: Number,    			// 押注金额
    validBet: Number,    		// 有效押注金额
	win: Number,				// 中奖金额
	bet_commission: Number,		// 押注抽水
	win_commission: Number,		// 赢取抽水
	settle_commission: Number,	// 结算抽水
	multiple: Number,			// 盈利倍数
	profit: Number,     		// 利润
	gold: Number,				// 当前金币
	playStatus: Number,			// 记录状态
	isDealer: Boolean,			// 是否庄家：true 表示庄家
	addRmb: Number,				// 总充值
	addTixian: Number,			// 总提现
	gameOrder: String,			// 订单编号
	game_record_live_id: String,// game_record_live 主键
	// privateRoom: Boolean,		// 是否私人房：true 表示私人房



	/** 新加字段 */
	roomId: String,				// 房间编号
	roundId: String,			// 游戏局号
	seat: Number,				// 座位号
	playersNumber: Number,		// 玩家人数
	result: String,				// 游戏当局结果
	startTime: String,			// 游戏开始时间
	endTime: String,			// 结束时间
}, { versionKey: false });


export const game_record = model<Igame_record>("game_record", schema, 'game_record');
export const game_record_backup = model<Igame_record>("game_record_backup", schema, 'game_record_backup');
