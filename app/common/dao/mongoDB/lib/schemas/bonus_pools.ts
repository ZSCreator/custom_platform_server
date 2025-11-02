'use strict';

import { Schema, Document, model } from 'mongoose';

interface Ibonus_pools extends Document {
  nid: string,                              // 游戏id
  gameName: string,                         // 游戏名称
  sceneId: number,                          // 场id
  sceneName: string,                        // 场名称：玩法类型
  roomId: string,                         // 房间id
  bonus_amount: number,                     // 公共奖池 当前金额
  bonus_initAmount: number,                 // 公共奖池 初始金额
  bonus_minAmount: number,                  // 公共奖池 下限金额
  bonus_minParameter: number,               // 公共奖池 金额减少时计算使用的系数
  bonus_maxAmount: number,                  // 公共奖池 上限金额
  bonus_maxParameter: number,               // 公共奖池 金额增加时计算使用的系数
  bonus_poolCorrectedValue: number,         // 公共奖池 修正系数
  bonus_maxAmountInStore: number,           // 最高储存金额
  bonus_maxAmountInStoreSwitch: boolean,    // 金额达到指定上限( bonus_maxAmountInStore )时,自动/手动 将多的部分转入"调控池"
  bonus_minBonusPoolCorrectedValue: number, // 公共奖池修正值 下限
  bonus_maxBonusPoolCorrectedValue: number, // 公共奖池修正值 上限
  bonus_personalReferenceValue: number,     // 房间个人基准值
  control_amount: number,                   // 调控池 当前金额
  profit_amount: number,                    // 盈利池 当前金额
  createDateTime: number,                   // 创建时间
  autoUpdate: boolean,                      // 是否定时自动更新
  lockJackpot: boolean,                     // 奖池是否被锁定 被锁定则奖池修正值则不再变化
  lastUpdateUUID: string,                   // 最近更新 id
  updateDateTime: number                    // 最近更新时间
}

const schema = new Schema({
  nid: String,                              // 游戏id
  gameName: String,                         // 游戏名称
  sceneId: Number,                          // 场id
  sceneName: String,                        // 场名称：玩法类型
  roomId: String,                         // 房间id
  bonus_amount: Number,                     // 公共奖池 当前金额
  bonus_initAmount: Number,                 // 公共奖池 初始金额
  bonus_minAmount: Number,                  // 公共奖池 下限金额
  bonus_minParameter: Number,               // 公共奖池 金额减少时计算使用的系数
  bonus_maxAmount: Number,                  // 公共奖池 上限金额
  bonus_maxParameter: Number,               // 公共奖池 金额增加时计算使用的系数
  bonus_poolCorrectedValue: Number,         // 公共奖池 修正系数
  bonus_maxAmountInStore: Number,           // 最高储存金额
  bonus_maxAmountInStoreSwitch: Boolean,    // 金额达到指定上限( bonus_maxAmountInStore )时,自动/手动 将多的部分转入"调控池"
  bonus_minBonusPoolCorrectedValue: Number, // 公共奖池修正值 下限
  bonus_maxBonusPoolCorrectedValue: Number, // 公共奖池修正值 上限
  bonus_personalReferenceValue: Number,     // 房间个人基准值
  control_amount: Number,                   // 调控池 当前金额
  profit_amount: Number,                    // 盈利池 当前金额
  createDateTime: Number,                   // 创建时间
  autoUpdate: Boolean,                      // 是否定时自动更新
  lockJackpot: Boolean,                     // 奖池是否被锁定 被锁定则奖池修正值则不再变化
  lastUpdateUUID: String,                   // 最近更新 id
  updateDateTime: Number                    // 最近更新时间
}, { versionKey: false });

export const bonus_pools = model<Ibonus_pools>("bonus_pools", schema, 'bonus_pools');
