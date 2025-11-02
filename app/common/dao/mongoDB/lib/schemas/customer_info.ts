'use strict';
/**
 * 暂时没有使用
 */
import { Schema, Document, model } from 'mongoose';

interface Icustomer_info extends Document {
	id: string,
	uid: string,
	content: string,
	replyContent: string,   //客服回复信息
	nickname: string,
	vip: string,
	inviteCode: string,
	isSolve: number,     //1为没处理,2为处理中 3为已处理 4为已回复
	createTime: number,
	type: number,        // 1: 意见反馈   2: 代理申请
	name: string,
	phone: number,
	qq: number,
	weixin: string,
	passStatus: number,
	remark: string,
	passType: number,    // 0:未处理 1:通过 2:拒绝
}
/**
 *  玩家发送反馈信息信息表
 */

const schema = new Schema({
	id: String,
	uid: String,
	content: String,
	replyContent: String,   //客服回复信息
	nickname: String,
	vip: String,
	inviteCode: String,
	isSolve: Number,     //1为没处理,2为处理中 3为已处理 4为已回复
	createTime: Number,
	type: Number,        // 1: 意见反馈   2: 代理申请
	name: String,
	phone: Number,
	qq: Number,
	weixin: String,
	passStatus: Number,
	remark: String,
	passType: Number,    // 0:未处理 1:通过 2:拒绝
}, { versionKey: false });

export const customer_info = model<Icustomer_info>("customer_info", schema, 'customer_info');
