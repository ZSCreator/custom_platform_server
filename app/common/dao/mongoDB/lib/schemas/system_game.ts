import { Schema, Document, model } from 'mongoose';
interface ISystemGame extends Document {
    nid: string,                // 游戏ID
    sort: number,               // 序号
    name: string,               // 英文名
    zname: string,              // 中文名
    heatDegree: number,         // 热度
    onlineAwards: number,       // 联机大奖奖池
    opened: boolean,            // 游戏是否处于开放状态（默认是开放状态）：true是开放状态、false是关闭状态
    closeTime: number,          // 最近一次的游戏关闭时间
    whetherToShowScene: boolean,// 是否展示场选择
    whetherToShowRoom: boolean, // 是否展示房间选择
    whetherToShowGamingInfo: boolean, // 是否展示游戏内信息(盘路)
    roomCount: number,          // 房间数
    roomUserLimit: number,      // 房间人数限制
}
/**
 * 游戏数据结构定义
 * */
const schema = new Schema({
    nid: String,                // 游戏ID
    sort: Number,               // 序号
    name: String,               // 英文名
    zname: String,              // 中文名
    heatDegree: Number,         // 热度
    onlineAwards: Number,       // 联机大奖奖池
    opened: Boolean,            // 游戏是否处于开放状态（默认是开放状态）：true是开放状态、false是关闭状态
    closeTime: Number,          // 最近一次的游戏关闭时间
    whetherToShowScene: Boolean,// 是否展示场选择
    whetherToShowRoom: Boolean, // 是否展示房间选择
    whetherToShowGamingInfo: Boolean, // 是否展示游戏内信息(盘路)
    roomCount: Number,          // 房间数
    roomUserLimit: Number,      // 房间人数限制
}, { versionKey: false });


export const system_game = model<ISystemGame>("system_game", schema, 'system_game');
