'use strict';
/**
 * 游戏中通过后台发送大喇叭的记录表
 * 暂时没有用
 */
import { Schema, Document, model } from 'mongoose';
interface Ibig_post_notice extends Document {
	nickname: string,
	content: string,
	uid: string,
	time: number,
}

const schema = new Schema({
	nickname: String,
	content: String,
	uid: String,
	time: Number,
}, { versionKey: false });

export const big_post_notice = model<Ibig_post_notice>("big_post_notice", schema, 'big_post_notice');
