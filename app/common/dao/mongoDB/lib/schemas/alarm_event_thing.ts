/**
 *  游戏的报警事件
 */

import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface IAlarm_event_thing extends Document {
    uid: string,                     // uid
    thirdUid: string,                // 第三方uid
    gameName: string,                // 游戏名称
    nid: string,                     // 游戏nid
    thingType: number,                // 报警事件,事件类型 1 为玩家事件 2 为游戏启动事件
    type: number,                     // 玩家事件类型  1为单次下注大于   2 为赢取大于  3 为赢取/带入大于
    status: number,                     // 报警事件是否已经处理  0为未处理 1 为已处理
    createTime: number,              // 时间戳
    input:number,                    //下注金额  单位为分
    win : number,                    //赢取金额  单位为分
    intoRmb : number,                //带入金额  单位为分
    oneWin : number,                // 带入一次的累计赢取金额  单位为分
    oneAddRmb : number,             //最近一次带入金额  单位为分
    dayWin : number,                //当日累计赢取金额
    sceneId : number,                //游戏场
    managerId : string               //处理人
}
const schema = new Schema({
    uid: String,                     // uid
    thirdUid: String,                // 第三方uid
    gameName: String,                // 游戏名称
    nid: String,                     // 游戏nid
    thingType: Number,                // 报警事件,事件类型 1 为玩家事件 2 为游戏启动事件
    type: Number,                     // 玩家事件类型   0为单次下注大于   1 为赢取大于  2 为赢取/带入大于
    status: {type:Number , index:true },                     // 报警事件是否已经处理  0为未处理 1 为已处理
    createTime: Number,              // 时间戳
    input: Number,                    //下注金额  单位为分
    win : Number,                    //赢取金额  单位为分
    intoRmb : Number,                //带入金额  单位为分
    oneWin : Number,                // 带入一次的累计赢取金额  单位为分
    oneAddRmb : Number,             //最近一次带入金额  单位为分
    dayWin : Number,                //当日累计赢取金额
    sceneId : Number,                //游戏场
    managerId : String               //处理人
}, { versionKey: false });

export const alarm_event_thing = model<IAlarm_event_thing>("alarm_event_thing", schema, 'alarm_event_thing');
