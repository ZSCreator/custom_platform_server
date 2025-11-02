'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.day_player_profits_pay_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    profits: Number,
    createTime: { type: Number, index: true },
    payMoney: Number,
    tixianMoney: Number,
    lucksGold: Number,
    nowPlayerGold: Number,
    uid: { type: String, index: true },
    nickname: String,
    superior: { type: String, index: true },
    profitsRatio: Number,
    startProfits: Number,
    numLevel: Number,
    nextUid: String,
    dailyChoushui: Number,
    dailyFlow: Number,
    input: Number,
    nid: String,
    gameName: String,
    gameOrder: String,
    gameType: String,
}, { versionKey: false });
exports.day_player_profits_pay_record = (0, mongoose_1.model)("day_player_profits_pay_record", schema, 'day_player_profits_pay_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5X3BsYXllcl9wcm9maXRzX3BheV9yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2RheV9wbGF5ZXJfcHJvZml0c19wYXlfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsdUNBQW1EO0FBMEJuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsRUFBRSxFQUFFLE1BQU07SUFDVixPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUN6QyxRQUFRLEVBQUUsTUFBTTtJQUNoQixXQUFXLEVBQUUsTUFBTTtJQUNuQixTQUFTLEVBQUUsTUFBTTtJQUNqQixhQUFhLEVBQUUsTUFBTTtJQUNyQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDbEMsUUFBUSxFQUFFLE1BQU07SUFDaEIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQ3ZDLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsYUFBYSxFQUFFLE1BQU07SUFDckIsU0FBUyxFQUFFLE1BQU07SUFDakIsS0FBSyxFQUFFLE1BQU07SUFDYixHQUFHLEVBQUUsTUFBTTtJQUNYLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFFBQVEsRUFBRSxNQUFNO0NBQ2hCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsNkJBQTZCLEdBQUcsSUFBQSxnQkFBSyxFQUFpQywrQkFBK0IsRUFBRSxNQUFNLEVBQUUsK0JBQStCLENBQUMsQ0FBQyJ9