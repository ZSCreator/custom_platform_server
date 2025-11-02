'use strict';

import { Schema, Document, model } from 'mongoose';
interface Isystem_config extends Document {
    tixianBate: number,                 // 手续费百分比
    customerText: string,               // 客服充值的警示语
    startGold: number,                  // 开始的新账号金币
    alreadyCommissionGames: [],         // 已经通过设置的赔率从赢取里面抽了水，所以实际赢取不再减去抽水的值，但要记录下来供后台返佣计算
    commissionSetting: {},              // 抽水设置
    // robotNumberSetting: {},             // 机器人数量设置 {nidA: {ordinary: {min, max}, expert: {min, max}}}
    wuXianConfig: {},                   // 无线代的返佣比例
    nativeDomain: string,               // 本机服务器域名
    isReleaseWater: Boolean,            // 是否打开龙虎对押放水
    h5GameUrl: string,                  // h5游戏地址
    inputGoldThan : number,             // 玩家单次下注大于
    winGoldThan : number,               // 玩家当日赢取大于
    winAddRmb : number ,                // 赢取/带入 倍数
}
const schema = new Schema({
    tixianBate: Number,                 // 手续费百分比
    customerText: String,               // 客服充值的警示语
    startGold: Number,                  // 开始的新账号金币
    alreadyCommissionGames: [],         // 已经通过设置的赔率从赢取里面抽了水，所以实际赢取不再减去抽水的值，但要记录下来供后台返佣计算
    commissionSetting: {},              // 抽水设置
    // robotNumberSetting: {},             // 机器人数量设置 {nidA: {ordinary: {min, max}, expert: {min, max}}}
    wuXianConfig: {},                   // 无线代的返佣比例
    nativeDomain: String,               // 本机服务器域名
    isReleaseWater: Boolean,            // 是否打开龙虎对押放水
    h5GameUrl: String,                  // h5游戏地址
    inputGoldThan : Number,             // 玩家单次下注大于
    winGoldThan : Number,               // 玩家当日赢取大于
    winAddRmb : Number ,                // 赢取/带入 倍数
}, { versionKey: false });

export const system_config = model<Isystem_config>("system_config", schema, 'system_config');
















