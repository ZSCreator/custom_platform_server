'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.tixian_money_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: { type: String, index: true },
    uid: { type: String, index: true },
    bankCardName: String,
    bankName: String,
    bankCardNo: String,
    openBankAddress: String,
    bankCode: String,
    moblieNO: Number,
    selfAddRmb: Number,
    selfTixian: Number,
    nickname: String,
    playerType: Number,
    createTime: { type: Number, index: true },
    money: Number,
    remark: String,
    type: Number,
    remittance: Number,
    remittanceRemark: String,
    gold: Number,
    moneyNum: Number,
    daiFuStatus: Number,
    daiFuFlag: Boolean,
    daiFuAccountName: String,
    shopNo: String,
    outTradeNo: String,
    closeStatus: Boolean,
    content: String,
    remittanceContent: String,
    nearPayMoney: Number,
    nearFlowCount: Number,
}, { versionKey: false });
exports.tixian_money_record = (0, mongoose_1.model)("tixian_money_record", schema, 'tixian_money_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGl4aWFuX21vbmV5X3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvdGl4aWFuX21vbmV5X3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQW9DaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNqQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDbEMsWUFBWSxFQUFFLE1BQU07SUFDcEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsZUFBZSxFQUFFLE1BQU07SUFDdkIsUUFBUSxFQUFFLE1BQU07SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQ3pDLEtBQUssRUFBRSxNQUFNO0lBQ2IsTUFBTSxFQUFFLE1BQU07SUFDZCxJQUFJLEVBQUUsTUFBTTtJQUNaLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLGdCQUFnQixFQUFFLE1BQU07SUFDeEIsSUFBSSxFQUFFLE1BQU07SUFDWixRQUFRLEVBQUUsTUFBTTtJQUNoQixXQUFXLEVBQUUsTUFBTTtJQUNuQixTQUFTLEVBQUUsT0FBTztJQUNsQixnQkFBZ0IsRUFBRSxNQUFNO0lBQ3hCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsVUFBVSxFQUFFLE1BQU07SUFDbEIsV0FBVyxFQUFFLE9BQU87SUFDcEIsT0FBTyxFQUFFLE1BQU07SUFDZixpQkFBaUIsRUFBRSxNQUFNO0lBQ3pCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLGFBQWEsRUFBRSxNQUFNO0NBQ3hCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSxnQkFBSyxFQUF1QixxQkFBcUIsRUFBRSxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQyJ9