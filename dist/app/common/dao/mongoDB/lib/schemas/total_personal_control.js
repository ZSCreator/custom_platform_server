"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.total_personal_control = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: { type: String, index: true },
    probability: Number,
    killCondition: Number,
    remark: String,
    managerId: String,
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() }
}, { versionKey: false });
exports.total_personal_control = (0, mongoose_1.model)("total_personal_control", schema, 'total_personal_control');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG90YWxfcGVyc29uYWxfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvdG90YWxfcGVyc29uYWxfY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUFVaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNsQyxXQUFXLEVBQUUsTUFBTTtJQUNuQixhQUFhLEVBQUUsTUFBTTtJQUNyQixNQUFNLEVBQUUsTUFBTTtJQUNkLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNqRCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7Q0FDcEQsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLGdCQUFLLEVBQXdCLHdCQUF3QixFQUFFLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDIn0=