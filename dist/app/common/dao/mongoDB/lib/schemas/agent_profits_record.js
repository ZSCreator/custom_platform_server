'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.agent_profits_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    allLiushui: Number,
    teamLiushui: Number,
    selfLiushui: Number,
    createTime: Number,
    dailiUid: String,
    kaohebili: Number,
    profits: Number,
    yuzhiProfits: Number,
}, { versionKey: false });
exports.agent_profits_record = (0, mongoose_1.model)("agent_profits_record", schema, 'agent_profits_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWdlbnRfcHJvZml0c19yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2FnZW50X3Byb2ZpdHNfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsdUNBQW1EO0FBY25ELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixFQUFFLEVBQUUsTUFBTTtJQUNWLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsWUFBWSxFQUFFLE1BQU07Q0FDdkIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxvQkFBb0IsR0FBRyxJQUFBLGdCQUFLLEVBQXdCLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDIn0=