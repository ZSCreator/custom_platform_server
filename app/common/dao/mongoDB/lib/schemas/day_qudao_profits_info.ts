'use strict';
/**
 * 运营数据报表，每日渠道的留存计算，
 * 暂时没有使用
 */
import { Schema, Document, model } from 'mongoose';
interface Iday_qudao_profits_info extends Document {
	id: string,
	uid: string,  //渠道的uid
	profits: number,  //每天的渠道利润
	createTime: number, //创建时间
	payNum: number, //今日充值的笔数
	payPeopleNum: [], //今日充值的人数,具体uid有哪些
	payMoney: number, //今日充值
	tixianMoney: number, //今日提现
	lucksGold: number, //今日赠送
	nowPlayerGold: number,		//今日渠道下面玩家晚上12点的时候金币总和
	flowCount: number, 		//渠道下面得总流水
	allDailyCommission: number, //每日的总抽水
	consumedSelfFlow: number, // 提佣消耗的的自玩流水
	consumedPromoteFlow: number, // 提佣消耗的的推广流水
	payPepleLength: number, 			//今日充值的人数
	addNewPayPeople: number,      //今日新增玩家充了值的人数
	addNewPayMoney: number,      //今日新增玩家充了值的金额
	inputNum: number, 			//今日下注的人数
	inputMoney: number, 			//今日下注金额
	zhongjiangMoney: number, 	//今日中奖金额
	loginNum: number, 			//今日登录人数
	newPlayer: number, 			//今日新增人数
	allPlayerLength: number, 	//截止目前总人数


	secondPayNum: number,   //付费次日的留存
	threePayNum: number,    //付费3日的留存
	sevenPayNum: number,    //付费7日的留存
	fifteenPayNum: number,	//付费15日的留存
	thirtyPayNum: number,		//付费30日的留存

	teamProfits: number, //团队的返点
	teamExhibit: number, //团队的盈亏
	settlementTime: number, //结算时间
	gameTypeProfits: {}, //游戏分类的利润
	status: number //是否已经结算  0 为未结算 1 为结算
}
const schema = new Schema({
	id: String,
	uid: String,  //渠道的uid
	profits: Number,  //每天的渠道利润
	createTime: Number, //创建时间
	payNum: Number, //今日充值的笔数
	payPeopleNum: [], //今日充值的人数,具体uid有哪些
	payMoney: Number, //今日充值
	tixianMoney: Number, //今日提现
	lucksGold: Number, //今日赠送
	nowPlayerGold: Number,		//今日渠道下面玩家晚上12点的时候金币总和
	flowCount: Number, 		//渠道下面得总流水
	allDailyCommission: Number, //每日的总抽水
	consumedSelfFlow: Number, // 提佣消耗的的自玩流水
	consumedPromoteFlow: Number, // 提佣消耗的的推广流水
	payPepleLength: Number, 			//今日充值的人数
	addNewPayPeople: Number,      //今日新增玩家充了值的人数
	addNewPayMoney: Number,      //今日新增玩家充了值的金额
	inputNum: Number, 			//今日下注的人数
	inputMoney: Number, 			//今日下注金额
	zhongjiangMoney: Number, 	//今日中奖金额
	loginNum: Number, 			//今日登录人数
	newPlayer: Number, 			//今日新增人数
	allPlayerLength: Number, 	//截止目前总人数


	secondPayNum: Number,   //付费次日的留存
	threePayNum: Number,    //付费3日的留存
	sevenPayNum: Number,    //付费7日的留存
	fifteenPayNum: Number,	//付费15日的留存
	thirtyPayNum: Number,		//付费30日的留存

	teamProfits: Number, //团队的返点
	teamExhibit: Number, //团队的盈亏
	settlementTime: Number, //结算时间
	gameTypeProfits: {}, //游戏分类的利润
	status: Number //是否已经结算  0 为未结算 1 为结算

}, { versionKey: false });

export const day_qudao_profits_info = model<Iday_qudao_profits_info>("day_qudao_profits_info", schema, 'day_qudao_profits_info');
