"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.player_day_profit_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: { type: String, index: true },
    enterGold: Number,
    outGold: Number,
    loginNum: Number,
    dailyFlow: Number,
    createTime: { type: Number, index: true },
    profit: Number,
}, { versionKey: false });
exports.player_day_profit_record = (0, mongoose_1.model)("player_day_profit_record", schema, 'player_day_profit_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyX2RheV9wcm9maXRfcmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9wbGF5ZXJfZGF5X3Byb2ZpdF9yZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQWdFO0FBY2hFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixHQUFHLEVBQUUsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFHLEtBQUssRUFBQyxJQUFJLEVBQUM7SUFDL0IsU0FBUyxFQUFFLE1BQU07SUFDakIsT0FBTyxFQUFFLE1BQU07SUFDZixRQUFRLEVBQUUsTUFBTTtJQUNoQixTQUFTLEVBQUUsTUFBTTtJQUNqQixVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFHLEtBQUssRUFBQyxJQUFJLEVBQUM7SUFDdEMsTUFBTSxFQUFFLE1BQU07Q0FDakIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSx3QkFBd0IsR0FBRyxJQUFBLGdCQUFLLEVBQTRCLDBCQUEwQixFQUFFLE1BQU0sRUFBRSwwQkFBMEIsQ0FBQyxDQUFDIn0=