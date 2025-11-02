'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.system_scene = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    id: Number,
    name: String,
    entryCond: Number,
    lowBet: Number,
    capBet: Number,
    allinMaxNum: Number,
    canCarryGold: {},
    blindBet: {},
    minimumGold: Number,
    maximumGold: Number,
    leastHouseGold: {},
    room_count: Number,
}, { versionKey: false });
exports.system_scene = (0, mongoose_1.model)("system_scene", schema, 'system_scene');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX3NjZW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9zeXN0ZW1fc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYix1Q0FBZ0U7QUFvQmhFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixHQUFHLEVBQUUsTUFBTTtJQUNYLEVBQUUsRUFBRSxNQUFNO0lBQ1YsSUFBSSxFQUFFLE1BQU07SUFFWixTQUFTLEVBQUUsTUFBTTtJQUNqQixNQUFNLEVBQUUsTUFBTTtJQUNkLE1BQU0sRUFBRSxNQUFNO0lBQ2QsV0FBVyxFQUFFLE1BQU07SUFFbkIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsUUFBUSxFQUFFLEVBQUU7SUFFWixXQUFXLEVBQUUsTUFBTTtJQUNuQixXQUFXLEVBQUUsTUFBTTtJQUNuQixjQUFjLEVBQUUsRUFBRTtJQUNsQixVQUFVLEVBQUUsTUFBTTtDQUNyQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLFlBQVksR0FBRyxJQUFBLGdCQUFLLEVBQWdCLGNBQWMsRUFBRSxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUMifQ==