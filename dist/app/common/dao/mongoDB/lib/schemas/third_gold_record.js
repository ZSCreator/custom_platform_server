'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.third_gold_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: { type: String, index: true, unique: false },
    orderId: { type: String, index: true, unique: false },
    agentUid: { type: String, index: true, unique: false },
    agentRemark: String,
    platformUid: String,
    add_time: Number,
    change_before: Number,
    gold: Number,
    change_after: Number,
    type: Number,
    status: Number,
    remark: String
}, { versionKey: false });
exports.third_gold_record = (0, mongoose_1.model)("third_gold_record", schema, 'third_gold_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhpcmRfZ29sZF9yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3RoaXJkX2dvbGRfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWdFO0FBcUJoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7SUFDakQsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7SUFDckQsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7SUFDdEQsV0FBVyxFQUFFLE1BQU07SUFDbkIsV0FBVyxFQUFFLE1BQU07SUFDbkIsUUFBUSxFQUFFLE1BQU07SUFDaEIsYUFBYSxFQUFFLE1BQU07SUFDckIsSUFBSSxFQUFFLE1BQU07SUFDWixZQUFZLEVBQUUsTUFBTTtJQUNwQixJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxNQUFNO0lBQ2QsTUFBTSxFQUFFLE1BQU07Q0FDakIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxpQkFBaUIsR0FBRyxJQUFBLGdCQUFLLEVBQXFCLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDIn0=