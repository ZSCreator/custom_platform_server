"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reality_video_game_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: Number,
    record_id: Number,
    game_type: String,
    username: String,
    table_id: Number,
    period_info: String,
    bet_amount: Number,
    game_result: String,
    bet_record: String,
    profit: Number,
    balance_before: Number,
    balance_after: Number,
    xima: Number,
    xima_detail: Number,
    bet_time: String,
    bet_time_unix: Number,
    draw_time: String,
    draw_time_unix: Number,
    state: Number,
    createTime: Number,
    dateTag: String
}, { versionKey: false });
exports.reality_video_game_record = (0, mongoose_1.model)("reality_video_game_record", schema, 'reality_video_game_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbGl0eV92aWRlb19nYW1lX3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcmVhbGl0eV92aWRlb19nYW1lX3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUE0QmhFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN4QixFQUFFLEVBQUUsTUFBTTtJQUNWLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsY0FBYyxFQUFFLE1BQU07SUFDdEIsYUFBYSxFQUFFLE1BQU07SUFDckIsSUFBSSxFQUFFLE1BQU07SUFDWixXQUFXLEVBQUUsTUFBTTtJQUNuQixRQUFRLEVBQUUsTUFBTTtJQUNoQixhQUFhLEVBQUUsTUFBTTtJQUNyQixTQUFTLEVBQUUsTUFBTTtJQUNqQixjQUFjLEVBQUUsTUFBTTtJQUN0QixLQUFLLEVBQUUsTUFBTTtJQUNiLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxNQUFNO0NBQ2hCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUdiLFFBQUEseUJBQXlCLEdBQUcsSUFBQSxnQkFBSyxFQUE2QiwyQkFBMkIsRUFBRSxNQUFNLEVBQUUsMkJBQTJCLENBQUMsQ0FBQyJ9