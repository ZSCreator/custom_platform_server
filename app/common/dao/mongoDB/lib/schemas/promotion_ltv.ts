'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

/**
 * 运营数据的相关报表
 * 暂时没有用到
 */
interface Ipromotion_ltv extends Document {
    id: string,
    uid: string,  							//uid
    zhishuPeopleNum: number,  				//直属的人数 (推广人数)
    jianjiePeopleNum: number,  				// 非直属的人数 （裂变人数）
    payMoney: number,  						//总的充值金额
    tixianMoney: number,  				// 总的 提现金额
    createTime: number,  					//保存时间
    ltvList: { time: number, ltv: number }[],							//ltv 的数值信息，以对象数组形式存在 {time: , ltv:}
}
/**
 *  后台真实的ltv 的相关数据
 */
const schema = new Schema({
    id: { type: String, index: true },
    uid: { type: String, index: true },  							//uid
    zhishuPeopleNum: Number,  				//直属的人数 (推广人数)
    jianjiePeopleNum: Number,  				// 非直属的人数 （裂变人数）
    payMoney: Number,  						//总的充值金额
    tixianMoney: Number,  				// 总的 提现金额
    createTime: { type: Number, index: true },  					//保存时间
    ltvList: [],							//ltv 的数值信息，以对象数组形式存在 {time: , ltv:}
}, { versionKey: false });


export const promotion_ltv = model<Ipromotion_ltv>("promotion_ltv", schema, 'promotion_ltv');
