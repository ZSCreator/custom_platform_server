'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Iupdate_announcement extends Document {
	createTime: number, 				//创建时间
	content: string,					    //公告内容
	noticeType: number,  			  //
	// opentPopUp: boolean,  			  //是否开启弹窗
	openType: string,   			 //是否关闭  0 弹出 1 就是打开 2 就是关闭
	// teamName: string,  			 //团队名字
	// isAddClose: Boolean, 			 //是否加关闭按钮
	sort: number, 					//公告的排序
	title: string, 				//公告标题的名字
	// url: string, 					//广告的URL地址
}
const schema = new Schema({
	createTime: Number, 				//创建时间
	// contents: [],					   //公告内容
	content: String,					    //公告内容
	// checkContent: String,						//勾选内容
	noticeType: Number,  			  //
	// opentPopUp: Boolean,  			  //是否开启弹窗
	openType: String,   			 //是否关闭  0 弹出 1 就是打开 2 就是关闭
	// teamName: String,  			 //团队名字
	// isAddClose: Boolean, 			 //是否加关闭按钮
	sort: Number, 					//公告的排序
	title: String, 				//公告标题的名字
}, { versionKey: false });

export const update_announcement = model<Iupdate_announcement>("update_announcement", schema, 'update_announcement');

