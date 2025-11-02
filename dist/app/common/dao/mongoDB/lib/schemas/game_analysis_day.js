'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.game_analysis_day = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    createTime: { type: Number, index: true },
    nid: String,
    sceneId: Number,
    remark: String,
    win: Number,
    input: Number,
    settle_commission: Number,
    betPlayers: [],
}, { versionKey: false });
exports.game_analysis_day = (0, mongoose_1.model)("game_analysis_day", schema, 'game_analysis_day');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZV9hbmFseXNpc19kYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2dhbWVfYW5hbHlzaXNfZGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsdUNBQW1EO0FBZW5ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN6QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDekMsR0FBRyxFQUFFLE1BQU07SUFDWCxPQUFPLEVBQUUsTUFBTTtJQUNmLE1BQU0sRUFBRSxNQUFNO0lBQ2QsR0FBRyxFQUFFLE1BQU07SUFDWCxLQUFLLEVBQUUsTUFBTTtJQUNiLGlCQUFpQixFQUFFLE1BQU07SUFDekIsVUFBVSxFQUFFLEVBQUU7Q0FDZCxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGlCQUFpQixHQUFHLElBQUEsZ0JBQUssRUFBcUIsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUMifQ==