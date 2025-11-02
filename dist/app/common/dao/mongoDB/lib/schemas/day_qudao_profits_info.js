'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.day_qudao_profits_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    uid: String,
    profits: Number,
    createTime: Number,
    payNum: Number,
    payPeopleNum: [],
    payMoney: Number,
    tixianMoney: Number,
    lucksGold: Number,
    nowPlayerGold: Number,
    flowCount: Number,
    allDailyCommission: Number,
    consumedSelfFlow: Number,
    consumedPromoteFlow: Number,
    payPepleLength: Number,
    addNewPayPeople: Number,
    addNewPayMoney: Number,
    inputNum: Number,
    inputMoney: Number,
    zhongjiangMoney: Number,
    loginNum: Number,
    newPlayer: Number,
    allPlayerLength: Number,
    secondPayNum: Number,
    threePayNum: Number,
    sevenPayNum: Number,
    fifteenPayNum: Number,
    thirtyPayNum: Number,
    teamProfits: Number,
    teamExhibit: Number,
    settlementTime: Number,
    gameTypeProfits: {},
    status: Number
}, { versionKey: false });
exports.day_qudao_profits_info = (0, mongoose_1.model)("day_qudao_profits_info", schema, 'day_qudao_profits_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5X3F1ZGFvX3Byb2ZpdHNfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvZGF5X3F1ZGFvX3Byb2ZpdHNfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFtRDtBQXVDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3pCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsR0FBRyxFQUFFLE1BQU07SUFDWCxPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsWUFBWSxFQUFFLEVBQUU7SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsU0FBUyxFQUFFLE1BQU07SUFDakIsYUFBYSxFQUFFLE1BQU07SUFDckIsU0FBUyxFQUFFLE1BQU07SUFDakIsa0JBQWtCLEVBQUUsTUFBTTtJQUMxQixnQkFBZ0IsRUFBRSxNQUFNO0lBQ3hCLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsY0FBYyxFQUFFLE1BQU07SUFDdEIsZUFBZSxFQUFFLE1BQU07SUFDdkIsY0FBYyxFQUFFLE1BQU07SUFDdEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsZUFBZSxFQUFFLE1BQU07SUFDdkIsUUFBUSxFQUFFLE1BQU07SUFDaEIsU0FBUyxFQUFFLE1BQU07SUFDakIsZUFBZSxFQUFFLE1BQU07SUFHdkIsWUFBWSxFQUFFLE1BQU07SUFDcEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsV0FBVyxFQUFFLE1BQU07SUFDbkIsYUFBYSxFQUFFLE1BQU07SUFDckIsWUFBWSxFQUFFLE1BQU07SUFFcEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsV0FBVyxFQUFFLE1BQU07SUFDbkIsY0FBYyxFQUFFLE1BQU07SUFDdEIsZUFBZSxFQUFFLEVBQUU7SUFDbkIsTUFBTSxFQUFFLE1BQU07Q0FFZCxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLHNCQUFzQixHQUFHLElBQUEsZ0JBQUssRUFBMEIsd0JBQXdCLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixDQUFDLENBQUMifQ==