'use strict';
/**
 * 暂时没有使用， 平台总览
 */

import { Schema, Document, model } from 'mongoose';
interface Iday_profits_info extends Document {
	id: string,
	profits: number,  //每天的营收  单位金币
	createTime: number, //创建时间
	payMoney: number, //今日充值
	payNum: number, //今日充值的笔数
	payPeopleNum: number, //今日充值的人数
	tixianMoney: number, //今日提现
	lucksGold: number, //今日赠送
	allFanShui: number, //今日返水
	allGameProfits: number, //今日所有游戏利润之和
	newPlayer: number, //今日新增玩家人数
	dayLoginPlayer: number, //今日登录人数
	firstPayNum: number, //首次充值的人数
	addNewPayPeople: number,      //今日新增玩家充了值的人数
	addNewPayMoney: number,      //今日新增玩家充了值的金额


	//以前的流水字段
	flowCount: number, //截至目前所有玩家得总流水
	nowPlayerGold: number,//今日登录的玩家晚上12点的时候金币
	allDailyCommission: number, //每日的总抽水
	consumedSelfFlow: number, // 提佣消耗的的自玩流水
	consumedPromoteFlow: number // 提佣消耗的的推广流水
}
const schema = new Schema({
	id: String,
	profits: Number,  //每天的营收  单位金币
	createTime: Number, //创建时间
	payMoney: Number, //今日充值
	payNum: Number, //今日充值的笔数
	payPeopleNum: Number, //今日充值的人数
	tixianMoney: Number, //今日提现
	lucksGold: Number, //今日赠送
	allFanShui: Number, //今日返水
	allGameProfits: Number, //今日所有游戏利润之和
	newPlayer: Number, //今日新增玩家人数
	dayLoginPlayer: Number, //今日登录人数
	firstPayNum: Number, //首次充值的人数
	addNewPayPeople: Number,      //今日新增玩家充了值的人数
	addNewPayMoney: Number,      //今日新增玩家充了值的金额


	//以前的流水字段
	flowCount: Number, //截至目前所有玩家得总流水
	nowPlayerGold: Number,//今日登录的玩家晚上12点的时候金币
	allDailyCommission: Number, //每日的总抽水
	consumedSelfFlow: Number, // 提佣消耗的的自玩流水
	consumedPromoteFlow: Number // 提佣消耗的的推广流水
}, { versionKey: false });

export const day_profits_info = model<Iday_profits_info>("day_profits_info", schema, 'day_profits_info');
