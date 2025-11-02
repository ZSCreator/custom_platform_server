'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.customer_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    uid: String,
    content: String,
    replyContent: String,
    nickname: String,
    vip: String,
    inviteCode: String,
    isSolve: Number,
    createTime: Number,
    type: Number,
    name: String,
    phone: Number,
    qq: Number,
    weixin: String,
    passStatus: Number,
    remark: String,
    passType: Number,
}, { versionKey: false });
exports.customer_info = (0, mongoose_1.model)("customer_info", schema, 'customer_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tZXJfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvY3VzdG9tZXJfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUliLHVDQUFtRDtBQXlCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3pCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsR0FBRyxFQUFFLE1BQU07SUFDWCxPQUFPLEVBQUUsTUFBTTtJQUNmLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLE1BQU07SUFDZixVQUFVLEVBQUUsTUFBTTtJQUNsQixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLE1BQU07SUFDYixFQUFFLEVBQUUsTUFBTTtJQUNWLE1BQU0sRUFBRSxNQUFNO0lBQ2QsVUFBVSxFQUFFLE1BQU07SUFDbEIsTUFBTSxFQUFFLE1BQU07SUFDZCxRQUFRLEVBQUUsTUFBTTtDQUNoQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWlCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==