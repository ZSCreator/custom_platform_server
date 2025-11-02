'use strict';
import { SchemaTypes, Schema, Document, model } from 'mongoose';
/**
 * 真人视讯的表结构
 * 暂时没有用到
 */
interface Ireality_video_score_record extends Document {
    uid: string,    // 用户id
    username: string,// 用户视讯账号
    changeIntegral: number,// 分数
    createDateTime: number,// 创建时间
}
const schema = new Schema({
    uid: String,    // 用户id
    username: String,// 用户视讯账号
    changeIntegral: Number,// 分数
    createDateTime: Number,// 创建时间
}, { versionKey: false });


export const reality_video_score_record = model<Ireality_video_score_record>("reality_video_score_record", schema, 'reality_video_score_record');
