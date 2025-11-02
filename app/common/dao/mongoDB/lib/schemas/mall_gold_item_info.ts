import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Imall_gold_item_info extends Document {
    itemId: string,           // id
    itemName: string,         // 金币商品名称
    itemDescription: string,  // 商品描述
    itemPrice: number,        // 商品价格
    priceToGold: number,      // 可兑换金币数量
    language: string,         // 语言
    sort: number,             // 排序
    itemButtonName: string,   // 按钮名称
    iconUrl: string,          // 商城图标地址
    noShowPayMethodList: [],      // 屏蔽的支付方式
    noShowPayTypeList: [],        // 屏蔽的支付通道
    isOpen: boolean,          // 是否开启
}
/**
 * 商品信息表
 *  - 原生充值自动匹配充值通道
 * @date 2019年10月23日
 * @description 新版支付
 * @author Andy
 */
const schema = new Schema({
    itemId: String,           // id
    itemName: String,         // 金币商品名称
    itemDescription: String,  // 商品描述
    itemPrice: Number,        // 商品价格
    priceToGold: Number,      // 可兑换金币数量
    language: String,         // 语言
    sort: Number,             // 排序
    itemButtonName: String,   // 按钮名称
    iconUrl: String,          // 商城图标地址
    noShowPayMethodList: [],      // 屏蔽的支付方式
    noShowPayTypeList: [],        // 屏蔽的支付通道
    isOpen: Boolean,          // 是否开启
}, { versionKey: false });


export const mall_gold_item_info = model<Imall_gold_item_info>("mall_gold_item_info", schema, 'mall_gold_item_info');
