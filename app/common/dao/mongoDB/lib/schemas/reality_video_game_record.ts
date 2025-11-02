import { SchemaTypes, Schema, Document, model } from 'mongoose';
/**
 * 真人视讯的表结构
 * 暂时没有用到
 */
interface Ireality_video_game_record extends Document {
  id: number,             // 
  record_id: number,      // 用户投注号
  game_type: string,      // baccarat:欢乐百人; dragon_tiger:龙虎; 牛牛:cattle;
  username: string,       // 用户名
  table_id: number,       // 投注的台号
  period_info: string,    // 投注的靴次/口次信息
  bet_amount: number,     // 下注金额
  game_result: string,    // 开奖结果
  bet_record: string,     // 下注记录
  profit: number,         // 盈利情况 正/负
  balance_before: number, // 用户投注前余额
  balance_after: number,  // 用户投注后余额
  xima: number,           // 用户洗码值
  xima_detail: number,    // 
  bet_time: string,       // 下注时间
  bet_time_unix: number,  // 下注时间戳
  draw_time: string,      // 结算时间
  draw_time_unix: number, // 结算时间戳
  state: number,          // 结果：1.正常开奖 2.游戏作废 3.取消投注
  createTime: number,
  dateTag: string          // 日期TAG，用以区分
}
const schema = new Schema({
  id: Number,             // 
  record_id: Number,      // 用户投注号
  game_type: String,      // baccarat:欢乐百人; dragon_tiger:龙虎; 牛牛:cattle;
  username: String,       // 用户名
  table_id: Number,       // 投注的台号
  period_info: String,    // 投注的靴次/口次信息
  bet_amount: Number,     // 下注金额
  game_result: String,    // 开奖结果
  bet_record: String,     // 下注记录
  profit: Number,         // 盈利情况 正/负
  balance_before: Number, // 用户投注前余额
  balance_after: Number,  // 用户投注后余额
  xima: Number,           // 用户洗码值
  xima_detail: Number,    // 
  bet_time: String,       // 下注时间
  bet_time_unix: Number,  // 下注时间戳
  draw_time: String,      // 结算时间
  draw_time_unix: Number, // 结算时间戳
  state: Number,          // 结果：1.正常开奖 2.游戏作废 3.取消投注
  createTime: Number,
  dateTag: String          // 日期TAG，用以区分
}, { versionKey: false });


export const reality_video_game_record = model<Ireality_video_game_record>("reality_video_game_record", schema, 'reality_video_game_record');
