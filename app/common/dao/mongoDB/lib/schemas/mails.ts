'use strict';

import { SchemaTypes, Schema, Document, model } from 'mongoose';

interface Imails extends Document {
    id: string,
    uid: string,  //邮件发送这id
    img: string,
    sender: string,  //发送人
    name: string,    //邮件名称
    content: string,  //邮件内容
    reason: string,     //原因
    type: number,  //是提现的邮件 1 提现邮件，没有该字段就是普通邮件
    // attachment: any,  //邮件附件
    time: number,      //邮件创建时间
    isRead: boolean,   //是否已读
    isdelete: boolean   //是否删除
}

const schema = new Schema({
    id: String,
    uid: { "type": String, "index": true },  //邮件发送这id
    img: String,
    sender: String,  //发送人
    name: String,    //邮件名称
    content: String,  //邮件内容
    reason: String,     //原因
    type: Number,  //是提现的邮件 1 提现邮件，没有该字段就是普通邮件
    // attachment: SchemaTypes.Mixed,  //邮件附件
    time: Number,      //邮件创建时间
    isRead: Boolean,   //是否已读
    isdelete: Boolean   //是否删除
}, { versionKey: false });

export const mails = model<Imails>("mails", schema, 'mails');
