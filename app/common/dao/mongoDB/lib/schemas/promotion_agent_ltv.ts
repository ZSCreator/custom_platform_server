'use strict';
/** 运营相关的报表
 * 代理ltv 的数据统计
 * 暂时没有用到
 */
import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Ipromotion_agent_ltv extends Document {
    id: string,  							//id
    uid: string,  							//uid
    newPeople: [],  				             //今日注册人数  以数组的方式记录人的uid
    jianjiePeopleNum: number,                   //目前为止总的裂变人数
    newPeoplePay: number,  				        // 今日注册人数充值了的(注充)
    newPeopleTixian: number,  				    // 今日注册人数提现了的(注提现)
    dayPayMoney: number,  				    // 今日注册人数充值金额 (首充金额)单位为元
    dayTixianMoney: number,  				    // 今日注册人数提现金额 (首提现金额)单位为元
    allPayMoney: number,  				    // 总充值金额 单位为元
    allTixianMoney: number,  				    // 总提现金额 (首提现金额)
    tax: number,  				            // 税收 单位为金币
    createTime: number,  					//保存时间
    ltvList: { time: number, ltv: number }[],							//ltv 的数值信息，以对象数组形式存在 {time: , ltv:}
    cost: number,                          //推广成本
}

/** 今日注册人数
 * 给代理看的 充值，提现，ltv
 *
 */
const schema = new Schema({
    id: { type: String, index: true },  							//id
    uid: { type: String, index: true },  							//uid
    newPeople: [],  				             //今日注册人数  以数组的方式记录人的uid
    jianjiePeopleNum: Number,                   //目前为止总的裂变人数
    newPeoplePay: Number,  				        // 今日注册人数充值了的(注充)
    newPeopleTixian: Number,  				    // 今日注册人数提现了的(注提现)
    dayPayMoney: Number,  				    // 今日注册人数充值金额 (首充金额)单位为元
    dayTixianMoney: Number,  				    // 今日注册人数提现金额 (首提现金额)单位为元
    allPayMoney: Number,  				    // 总充值金额 单位为元
    allTixianMoney: Number,  				    // 总提现金额 (首提现金额)
    tax: Number,  				            // 税收 单位为金币
    createTime: { type: Number, index: true },  					//保存时间
    ltvList: [],							//ltv 的数值信息，以对象数组形式存在 {time: , ltv:}
    cost: Number,                          //推广成本
}, { versionKey: false });

export const promotion_agent_ltv = model<Ipromotion_agent_ltv>("promotion_agent_ltv", schema, 'promotion_agent_ltv');
