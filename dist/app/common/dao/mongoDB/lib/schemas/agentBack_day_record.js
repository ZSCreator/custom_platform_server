'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentBack_day_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    uid: String,
    superior: String,
    zhishuPeople: Number,
    jianjiePeople: Number,
    dayPeople: Number,
    jianjieProfits: Number,
    zhijieProfits: Number,
    allProfits: Number,
    chouShui: Number,
    selfProfits: Number,
    createTime: Number,
}, { versionKey: false });
exports.agentBack_day_record = (0, mongoose_1.model)("agentBack_day_record", schema, 'agentBack_day_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRCYWNrX2RheV9yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2FnZW50QmFja19kYXlfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsdUNBQW1EO0FBZW5ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixFQUFFLEVBQUUsTUFBTTtJQUNWLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsYUFBYSxFQUFFLE1BQU07SUFDckIsU0FBUyxFQUFFLE1BQU07SUFDakIsY0FBYyxFQUFFLE1BQU07SUFDdEIsYUFBYSxFQUFFLE1BQU07SUFDckIsVUFBVSxFQUFFLE1BQU07SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLE1BQU07Q0FDckIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2IsUUFBQSxvQkFBb0IsR0FBRyxJQUFBLGdCQUFLLEVBQXdCLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDIn0=