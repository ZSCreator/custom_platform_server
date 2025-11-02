'use strict';

import { Schema, Document, model } from 'mongoose';

/**
 * 现阶段没有用到，先屏蔽
 */

interface Iactivity_info extends Document {
    type: number;
    remark: string,
    title: String,                          // 标题
    contentImg: string[],                         // 类容图片
    createTime: number,                     // 创建时间
    updateTime: number,                     // 更新时间
    sort: number,                           // 活动排序
    isLeading: boolean,                    //是否前端固定
    isOpen: boolean, // 是否开启
}

const schema = new Schema({
    type: { type: Number, index: true },      // 类型 1：活动配置，2：实况配置
    remark: String,                         // 描述
    title: String,                          // 标题
    contentImg: [],                         // 类容图片
    createTime: Number,                     // 创建时间
    updateTime: Number,                     // 更新时间
    sort: Number,                           // 活动排序
    isLeading: Boolean,                    //是否前端固定
    isOpen: { type: Boolean, default: true }, // 是否开启
}, { versionKey: false });

// schema.index({ type: 1 }); // schema level

export const activity_info = model<Iactivity_info>("activity_info", schema, 'activity_info');