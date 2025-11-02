import { SchemaTypes, Schema, Document, model } from 'mongoose';

/**
 * 记录玩家每日的利润记录
 */
interface Iplayer_day_profit_record extends Document {
    uid: string,                // 绑定id
    enterGold: number,          // 带入金币
    outGold: number,              // 带出金币
    loginNum: number,          // 登入次数
    dailyFlow: string,           // 今日码量
    profit: string,         // 利润
    createTime: number,    // 时间戳
}
const schema = new Schema({
    uid: {type:String , index:true},                // 绑定id
    enterGold: Number,               // 名字 customerText
    outGold: Number,              // 带出金币
    loginNum: Number,           // 登入次数
    dailyFlow: Number,         // 今日码量
    createTime: {type:Number , index:true},             // 时间戳
    profit: Number,               // 利润
}, { versionKey: false });

export const player_day_profit_record = model<Iplayer_day_profit_record>("player_day_profit_record", schema, 'player_day_profit_record');
