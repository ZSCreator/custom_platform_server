'use strict';
import { Schema, Document, model } from 'mongoose';
interface Igame_Records_live extends Document {
    nid: string,                // 游戏ID
    uid: string,
    gameName: string,           // 游戏名称
    createTime: number,
    result: [],
}
//游戏实况记录 对战游戏 三张牌 比牌牛牛专用
const schema = new Schema({
    nid: String,                // 游戏ID
    uid: String,
    gameName: String,           // 游戏名称
    createTime: Number,
    result: [],
}, { versionKey: false });

export const game_Records_live = model<Igame_Records_live>("game_Records_live", schema, 'game_Records_live');
