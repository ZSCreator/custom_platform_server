'use strict';
/**
 * 代理抽取流水的总和 在该表里面，
 *  暂时没有使用
 */
import { Schema, Document, model } from 'mongoose';
interface Idaili_liushui_record extends Document {
    id: string,                             //记录id
    dailiUid: string,                        //代理uid
    yazhuLiushui: number,                    //押注流水
    jianjieLiushui: number, 	                // 代理间接玩家产生抽水值 单位为金币
    jianjieLiushuiProfits: number, 	    //代理间接玩家产生的抽水值产生的利润 单位为元
    zhijieLiushui: number, 	                // 代理直接玩家产生抽水值 单位为金币
    zhijieLiushuiProfits: number, 	        //代理直接玩家产生的抽水值产生的利润 单位为元
    createTime: number,                      // 创建时间
    allPeople: number,                       //团队总人数
    zhiShuPeople: number,                    //直属人数
    alreadyTiqu: number,                    // 已经提取佣金
    jianjieLiushuiNoCellPhone: number, 	//间接流水绑定的手机
    zhijieLiushuiNoCellPhone: number, 	    //直接流水绑定的手机
}
const schema = new Schema({
    id: String,                             //记录id
    dailiUid: String,                        //代理uid
    yazhuLiushui: Number,                    //押注流水
    jianjieLiushui: Number, 	                // 代理间接玩家产生抽水值 单位为金币
    jianjieLiushuiProfits: Number, 	    //代理间接玩家产生的抽水值产生的利润 单位为元
    zhijieLiushui: Number, 	                // 代理直接玩家产生抽水值 单位为金币
    zhijieLiushuiProfits: Number, 	        //代理直接玩家产生的抽水值产生的利润 单位为元
    createTime: Number,                      // 创建时间
    allPeople: Number,                       //团队总人数
    zhiShuPeople: Number,                    //直属人数
    alreadyTiqu: Number,                    // 已经提取佣金
    jianjieLiushuiNoCellPhone: Number, 	//间接流水绑定的手机
    zhijieLiushuiNoCellPhone: Number, 	    //直接流水绑定的手机
}, { versionKey: false });

export const daili_liushui_record = model<Idaili_liushui_record>("daili_liushui_record", schema, 'daili_liushui_record');
