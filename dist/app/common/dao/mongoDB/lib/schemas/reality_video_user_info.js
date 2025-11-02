'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.reality_video_user_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    nickname: String,
    username: String,
    password: String,
    ratio_switch: Number,
    ratio: Number,
    ratio_setting: Number,
    integral: Number,
    isDemoAccount: Number,
    lastLoginTime: Number,
    createDateTime: Number,
    updateDateTime: Number,
}, { versionKey: false });
exports.reality_video_user_info = (0, mongoose_1.model)("reality_video_user_info", schema, 'reality_video_user_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbGl0eV92aWRlb191c2VyX2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3JlYWxpdHlfdmlkZW9fdXNlcl9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsdUNBQWdFO0FBb0JoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsR0FBRyxFQUFFLE1BQU07SUFDWCxRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsTUFBTTtJQUNoQixZQUFZLEVBQUUsTUFBTTtJQUNwQixLQUFLLEVBQUUsTUFBTTtJQUNiLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLGNBQWMsRUFBRSxNQUFNO0NBQ3pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsdUJBQXVCLEdBQUcsSUFBQSxnQkFBSyxFQUEyQix5QkFBeUIsRUFBRSxNQUFNLEVBQUUseUJBQXlCLENBQUMsQ0FBQyJ9