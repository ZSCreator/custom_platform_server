'use strict';

import {Schema, Document, model } from 'mongoose';
import {GameNidEnum} from "../../../../constant/game/GameNidEnum";

interface ISlotWinLimit extends Document {
    nid: GameNidEnum,                             // 游戏nid
    winLimitConfig: any,                          // 具体配置
    updateTime?: number,
    createDateTime?: number
}
// 表model
const schema = new Schema({
    nid: String,                                 // 游戏nid
    winLimitConfig: Object,                                 // 具体配置
    updateTime: { type: Number, default: Date.now() },
    createDateTime: { type: Number, default: Date.now() }
}, { versionKey: false });

export const slot_win_limit = model<ISlotWinLimit>("slot_win_limit", schema, 'slot_win_limit');
