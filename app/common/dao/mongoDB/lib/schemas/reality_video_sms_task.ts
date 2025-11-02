import { SchemaTypes, Schema, Document, model } from 'mongoose';
/**
 * 真人视讯的表结构
 * 暂时没有用到
 */
interface Ireality_video_sms_task extends Document {
  warn_integral: number,      // 代理账户余额预警值(元)
  user_name: string,          // 通知人用户名或昵称
  telphone: string,           // 通知人号码
  send_times: number,         // 通知次数；0:无上限
  interval_time: number,      // 通知间隔时间(单位 秒) 0:玩家登入时触发一次则触发一次
  status: number,             // 1.启用 2.停止 
  record: [],                 // 通知记录 
  lastSendTime: number,       // 上次发送时间
  createTime: number,
}
const schema = new Schema({
  warn_integral: Number,      // 代理账户余额预警值(元)
  user_name: String,          // 通知人用户名或昵称
  telphone: String,           // 通知人号码
  send_times: Number,         // 通知次数；0:无上限
  interval_time: Number,      // 通知间隔时间(单位 秒) 0:玩家登入时触发一次则触发一次
  status: Number,             // 1.启用 2.停止 
  record: [],                 // 通知记录 
  lastSendTime: Number,       // 上次发送时间
  createTime: Number,
}, { versionKey: false });

export const reality_video_sms_task = model<Ireality_video_sms_task>("reality_video_sms_task", schema, 'reality_video_sms_task');
// export default reality_video_sms_task;
/**
 * 记录说明 ：
 * record:
 * {integral, had_send_times,send_status,err_msg,createTime }
 *
 * 单条属性说明
 * integral: 发送消息时，所剩余额
 * had_send_times:已发次数
 * send_status:发送状态 1.成功 2.失败
 * err_msg: 失败原因
 */