'use strict';
/**
 * 暂时没有使用
 */

import { Schema, Document, model } from 'mongoose';
interface Icustomer_pay_info extends Document {
	id: string, 				//客服id
	customerName: string,  //客服充值的名字
	customerUrl: string,   //客服的logoUrl地址
	customerDesc: string,  //客服的描述
	customerContact: [],   //客服的联系方式
	createTime: string,    //创建时间
	language: string,     //语言版本
	NumOrder: number, 		//客服充值的排序
	isOpen: boolean,       //是否开启
}

const schema = new Schema({
	id: String, 				//客服id
	customerName: String,  //客服充值的名字
	customerUrl: String,   //客服的logoUrl地址
	customerDesc: String,  //客服的描述
	customerContact: [],   //客服的联系方式
	createTime: String,    //创建时间
	language: String,     //语言版本
	NumOrder: Number, 		//客服充值的排序
	isOpen: Boolean,       //是否开启
}, { versionKey: false });

export const customer_pay_info = model<Icustomer_pay_info>("customer_pay_info", schema, 'customer_pay_info');
