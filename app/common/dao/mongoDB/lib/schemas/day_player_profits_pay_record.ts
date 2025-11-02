'use strict';
/*
	记录每个玩家每天的返利给上级多少
	暂时没有使用
**/
import { Schema, Document, model } from 'mongoose';

interface Iday_player_profits_pay_record extends Document {
	id: string,
	profits: number,  //每天的玩家推广利润
	createTime: number, //创建时间
	payMoney: number, //今日充值
	tixianMoney: number, //今日提现
	lucksGold: number, //今日赠送
	nowPlayerGold: number,//今日登录的玩家晚上12点的时候金币
	uid: string,  //玩家的uid
	nickname: string,  //玩家的昵称
	superior: string,  //上一级玩家
	profitsRatio: number,  //抽多少利润点给上级
	startProfits: number,  //一开始的利润是多少
	numLevel: number, //属于几级
	nextUid: string, // 直接给上级
	dailyChoushui: number,  //当天的日抽水
	dailyFlow: number, //日流水
	input: number, //压住金额  (当天的日抽水)
	nid: string,  //哪款游戏进行的返点
	gameName: string, //游戏昵称
	gameOrder: string, //游戏的订单号
	gameType: string, //游戏类型
}

const schema = new Schema({
	id: String,
	profits: Number,  //每天的玩家推广利润
	createTime: { type: Number, index: true }, //创建时间
	payMoney: Number, //今日充值
	tixianMoney: Number, //今日提现
	lucksGold: Number, //今日赠送
	nowPlayerGold: Number,//今日登录的玩家晚上12点的时候金币
	uid: { type: String, index: true },  //玩家的uid
	nickname: String,  //玩家的昵称
	superior: { type: String, index: true },  //上一级玩家
	profitsRatio: Number,  //抽多少利润点给上级
	startProfits: Number,  //一开始的利润是多少
	numLevel: Number, //属于几级
	nextUid: String, // 直接给上级
	dailyChoushui: Number,  //当天的日抽水
	dailyFlow: Number, //日流水
	input: Number, //压住金额  (当天的日抽水)
	nid: String,  //哪款游戏进行的返点
	gameName: String, //游戏昵称
	gameOrder: String, //游戏的订单号
	gameType: String, //游戏类型
}, { versionKey: false });

export const day_player_profits_pay_record = model<Iday_player_profits_pay_record>("day_player_profits_pay_record", schema, 'day_player_profits_pay_record');
