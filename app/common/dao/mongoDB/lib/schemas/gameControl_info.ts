import { Schema, Document, model } from 'mongoose';
interface IgameControl_info extends Document {
    nid: string,             // 游戏nid
    gameName: string,             // 游戏名称
    sceneId: number,             // 游戏场
    roomId: string,             // 游戏房间号
    sceneControlWeightValue: number,             // 场控权重权重值
    personalControlWeightValue: number,             // 个人调控权重值
    control_count: number,             // 被调控次数
    sceneControl_count: number,             // 场控次数
    personalControl_count: number,             // 个控次数
    updateTime: number,
    createTime: number,
}
const schema = new Schema({
    nid: String,             // 游戏nid
    gameName: String,             // 游戏名称
    sceneId: Number,             // 游戏场
    roomId: String,             // 游戏房间号
    sceneControlWeightValue: Number,             // 场控权重权重值
    personalControlWeightValue: Number,             // 个人调控权重值
    control_count: Number,             // 被调控次数
    sceneControl_count: Number,             // 场控次数
    personalControl_count: Number,             // 个控次数
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });

export const gameControl_info = model<IgameControl_info>("gameControl_info", schema, 'gameControl_info');
