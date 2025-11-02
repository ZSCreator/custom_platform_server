"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mall_gold_item_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    itemId: String,
    itemName: String,
    itemDescription: String,
    itemPrice: Number,
    priceToGold: Number,
    language: String,
    sort: Number,
    itemButtonName: String,
    iconUrl: String,
    noShowPayMethodList: [],
    noShowPayTypeList: [],
    isOpen: Boolean,
}, { versionKey: false });
exports.mall_gold_item_info = (0, mongoose_1.model)("mall_gold_item_info", schema, 'mall_gold_item_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFsbF9nb2xkX2l0ZW1faW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvbWFsbF9nb2xkX2l0ZW1faW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUFzQmhFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixNQUFNLEVBQUUsTUFBTTtJQUNkLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLElBQUksRUFBRSxNQUFNO0lBQ1osY0FBYyxFQUFFLE1BQU07SUFDdEIsT0FBTyxFQUFFLE1BQU07SUFDZixtQkFBbUIsRUFBRSxFQUFFO0lBQ3ZCLGlCQUFpQixFQUFFLEVBQUU7SUFDckIsTUFBTSxFQUFFLE9BQU87Q0FDbEIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBR2IsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLGdCQUFLLEVBQXVCLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDIn0=