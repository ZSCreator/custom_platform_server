'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Isystem_shop_gold extends Document {
    id: string,   //id
    name: string,  //金币商品名称
    dese: string,  //商品描述
    luckyGrass: number,    //充值获得多少幸运草
    price: number,    //商品价格
    coinType: number,    //货币类型
    language: string,     //语言
    shopNum: number,    //商品顺序
    isOpen: Boolean,   //是否开启url
    icon: string,   //商品图标
    url: string,   //商品图片地址
    gold: number,    //充值获得多少金币
    btnTxt: string,   //按钮名称
    noShowPayType: any[],  //不显示的支付方式
    noShowPayMethod: [],  //不显示的支付通道 
    sort: number     // 排序
}
/**
 * 记录系统上传的购买金币的物品
 * 暂时没有用到
 */
const schema = new Schema({
    id: String,   //id
    name: String,  //金币商品名称
    dese: String,  //商品描述
    luckyGrass: Number,    //充值获得多少幸运草
    price: Number,    //商品价格
    coinType: Number,    //货币类型
    language: String,     //语言
    shopNum: Number,    //商品顺序
    isOpen: Boolean,   //是否开启url
    icon: String,   //商品图标
    url: String,   //商品图片地址
    gold: Number,    //充值获得多少金币
    btnTxt: String,   //按钮名称
    noShowPayType: [],  //不显示的支付方式
    noShowPayMethod: [],  //不显示的支付通道 
    sort: Number     // 排序
}, { versionKey: false });

export const system_shop_gold = model<Isystem_shop_gold>("system_shop_gold", schema, 'system_shop_gold');