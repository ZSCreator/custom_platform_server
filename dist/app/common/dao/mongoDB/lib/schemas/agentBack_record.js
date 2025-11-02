'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentBack_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    uid: String,
    superior: String,
    zhishuPeople: Number,
    jianjiePeople: Number,
    todayPeople: Number,
    alreadyTiqu: Number,
    yesDayZhishuProfits: Number,
    yesDayJianjieProfits: Number,
    jianjieProfits: Number,
    zhijieProfits: Number,
    allProfits: Number,
    selfProfits: Number,
    createTime: Number,
}, { versionKey: false });
exports.agentBack_record = (0, mongoose_1.model)("agentBack_record", schema, 'agentBack_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRCYWNrX3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvYWdlbnRCYWNrX3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFtRDtBQWlCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsR0FBRyxFQUFFLE1BQU07SUFDWCxRQUFRLEVBQUUsTUFBTTtJQUNoQixZQUFZLEVBQUUsTUFBTTtJQUNwQixhQUFhLEVBQUUsTUFBTTtJQUNyQixXQUFXLEVBQUUsTUFBTTtJQUNuQixXQUFXLEVBQUUsTUFBTTtJQUNuQixtQkFBbUIsRUFBRSxNQUFNO0lBQzNCLG9CQUFvQixFQUFFLE1BQU07SUFDNUIsY0FBYyxFQUFFLE1BQU07SUFDdEIsYUFBYSxFQUFFLE1BQU07SUFDckIsVUFBVSxFQUFFLE1BQU07SUFDbEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLE1BQU07Q0FDckIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLGdCQUFLLEVBQW9CLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDIn0=