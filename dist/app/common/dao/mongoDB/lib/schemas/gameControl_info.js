"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameControl_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    gameName: String,
    sceneId: Number,
    roomId: String,
    sceneControlWeightValue: Number,
    personalControlWeightValue: Number,
    control_count: Number,
    sceneControl_count: Number,
    personalControl_count: Number,
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });
exports.gameControl_info = (0, mongoose_1.model)("gameControl_info", schema, 'gameControl_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUNvbnRyb2xfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvZ2FtZUNvbnRyb2xfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUQ7QUFjbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsT0FBTyxFQUFFLE1BQU07SUFDZixNQUFNLEVBQUUsTUFBTTtJQUNkLHVCQUF1QixFQUFFLE1BQU07SUFDL0IsMEJBQTBCLEVBQUUsTUFBTTtJQUNsQyxhQUFhLEVBQUUsTUFBTTtJQUNyQixrQkFBa0IsRUFBRSxNQUFNO0lBQzFCLHFCQUFxQixFQUFFLE1BQU07SUFDN0IsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ2pELFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtDQUNwRCxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGdCQUFnQixHQUFHLElBQUEsZ0JBQUssRUFBb0Isa0JBQWtCLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUMifQ==