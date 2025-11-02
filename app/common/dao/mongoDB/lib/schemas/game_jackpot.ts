'use strict';

import { Schema, Document, model } from 'mongoose';

/**
 * 彩票类奖池
 * 暂时没有用到
 */
interface Igame_jackpot extends Document {
    nid: string,                // 游戏ID
    id: number,                 // nid 游戏下的子奖池编号
    gameName: string,           // 游戏名称
    jackpot: number,            // 基础奖池
    profitPool: number,         // 盈利池
    runningPool: number         // 流通池
}

const schema = new Schema({
    nid: String,                // 游戏ID
    id: Number,                 // nid 游戏下的子奖池编号
    gameName: String,           // 游戏名称
    jackpot: Number,            // 基础奖池
    profitPool: Number,         // 盈利池
    runningPool: Number         // 流通池
}, { versionKey: false });

export const game_jackpot = model<Igame_jackpot>("game_jackpot", schema, 'game_jackpot');
