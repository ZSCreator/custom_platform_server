'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.pay_order = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    orderNumber: String,
    time: Number,
    aisleId: Number,
    uid: String,
    money: Number,
    platform: String,
    payType: String,
    status: { type: Number, default: 0 },
    field1: String,
    shopId: String,
    reissue: { type: Boolean, default: false },
    isLock: { type: Boolean, default: false },
    callBackTime: String,
    remark: String,
}, { versionKey: false });
exports.pay_order = (0, mongoose_1.model)("pay_order", schema, 'pay_order');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5X29yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9wYXlfb3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYix1Q0FBZ0U7QUFvQmhFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixXQUFXLEVBQUUsTUFBTTtJQUNuQixJQUFJLEVBQUUsTUFBTTtJQUNaLE9BQU8sRUFBRSxNQUFNO0lBQ2YsR0FBRyxFQUFFLE1BQU07SUFDWCxLQUFLLEVBQUUsTUFBTTtJQUNiLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO0lBQ3BDLE1BQU0sRUFBRSxNQUFNO0lBQ2QsTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUU7SUFDMUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0lBQ3pDLFlBQVksRUFBRSxNQUFNO0lBQ3BCLE1BQU0sRUFBRSxNQUFNO0NBQ2pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsU0FBUyxHQUFHLElBQUEsZ0JBQUssRUFBYSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDIn0=