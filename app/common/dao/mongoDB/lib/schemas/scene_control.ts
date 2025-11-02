import { Schema, Document, model } from 'mongoose';
interface ISceneControl extends Document {
    nid: string,                    // 游戏nid
    gameName: string,               // 游戏名称
    sceneName: string,              // 场名字
    baseSystemWinRate: number,      // 系统基础胜率
    sceneId: number,                // 场id
    bankerKillProbability: number,  // 庄杀概率
    weights: number;                // 权重值
    bankerGame: boolean,            // 有庄游戏
    lockPool: boolean,              // 是否锁定奖池
    updateTime: number,
    createTime: number,
}
const schema = new Schema({
    nid: String,                    // 游戏nid
    gameName: String,               // 游戏名称
    sceneName: String,              // 场名称
    baseSystemWinRate: Number,      // 系统基础胜率
    sceneId: Number,                // 场id
    bankerGame: Boolean,            // 有庄游戏
    weights: Number,                // 权重值
    bankerKillProbability: Number,  // 庄杀概率
    lockPool: {type: Boolean, default: false},               //  是否锁定奖池
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });

export const scene_control = model<ISceneControl>("scene_control", schema, 'scene_control');
