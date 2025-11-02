"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pirate_data = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    pirateMiniGames: {},
    pirateBox: [],
    freespinNum: Number,
    bet: Number,
    profit: Number,
    currDish: Number
}, { versionKey: false });
exports.pirate_data = (0, mongoose_1.model)("pirate_data", schema, 'pirate_data');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlyYXRlX2RhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3BpcmF0ZV9kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFnRTtBQVdoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsR0FBRyxFQUFFLE1BQU07SUFDWCxlQUFlLEVBQUUsRUFBRTtJQUNuQixTQUFTLEVBQUUsRUFBRTtJQUNiLFdBQVcsRUFBRSxNQUFNO0lBQ25CLEdBQUcsRUFBRSxNQUFNO0lBQ1gsTUFBTSxFQUFFLE1BQU07SUFDZCxRQUFRLEVBQUUsTUFBTTtDQUNuQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLFdBQVcsR0FBRyxJQUFBLGdCQUFLLEVBQWUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyJ9