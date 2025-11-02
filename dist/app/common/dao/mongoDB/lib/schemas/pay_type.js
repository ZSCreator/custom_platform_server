'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.pay_type = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: String,
    isOpen: Boolean,
    url: String,
    buyId: Number,
    shanghu: String,
    type: String,
    isMobile: Boolean,
    isPC: Boolean,
    isWX: Boolean,
    isQrCode: Boolean,
    tips: String,
    isUse: Boolean,
    sort: Number,
    icon: String,
    remark: String,
    callBackDelay: Number,
    rate: { type: Number, default: 0 },
    callBackSucceed: { type: Number, default: 0 },
    callBackAll: { type: Number, default: 0 },
    isOpenJustShowPay: { type: Boolean, default: false },
}, { versionKey: false });
exports.pay_type = (0, mongoose_1.model)("pay_type", schema, 'pay_type');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5X3R5cGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3BheV90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWdFO0FBNEJoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsSUFBSSxFQUFFLE1BQU07SUFDWixNQUFNLEVBQUUsT0FBTztJQUNmLEdBQUcsRUFBRSxNQUFNO0lBQ1gsS0FBSyxFQUFFLE1BQU07SUFDYixPQUFPLEVBQUUsTUFBTTtJQUNmLElBQUksRUFBRSxNQUFNO0lBQ1osUUFBUSxFQUFFLE9BQU87SUFDakIsSUFBSSxFQUFFLE9BQU87SUFDYixJQUFJLEVBQUUsT0FBTztJQUNiLFFBQVEsRUFBRSxPQUFPO0lBQ2pCLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLE9BQU87SUFDZCxJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxNQUFNO0lBQ1osTUFBTSxFQUFFLE1BQU07SUFDZCxhQUFhLEVBQUUsTUFBTTtJQUNyQixJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUU7SUFDbEMsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO0lBQzdDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtJQUN6QyxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTtDQUN2RCxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFHYixRQUFBLFFBQVEsR0FBRyxJQUFBLGdCQUFLLEVBQVksVUFBVSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyJ9