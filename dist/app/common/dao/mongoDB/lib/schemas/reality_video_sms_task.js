"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reality_video_sms_task = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    warn_integral: Number,
    user_name: String,
    telphone: String,
    send_times: Number,
    interval_time: Number,
    status: Number,
    record: [],
    lastSendTime: Number,
    createTime: Number,
}, { versionKey: false });
exports.reality_video_sms_task = (0, mongoose_1.model)("reality_video_sms_task", schema, 'reality_video_sms_task');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbGl0eV92aWRlb19zbXNfdGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcmVhbGl0eV92aWRlb19zbXNfdGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUFnQmhFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN4QixhQUFhLEVBQUUsTUFBTTtJQUNyQixTQUFTLEVBQUUsTUFBTTtJQUNqQixRQUFRLEVBQUUsTUFBTTtJQUNoQixVQUFVLEVBQUUsTUFBTTtJQUNsQixhQUFhLEVBQUUsTUFBTTtJQUNyQixNQUFNLEVBQUUsTUFBTTtJQUNkLE1BQU0sRUFBRSxFQUFFO0lBQ1YsWUFBWSxFQUFFLE1BQU07SUFDcEIsVUFBVSxFQUFFLE1BQU07Q0FDbkIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLGdCQUFLLEVBQTBCLHdCQUF3QixFQUFFLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDIn0=