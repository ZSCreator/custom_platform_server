'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.robot_account = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    rechargeMoney: Number,
    addtime: Number
}, { versionKey: false });
exports.robot_account = (0, mongoose_1.model)("robot_account", schema, 'robot_account');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RfYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcm9ib3RfYWNjb3VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQVNoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDbEIsR0FBRyxFQUFFLE1BQU07SUFDWCxhQUFhLEVBQUUsTUFBTTtJQUNyQixPQUFPLEVBQUUsTUFBTTtDQUV0QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWlCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==