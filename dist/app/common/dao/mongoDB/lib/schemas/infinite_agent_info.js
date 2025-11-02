'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.infinite_agent_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: { type: String, index: true },
    remark: { type: String, index: true },
    inviteCode: String,
    gold: Number,
    createTime: Number,
    superior: String,
    group_id: String,
    agentLevel: Number,
    group_line: Number,
    open_agent: Boolean,
    open_group_time: Number,
    close_group_time: Number,
    gameDownUrl: String,
    openQrCode: Number,
    openCommission: Number,
    profitsRatio: Number,
}, { versionKey: false });
exports.infinite_agent_info = (0, mongoose_1.model)("infinite_agent_info", schema, 'infinite_agent_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5maW5pdGVfYWdlbnRfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvaW5maW5pdGVfYWdlbnRfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQXdCaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNsQyxNQUFNLEVBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDdEMsVUFBVSxFQUFFLE1BQU07SUFDbEIsSUFBSSxFQUFFLE1BQU07SUFDWixVQUFVLEVBQUUsTUFBTTtJQUNsQixRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsTUFBTTtJQUNoQixVQUFVLEVBQUUsTUFBTTtJQUNsQixVQUFVLEVBQUUsTUFBTTtJQUNsQixVQUFVLEVBQUUsT0FBTztJQUNuQixlQUFlLEVBQUUsTUFBTTtJQUN2QixnQkFBZ0IsRUFBRSxNQUFNO0lBR3hCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFlBQVksRUFBRSxNQUFNO0NBQ3ZCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSxnQkFBSyxFQUF1QixxQkFBcUIsRUFBRSxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQyJ9