"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reality_video_schedule_task = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    task_tag: String,
    uid: String,
    username: String,
    betTotal: Number,
    profitTotal: Number,
    gameRounds: Number,
    status: Number,
    err_msg: String,
    createTime: Number,
    lastUpdateTime: Number,
}, { versionKey: false });
exports.reality_video_schedule_task = (0, mongoose_1.model)("reality_video_schedule_task", schema, 'reality_video_schedule_task');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbGl0eV92aWRlb19zY2hlZHVsZV90YXNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9yZWFsaXR5X3ZpZGVvX3NjaGVkdWxlX3Rhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQWdFO0FBa0JoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDeEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsR0FBRyxFQUFFLE1BQU07SUFDWCxRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsTUFBTTtJQUNoQixXQUFXLEVBQUUsTUFBTTtJQUNuQixVQUFVLEVBQUUsTUFBTTtJQUNsQixNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLE1BQU07SUFDbEIsY0FBYyxFQUFFLE1BQU07Q0FDdkIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSwyQkFBMkIsR0FBRyxJQUFBLGdCQUFLLEVBQStCLDZCQUE2QixFQUFFLE1BQU0sRUFBRSw2QkFBNkIsQ0FBQyxDQUFDIn0=