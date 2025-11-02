'use strict';

/**
 * 领取邮件的记录
 */
import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Ireceive_mail_record extends Document {
        mailId: string,  //记录id
        uid: string,         //uid
        name: string,    //邮件名称
        sender: string,  //发送人
        content: string,  //邮件内容
        sendTime: number,  // 发送时间
        createTime: number,  // 创建时间
        attachment: any,  //邮件附件
}
const schema = new Schema({
        mailId: String,  //记录id
        uid: String,         //uid
        name: String,    //邮件名称
        sender: String,  //发送人
        content: String,  //邮件内容
        sendTime: Number,  // 发送时间
        createTime: Number,  // 创建时间
        attachment: SchemaTypes.Mixed,  //邮件附件
}, { versionKey: false });


export const receive_mail_record = model<Ireceive_mail_record>("receive_mail_record", schema, 'receive_mail_record');
