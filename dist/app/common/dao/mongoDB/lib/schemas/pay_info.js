'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.pay_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: { type: String, unique: true },
    time: Number,
    time_end: Number,
    attach: String,
    bank_type: String,
    fee_type: String,
    total_fee: Number,
    openid: String,
    remark: String,
    uid: String,
    nickname: String,
    addgold: Number,
    gold: Number,
    agencylink: String,
    customerName: String,
    customerId: String,
    customerIp: String,
    lastGold: Number,
    isUpdateGold: Boolean,
    updateTime: Number,
    aisleId: Number,
    bonus: { type: Number, default: 0 }
}, { versionKey: false });
exports.pay_info = (0, mongoose_1.model)("pay_info", schema, 'pay_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3BheV9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWdFO0FBa0NoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0lBQ2xDLElBQUksRUFBRSxNQUFNO0lBQ1osUUFBUSxFQUFFLE1BQU07SUFDaEIsTUFBTSxFQUFFLE1BQU07SUFDZCxTQUFTLEVBQUUsTUFBTTtJQUNqQixRQUFRLEVBQUUsTUFBTTtJQUNoQixTQUFTLEVBQUUsTUFBTTtJQUNqQixNQUFNLEVBQUUsTUFBTTtJQUNkLE1BQU0sRUFBRSxNQUFNO0lBQ2QsR0FBRyxFQUFFLE1BQU07SUFDWCxRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsTUFBTTtJQUNmLElBQUksRUFBRSxNQUFNO0lBQ1osVUFBVSxFQUFFLE1BQU07SUFDbEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsWUFBWSxFQUFFLE9BQU87SUFDckIsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLE1BQU07SUFFZixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7Q0FDdEMsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxRQUFRLEdBQUcsSUFBQSxnQkFBSyxFQUFZLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMifQ==