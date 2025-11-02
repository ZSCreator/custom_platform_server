'use strict';
/**
 * 如果代理返佣出现错误，就讲每把需要返佣的数据存储到该表
 * 暂时没有使用
 */
import { Schema, Document, model } from 'mongoose';

interface Iday_not_player_profits extends Document {
	id: string,
	profits: number,  //每天的玩家推广利润
	createTime: number, //创建时间
	uid: string,  //玩家的uid
	nickname: string,  //玩家的昵称
	numLevel: number, //属于几级
	dailyFlow: number, //日流水
	input: number, //返佣金额
	nid: string,  //哪款游戏进行的返点
	nextUid: string,  //那个uid返利的
	superior: string,  //返给上级的是谁
	gameName: string, //游戏昵称
	gameOrder: string, //游戏的订单号
	gameType: String, //游戏类型
	status: number, // 如果状态为0 则还没有进行返利操作，如果为1则已经进行了返利操作
	error: string, //报错的原因
}


const schema = new Schema({
	id: String,
	profits: Number,  //每天的玩家推广利润
	createTime: Number, //创建时间
	uid: String,  //玩家的uid
	nickname: String,  //玩家的昵称
	numLevel: Number, //属于几级
	dailyFlow: Number, //日流水
	input: Number, //返佣金额
	nid: String,  //哪款游戏进行的返点
	nextUid: String,  //那个uid返利的
	superior: String,  //返给上级的是谁
	gameName: String, //游戏昵称
	gameOrder: String, //游戏的订单号
	gameType: String, //游戏类型
	status: Number, // 如果状态为0 则还没有进行返利操作，如果为1则已经进行了返利操作
	error: String, //报错的原因
}, { versionKey: false });

export const day_not_player_profits = model<Iday_not_player_profits>("day_not_player_profits", schema, 'day_not_player_profits');
