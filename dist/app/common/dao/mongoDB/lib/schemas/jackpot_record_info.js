'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.jackpot_record_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    roomId: String,
    id: Number,
    jackpot: Number,
    runningPool: Number,
    profitPool: Number,
    createTime: Number,
}, { versionKey: false });
exports.jackpot_record_info = (0, mongoose_1.model)("jackpot_record_info", schema, 'jackpot_record_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamFja3BvdF9yZWNvcmRfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvamFja3BvdF9yZWNvcmRfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQVVoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsR0FBRyxFQUFFLE1BQU07SUFDWCxNQUFNLEVBQUUsTUFBTTtJQUNkLEVBQUUsRUFBRSxNQUFNO0lBQ1YsT0FBTyxFQUFFLE1BQU07SUFDZixXQUFXLEVBQUUsTUFBTTtJQUNuQixVQUFVLEVBQUUsTUFBTTtJQUNsQixVQUFVLEVBQUUsTUFBTTtDQUNsQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLG1CQUFtQixHQUFHLElBQUEsZ0JBQUssRUFBdUIscUJBQXFCLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUMifQ==