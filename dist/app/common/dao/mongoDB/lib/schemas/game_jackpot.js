'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.game_jackpot = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    id: Number,
    gameName: String,
    jackpot: Number,
    profitPool: Number,
    runningPool: Number
}, { versionKey: false });
exports.game_jackpot = (0, mongoose_1.model)("game_jackpot", schema, 'game_jackpot');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZV9qYWNrcG90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9nYW1lX2phY2twb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYix1Q0FBbUQ7QUFlbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsRUFBRSxFQUFFLE1BQU07SUFDVixRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFdBQVcsRUFBRSxNQUFNO0NBQ3RCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsWUFBWSxHQUFHLElBQUEsZ0JBQUssRUFBZ0IsY0FBYyxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQyJ9