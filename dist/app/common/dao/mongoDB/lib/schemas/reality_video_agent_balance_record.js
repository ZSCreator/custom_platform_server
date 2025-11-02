'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.reality_video_agent_balance_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    integralBeforeChange: Number,
    changeIntegral: Number,
    integralAfterChange: Number,
    agentTotalOfHistory: Number,
    changeStatus: Number,
    createUser: String,
    createTime: Number,
    createDateTime: Number,
}, { versionKey: false });
exports.reality_video_agent_balance_record = (0, mongoose_1.model)("reality_video_agent_balance_record", schema, 'reality_video_agent_balance_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbGl0eV92aWRlb19hZ2VudF9iYWxhbmNlX3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcmVhbGl0eV92aWRlb19hZ2VudF9iYWxhbmNlX3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLHVDQUFnRTtBQWlCaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLG9CQUFvQixFQUFFLE1BQU07SUFDNUIsY0FBYyxFQUFFLE1BQU07SUFDdEIsbUJBQW1CLEVBQUUsTUFBTTtJQUMzQixtQkFBbUIsRUFBRSxNQUFNO0lBQzNCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLGNBQWMsRUFBRSxNQUFNO0NBQ3pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUdiLFFBQUEsa0NBQWtDLEdBQUcsSUFBQSxnQkFBSyxFQUFzQyxvQ0FBb0MsRUFBRSxNQUFNLEVBQUUsb0NBQW9DLENBQUMsQ0FBQyJ9