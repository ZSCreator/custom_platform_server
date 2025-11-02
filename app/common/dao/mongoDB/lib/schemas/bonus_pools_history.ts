'use strict';

import { Schema, Document, model } from 'mongoose';

interface Ibonus_pools_history extends Document {
    nid: string,                              // 游戏id
    gameName: string,                         // 游戏名称
    sceneId: number,                          // 场id
    sceneName: string,                        // 场名称：玩法类型
    bonus_amount: number,                     // 公共奖池 当前金额
    control_amount: number,                   // 调控池 当前金额
    profit_amount: number,                    // 盈利池 当前金额
    createDateTime: number,                   // 创建时间
    updateDateTime: number                    // 最近更新时间
}
/**
 * 奖池清空记录统计
 */
const schema = new Schema({
    nid: String,                              // 游戏id
    gameName: String,                         // 游戏名称
    sceneId: Number,                          // 场id
    sceneName: String,                        // 场名称：玩法类型
    bonus_amount: Number,                     // 公共奖池 当前金额
    control_amount: Number,                   // 调控池 当前金额
    profit_amount: Number,                    // 盈利池 当前金额
    createDateTime: Number,                   // 创建时间
    updateDateTime: Number                    // 最近更新时间
}, { versionKey: false });


export const bonus_pools_history = model<Ibonus_pools_history>("bonus_pools_history", schema, 'bonus_pools_history');
