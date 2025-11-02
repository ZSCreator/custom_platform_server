import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Ipirate_data extends Document {
    uid: string,
    pirateMiniGames: {},//海盗船小游戏金币收集进度,数组为空默认0,金币场
    pirateBox: [],//海盗船宝箱,金币场
    freespinNum: number,//freespin次数,金币场
    bet: number,//玩家投入
    profit: number,//玩家盈利
    currDish: number//当前轮盘
}
const schema = new Schema({
    uid: String,
    pirateMiniGames: {},//海盗船小游戏金币收集进度,数组为空默认0,金币场
    pirateBox: [],//海盗船宝箱,金币场
    freespinNum: Number,//freespin次数,金币场
    bet: Number,//玩家投入
    profit: Number,//玩家盈利
    currDish: Number//当前轮盘
}, { versionKey: false });

export const pirate_data = model<Ipirate_data>("pirate_data", schema, 'pirate_data');
