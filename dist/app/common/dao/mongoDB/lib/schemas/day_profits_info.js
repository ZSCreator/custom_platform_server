'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.day_profits_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    profits: Number,
    createTime: Number,
    payMoney: Number,
    payNum: Number,
    payPeopleNum: Number,
    tixianMoney: Number,
    lucksGold: Number,
    allFanShui: Number,
    allGameProfits: Number,
    newPlayer: Number,
    dayLoginPlayer: Number,
    firstPayNum: Number,
    addNewPayPeople: Number,
    addNewPayMoney: Number,
    flowCount: Number,
    nowPlayerGold: Number,
    allDailyCommission: Number,
    consumedSelfFlow: Number,
    consumedPromoteFlow: Number
}, { versionKey: false });
exports.day_profits_info = (0, mongoose_1.model)("day_profits_info", schema, 'day_profits_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5X3Byb2ZpdHNfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvZGF5X3Byb2ZpdHNfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFtRDtBQTBCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3pCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsT0FBTyxFQUFFLE1BQU07SUFDZixVQUFVLEVBQUUsTUFBTTtJQUNsQixRQUFRLEVBQUUsTUFBTTtJQUNoQixNQUFNLEVBQUUsTUFBTTtJQUNkLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLGNBQWMsRUFBRSxNQUFNO0lBSXRCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLGtCQUFrQixFQUFFLE1BQU07SUFDMUIsZ0JBQWdCLEVBQUUsTUFBTTtJQUN4QixtQkFBbUIsRUFBRSxNQUFNO0NBQzNCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSxnQkFBSyxFQUFvQixrQkFBa0IsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyJ9