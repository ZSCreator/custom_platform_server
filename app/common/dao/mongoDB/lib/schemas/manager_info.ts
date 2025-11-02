'use strict';

import { Schema, Document, model } from 'mongoose';

/**
 * 新的管理后台账户表
 */
interface Imanager_info extends Document {
    userName: string,                       // 用户名
    passWord: string,                       // 用户名密码
    managerId: string,                       // 后台管理人员编号
    remark: string,                         // 后台备注信息
    agent: string,                        //存储uid
    role: number,                         //账号角色     //1 是什么角色  2 是什么角色  3 是什么角色, 由前端那边进行定义
    ip: [],                             // 白名单ip
}


//  管理后台的表结构
const schema = new Schema({
    userName: String,  // 用户名
    passWord: String,                        // 用户名密码
    managerId: String,                        // 后台管理人员编号
    remark: String,                           // 后台备注信息
    agent: String,                            // 存储uid
    role: Number,                            // 账号角色
    ip: Array,                         // 后台备注信息
}, { versionKey: false });

export const manager_info = model<Imanager_info>("manager_info", schema, 'manager_info');
