'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

export interface Iinfinite_agent_info extends Document {
    uid: string,   // 玩家uid
    remark: string,                     // 代理备注或者代理编号
    inviteCode: string,                 // 邀请码
    gold: number,                        //玩家身上有多少金币
    createTime: number,                 // 创建时间
    superior: string,                   // 上级的 uid
    group_id: string,                   // 顶级的 uid
    agentLevel: number,                 // 代理等级
    group_line: number,                 // group_line，查询用的
    open_agent: boolean,                // 是否开通了代理
    open_group_time: number,            // 上次开通大区的时间
    close_group_time: number,           // 上次关闭大区的时间
    // addRmbNum: [],                      // 充值过的直属下级
    // closedGames: [],                    // 关闭的游戏（只有大区能开）
    gameDownUrl: string,                   // 游戏的下载地址
    openQrCode: number,                   // 是否打开二维码  1为不开 2 为开
    openCommission: number,                   // 是否打开佣金 1为不开 2 为开
    profitsRatio: number,               // 设置的返佣比例
}

// 无限级代理的代理信息表
const schema = new Schema({
    uid: { type: String, index: true },   // 玩家uid
    remark:  { type: String, index: true },                     // 代理备注或者代理编号
    inviteCode: String,                 // 邀请码
    gold: Number,                        //玩家身上有多少金币
    createTime: Number,                 // 创建时间
    superior: String,                   // 上级的 uid
    group_id: String,                   // 顶级的 uid
    agentLevel: Number,                 // 代理等级
    group_line: Number,                 // group_line，查询用的
    open_agent: Boolean,                // 是否开通了代理
    open_group_time: Number,            // 上次开通大区的时间
    close_group_time: Number,           // 上次关闭大区的时间
    // addRmbNum: [],                      // 充值过的直属下级
    // closedGames: [],                    // 关闭的游戏（只有大区能开）
    gameDownUrl: String,                // 游戏的下载地址
    openQrCode: Number,                 // 是否打开二维码  1为不开 2 为开
    openCommission: Number,             // 是否打开佣金 1为不开 2 为开
    profitsRatio: Number,               // 设置的返佣比例
}, { versionKey: false });

export const infinite_agent_info = model<Iinfinite_agent_info>("infinite_agent_info", schema, 'infinite_agent_info');
