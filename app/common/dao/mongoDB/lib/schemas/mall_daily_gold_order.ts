import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Imall_daily_gold_order extends Document {
    payMethodId: number,
    payMethodName: string,          // 支付方式名称
    payTypeId: number,              // 支付通道编号
    payTypeName: string,            // 支付通道名称
    prePayOrder: number,            // 预支付订单数
    payedOrder: number,             // 已支付订单数
    allGoldItem: [],                // 该支付各商品细类统计
    paySuccessPercentage: number,   // 支付成功百分比 表示 100% => 100
    date: string,                   // 日期 YYYY-MM-DD
    createTime: number              // 创建时间 时间戳
}
/**
 * 商城每日金币订单统计表
 *  - 原生充值自动匹配充值通道
 * @date 2019年10月23日
 * @description 新版支付
 * @author Andy
 * 
 * @property allGoldItem<[{itemId:number,prePayOrder:number,payedOrder:number}]>
 */
const schema = new Schema({
    payMethodId: Number,
    payMethodName: String,          // 支付方式名称
    payTypeId: Number,              // 支付通道编号
    payTypeName: String,            // 支付通道名称
    prePayOrder: Number,            // 预支付订单数
    payedOrder: Number,             // 已支付订单数
    allGoldItem: [],                // 该支付各商品细类统计
    paySuccessPercentage: Number,   // 支付成功百分比 表示 100% => 100
    date: String,                   // 日期 YYYY-MM-DD
    createTime: Number              // 创建时间 时间戳
});

export const mall_daily_gold_order = model<Imall_daily_gold_order>("mall_daily_gold_order", schema, 'mall_daily_gold_order');
