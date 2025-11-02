'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent_yuzhi_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    createTime: Number,
    dailiUid: String,
    yuzhiProfits: Number,
    type: Number,
    lastProfits: Number,
}, { versionKey: false });
exports.agent_yuzhi_record = (0, mongoose_1.model)("agent_yuzhi_record", schema, 'agent_yuzhi_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRfeXV6aGlfcmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9hZ2VudF95dXpoaV9yZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFLYix1Q0FBbUQ7QUFVbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsVUFBVSxFQUFFLE1BQU07SUFDbEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsSUFBSSxFQUFFLE1BQU07SUFDWixXQUFXLEVBQUUsTUFBTTtDQUN0QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGtCQUFrQixHQUFHLElBQUEsZ0JBQUssRUFBc0Isb0JBQW9CLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUMifQ==