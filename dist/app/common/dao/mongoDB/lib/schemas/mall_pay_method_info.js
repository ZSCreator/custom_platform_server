"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mall_pay_method_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    payMethodId: Number,
    payMethodName: String,
    payMethodDescription: String,
    payMethodIcon: String,
    cornerIcon: String,
    minAmount: { type: Number, default: 0 },
    maxAmount: Number,
    isMobile: Boolean,
    isPC: Boolean,
    isWX: Boolean,
    isQrCode: Boolean,
    sort: Number,
    isOpenJustShowPay: { type: Boolean, default: false },
}, { versionKey: false });
exports.mall_pay_method_info = (0, mongoose_1.model)("mall_pay_method_info", schema, 'mall_pay_method_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFsbF9wYXlfbWV0aG9kX2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL21hbGxfcGF5X21ldGhvZF9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFnRTtBQXVCaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLG9CQUFvQixFQUFFLE1BQU07SUFDNUIsYUFBYSxFQUFFLE1BQU07SUFDckIsVUFBVSxFQUFFLE1BQU07SUFDbEIsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO0lBQ3ZDLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFFBQVEsRUFBRSxPQUFPO0lBQ2pCLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBSSxFQUFFLE9BQU87SUFDYixRQUFRLEVBQUUsT0FBTztJQUNqQixJQUFJLEVBQUUsTUFBTTtJQUNaLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO0NBQ3ZELEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSxnQkFBSyxFQUF3QixzQkFBc0IsRUFBRSxNQUFNLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyJ9