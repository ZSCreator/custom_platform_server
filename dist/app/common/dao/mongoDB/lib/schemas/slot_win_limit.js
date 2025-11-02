'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.slot_win_limit = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    winLimitConfig: Object,
    updateTime: { type: Number, default: Date.now() },
    createDateTime: { type: Number, default: Date.now() }
}, { versionKey: false });
exports.slot_win_limit = (0, mongoose_1.model)("slot_win_limit", schema, 'slot_win_limit');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdF93aW5fbGltaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3Nsb3Rfd2luX2xpbWl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWtEO0FBVWxELE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixHQUFHLEVBQUUsTUFBTTtJQUNYLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNqRCxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUU7Q0FDeEQsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxjQUFjLEdBQUcsSUFBQSxnQkFBSyxFQUFnQixnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyJ9