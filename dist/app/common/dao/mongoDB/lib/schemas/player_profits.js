'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.player_profits = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    profits: Number,
    extractProfits: Number,
    profitsForGold: Number,
    kaoheProfits: Number,
    createTime: Number,
    canGetNum: Number,
    uid: String,
}, { versionKey: false });
exports.player_profits = (0, mongoose_1.model)("player_profits", schema, 'player_profits');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyX3Byb2ZpdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3BsYXllcl9wcm9maXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWdFO0FBcUJoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsRUFBRSxFQUFFLE1BQU07SUFDVixPQUFPLEVBQUUsTUFBTTtJQUNaLGNBQWMsRUFBRSxNQUFNO0lBQ3pCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLEdBQUcsRUFBRSxNQUFNO0NBQ1gsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxjQUFjLEdBQUcsSUFBQSxnQkFBSyxFQUFrQixnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyJ9