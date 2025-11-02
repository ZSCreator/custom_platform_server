'use strict';

/**
 * 埃及夺宝窗口结果
 */
import { SchemaTypes, Schema, Document, model } from 'mongoose';
interface Ipharaoh extends Document {
	pass: string,
	reward: string,
	winNum: string,
	result: any,
}
const schema = new Schema({
	pass: String,
	reward: String,
	winNum: String,
	result: SchemaTypes.Mixed,
}, { versionKey: false });

export const pharaoh = model<Ipharaoh>("pharaoh", schema, 'pharaoh');
