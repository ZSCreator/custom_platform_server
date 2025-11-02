'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Isystem_scene extends Document {
    nid: string,                // 游戏ID
    id: number,                 // 某个游戏的场ID
    name: string,               // 场名称

    entryCond: number,          // 进入条件
    lowBet: number,             // 底注
    capBet: number,             // 封顶
    allinMaxNum: number,        // 可以全下最大额度

    canCarryGold: {},           // 可以携带的金币
    blindBet: {},               // 小盲/大盲

    minimumGold: number,        // 进入玩家最少金币
    maximumGold: number,        // 进入玩家最多金币
    leastHouseGold: {},         // 最小上庄金币
    room_count: number,         // 场的房间配置个数
}
// 场的表结构定义
const schema = new Schema({
    nid: String,                // 游戏ID
    id: Number,                 // 某个游戏的场ID
    name: String,               // 场名称

    entryCond: Number,          // 进入条件
    lowBet: Number,             // 底注
    capBet: Number,             // 封顶
    allinMaxNum: Number,        // 可以全下最大额度

    canCarryGold: {},           // 可以携带的金币
    blindBet: {},               // 小盲/大盲

    minimumGold: Number,        // 进入玩家最少金币
    maximumGold: Number,        // 进入玩家最多金币
    leastHouseGold: {},         // 最小上庄金币
    room_count: Number,         // 场的房间配置个数
}, { versionKey: false });

export const system_scene = model<Isystem_scene>("system_scene", schema, 'system_scene');