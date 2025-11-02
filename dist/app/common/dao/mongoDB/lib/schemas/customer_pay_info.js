'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.customer_pay_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    customerName: String,
    customerUrl: String,
    customerDesc: String,
    customerContact: [],
    createTime: String,
    language: String,
    NumOrder: Number,
    isOpen: Boolean,
}, { versionKey: false });
exports.customer_pay_info = (0, mongoose_1.model)("customer_pay_info", schema, 'customer_pay_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXJfcGF5X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2N1c3RvbWVyX3BheV9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsdUNBQW1EO0FBYW5ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN6QixFQUFFLEVBQUUsTUFBTTtJQUNWLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFlBQVksRUFBRSxNQUFNO0lBQ3BCLGVBQWUsRUFBRSxFQUFFO0lBQ25CLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxPQUFPO0NBQ2YsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxpQkFBaUIsR0FBRyxJQUFBLGdCQUFLLEVBQXFCLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDIn0=