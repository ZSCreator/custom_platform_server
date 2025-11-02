'use strict';

/**
 *  记录每日玩家进入游戏前的金币和出房间的金币
 *  暂时没有用到这张表
 */
import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Iplayer_day_game_record extends Document {
    createTime: number,                 // 创建时间
    nid: string,                       // 那个游戏
    uid: string,                       // uid
    sceneId: number,                   // 哪个场景
    roomId: string,                  // 哪个房间
    leaveTime: number,                 // 离开游戏时间
    startGold: number,                                      //  开始进入房间的金币
    leaveGold: number,                                     //   离开房间的金币
}
const schema = new Schema({
    createTime: { type: Number, index: true },                 // 创建时间
    nid: { type: String, index: true },                       // 那个游戏
    uid: { type: String, index: true },                       // uid
    sceneId: { type: Number, index: true },                   // 哪个场景
    roomId: { type: String, index: true },                  // 哪个房间
    leaveTime: { type: Number, index: true },                 // 离开游戏时间
    startGold: Number,                                      //  开始进入房间的金币
    leaveGold: Number,                                     //   离开房间的金币
}, { versionKey: false });

export const player_day_game_record = model<Iplayer_day_game_record>("player_day_game_record", schema, 'player_day_game_record');
