/**
 * 短信验证码，验证的记录
 */
import { Schema, Document, model } from 'mongoose';
interface Iauth_code extends Document {
    auth_code: string,
    createTime: number,
    status: number,
    phone: string
}
const schema = new Schema({
    auth_code: String,
    createTime: Number,
    status: Number,
    phone: String
}, { versionKey: false });

export const auth_code = model<Iauth_code>("auth_code", schema, 'auth_code');
