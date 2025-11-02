"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scene_control = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    gameName: String,
    sceneName: String,
    baseSystemWinRate: Number,
    sceneId: Number,
    bankerGame: Boolean,
    weights: Number,
    bankerKillProbability: Number,
    lockPool: { type: Boolean, default: false },
    updateTime: { type: Number, default: Date.now() },
    createTime: { type: Number, default: Date.now() },
}, { versionKey: false });
exports.scene_control = (0, mongoose_1.model)("scene_control", schema, 'scene_control');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmVfY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvc2NlbmVfY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUQ7QUFjbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsU0FBUyxFQUFFLE1BQU07SUFDakIsaUJBQWlCLEVBQUUsTUFBTTtJQUN6QixPQUFPLEVBQUUsTUFBTTtJQUNmLFVBQVUsRUFBRSxPQUFPO0lBQ25CLE9BQU8sRUFBRSxNQUFNO0lBQ2YscUJBQXFCLEVBQUUsTUFBTTtJQUM3QixRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUM7SUFDekMsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ2pELFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtDQUNwRCxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWdCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==