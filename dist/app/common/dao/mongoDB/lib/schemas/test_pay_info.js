'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.test_pay_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    createTime: Number,
    total_fee: Number,
    walletGoldToGold: Number,
    remark: String,
    uid: String,
    nickname: String,
    addgold: Number,
    gold: Number,
    agencylink: String,
    customerName: String,
    customerId: String,
    lastGold: Number,
    lastWalletGold: Number,
}, { versionKey: false });
exports.test_pay_info = (0, mongoose_1.model)("test_pay_info", schema, 'test_pay_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9wYXlfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvdGVzdF9wYXlfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQW1CaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsVUFBVSxFQUFFLE1BQU07SUFDbEIsU0FBUyxFQUFFLE1BQU07SUFDakIsZ0JBQWdCLEVBQUUsTUFBTTtJQUN4QixNQUFNLEVBQUUsTUFBTTtJQUNkLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsT0FBTyxFQUFFLE1BQU07SUFDZixJQUFJLEVBQUUsTUFBTTtJQUNaLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLGNBQWMsRUFBRSxNQUFNO0NBQ3pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsYUFBYSxHQUFHLElBQUEsZ0JBQUssRUFBaUIsZUFBZSxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyJ9