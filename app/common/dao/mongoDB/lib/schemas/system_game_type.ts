import { Schema, Document, model } from 'mongoose';
interface ISystemGameType extends Document {
    typeId: string,                 // 游戏类型Id
    sort: number,                   // 序号
    name: string,                   //  中文名
    open: boolean,                   // 是否显示
    nidList: [],                     //nid 的集合{nid:'1'}
}
/**
 * 游戏数据结构定义
 * */
const schema = new Schema({
    typeId: String,                // 游戏类型Id
    sort: Number,               // 序号
    name: String,               // 中文名
    open: Boolean,              // 是否显示
    nidList: [],                // nid 的集合{nid:'1' ,sort : 1 }
}, { versionKey: false });


export const system_game_type = model<ISystemGameType>("system_game_type", schema, 'system_game_type');
