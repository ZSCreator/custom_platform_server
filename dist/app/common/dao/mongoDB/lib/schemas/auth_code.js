"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth_code = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    auth_code: String,
    createTime: Number,
    status: Number,
    phone: String
}, { versionKey: false });
exports.auth_code = (0, mongoose_1.model)("auth_code", schema, 'auth_code');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aF9jb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9hdXRoX2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsdUNBQW1EO0FBT25ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixTQUFTLEVBQUUsTUFBTTtJQUNqQixVQUFVLEVBQUUsTUFBTTtJQUNsQixNQUFNLEVBQUUsTUFBTTtJQUNkLEtBQUssRUFBRSxNQUFNO0NBQ2hCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsU0FBUyxHQUFHLElBQUEsZ0JBQUssRUFBYSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDIn0=