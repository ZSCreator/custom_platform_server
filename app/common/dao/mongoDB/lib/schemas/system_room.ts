'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';
export interface Isystem_room extends Document {
    serverId: string,
    nid: string,
    roomId: string,             // 房间编号
    jackpot: number,            // 基础奖池
    createTime: number,         // 房间的创建时间
    runningPool: number,        // 流水池
    profitPool: number,         // 盈利池
    currJackpot: {
        jackpot: number,
        runningPool: number,
        profitPool: number
    },                          // 前一天的奖池情况
    outRate: number,            // 返奖率
    socialDot: number,
    matchDot: number,
    winTotal: number,
    consumeTotal: number,
    boomNum: number,            // 房间爆机次数
    open: boolean,              // 房间是否打开
    // disableTime: number,        // 停用时间
    sceneId: number,            // 房间所属的场的ID
    users: any[],               // 玩家
    jackpotShow: {},            // 奖池显示配置
    wangJackpot: number,        // 草花机鬼牌奖池
    betUpperLimit: {},          // 压盘游戏限红
    entryCond: number,          // 进入金币要求
    enterVIPScore: number,      // 进入VIP积分要求
}
/**
 * 房间数据结构定义
 * */
const schema = new Schema({
    serverId: String,
    nid: String,
    roomId: String,             // 房间编号
    jackpot: Number,            // 基础奖池
    createTime: Number,         // 房间的创建时间
    runningPool: Number,        // 流水池
    profitPool: Number,         // 盈利池
    currJackpot: {
        jackpot: Number,
        runningPool: Number,
        profitPool: Number
    },                          // 前一天的奖池情况
    outRate: Number,            // 返奖率
    socialDot: Number,
    matchDot: Number,
    winTotal: Number,
    consumeTotal: Number,
    boomNum: Number,            // 房间爆机次数
    open: Boolean,              // 房间是否打开
    // disableTime: Number,        // 停用时间
    sceneId: Number,            // 房间所属的场的ID
    users: [],                  // 玩家
    jackpotShow: {},            // 奖池显示配置
    wangJackpot: Number,        // 草花机鬼牌奖池
    betUpperLimit: {},          // 压盘游戏限红
    entryCond: Number,          // 进入金币要求
    enterVIPScore: Number,      // 进入VIP积分要求
}, { versionKey: false });

export const system_room = model<Isystem_room>("system_room", schema, 'system_room');
