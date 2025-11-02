'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.player_day_game_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    createTime: { type: Number, index: true },
    nid: { type: String, index: true },
    uid: { type: String, index: true },
    sceneId: { type: Number, index: true },
    roomId: { type: String, index: true },
    leaveTime: { type: Number, index: true },
    startGold: Number,
    leaveGold: Number,
}, { versionKey: false });
exports.player_day_game_record = (0, mongoose_1.model)("player_day_game_record", schema, 'player_day_game_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyX2RheV9nYW1lX3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcGxheWVyX2RheV9nYW1lX3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQU1iLHVDQUFnRTtBQVdoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQ3pDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNsQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDbEMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQ3RDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUNyQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDeEMsU0FBUyxFQUFFLE1BQU07SUFDakIsU0FBUyxFQUFFLE1BQU07Q0FDcEIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxzQkFBc0IsR0FBRyxJQUFBLGdCQUFLLEVBQTBCLHdCQUF3QixFQUFFLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDIn0=