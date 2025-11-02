'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotion_agent_ltv = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: { type: String, index: true },
    uid: { type: String, index: true },
    newPeople: [],
    jianjiePeopleNum: Number,
    newPeoplePay: Number,
    newPeopleTixian: Number,
    dayPayMoney: Number,
    dayTixianMoney: Number,
    allPayMoney: Number,
    allTixianMoney: Number,
    tax: Number,
    createTime: { type: Number, index: true },
    ltvList: [],
    cost: Number,
}, { versionKey: false });
exports.promotion_agent_ltv = (0, mongoose_1.model)("promotion_agent_ltv", schema, 'promotion_agent_ltv');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbW90aW9uX2FnZW50X2x0di5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcHJvbW90aW9uX2FnZW50X2x0di50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFnRTtBQXNCaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNqQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDbEMsU0FBUyxFQUFFLEVBQUU7SUFDYixnQkFBZ0IsRUFBRSxNQUFNO0lBQ3hCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQ3pDLE9BQU8sRUFBRSxFQUFFO0lBQ1gsSUFBSSxFQUFFLE1BQU07Q0FDZixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLG1CQUFtQixHQUFHLElBQUEsZ0JBQUssRUFBdUIscUJBQXFCLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUMifQ==