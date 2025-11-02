'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.manager_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    userName: String,
    passWord: String,
    managerId: String,
    remark: String,
    agent: String,
    role: Number,
    ip: Array,
}, { versionKey: false });
exports.manager_info = (0, mongoose_1.model)("manager_info", schema, 'manager_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuYWdlcl9pbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9tYW5hZ2VyX2luZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYix1Q0FBbUQ7QUFpQm5ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsTUFBTTtJQUNoQixTQUFTLEVBQUUsTUFBTTtJQUNqQixNQUFNLEVBQUUsTUFBTTtJQUNkLEtBQUssRUFBRSxNQUFNO0lBQ2IsSUFBSSxFQUFFLE1BQU07SUFDWixFQUFFLEVBQUUsS0FBSztDQUNaLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsWUFBWSxHQUFHLElBQUEsZ0JBQUssRUFBZ0IsY0FBYyxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQyJ9