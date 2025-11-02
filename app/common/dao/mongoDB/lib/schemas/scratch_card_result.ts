'use strict';
import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Iscratch_card_result extends Document {
        id: string,  //         唯一标识的值
        cardNum: string,  //   卡的编号
        result: [],  //      刮刮乐的结果集
        rebate: number, //  赔率
        jackpotId: number,// 奖池id
        status: number,  //数据状态 ，初始为0,如果被使用那么就变为1 然后不停的累加
}
const schema = new Schema({
        id: String,  //         唯一标识的值
        cardNum: String,  //   卡的编号
        result: [],  //      刮刮乐的结果集
        rebate: Number, //  赔率
        jackpotId: Number,// 奖池id
        status: Number,  //数据状态 ，初始为0,如果被使用那么就变为1 然后不停的累加
}, { versionKey: false });

export const scratch_card_result = model<Iscratch_card_result>("scratch_card_result", schema, 'scratch_card_result');
