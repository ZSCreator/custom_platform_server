import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface IPersonalControl extends Document {
    nid: string,                                 // 游戏nid
    gameName: string,                            // 游戏名称
    sceneName: string,                           // 游戏名字
    sceneId: number,                             // 游戏场
    playersCount: number,                        // 调控玩家人数
    conditionDescription: string,                // 调控条件描述
    controlPlayersMap: any,                      // 调控玩家
    updateTime: number,                          // 更新时间
    createTime: number,                          // 创建时间
}
const schema = new Schema({
    nid: String,
    gameName: String,
    sceneId: Number,
    sceneName: String,
    conditionDescription: String,
    playersCount: Number,
    controlPlayersMap: { type: Object, default: {} },
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });

export const personal_control = model<IPersonalControl>("personal_control", schema, 'personal_control');
