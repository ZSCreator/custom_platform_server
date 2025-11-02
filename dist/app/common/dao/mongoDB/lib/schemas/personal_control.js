"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.personal_control = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    gameName: String,
    sceneId: Number,
    sceneName: String,
    conditionDescription: String,
    playersCount: Number,
    controlPlayersMap: { type: Object, default: {} },
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });
exports.personal_control = (0, mongoose_1.model)("personal_control", schema, 'personal_control');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uYWxfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcGVyc29uYWxfY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUFZaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsT0FBTyxFQUFFLE1BQU07SUFDZixTQUFTLEVBQUUsTUFBTTtJQUNqQixvQkFBb0IsRUFBRSxNQUFNO0lBQzVCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLGlCQUFpQixFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO0lBQ2hELFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNqRCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7Q0FDcEQsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxnQkFBZ0IsR0FBRyxJQUFBLGdCQUFLLEVBQW1CLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDIn0=