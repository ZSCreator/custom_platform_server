'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.day_agent_profits_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    remark: { type: String, index: true },
    profit: Number,
    createTime: { type: Number, index: true },
    playerPeople: [],
    chouShui: Number,
    validBet: Number,
    betNum: Number,
    group_remark: String,
}, { versionKey: false });
exports.day_agent_profits_info = (0, mongoose_1.model)("day_agent_profits_info", schema, 'day_agent_profits_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5X2FnZW50X3Byb2ZpdHNfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvZGF5X2FnZW50X3Byb2ZpdHNfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFtRDtBQWNuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFFekIsR0FBRyxFQUFFLE1BQU07SUFDUixNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFHLEtBQUssRUFBQyxJQUFJLEVBQUM7SUFDckMsTUFBTSxFQUFFLE1BQU07SUFDZCxVQUFVLEVBQUUsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFHLEtBQUssRUFBQyxJQUFJLEVBQUM7SUFDbkMsWUFBWSxFQUFFLEVBQUU7SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDbkIsTUFBTSxFQUFDLE1BQU07SUFDVixZQUFZLEVBQUMsTUFBTTtDQUd0QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLHNCQUFzQixHQUFHLElBQUEsZ0JBQUssRUFBMEIsd0JBQXdCLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixDQUFDLENBQUMifQ==