import { SchemaTypes, Schema, Document, model } from 'mongoose';
/**
 * 真人视讯的表结构
 * 暂时没有用到
 */
interface Ireality_video_schedule_task extends Document {
  task_tag: string,       // 任务标识符 取自 表：reality_video_game_record 的 dateTag
  uid: string,           // 用户编号
  username: string,      // 视讯账号
  betTotal: number,      // 下注总流水
  profitTotal: number,   // 盈利总流水
  gameRounds: number,    // 局数
  status: number,        // 任务状态  0.未开始 1.执行成功 2.执行异常 3.执行出错
  err_msg: string,       // 任务结果说明
  createTime: number,    // 创建时间
  lastUpdateTime: number,// 最近修改时间
}

const schema = new Schema({
  task_tag: String,       // 任务标识符 取自 表：reality_video_game_record 的 dateTag
  uid: String,           // 用户编号
  username: String,      // 视讯账号
  betTotal: Number,      // 下注总流水
  profitTotal: Number,   // 盈利总流水
  gameRounds: Number,    // 局数
  status: Number,        // 任务状态  0.未开始 1.执行成功 2.执行异常 3.执行出错
  err_msg: String,       // 任务结果说明
  createTime: Number,    // 创建时间
  lastUpdateTime: Number,// 最近修改时间
}, { versionKey: false });

export const reality_video_schedule_task = model<Ireality_video_schedule_task>("reality_video_schedule_task", schema, 'reality_video_schedule_task');
