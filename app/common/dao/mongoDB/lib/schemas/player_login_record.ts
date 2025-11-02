'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
import { plugins } from '../plugins/index';
interface Iplayer_login_record extends Document {
    uid: string,
    nickname: string,
    loginTime: number,
    leaveTime: number,
    ip: string,                                         //登陆IP
    gold: {},
    addRmb: number,
}
// 玩家登陆信息记录
// 是否需要添加插件
const schema = new Schema({
    uid: String,
    nickname: String,
    loginTime: Number,
    leaveTime: Number,
    ip: String,                                         //登陆IP
    gold: {},
    addRmb: Number,
}, { versionKey: false });

schema.plugin(plugins, { index: true });

export const player_login_record = model<Iplayer_login_record>("player_login_record", schema, 'player_login_record');
