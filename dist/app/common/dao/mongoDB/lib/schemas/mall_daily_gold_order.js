"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mall_daily_gold_order = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    payMethodId: Number,
    payMethodName: String,
    payTypeId: Number,
    payTypeName: String,
    prePayOrder: Number,
    payedOrder: Number,
    allGoldItem: [],
    paySuccessPercentage: Number,
    date: String,
    createTime: Number
});
exports.mall_daily_gold_order = (0, mongoose_1.model)("mall_daily_gold_order", schema, 'mall_daily_gold_order');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFsbF9kYWlseV9nb2xkX29yZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9tYWxsX2RhaWx5X2dvbGRfb3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQWdFO0FBdUJoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsYUFBYSxFQUFFLE1BQU07SUFDckIsU0FBUyxFQUFFLE1BQU07SUFDakIsV0FBVyxFQUFFLE1BQU07SUFDbkIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLE1BQU07SUFDbEIsV0FBVyxFQUFFLEVBQUU7SUFDZixvQkFBb0IsRUFBRSxNQUFNO0lBQzVCLElBQUksRUFBRSxNQUFNO0lBQ1osVUFBVSxFQUFFLE1BQU07Q0FDckIsQ0FBQyxDQUFDO0FBRVUsUUFBQSxxQkFBcUIsR0FBRyxJQUFBLGdCQUFLLEVBQXlCLHVCQUF1QixFQUFFLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxDQUFDIn0=