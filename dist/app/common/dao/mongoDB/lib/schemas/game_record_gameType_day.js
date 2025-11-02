'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.game_record_gameType_day = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    createTime: { type: Number, index: true },
    input: Number,
    win: Number,
    profits: Number,
    fanshui: Number,
    gameType: String,
}, { versionKey: false });
exports.game_record_gameType_day = (0, mongoose_1.model)("game_record_gameType_day", schema, 'game_record_gameType_day');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZV9yZWNvcmRfZ2FtZVR5cGVfZGF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9nYW1lX3JlY29yZF9nYW1lVHlwZV9kYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYix1Q0FBbUQ7QUFrQm5ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN6QixFQUFFLEVBQUUsTUFBTTtJQUNWLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUN6QyxLQUFLLEVBQUUsTUFBTTtJQUNiLEdBQUcsRUFBRSxNQUFNO0lBQ1gsT0FBTyxFQUFFLE1BQU07SUFDZixPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSxNQUFNO0NBQ2hCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSxnQkFBSyxFQUE0QiwwQkFBMEIsRUFBRSxNQUFNLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyJ9