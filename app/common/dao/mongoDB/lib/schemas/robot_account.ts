'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Irobot_account extends Document {
        uid: string,  //id  
        rechargeMoney: number,  //玩家金币
        addtime: number //时间
}
/**
 * 机器人金钱明细
 */
const schema = new Schema({
        uid: String,  //id  
        rechargeMoney: Number,  //玩家金币
        addtime: Number //时间

}, { versionKey: false });

export const robot_account = model<Irobot_account>("robot_account", schema, 'robot_account');
