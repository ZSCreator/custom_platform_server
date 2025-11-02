'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_announcement = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    createTime: Number,
    content: String,
    noticeType: Number,
    openType: String,
    sort: Number,
    title: String,
}, { versionKey: false });
exports.update_announcement = (0, mongoose_1.model)("update_announcement", schema, 'update_announcement');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlX2Fubm91bmNlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvdXBkYXRlX2Fubm91bmNlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQWFoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsVUFBVSxFQUFFLE1BQU07SUFFbEIsT0FBTyxFQUFFLE1BQU07SUFFZixVQUFVLEVBQUUsTUFBTTtJQUVsQixRQUFRLEVBQUUsTUFBTTtJQUdoQixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxNQUFNO0NBQ2IsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLGdCQUFLLEVBQXVCLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDIn0=