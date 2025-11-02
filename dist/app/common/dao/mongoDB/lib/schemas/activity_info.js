'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activity_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    type: { type: Number, index: true },
    remark: String,
    title: String,
    contentImg: [],
    createTime: Number,
    updateTime: Number,
    sort: Number,
    isLeading: Boolean,
    isOpen: { type: Boolean, default: true },
}, { versionKey: false });
exports.activity_info = (0, mongoose_1.model)("activity_info", schema, 'activity_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvYWN0aXZpdHlfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFtRDtBQWtCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNuQyxNQUFNLEVBQUUsTUFBTTtJQUNkLEtBQUssRUFBRSxNQUFNO0lBQ2IsVUFBVSxFQUFFLEVBQUU7SUFDZCxVQUFVLEVBQUUsTUFBTTtJQUNsQixVQUFVLEVBQUUsTUFBTTtJQUNsQixJQUFJLEVBQUUsTUFBTTtJQUNaLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtDQUMzQyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFJYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWlCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==