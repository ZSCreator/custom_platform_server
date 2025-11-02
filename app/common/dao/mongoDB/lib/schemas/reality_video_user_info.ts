'use strict';
import { SchemaTypes, Schema, Document, model } from 'mongoose';
/**
 * 真人视讯的表结构
 * 暂时没有用到
 */
interface Ireality_video_user_info extends Document {
    uid: string,// 内部id
    nickname: string,// 内部账户，用户昵称
    username: string,// 视讯账号
    password: string,// 视讯密码
    ratio_switch: number,// 1.单边；2双边
    ratio: number,// 洗码比例
    ratio_setting: number,//是否可查看洗码比例 1.可查看 0.不可
    integral: number,// 分数
    isDemoAccount: number,// 账户类型 1 正常账户 2 试玩账户 
    lastLoginTime: number,// 最近登录时间
    createDateTime: number,// 创建时间
    updateDateTime: number,// 最近修改时间
}

const schema = new Schema({
    uid: String,// 内部id
    nickname: String,// 内部账户，用户昵称
    username: String,// 视讯账号
    password: String,// 视讯密码
    ratio_switch: Number,// 1.单边；2双边
    ratio: Number,// 洗码比例
    ratio_setting: Number,//是否可查看洗码比例 1.可查看 0.不可
    integral: Number,// 分数
    isDemoAccount: Number,// 账户类型 1 正常账户 2 试玩账户 
    lastLoginTime: Number,// 最近登录时间
    createDateTime: Number,// 创建时间
    updateDateTime: Number,// 最近修改时间
}, { versionKey: false });

export const reality_video_user_info = model<Ireality_video_user_info>("reality_video_user_info", schema, 'reality_video_user_info');
